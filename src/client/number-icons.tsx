import React from 'react';
import { numberIconPaths } from './number-icons.generated';

/**
 * 数字序号图标：数据来自开源图标库 Material Design Icons（见 number-icons.generated.ts，Apache-2.0）。
 * 覆盖 0~10，每个数字有 5 种样式：实心、圆形、圆形描边、方形、方形描边。
 */
const MdiNumberIcon = ({ d }: { d: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

export const numberIcons: Record<string, React.ComponentType<any>> = Object.fromEntries(
  Object.entries(numberIconPaths).map(([name, d]) => [name, () => <MdiNumberIcon d={d} />]),
);
