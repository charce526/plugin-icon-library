import { Icon, hasIcon, icons } from '@nocobase/client-v2';
import { createIconPicker } from './createPicker';
export type { ExtendedIconPickerProps } from './createPicker';
export const ExtendedIconPicker = createIconPicker({ Icon, hasIcon, icons });
