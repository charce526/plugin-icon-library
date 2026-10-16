import React from 'react';

const bridgeKey = Symbol.for('xz-icon-library:legacy-picker-reference');
type BridgeState = { pickers: WeakMap<object, React.ComponentType<any>> };

/** V1 schema dialogs can retain a component reference copied before registration. */
export function bindLegacyPickerReference(component: any, app: object, picker: any, useApp: () => any) {
  if (!component || component === picker || component.$$typeof !== Symbol.for('react.forward_ref')) return;
  let state: BridgeState = component[bridgeKey];
  if (!state) {
    if (!Object.isExtensible(component) || typeof component.render !== 'function') return;
    state = { pickers: new WeakMap() };
    const Original = React.forwardRef(component.render);
    Original.displayName = component.displayName;
    component[bridgeKey] = state;
    component.render = function LegacyPickerReference(props: any, ref: any) {
      const owner = useApp();
      const Current = owner && state.pickers.get(owner) || Original;
      return <Current {...props} ref={ref} />;
    };
  }
  state.pickers.set(app, picker);
}
