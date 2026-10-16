/** Mixed V1/V2 pages may render icons through different public runtime registries. */
export function createIconRegistration(app: any, primary: (icons: Record<string, any>) => void) {
  return (components: Record<string, any>) => {
    primary(components);
    const loader = app.requirejs?.requirejs;
    if (typeof loader?.defined !== 'function') return;
    const registered = new Set<Function>([primary]);
    for (const name of ['@nocobase/client', '@nocobase/client-v2']) {
      // Only read already loaded public modules; never trigger a legacy runtime download.
      if (!loader.defined(name)) continue;
      const runtime = loader(name);
      const register = runtime?.registerIcons || runtime?.Icon?.register;
      if (typeof register !== 'function' || registered.has(register)) continue;
      registered.add(register);
      register.call(runtime.Icon, components);
    }
  };
}
