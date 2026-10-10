/** Keep saved sizes within compact button/menu layouts, including older variants. */
export function presetSize(attrs?: Record<string, string>): number | undefined {
  const width = Number(attrs?.width);
  if (!Number.isFinite(width) || width < 12 || width > 64 || attrs?.height !== attrs?.width) return undefined;
  if (width <= 13) return 12;
  if (width <= 16) return undefined;
  return width <= 21 ? 20 : 24;
}
