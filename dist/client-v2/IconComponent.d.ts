import React from 'react';
/** Keep the native Icon contract for both SVG libraries. */
export declare function wrapIcon(Component: React.ComponentType<any>, defaultSize?: number): React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<HTMLSpanElement>>;
