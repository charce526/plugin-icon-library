import React from 'react';
import { PopoverProps } from 'antd';
/** Follow the containing popup without importing internal NocoBase subpaths. */
export declare function LayerPopover({ onLayerChange, ...props }: PopoverProps & {
    onLayerChange?: (zIndex: number) => void;
}): React.JSX.Element;
