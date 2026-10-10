const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function sourceModule(filename) {
  if (cache.has(filename)) return cache.get(filename);
  const mod = { exports: {} }; cache.set(filename, mod.exports);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const localRequire = (name) => name.startsWith('.') ? sourceModule(path.resolve(path.dirname(filename), name + '.ts')) : require(name);
  new Function('require', 'module', 'exports', code)(localRequire, mod, mod.exports);
  return mod.exports;
}
const { keywordsOf, matches, metadataKeywords, inCategory, industryCategories } = sourceModule(path.join(root, 'src/client-v2/search.ts'));
assert.equal(industryCategories.find(item=>item.key==='industryBuilding').label,'建筑工程');
assert.equal(industryCategories.find(item=>item.key==='industryCRM').label,'客户管理');
const native = Object.keys(require('@ant-design/icons')).filter(name => /(Outlined|Filled|TwoTone)$/.test(name));
const numbers = [...fs.readFileSync(path.join(root, 'src/client/number-icons.generated.ts'), 'utf8').matchAll(/^\s+(Number\w+):/gm)].map(match => `Xz${match[1]}Outlined`);
const extended = require('./icon-manifest.json').map(name => `Xz${name}Outlined`);
for (const name of [...native, ...extended, ...numbers]) {
  const words = keywordsOf(name);
  assert(/[\u4e00-\u9fff]/.test(words), 'Missing Chinese translation: ' + name);
  assert.equal(keywordsOf(name.toLowerCase()), words, 'Native lowercase registry support: ' + name);
  assert(!/通用 图标|建筑与家居|生活与饮食|CRM|BIM/.test(words), 'Guessed business/category keywords: ' + name);
}
const cases = [
  ['EnvironmentFilled', ['环境', '位置'], ['建筑', '家居', '饮食', '熨斗']],
  ['XzTabletSmartphoneOutlined', ['平板电脑', '智能手机'], ['数据表']],
  ['XzTabletsOutlined', ['药片'], ['平板电脑']],
  ['XzBatteryMediumOutlined', ['电池', '中等'], ['博客', 'Medium']],
  ['XzSignalMediumOutlined', ['信号', '中等'], ['博客', 'Medium']],
  ['XzSunMediumOutlined', ['太阳', '中等'], ['博客', 'Medium']],
  ['MediumOutlined', ['Medium', '博客'], ['中等']],
  ['XzNutOutlined', ['坚果'], ['螺母']],
  ['XzHandMetalOutlined', ['手势', '摇滚'], ['手金属']],
  ['XzScrollTextOutlined', ['卷轴', '文本'], ['合同', '协议']],
  ['FileTextOutlined', ['文本', '文件'], ['合同', '项目']],
  ['XzBoxOutlined', ['盒子'], ['BIM', '三维']],
  ['XzNumber10CircleOutlineOutlined', ['数字10', '圆形', '轮廓'], ['一二三四']],
];
for (const [name, included, excluded] of cases) {
  for (const word of included) { assert(keywordsOf(name).includes(word), `${name} lacks ${word}`); assert(matches(name, word), `${name} cannot be found by ${word}`); }
  for (const word of excluded) { assert(!keywordsOf(name).includes(word), `${name} incorrectly includes ${word}`); if (!name.toLowerCase().includes(word.toLowerCase())) assert(!matches(name, word), `${name} incorrectly matches ${word}`); }
}
assert.equal(keywordsOf('XzLibraryUnknownOutlined'), '', 'Unknown names must not inherit prefix/category guesses');
assert(inCategory('XzHouseOutlined', 'industryBuilding'));
assert(inCategory('XzKanbanOutlined', 'industryProject'));
assert(!inCategory('EnvironmentFilled', 'industryBuilding'));
assert(!inCategory('XzHandbagOutlined', 'industryCRM'));
const oldColor = { label: 'environment #000000', keywords: '建筑与家居 生活与饮食' };
assert.equal(metadataKeywords('XzCustom123Outlined', oldColor), keywordsOf('EnvironmentFilled'));
assert.equal(metadataKeywords('XzCustom123Outlined', {label:'企业标识',keywords:'企业 品牌'}), '企业 品牌');
assert(metadataKeywords('XzCustom123Outlined', {label:'Rocket',keywords:'火箭标识'}).includes('火箭'));
console.log(`Keywords PASS: all ${native.length + extended.length + numbers.length} glyphs translated; ambiguous words, no prefix/category/business pollution, old color copies and industry shortcuts checked`);
