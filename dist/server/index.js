/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var server_exports = {};
__export(server_exports, {
  PluginIconLibraryServer: () => PluginIconLibraryServer,
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_server = require("@nocobase/server");
var import_path = __toESM(require("path"));
var import_svg = require("../svg");
class PluginIconLibraryServer extends import_server.Plugin {
  async load() {
    await this.db.import({ directory: import_path.default.resolve(__dirname, "collections") });
    const collection = this.db.getCollection("xzIconLibraryIcons");
    if (!await this.db.sequelize.getQueryInterface().tableExists(collection.model.getTableName())) {
      await collection.sync({ alter: false });
    }
    this.app.resourceManager.define({
      name: "iconLibrary",
      actions: {
        list: async (ctx, next) => {
          ctx.body = await ctx.db.getRepository("xzIconLibraryIcons").find({ limit: 5e3, sort: ["name"] });
          await next();
        },
        import: async (ctx, next) => {
          const { name, label, keywords = "", definition } = ctx.action.params.values || {};
          if (typeof name !== "string" || !/^XzCustom[a-zA-Z0-9]{8,64}Outlined$/.test(name) || typeof label !== "string" || !label.trim() || label.length > 100 || typeof keywords !== "string" || keywords.length > 255) ctx.throw(400, "Invalid icon metadata");
          let safe;
          try {
            safe = (0, import_svg.validateDefinition)(definition);
          } catch {
            ctx.throw(400, "Unsupported SVG");
          }
          const repository = ctx.db.getRepository("xzIconLibraryIcons");
          if (await repository.findOne({ filterByTk: name })) ctx.throw(409, "Icon name already exists");
          if (await repository.count() >= 5e3) ctx.throw(400, "Custom icon limit reached");
          ctx.body = await repository.create({ values: { name, label: label.trim(), keywords, definition: safe } });
          await next();
        }
      }
    });
    this.app.acl.allow("iconLibrary", "list", "loggedIn");
    this.app.acl.registerSnippet({ name: "pm.plugin-icon-library", actions: ["iconLibrary:import"] });
  }
}
var server_default = PluginIconLibraryServer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PluginIconLibraryServer
});
