import { Icon, Plugin } from '@nocobase/client';
import React from 'react';
import { ExtendedIconPicker } from './ExtendedIconPicker';
import { extendedIcons } from './icons';

/**
 * NocoBase 2.x 里图标选择器与图标注册表都不止一份，插件需要逐个接管：
 *
 * 1. 图标注册表
 *    - `@nocobase/client`：旧版 schema 渲染，菜单 / 图标字段等；
 *    - `@nocobase/client-v2`：FlowEngine 渲染的界面（例如表格行按钮），
 *      它内部是**另一份** Icon 注册表，不注册进去按钮图标就渲染不出来。
 * 2. 图标选择器组件
 *    - `app.addComponents()`：旧版 schema 里的 `x-component: 'IconPicker'`；
 *    - `app.flowEngine.flowSettings.components`：FlowEngine 设置表单里的图标字段。
 */
const ICON_PICKER_NAMES = ['IconPicker', 'MobileMenuSettingsIconPicker'];
const ICON_MODULES = ['@nocobase/client', '@nocobase/client-v2'];
/** 图标注册表可能随核心插件稍后才就绪，失败时重试 */
const REGISTER_RETRY_TIMES = 20;
const REGISTER_RETRY_INTERVAL = 500;

function resolveRuntimeModule(name: string): any {
  const globalThisAny = window as any;
  // 开发模式：app-dev 会把共享依赖挂到 window 上
  const fromDevDeps = globalThisAny.__nocobase_app_dev_deps__?.[name];
  if (fromDevDeps) {
    return fromDevDeps;
  }
  // 生产模式：核心模块通过内置 requirejs 注册（defineGlobalDep 会执行 requirejs.define）
  try {
    return globalThisAny.requirejs?.requirejs?.(name) || null;
  } catch (error) {
    return null;
  }
}

export class PluginIconLibraryClient extends Plugin {
  async load() {
    // 旧版注册表：静态 import 的 Icon 就是它，直接注册
    Icon.register(extendedIcons);
    // 其余注册表：运行时解析后注册（client-v2 是 FlowEngine 渲染按钮图标用的那份）
    this.registerIconsToOtherRegistries(0);
    // 旧版 schema 里的图标选择器
    this.app.addComponents({ IconPicker: ExtendedIconPicker });
    // FlowEngine 设置表单里的图标选择器
    this.takeOverFlowSettingsIconPicker();
  }

  private registerIconsToOtherRegistries(attempt: number) {
    const pending = ICON_MODULES.filter((name) => {
      const mod = resolveRuntimeModule(name);
      if (typeof mod?.registerIcons === 'function') {
        mod.registerIcons(extendedIcons);
        return false;
      }
      return true;
    });

    if (!pending.length) {
      return;
    }
    if (attempt < REGISTER_RETRY_TIMES) {
      setTimeout(() => this.registerIconsToOtherRegistries(attempt + 1), REGISTER_RETRY_INTERVAL);
      return;
    }
    console.warn(`[plugin-icon-library] 以下图标注册表未就绪，扩展图标可能无法渲染：${pending.join(', ')}`);
  }

  private takeOverFlowSettingsIconPicker() {
    const flowSettings = (this.app as any).flowEngine?.flowSettings;
    if (!flowSettings?.components) {
      console.warn('[plugin-icon-library] flowEngine.flowSettings 不可用，跳过注册');
      return;
    }

    const originalRegister = flowSettings.registerComponents.bind(flowSettings);

    const applyIconPickers = () => {
      ICON_PICKER_NAMES.forEach((name) => {
        flowSettings.components[name] = ExtendedIconPicker;
      });
    };
    applyIconPickers();

    // 核心插件可能在之后才注册原生 IconPicker，这里保证最终生效的是扩展图标选择器
    flowSettings.registerComponents = (components: Record<string, any>) => {
      if (!components) {
        return;
      }
      const rest = { ...components };
      ICON_PICKER_NAMES.forEach((name) => {
        delete rest[name];
      });
      originalRegister(rest);
      applyIconPickers();
    };
  }
}

export default PluginIconLibraryClient;
