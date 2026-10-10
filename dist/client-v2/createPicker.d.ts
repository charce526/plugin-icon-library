import React from 'react';
import { CustomStore } from './customIcons';
export interface ExtendedIconPickerProps {
    value?: string;
    onChange?: (value: string | null) => void;
    onChangeComplete?: (value: string | null) => void;
    disabled?: boolean;
    suffix?: React.ReactNode;
    iconSize?: number;
    searchable?: boolean;
}
export interface PickerRuntime {
    Icon: React.ComponentType<any>;
    hasIcon: (name: string) => boolean;
    icons: Map<string, any>;
    appName?: string;
    useUser?: () => any;
    getUserId?: () => string | number | undefined;
    custom?: CustomStore;
}
export declare function createIconPicker(runtime: PickerRuntime): React.ForwardRefExoticComponent<Partial<ExtendedIconPickerProps> & React.RefAttributes<unknown>>;
