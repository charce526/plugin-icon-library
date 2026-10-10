import React from 'react';
import { CustomIcon, SvgDefinition } from '../svg';
export declare function parseSvg(source: string): SvgDefinition;
export declare function customComponent(definition: SvgDefinition): React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export declare function createCustomStore(api: any, registerIcons: (icons: Record<string, any>) => void): {
    get: () => CustomIcon[];
    subscribe(listener: () => void): () => void;
    refresh(): Promise<void>;
    import(label: string, keywords: string, source: string): Promise<CustomIcon>;
    importDefinition(label: string, keywords: string, value: SvgDefinition): Promise<CustomIcon>;
};
export type CustomStore = ReturnType<typeof createCustomStore>;
