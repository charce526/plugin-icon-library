const slot = Symbol.for('xz-icon-library:picker-registration');
function override(target: any, method: string, picker: any) {
  if (!target?.[method]) return;
  const pickers = { IconPicker: picker, MobileMenuSettingsIconPicker: picker };
  if (target[slot]) target[slot].pickers = pickers;
  else {
    const state = { pickers, register: target[method].bind(target) };
    target[slot] = state;
    target[method] = (components: Record<string, any>) => state.register({ ...components, ...state.pickers });
  }
  target[method](pickers);
}
export function installPickers(app: any, picker: any) {
  override(app, 'addComponents', picker);
  override(app.flowEngine?.flowSettings, 'registerComponents', picker);
}
