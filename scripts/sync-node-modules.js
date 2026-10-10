// Local development: preserve working links; synchronize runtime files only.
const fs = require('fs');
const path = require('path');
const pkgDir = path.resolve(__dirname, '..');
const pkg = require(path.join(pkgDir, 'package.json'));
if (pkg.name !== '@xiezuo/plugin-icon-library') throw new Error('Unexpected package');
const workspace = path.resolve(pkgDir, '../../../..');
if (!fs.existsSync(path.join(workspace,'package.json'))) throw new Error('Workspace not found');
const modules = path.join(workspace,'node_modules');
const target = path.join(modules,'@xiezuo','plugin-icon-library');
let linked = false;
try {
  if (fs.lstatSync(target).isSymbolicLink()) {
    try { linked = fs.realpathSync(target) === fs.realpathSync(pkgDir); fs.readdirSync(target); } catch { linked = false; }
    if (!linked) fs.unlinkSync(target);
  } else {
    if (!fs.realpathSync(target).startsWith(fs.realpathSync(modules) + path.sep)) throw new Error('Target outside node_modules');
    fs.rmSync(target,{recursive:true,force:true});
  }
} catch (error) { if(error.code !== 'ENOENT') throw error; }
if (!linked) {
  fs.mkdirSync(target,{recursive:true});
  for (const item of ['package.json','dist','README.md','README_EN.md','LICENSE',...pkg.files.filter(item => !item.includes('*'))]) {
    const source = path.join(pkgDir,item);
    if(fs.existsSync(source)) fs.cpSync(source,path.join(target,item),{recursive:true});
  }
}
console.log('[sync-node-modules] Runtime synchronized');
