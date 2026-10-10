// Compatibility adapter: implementation is shared with V2; only the runtime differs.
import { Icon, Plugin, icons, hasIcon, useCurrentUserContext } from '@nocobase/client';
import { extendedIcons } from './builtins';
import { createIconPicker } from './createPicker';
import { createCustomStore } from './customIcons';
import { installPickers } from './registration';
import { localeResources } from './locale';

export const LegacyIconPicker = createIconPicker({ Icon, icons, hasIcon });
export default class PluginIconLibraryLegacy extends Plugin {
  async load() {
    Object.entries(localeResources).forEach(([language, resources]) => this.app.i18n.addResources(language, '@xiezuo/plugin-icon-library', resources));
    Icon.register(extendedIcons);
    const custom = createCustomStore(this.app.apiClient, (components) => Icon.register(components));
    const Picker = createIconPicker({ Icon, icons, hasIcon, custom, useUser: useCurrentUserContext, appName: this.app.name });
    installPickers(this.app, Picker);
    await custom.refresh().catch(() => {});
  }
}
