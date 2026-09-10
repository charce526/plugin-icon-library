import React from 'react';
import { lucideIcons } from './lucide-icons';
import { numberIcons } from './number-icons';

/**
 * 扩展图标清单：
 * - `lucide-icons.ts`：由 scripts/generate-icons.mjs 从 lucide-react 生成，
 *   已剔除与 Ant Design 内置图标同名或语义重复的图标（开发/网页高频图标会强制保留）；
 * - `number-icons.tsx`：数字序号图标（lucide 没有，按同一线框风格生成）。
 *
 * 注册进 NocoBase 图标表时统一使用 `Xz` 前缀 + `Outlined` 后缀：
 * - `Xz` 前缀：避免覆盖系统图标；
 * - `Outlined` 后缀：让图标也能出现在原生 IconPicker 的“线框”分组里。
 *
 * 渲染时套一层 `anticon`，让 lucide 图标与 Ant Design 图标拥有相同的对齐方式，
 * 并且 `size` 用 1em 跟随外部 fontSize。
 */
const source: Record<string, React.ComponentType<any>> = { ...lucideIcons, ...numberIcons };

export const extendedIcons = Object.fromEntries(
  Object.entries(source).map(([name, Component]) => [
    `Xz${name}Outlined`,
    ({ style, className }: any = {}) => (
      <span
        className={['anticon', className].filter(Boolean).join(' ')}
        style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      >
        <Component size="1em" strokeWidth={2} />
      </span>
    ),
  ]),
);

export const extendedIconNames = Object.keys(source).map((name) => `Xz${name}Outlined`);
