// Compatibility adapter: implementation is shared with V2; only the runtime differs.
import { Icon, IconPicker, Plugin, icons, hasIcon, useApp, useCurrentUserContext } from '@nocobase/client';
import { extendedIcons } from './builtins';
import { createIconPicker } from './createPicker';
import { createCustomStore } from './customIcons';
import { installPickers } from './registration';
import { localeResources } from './locale';
import { bindLegacyPickerReference } from './legacyReferences';

export const LegacyIconPicker = createIconPicker({ Icon, icons, hasIcon });
export default class PluginIconLibraryLegacy extends Plugin {
  async load() {
    Object.entries(localeResources).forEach(([language, resources]) => this.app.i18n.addResources(language, '@xiezuo/plugin-icon-library', resources));
    Icon.register(extendedIcons);
    const custom = createCustomStore(this.app.apiClient, (components) => Icon.register(components));
    const Picker = createIconPicker({ Icon, icons, hasIcon, custom, useUser: useCurrentUserContext, appName: this.app.name });
    const bindReferences = (components?: Record<string, any>) => {
      for (const name of ['IconPicker', 'MobileMenuSettingsIconPicker']) {
        bindLegacyPickerReference(components?.[name], this.app, Picker, useApp);
      }
    };
    bindReferences({ IconPicker });
    installPickers(this.app, Picker, bindReferences);
    await custom.refresh().catch(() => {});
  }
}
