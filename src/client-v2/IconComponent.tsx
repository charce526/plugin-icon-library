import React from 'react';

/** Keep the native Icon contract for both SVG libraries. */
export function wrapIcon(Component: React.ComponentType<any>, defaultSize?: number) {
  return React.forwardRef<HTMLSpanElement, any>(function ExtendedIcon(
    { style, className, spin, rotate, size, strokeWidth, color, twoToneColor, ...props }, ref,
  ) {
    return (
      <span {...props} ref={ref} role={props.role || 'img'}
        className={['anticon', spin && 'anticon-spin', className].filter(Boolean).join(' ')}
        style={{ display: 'inline-flex', alignItems: 'center', color, ...style }}>
        <Component size={size ?? defaultSize ?? '1em'} strokeWidth={strokeWidth ?? 2}
          style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined} />
      </span>
    );
  });
}
