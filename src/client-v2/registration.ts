const slot = Symbol.for('xz-icon-library:picker-registration');
function override(target: any, method: string, picker: any, onRegister?: (components: Record<string, any>) => void) {
  if (!target?.[method]) return;
  const pickers = { IconPicker: picker, MobileMenuSettingsIconPicker: picker };
  const state = target[slot] || { register: target[method].bind(target) };
  state.pickers = pickers;
  state.onRegister = onRegister;
  target[slot] = state;
  // Replace the wrapper even when the slot was created by 2.0.0, which had no callback.
  target[method] = (components: Record<string, any>) => {
    state.onRegister?.(components);
    return state.register({ ...components, ...state.pickers });
  };
  target[method](pickers);
}
export function installPickers(app: any, picker: any, onRegister?: (components: Record<string, any>) => void) {
  onRegister?.(app.components);
  onRegister?.(app.flowEngine?.flowSettings?.components);
  override(app, 'addComponents', picker, onRegister);
  override(app.flowEngine?.flowSettings, 'registerComponents', picker, onRegister);
}
