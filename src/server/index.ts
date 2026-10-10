import { Plugin } from '@nocobase/server';
import path from 'path';
import { validateDefinition } from '../svg';

export class PluginIconLibraryServer extends Plugin {
  async load() {
    await this.db.import({ directory: path.resolve(__dirname, 'collections') });
    // Normal dev startup does not run the application's global schema sync.
    // Create only this plugin's missing table; never alter an existing table here.
    const collection = this.db.getCollection('xzIconLibraryIcons');
    if (!await this.db.sequelize.getQueryInterface().tableExists(collection.model.getTableName())) {
      await collection.sync({ alter: false });
    }
    this.app.resourceManager.define({
      name: 'iconLibrary',
      actions: {
        list: async (ctx, next) => {
          ctx.body = await ctx.db.getRepository('xzIconLibraryIcons').find({ limit: 5000, sort: ['name'] });
          await next();
        },
        import: async (ctx, next) => {
          const { name, label, keywords = '', definition } = ctx.action.params.values || {};
          if (typeof name !== 'string' || !/^XzCustom[a-zA-Z0-9]{8,64}Outlined$/.test(name)
            || typeof label !== 'string' || !label.trim() || label.length > 100
            || typeof keywords !== 'string' || keywords.length > 255) ctx.throw(400, 'Invalid icon metadata');
          let safe;
          try { safe = validateDefinition(definition); } catch { ctx.throw(400, 'Unsupported SVG'); }
          const repository = ctx.db.getRepository('xzIconLibraryIcons');
          if (await repository.findOne({ filterByTk: name })) ctx.throw(409, 'Icon name already exists');
          if (await repository.count() >= 5000) ctx.throw(400, 'Custom icon limit reached');
          ctx.body = await repository.create({ values: { name, label: label.trim(), keywords, definition: safe } });
          await next();
        },
      },
    });
    this.app.acl.allow('iconLibrary', 'list', 'loggedIn');
    this.app.acl.registerSnippet({ name: 'pm.plugin-icon-library', actions: ['iconLibrary:import'] });
  }
}

export default PluginIconLibraryServer;
