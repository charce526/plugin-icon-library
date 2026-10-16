// Real V1 Icon/Picker/SchemaComponentOptions from the pinned official source;
// app lifecycle and app context are fixtures, not a V2 component adapter.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const references = require('./v1-reference-manifest.json');
const version = process.argv.find((arg) => arg.startsWith('--version='))?.slice('--version='.length) || references.defaultVersion;
assert(references.versions[version], 'Unsupported reference version: ' + version);
const reference = { version, files: references.versions[version] };
const cache = path.join(root, 'release/validation', `nocobase-v${reference.version}-client`);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/admin/' });
for (const key of ['window','document','HTMLElement','Element','Node','SVGElement','ShadowRoot','MutationObserver','Event','EventTarget','DOMParser']) global[key] = dom.window[key];
const computed = window.getComputedStyle.bind(window);
window.getComputedStyle = (element) => computed(element);
global.getComputedStyle = window.getComputedStyle;
window.matchMedia = (query) => ({ matches: query === '(min-width: 768px)', addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
const React = require('react');
const { render, fireEvent, screen, waitFor, cleanup } = require('@testing-library/react');
const formily = require('@formily/react');
const { createForm } = require('@formily/core');
const AppContext = React.createContext(undefined);
const useApp = () => React.useContext(AppContext);

async function prepareReferences() {
  for (const [relative, expected] of Object.entries(reference.files)) {
    const file = path.join(cache, relative);
    if (!fs.existsSync(file)) {
      const url = `https://raw.githubusercontent.com/nocobase/nocobase/v${reference.version}/packages/core/client/src/${relative}`;
      const response = await fetch(url);
      assert(response.ok, `Cannot fetch V1 reference: ${relative}`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    }
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), expected, `V1 source hash mismatch: ${relative}`);
  }
}
function source(relative, overrides = {}) {
  const filename = path.join(cache, relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })((name) => overrides[name] || require(name), mod, mod.exports);
  return mod.exports;
}
async function main() {
  await prepareReferences();
  const i18n = require('i18next');
  await i18n.init({ lng: 'zh-CN', fallbackLng: 'en-US', resources: {}, interpolation: { escapeValue: false } });
  require('react-i18next').setI18n(i18n);
  const icon = source('icon/Icon.tsx');
  const native = source('schema-component/antd/icon-picker/IconPicker.tsx', {
    '../../../icon': icon, '../popover': { StablePopover: require('antd').Popover },
  }).IconPicker;
  const { SchemaComponentOptions } = source('schema-component/core/SchemaComponentOptions.tsx');
  class Plugin { constructor(options, app) { this.options = options; this.app = app; } }
  let bundle;
  const script = document.createElement('script');
  script.src = 'http://localhost/static/plugins/@xiezuo/plugin-icon-library/dist/client/index.js';
  document.head.appendChild(script);
  const define = (name, deps, factory) => {
    assert.equal(name, '@xiezuo/plugin-icon-library');
    assert(!deps.includes('@nocobase/client-v2'), 'The V1 entry must not use the V2 runtime');
    bundle = factory(...deps.map((name) => name === '@nocobase/client'
      ? { ...icon, IconPicker: native, Plugin, useApp, useCurrentUserContext: () => ({ data: { data: { id: 1 } } }) }
      : require(name)));
  };
  define.amd = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/client/index.js'), 'utf8'), {
    window, document, console, self: window, define, Event, DOMParser, localStorage: window.localStorage, crypto: crypto.webcrypto,
  });
  const rows = [];
  const app = { name: 'v1-real', i18n, components: { IconPicker: native },
    addComponents(components) { Object.assign(this.components, components); },
    apiClient: { async request({ url, data }) { if (url === 'iconLibrary:import') { rows.push(data); return { data: { data } }; } return { data: { data: rows } }; } },
  };
  // Same copy made by V1 settings dialogs. It deliberately retains the old object.
  const snapshot = { ...app.components };
  // An application can already have the 2.0.0 registration wrapper.
  const previous = { pickers: { IconPicker: native }, register: app.addComponents.bind(app) };
  app[Symbol.for('xz-icon-library:picker-registration')] = previous;
  app.addComponents = (components) => previous.register({ ...components, ...previous.pickers });
  const oldRender = native.render;
  await new bundle.default({}, app).load();
  function formView(owner, components, fieldType = 'IconPicker', form = createForm({ values: { icon: 'XzTerminalOutlined' } })) {
    return { form, ...render(React.createElement(AppContext.Provider, { value: owner },
      React.createElement(formily.FormProvider, { form },
        React.createElement(SchemaComponentOptions, { components: owner.components },
          React.createElement(SchemaComponentOptions, { components },
            React.createElement(formily.RecursionField, { schema: new formily.Schema({ type: 'object', properties: { icon: { type: 'string', 'x-component': fieldType } } }) })))))) };
  }
  const view = formView(app, snapshot);
  fireEvent.click(screen.queryByRole('button', { name: /选择图标|Select icon/ }) || view.container.querySelector('button'));
  assert(screen.getByRole('button', { name: /^应\s*用$/ }), 'A captured V1 picker must show the current Apply/Cancel interface');
  assert.notEqual(native.render, oldRender, 'The old captured reference is bridged');
  assert.equal(snapshot.IconPicker, native, 'No copied schema context needs to be rewritten');
  fireEvent.change(screen.getByPlaceholderText('搜索图标名称或中文关键词'), { target: { value: '服务器' } });
  fireEvent.click(await screen.findByRole('button', { name: 'Server', exact: true }));
  assert.equal(view.form.values.icon, 'XzTerminalOutlined', 'Click is a draft, not an immediate change');
  assert.equal(screen.getByLabelText('预览图标').textContent, 'Server');
  assert(screen.getByRole('radio', { name: '默认', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /^应\s*用$/ }));
  assert.equal(view.form.values.icon, 'XzServerOutlined');
  fireEvent.click(screen.getByRole('button', { name: '选择图标' }));
  fireEvent.change(screen.getByLabelText('图标颜色'), { target: { value: '#ef4444' } });
  fireEvent.click(screen.getByRole('radio', { name: '加大', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /^应\s*用$/ }));
  await waitFor(() => assert.equal(view.form.values.icon, rows[0]?.name));
  assert.equal(rows[0].definition.attrs.stroke, '#ef4444');
  assert.equal(rows[0].definition.attrs.width, '24');
  fireEvent.click(screen.getByRole('button', { name: '选择图标' }));
  assert.equal(screen.getByLabelText('图标颜色').value, '#ef4444');
  assert(screen.getByRole('radio', { name: '加大', exact: true }).checked);
  assert.equal(screen.getByLabelText('预览图标').closest('.ant-space').querySelector('svg').getAttribute('width'), '40');
  fireEvent.change(screen.getByLabelText('图标颜色'), { target: { value: '#00ff00' } });
  fireEvent.click(screen.getByRole('button', { name: /^取\s*消$/ }));
  assert.equal(rows.length, 1, 'Cancel does not save a variant'); cleanup();

  // A later registration may already have been captured by a local schema.
  const late = React.forwardRef(() => React.createElement('button', null, 'old mobile picker'));
  app.addComponents({ MobileMenuSettingsIconPicker: late });
  formView(app, { MobileMenuSettingsIconPicker: late }, 'MobileMenuSettingsIconPicker');
  fireEvent.click(screen.getByRole('button', { name: '选择图标' }));
  assert(screen.getByRole('button', { name: /^应\s*用$/ })); cleanup();

  const other = { components: { IconPicker: native } };
  const foreign = formView(other, { IconPicker: native });
  assert(!screen.queryByRole('button', { name: '选择图标' }), 'Apps without this plugin retain their native control');
  assert(foreign.container.querySelector('svg')); cleanup();
  const bridge = native.render;
  await new bundle.default({}, app).load();
  assert.equal(native.render, bridge, 'Reload updates per-app bindings without stacking patches');
  console.log(`V1 ${reference.version} PASS: real native registry/control and schema contexts, captured references, field Apply/Cancel, color/size persistence, late mobile registration, app isolation and reload`);
}
main().then(() => { cleanup(); dom.window.close(); }).catch((error) => { console.error(error.message); process.exitCode = 1; cleanup(); dom.window.close(); });
