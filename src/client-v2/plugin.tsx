import { Application, Plugin, registerIcons, Icon, icons, hasIcon, useCurrentUserContext } from '@nocobase/client-v2';
import { extendedIcons } from './builtins';
import { createIconPicker } from './createPicker';
import { createCustomStore } from './customIcons';
import { installPickers } from './registration';
import { createIconFieldModel } from './models/IconFieldModel';
import { localeResources } from './locale';

export default class PluginIconLibraryClientV2 extends Plugin<any, Application> {
  async load() {
    Object.entries(localeResources).forEach(([language, resources]) => this.app.i18n.addResources(language, '@xiezuo/plugin-icon-library', resources));
    registerIcons(extendedIcons);
    const custom = createCustomStore(this.app.apiClient, registerIcons);
    const Picker = createIconPicker({ Icon, icons, hasIcon, custom, useUser: useCurrentUserContext,
      getUserId: () => (this.app.flowEngine.context as any).user?.id, appName: this.app.name });
    installPickers(this.app, Picker);
    // Replace the registered model name so existing icon fields get the same picker.
    this.flowEngine.registerModels({ IconFieldModel: createIconFieldModel(Picker) });
    await custom.refresh().catch(() => {});
    this.app.eventBus.addEventListener('dataSource:loaded', () => { void custom.refresh().catch(() => {}); });
  }
}
