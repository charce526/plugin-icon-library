import React from 'react';
export interface ExtendedIconPickerProps {
    value?: string;
    onChange?: (value: string | null) => void;
    disabled?: boolean;
    suffix?: React.ReactNode;
    iconSize?: number;
    searchable?: boolean;
}
export declare const ExtendedIconPicker: React.ForwardRefExoticComponent<Partial<ExtendedIconPickerProps> & React.RefAttributes<unknown>>;
