import { lucideIcons } from '../client/lucide-icons';
import { numberIcons } from '../client/number-icons';
import { wrapIcon } from './IconComponent';

export const extendedIcons = Object.fromEntries(
  Object.entries({ ...lucideIcons, ...numberIcons }).map(([name, component]) => [`Xz${name}Outlined`, wrapIcon(component)]),
);
export const extendedIconNames = Object.keys(extendedIcons);
