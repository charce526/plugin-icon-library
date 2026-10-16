// Run against the compiled AMD bundle and the installed NocoBase V2 icon implementation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/v2/admin/' });
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'ShadowRoot', 'MutationObserver', 'Event', 'EventTarget', 'DOMParser']) {
  global[key] = dom.window[key];
}
const realComputedStyle = dom.window.getComputedStyle.bind(dom.window);
window.getComputedStyle = (element) => realComputedStyle(element);
global.getComputedStyle = window.getComputedStyle;
window.matchMedia = (query) => ({ matches: Boolean(process.env.ICON_TEST_DESKTOP && query === '(min-width: 768px)'), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
const React = require('react');
const { render, fireEvent, screen, within, waitFor, cleanup } = require('@testing-library/react');
function expandDetails(){const heading=screen.queryByText('图标详情',{exact:true});if(heading && heading.closest('[aria-expanded]')?.getAttribute('aria-expanded') !== 'true') fireEvent.click(heading);}
const root = path.resolve(__dirname, '..');
const legacy = process.argv.includes('--legacy');
const mixed = process.argv.includes('--mixed');
const lane = legacy ? 'client' : 'client-v2';
const referenceVersion = process.argv.find((arg) => arg.startsWith('--version='))?.slice('--version='.length);
assert(!referenceVersion || !legacy, 'Use check-v1.cjs for pinned V1 controls');
const referenceFiles = referenceVersion && require('./v1-reference-manifest.json').v2Versions[referenceVersion];
assert(!referenceVersion || referenceFiles, 'Unsupported V2 reference version: ' + referenceVersion);
const core = referenceVersion
  ? path.join(root, 'release/validation', 'nocobase-v' + referenceVersion + '-client-v2')
  : path.join(path.dirname(require.resolve('@nocobase/client-v2/package.json')), 'src');
async function prepareReferences() {
  for (const [relative, expected] of Object.entries(referenceFiles || {})) {
    const file = path.join(core, relative);
    if (!fs.existsSync(file)) {
      const response = await fetch('https://raw.githubusercontent.com/nocobase/nocobase/v' + referenceVersion + '/packages/core/client-v2/src/' + relative);
      assert(response.ok, 'Cannot fetch V2 reference: ' + relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    }
    assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex'), expected, 'V2 source hash mismatch: ' + relative);
  }
}

function coreSource(relative) {
  const filename = path.join(core, relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })(require, mod, mod.exports);
  return mod.exports;
}

async function main() {
  await prepareReferences();
  const i18n=require('i18next');
  await i18n.init({lng:'zh-CN',fallbackLng:'en-US',resources:{},interpolation:{escapeValue:false}});
  require('react-i18next').setI18n(i18n);
  const iconModule = coreSource('components/Icon.tsx');
  const { Plugin } = coreSource('Plugin.ts');
  let iconRenders=0;
  const TrackedIcon=(props)=>{iconRenders++;return React.createElement(iconModule.Icon,props);};
  Object.assign(TrackedIcon,iconModule.Icon);
  let bundle;
  const script = document.createElement('script');
  script.src = 'http://localhost/static/plugins/@xiezuo/plugin-icon-library/dist/client-v2/index.js';
  document.head.appendChild(script);
  const define = (name, dependencies, factory) => {
      assert.equal(name, legacy ? '@xiezuo/plugin-icon-library' : '@xiezuo/plugin-icon-library/client-v2');
      assert(legacy || !dependencies.includes('@nocobase/client'), 'V2 bundle must not depend on the legacy registry');
      bundle = factory(...dependencies.map((name) => name === (legacy ? '@nocobase/client' : '@nocobase/client-v2') ? { ...iconModule, Icon:TrackedIcon, Plugin, useApp: () => app, IconFieldModel: class IconFieldModel { constructor(props){this.props=props;} }, useCurrentUserContext: () => ({data:{data:{id:123}}}) } : require(name)));
    };
  define.amd = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'dist', lane, 'index.js'), 'utf8'), {
    window, document, console, self: window, define, Event, DOMParser, localStorage: window.localStorage, crypto: require('node:crypto').webcrypto,
  });
  const settings = { components: {}, registerComponents(components) { Object.assign(this.components, components); } };
  const models={}; const imported=[];
  const apiClient={async request({url,data}){if(url==='iconLibrary:import'){imported.push(data);return {data:{data}};}return {data:{data:imported}};}};
  let otherIcon;
  if (mixed) {
    const version = '2.2.0', relative = 'icon/Icon.tsx';
    const expected = require('./v1-reference-manifest.json').versions[version][relative];
    const filename = path.join(root, 'release/validation', 'nocobase-v' + version + '-client', relative);
    if (!fs.existsSync(filename)) {
      const response = await fetch('https://raw.githubusercontent.com/nocobase/nocobase/v' + version + '/packages/core/client/src/' + relative);
      assert(response.ok, 'Cannot fetch mixed runtime reference: ' + relative);
      fs.mkdirSync(path.dirname(filename), { recursive: true });
      fs.writeFileSync(filename, Buffer.from(await response.arrayBuffer()));
    }
    const code = fs.readFileSync(filename, 'utf8');
    assert.equal(require('node:crypto').createHash('sha256').update(code).digest('hex'), expected);
    const mod = { exports: {} };
    vm.runInThisContext('(function(require,module,exports){' + ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText + '\n})')(require, mod, mod.exports);
    otherIcon = mod.exports;
  }
  const app = {name:'test', i18n,apiClient,eventBus:new EventTarget(),flowEngine: { context:{user:{id:123}},flowSettings: settings,registerModels(value){Object.assign(models,value);} }, components: {}, addComponents(components) { Object.assign(this.components, components); } };
  if (mixed) {
    const modules = { '@nocobase/client': legacy ? iconModule : otherIcon, '@nocobase/client-v2': legacy ? otherIcon : iconModule };
    const loader = (id) => modules[id]; loader.defined = (id) => Boolean(modules[id]);
    app.requirejs = { requirejs: loader };
  }
  await new bundle.default({}, app).load();
  if (mixed) {
    const Picker = settings.components.IconPicker;
    for (const kind of ['color', 'size']) {
      let selected;
      render(React.createElement(Picker, { value: 'XzTerminalOutlined', onChange(value) { selected = value; } }));
      fireEvent.click(screen.getByRole('button', { name: '选择图标' })); expandDetails();
      if (kind === 'color') fireEvent.change(screen.getByLabelText('图标颜色'), { target: { value: '#ef4444' } });
      else fireEvent.click(screen.getByRole('radio', { name: '加大', exact: true }));
      fireEvent.click(screen.getByRole('button', { name: /^应\s*用$/ }));
      await waitFor(() => assert(selected?.startsWith('XzCustom'))); cleanup();
      // V1 Action/Action.Link use this native Icon expression for their button icon.
      const { Button, Tabs, Menu } = require('antd');
      const rendered = render(React.createElement('div', null,
        React.createElement(Button, { icon: React.createElement(otherIcon.Icon, { type: selected }), 'data-testid': 'v1-action' }, '编辑'),
        React.createElement(Tabs, { items: [{ key: 'page', label: React.createElement(iconModule.Icon, { type: selected }), children: '页面' }] }),
        React.createElement(Menu, { items: [{ key: 'menu', icon: React.createElement(iconModule.Icon, { type: selected }), label: '菜单' }] })));
      const svg = screen.getByTestId('v1-action').querySelector('svg');
      assert(svg, 'Mixed runtime button must render the saved ' + kind + ' variant');
      if (kind === 'color') assert.equal(svg.getAttribute('stroke'), '#ef4444');
      else assert.equal(svg.getAttribute('width'), '24');
      assert(rendered.container.querySelector('.ant-tabs-tab svg'));
      assert(rendered.container.querySelector('.ant-menu-item svg')); cleanup();
      otherIcon.icons.delete(selected.toLowerCase()); iconModule.icons.delete(selected.toLowerCase());
      await new bundle.default({}, app).load();
      assert(otherIcon.hasIcon(selected), 'Persisted variants must load into the button registry after reload');
      assert(iconModule.hasIcon(selected));
    }
    console.log(lane + ' MIXED PASS: color, size, native action button, page/tab/menu and persisted reload'); return;
  }
  assert.equal([...iconModule.icons.keys()].filter((name) => name.startsWith('xz')).length, 1426);
  const picker = settings.components.IconPicker;
  assert.equal(app.components.IconPicker, picker);
  settings.registerComponents({ IconPicker: () => null, MobileMenuSettingsIconPicker: () => null, Other: 'untouched' });
  assert.equal(settings.components.IconPicker, picker);
  assert.equal(settings.components.MobileMenuSettingsIconPicker, picker);
  assert.equal(settings.components.Other, 'untouched');
  let clicks=0;
  const attributes=render(React.createElement(iconModule.Icon,{type:'XzTerminalOutlined',title:'forwarded',spin:true,'aria-label':'accessible',onClick(){clicks++;}}));
  fireEvent.click(screen.getByLabelText('accessible')); assert.equal(clicks,1);assert(attributes.container.querySelector('.anticon-spin'));assert(screen.getByTitle('forwarded'));cleanup();
  let selected, completed;
  render(React.createElement('div',{style:{position:'relative',zIndex:3000}},React.createElement(picker, { onChange(value) { selected = value; },onChangeComplete(value){completed=value;} })));
  fireEvent.click(screen.getByRole('button', { name: '选择图标' }));
  await waitFor(()=>assert(Number(getComputedStyle(document.querySelector('.ant-popover')).zIndex)>3000));
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'), { target: { value: 'XzTerminalOutlined' } });
  const terminal = await screen.findByRole('button', { name: 'Terminal', exact: true });
  fireEvent.mouseEnter(terminal);expandDetails();assert(!screen.queryByLabelText('预览图标'),'Hover alone does not preview');
  fireEvent.focus(terminal);assert(!screen.queryByLabelText('预览图标'),'Focus alone does not preview');
  fireEvent.click(terminal);fireEvent.click(await screen.findByRole('button',{name:'收藏',exact:true}));
  assert(JSON.parse(window.localStorage.getItem('xz-icon-library:v1:test:123')).favorites.includes('XzTerminalOutlined'));
  fireEvent.click(terminal); assert.equal(completed,undefined);assert.equal(selected,undefined);
  assert.equal(screen.getByLabelText('预览图标').textContent,'Terminal');
  assert(!document.querySelector('.ant-typography-copy'),'Stored code and copy control are removed');
  assert(!document.querySelector('.ant-tag'),'Keywords use compact plain text');
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'XzServerOutlined'}});
  const hoverServer=await screen.findByRole('button',{name:'Server',exact:true});
  fireEvent.mouseEnter(hoverServer);assert.equal(screen.getByLabelText('预览图标').textContent,'Terminal');
  fireEvent.focus(hoverServer);assert.equal(screen.getByLabelText('预览图标').textContent,'Terminal');
  fireEvent.mouseLeave(hoverServer);assert.equal(screen.getByLabelText('预览图标').textContent,'Terminal');
  fireEvent.click(hoverServer);assert.equal(screen.getByLabelText('预览图标').textContent,'Server');
  assert.equal(selected,undefined);assert.equal(completed,undefined);
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'XzTerminalOutlined'}});
  fireEvent.click(await screen.findByRole('button',{name:'Terminal',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));assert.equal(completed,'XzTerminalOutlined');
  assert(JSON.parse(window.localStorage.getItem('xz-icon-library:v1:test:123')).recent[0]==='XzTerminalOutlined');
  assert.equal(selected, 'XzTerminalOutlined');
  cleanup();
  const view = render(React.createElement(picker, { value: selected, onChange(value) { selected = value; } }));
  assert(view.container.querySelector('svg'), 'Saved extended icon must render from the V2 registry');
  fireEvent.click(screen.getByRole('button',{name:'清空图标'}));
  assert.equal(selected, null);
  cleanup();
  assert(iconModule.hasIcon('AppstoreOutlined'), 'Native icons remain registered');
  render(React.createElement(picker));fireEvent.click(screen.getByRole('button',{name:'选择图标'}));
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'AppstoreTwoTone'}});
  const native=await screen.findByRole('button',{name:/^appstore$/i});
  const nativePaints=new Set([...native.querySelectorAll('path')].map(path=>path.getAttribute('fill')).filter(Boolean));
  assert(nativePaints.size >= 2,'Two-tone grid preserves distinct outline/background paints');
  assert(!nativePaints.has('#1677ff'),'Two-tone grid does not retain default blue');
  if(process.env.ICON_TEST_DESKTOP) assert(screen.getByRole('complementary',{name:'图标详情'}));
  else assert(screen.getByText('图标详情',{exact:true}));cleanup();
  render(React.createElement(picker));fireEvent.click(screen.getByRole('button',{name:'选择图标'}));
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'环境'}});
  const environment=(await screen.findAllByRole('button',{name:/^environment$/i}))[0];
  fireEvent.click(environment);expandDetails();
  assert(screen.getByText(/环境 · 位置 · 定位/));
  assert(!screen.queryByText(/建筑与家居.*生活与饮食/),'Environment no longer displays guessed categories');
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'图书馆'}});
  await screen.findByRole('button',{name:'Library',exact:true});cleanup();
  if (!legacy) assert.equal(new models.IconFieldModel({value:'XzTerminalOutlined'}).render().type,picker);
  render(React.createElement('div',{style:{position:'relative',zIndex:12000}},React.createElement(picker,{value:'XzTerminalOutlined'})));fireEvent.click(screen.getByRole('button',{name:'选择图标'}));
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'文本卷轴'}});
  await screen.findByRole('button',{name:'ScrollText',exact:true});
  fireEvent.click(screen.getByRole('button',{name:'导入 SVG'}));
  const importDialog=await screen.findByRole('dialog',{name:'导入 SVG'});
  const pickerLayer=Number(getComputedStyle(document.querySelector('.ant-popover')).zIndex);
  assert(pickerLayer>12000,'Picker follows a high containing popup');
  assert(Number(getComputedStyle(importDialog.closest('.ant-modal-wrap')).zIndex)>pickerLayer,'Import dialog is above the icon picker');
  assert(Number(getComputedStyle(document.querySelector('.ant-modal-mask')).zIndex)>pickerLayer,'Import mask blocks the underlying picker');
  fireEvent.click(within(importDialog).getByRole('button',{name:/^取\s*消$/}));
  await waitFor(()=>assert(!screen.queryByRole('dialog',{name:'导入 SVG'})));
  expandDetails();assert.equal(screen.getByLabelText('预览图标').textContent,'Terminal');
  assert.equal(screen.getByPlaceholderText('搜索图标名称或中文关键词').value,'文本卷轴');
  fireEvent.click(screen.getByRole('button',{name:'导入 SVG'}));
  await screen.findByRole('dialog',{name:'导入 SVG'});
  fireEvent.change(screen.getByLabelText('图标名称'),{target:{value:'企业标识'}});
  fireEvent.change(screen.getByLabelText('搜索关键词'),{target:{value:'企业 品牌'}});
  fireEvent.change(screen.getByLabelText('SVG',{exact:true}),{target:{value:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0 L24 24"/></svg>'}});
  fireEvent.click(screen.getByRole('button',{name:/^导\s*入$/}));
  await waitFor(()=>assert.equal(imported.length,1));
  await waitFor(()=>assert(iconModule.hasIcon(imported[0].name))); cleanup();
  render(React.createElement(picker,{value:imported[0].name}));assert(screen.getByRole('button',{name:'选择图标'}).querySelector('svg'));cleanup();
  let canceled=0;
  render(React.createElement(picker,{value:'XzTerminalOutlined',onChange(){canceled++;},onChangeComplete(){canceled++;}}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  const colorControl=screen.getByLabelText('图标颜色');
  assert(colorControl.parentElement.querySelector('[data-color-empty]'),'No color is represented by a slash');
  assert.equal(colorControl.value,'#000000','No default blue');
  const beforeDrag=iconRenders;
  for(let index=0;index<100;index++) fireEvent.input(colorControl,{target:{value:'#'+index.toString(16).padStart(6,'0')}});
  assert.equal(iconRenders,beforeDrag,'Continuous dragging does not rebuild previews or the icon grid');
  fireEvent.input(colorControl,{target:{value:'#00ff00'}});
  fireEvent.change(colorControl,{target:{value:'#00ff00'}});
  assert(!colorControl.parentElement.querySelector('[data-color-empty]'),'Final native change commits even after input events');
  assert(screen.getByText('#00ff00',{exact:true}));
  assert(iconRenders-beforeDrag<10,'Final color change does not rerender 120 grid icons');
  fireEvent.click(screen.getByRole('button',{name:'恢复默认'}));
  assert(colorControl.parentElement.querySelector('[data-color-empty]'),'Reset returns to the slash state');
  assert.equal(colorControl.value,'#000000');
  fireEvent.change(colorControl,{target:{value:'#00ff00'}});
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'),{target:{value:'XzServerOutlined'}});
  fireEvent.click(await screen.findByRole('button',{name:'Server',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:/^取\s*消$/}));assert.equal(canceled,0);assert.equal(imported.length,1);
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  assert.equal(screen.getByLabelText('预览图标').textContent,'Terminal');cleanup();
  let coloredSelection, coloredCompleted;
  render(React.createElement(picker,{value:'XzTerminalOutlined',onChange(value){coloredSelection=value;},onChangeComplete(value){coloredCompleted=value;}}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));
  expandDetails();
  fireEvent.change(screen.getByLabelText('图标颜色',{exact:true}),{target:{value:'#ef4444'}});
  fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));
  await waitFor(()=>assert.equal(imported.length,2));
  await waitFor(()=>assert.equal(coloredSelection,imported[1].name));
  assert.equal(coloredCompleted,coloredSelection);
  assert.equal(imported[1].definition.attrs.stroke,'#ef4444');
  assert.equal(imported[1].definition.attrs.fill,'none');
  assert(imported[1].keywords.includes('终端'),'Saved color copies keep the direct Chinese translation');
  assert(!imported[1].keywords.includes('通用 图标'));
  cleanup();
  await new bundle.default({},app).load();
  const colored=render(React.createElement(iconModule.Icon,{type:coloredSelection}));
  assert.equal(colored.container.querySelector('svg').getAttribute('stroke'),'#ef4444');cleanup();
  const disabled=render(React.createElement(picker,{value:'XzTerminalOutlined',disabled:true}));
  assert(screen.getByRole('button',{name:'选择图标'}).disabled);assert(!screen.queryByRole('button',{name:'清空图标'}));cleanup();
  render(React.createElement(picker,{value:'AppstoreTwoTone',onChange(value){coloredSelection=value;}}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  fireEvent.change(screen.getByLabelText('图标颜色'),{target:{value:'#ffffff'}});
  const whitePreview=screen.getByLabelText('预览图标').closest('.ant-space').querySelector('svg');
  assert(new Set([...whitePreview.querySelectorAll('path')].map(path=>path.getAttribute('fill'))).size>=2,'Even white custom colors retain distinct layers');
  fireEvent.change(screen.getByLabelText('图标颜色'),{target:{value:'#ef4444'}});
  fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));
  await waitFor(()=>assert.equal(imported.length,3));
  await waitFor(()=>assert.equal(coloredSelection,imported[2].name));
  const coloredPaints=new Set();const collectPaints=(node)=>{if(node.attrs.fill)coloredPaints.add(node.attrs.fill);(node.children||[]).forEach(collectPaints);};
  imported[2].definition.nodes.forEach(collectPaints);
  assert(coloredPaints.has('#ef4444'));assert(coloredPaints.size>=2,'Saving a custom color retains two-tone contrast');
  cleanup();
  await new bundle.default({},app).load();
  const twoToneReload=render(React.createElement(iconModule.Icon,{type:coloredSelection}));
  assert(new Set([...twoToneReload.container.querySelectorAll('path')].map(path=>path.getAttribute('fill'))).size>=2);cleanup();
  render(React.createElement(picker,{value:coloredSelection}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  assert.equal(screen.getByLabelText('图标颜色').value,'#ef4444','Two-tone icons restore the chosen primary, not the light background');
  assert(new Set([...screen.getByLabelText('预览图标').closest('.ant-space').querySelectorAll('path')].map(path=>path.getAttribute('fill'))).size>=2,'Reopening does not recolor the saved layers');cleanup();
  let sizedSelection;
  render(React.createElement(picker,{value:imported[1].name,onChange(value){sizedSelection=value;}}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  const sizeControl=screen.getByRole('radio',{name:'放大',exact:true});
  const restoredColor=screen.getByLabelText('图标颜色');
  assert.equal(restoredColor.value,'#ef4444','Reopening restores the saved color');
  assert(!restoredColor.parentElement.querySelector('[data-color-empty]'),'Saved color no longer displays the slash');
  fireEvent.change(restoredColor,{target:{value:'#00ff00'}});
  fireEvent.click(screen.getByRole('button',{name:'恢复原色',exact:true}));
  assert.equal(restoredColor.value,'#ef4444','Reset discards a color edit and restores the saved original');
  assert(screen.getByRole('radio',{name:'默认',exact:true}).checked,'Unsized icons follow the host default');
  assert(!screen.queryByRole('spinbutton'));assert(!screen.queryByRole('slider'));
  const beforeSize=iconRenders;
  fireEvent.click(sizeControl);
  assert.equal(screen.getByLabelText('预览图标').closest('.ant-space').querySelector('svg').getAttribute('width'),'40','Header stays at its fixed display size');
  fireEvent.click(screen.getByText('场景预览',{exact:true}));
  assert.equal(screen.getByRole('button',{name:'按钮预览',exact:true}).querySelector('svg').getAttribute('width'),'20','Only usage previews track the size preset');
  fireEvent.click(screen.getByRole('radio',{name:'加大',exact:true}));
  assert.equal(screen.getByRole('button',{name:'按钮预览',exact:true}).querySelector('svg').getAttribute('width'),'24');
  assert.equal(screen.getByLabelText('预览图标').closest('.ant-space').querySelector('svg').getAttribute('width'),'40');
  fireEvent.click(sizeControl);
  assert(iconRenders-beforeSize<30,'Repeated size editing does not rerender the grid');
  assert.equal(sizedSelection,undefined,'Size edits are staged until Apply');
  fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));
  await waitFor(()=>assert.equal(sizedSelection,imported[3].name));
  assert.equal(imported[3].definition.attrs.width,'20');
  assert.equal(imported[3].definition.attrs.height,'20');
  assert.equal(imported[3].definition.attrs.stroke,'#ef4444','Resizing preserves the saved color');cleanup();
  assert.equal(imported[3].label,imported[1].label,'Size changes do not append duplicate color labels');
  await new bundle.default({},app).load();
  const sizedReload=render(React.createElement(iconModule.Icon,{type:sizedSelection}));
  assert.equal(sizedReload.container.querySelector('svg').getAttribute('width'),'20');cleanup();
  const sizeOverride=render(React.createElement(iconModule.Icon,{type:sizedSelection,size:20}));
  assert.equal(sizeOverride.container.querySelector('svg').getAttribute('width'),'20','Explicit host size can override the saved default');cleanup();
  const savedSelection=sizedSelection;
  render(React.createElement(picker,{value:savedSelection,onChange(value){sizedSelection=value;}}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  assert(screen.getByRole('radio',{name:'放大',exact:true}).checked,'Reopening restores the saved size');
  assert.equal(screen.getByLabelText('图标颜色').value,'#ef4444');
  fireEvent.change(screen.getByLabelText('图标颜色'),{target:{value:'#00ff00'}});
  fireEvent.click(screen.getByRole('radio',{name:'加大',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:/^取\s*消$/}));
  assert.equal(sizedSelection,savedSelection);assert.equal(imported.length,4,'Cancel does not save an appearance variant');
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  assert(screen.getByRole('radio',{name:'放大',exact:true}).checked);
  assert.equal(screen.getByLabelText('图标颜色').value,'#ef4444','Cancel discards the temporary color and restores saved color');
  fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));
  await waitFor(()=>assert.equal(imported.length,4));
  assert.equal(sizedSelection,savedSelection,'Unchanged size reuses the existing icon');
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  fireEvent.click(screen.getByRole('radio',{name:'默认',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));
  await waitFor(()=>assert.equal(sizedSelection,imported[4].name));
  assert.equal(imported[4].definition.attrs.width,undefined);
  assert.equal(imported[4].definition.attrs.height,undefined);
  assert.equal(imported[4].definition.attrs.stroke,'#ef4444');cleanup();
  const defaultReload=render(React.createElement(iconModule.Icon,{type:sizedSelection}));
  assert.equal(defaultReload.container.querySelector('svg').getAttribute('width'),'1em','Default restores the original inherited size');cleanup();
  // Older saved variants must not retain a 64px default in compact controls.
  imported.push({...imported[3],name:'XzCustomLegacySizeOutlined',definition:{...imported[3].definition,attrs:{...imported[3].definition.attrs,width:'64',height:'64'}}});
  await new bundle.default({},app).load();
  const oldSize=render(React.createElement(iconModule.Icon,{type:'XzCustomLegacySizeOutlined'}));
  assert.equal(oldSize.container.querySelector('svg').getAttribute('width'),'24','Legacy oversized variants use the largest preset');cleanup();
  const legacyLabel={...imported[1],name:'XzCustomLegacyLabelOutlined',label:'stop #04ff00 #026100',definition:{...imported[1].definition,attrs:{...imported[1].definition.attrs,stroke:'#026100'}}};
  imported.push(legacyLabel);await new bundle.default({},app).load();
  let recoloredName=legacyLabel.name;
  for(const nextColor of ['#ff0088','#026100']) {
    render(React.createElement(picker,{value:recoloredName,onChange(value){recoloredName=value;}}));
    fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
    await waitFor(()=>assert.equal(screen.getByLabelText('预览图标').textContent,'stop','Old and new labels display only the icon name'));
    fireEvent.change(screen.getByLabelText('图标颜色'),{target:{value:nextColor}});
    const count=imported.length;
    fireEvent.click(screen.getByRole('button',{name:/^应\s*用$/}));
    await waitFor(()=>assert.equal(imported.length,count+1));
    await waitFor(()=>assert.equal(recoloredName,imported[count].name));
    assert.equal(imported[count].label,`stop ${nextColor}`,'Repeated recoloring stores only the current color suffix');cleanup();
  }
  render(React.createElement(picker,{value:recoloredName}));
  fireEvent.click(screen.getByRole('button',{name:'选择图标'}));expandDetails();
  await waitFor(()=>assert.equal(screen.getByLabelText('预览图标').textContent,'stop'));
  assert.equal(screen.getByLabelText('图标颜色').value,'#026100','Clean label preserves color recovery');cleanup();
  let signedOutRequests=0;
  const signedOut={...app,apiClient:{auth:{getToken:()=>''},async request(){signedOutRequests++;return {data:{data:[]}};}}};
  await new bundle.default({},signedOut).load();
  assert.equal(signedOutRequests,0,'Signed-out plugin does not request private icons');
  console.log(lane + (referenceVersion ? ' ' + referenceVersion : '') + ' PASS: entry, 1426 icons, registration, search, shared SVG, persisted color/size and reload, size reset and cancel, apply/cancel, click-only preview, compact details, clear and disabled');
}
main().then(() => { cleanup(); dom.window.close(); if (mixed) process.exit(0); }).catch((error) => { console.error(error.message); process.exitCode = 1; cleanup(); dom.window.close(); if (mixed) process.exit(1); });
