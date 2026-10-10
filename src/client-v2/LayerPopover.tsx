import React, { useLayoutEffect, useRef, useState } from 'react';
import { Popover, PopoverProps } from 'antd';

/** Follow the containing popup without importing internal NocoBase subpaths. */
export function LayerPopover({ onLayerChange, ...props }: PopoverProps & { onLayerChange?: (zIndex: number) => void }) {
  const trigger = useRef<HTMLSpanElement>(null);
  const [zIndex, setZIndex] = useState(2000);
  useLayoutEffect(() => {
    let element: HTMLElement | null = trigger.current;
    let highest = 1999;
    while (element) {
      const value = Number(window.getComputedStyle(element).zIndex);
      if (Number.isFinite(value)) highest = Math.max(highest, value);
      element = element.parentElement;
    }
    setZIndex(highest + 1);
    onLayerChange?.(highest + 1);
  }, [props.open, onLayerChange]);
  return <span ref={trigger}><Popover {...props} zIndex={zIndex} />
  </span>;
}
