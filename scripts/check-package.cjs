const fs=require('node:fs');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const tar=require('tar-stream');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const pkg=require('../package.json');
const archive=path.join(root,'release',`plugin-icon-library-${pkg.version}.tgz`);
const entries=new Map();const extract=tar.extract();
extract.on('entry',(header,stream,next)=>{
  assert(!header.name.startsWith('/') && !header.name.split(/[\\/]/).includes('..'),'Unsafe archive path');
  assert(!entries.has(header.name),'Duplicate archive entry '+header.name);
  const chunks=[];stream.on('data',chunk=>chunks.push(chunk));
  stream.on('end',()=>{entries.set(header.name,Buffer.concat(chunks));next();});stream.resume();
});
extract.on('finish',()=>{
  const get=name=>{assert(entries.has(name),'Missing '+name);return entries.get(name);};
  assert.equal(JSON.parse(get('package.json')).version,pkg.version);
  for(const name of ['client.js','client-v2.js','server.js','client.d.ts','client-v2.d.ts','server.d.ts',
    'dist/client/index.js','dist/client-v2/index.js','dist/server/index.js','dist/server/collections/xzIconLibraryIcons.js',
    'dist/svg.js','dist/svg.d.ts','dist/client/index.d.ts','dist/client-v2/index.d.ts','dist/server/index.d.ts',
    'dist/locale/zh-CN.json','dist/locale/en-US.json','dist/externalVersion.js',
    'README.md','README_EN.md','CHANGELOG.md','LICENSE','LICENSE-THIRD-PARTY']) get(name);
  const verifyDirectory=(directory)=>{
    for(const item of fs.readdirSync(path.join(root,directory),{withFileTypes:true})) {
      const name=`${directory}/${item.name}`;
      if(item.isDirectory()) verifyDirectory(name);
      else assert(get(name).equals(fs.readFileSync(path.join(root,name))),name+' differs from the local build');
    }
  };
  verifyDirectory('dist');
  for(const name of ['client.js','client-v2.js','server.js','README.md','README_EN.md','CHANGELOG.md','LICENSE','LICENSE-THIRD-PARTY']) {
    assert(get(name).equals(fs.readFileSync(path.join(root,name))),name+' differs from the release source');
  }
  for(const name of ['README.md','README_EN.md']) assert(get(name).toString().includes(`**${pkg.version}**`),'README version mismatch');
  assert(![...entries.keys()].some(name=>/^(release|src|scripts|storage|node_modules|\.git)(\/|$)/.test(name)
    || /(^|\/)\.env/.test(name) || /\.(log|tmp|bak)$/.test(name)
    || /^(V2-FIX-VERIFICATION|RELEASE_CHECKLIST|RELEASE_NOTES_)/.test(name)));
  const checksum=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
  assert.equal(fs.readFileSync(archive+'.sha256','utf8'),`${checksum}  ${path.basename(archive)}\n`,'Checksum mismatch');
  console.log(`PASS: ${pkg.version}, ${entries.size} archive entries, complete build equality, docs, licenses, no development/private files, SHA-256`);
});
const fail=error=>{console.error(error.message);process.exitCode=1;};
fs.createReadStream(archive).on('error',fail).pipe(zlib.createGunzip().on('error',fail)).pipe(extract.on('error',fail));
