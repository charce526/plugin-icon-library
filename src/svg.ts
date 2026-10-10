export type SvgNode = { tag: string; attrs: Record<string, string>; children?: SvgNode[] };
export type SvgDefinition = { viewBox: string; attrs: Record<string, string>; nodes: SvgNode[] };
export type CustomIcon = { name: string; label: string; keywords: string; definition: SvgDefinition };
const tags = new Set(['g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
const numbers = new Set(['x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'strokeWidth', 'opacity', 'fillOpacity', 'strokeOpacity', 'strokeDashoffset']);
const enums: Record<string, string[]> = { strokeLinecap: ['butt', 'round', 'square'], strokeLinejoin: ['miter', 'round', 'bevel'], fillRule: ['nonzero', 'evenodd'], clipRule: ['nonzero', 'evenodd'] };
function attrsOf(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid SVG attributes');
  const result: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw !== 'string' || raw.length > 20000) throw new Error('Invalid SVG attribute');
    let valid = false;
    if (numbers.has(key)) valid = raw.trim() !== '' && Number.isFinite(Number(raw)) && Math.abs(Number(raw)) <= 100000;
    if (key === 'fill' || key === 'stroke') valid = /^(none|currentColor|transparent|#[\da-fA-F]{3,8}|[a-zA-Z]{1,20})$/.test(raw);
    if (key === 'd') valid = /^[MmLlHhVvCcSsQqTtAaZz\d.eE+,\s-]+$/.test(raw);
    if (key === 'points' || key === 'strokeDasharray') valid = /^[\d.eE+,\s-]+$/.test(raw);
    if (key === 'transform') valid = /^(\s*(matrix|translate|scale|rotate|skewX|skewY)\(\s*[-+\d.eE,\s]+\)\s*)+$/.test(raw);
    if (enums[key]) valid = enums[key].includes(raw);
    if (!valid) throw new Error(`Unsupported SVG attribute: ${key}`);
    result[key] = raw;
  }
  return result;
}
export function validateDefinition(value: unknown): SvgDefinition {
  if (!value || typeof value !== 'object' || JSON.stringify(value).length > 50000) throw new Error('SVG exceeds size limit');
  const definition = value as SvgDefinition;
  if (typeof definition.viewBox !== 'string') throw new Error('SVG requires a viewBox');
  const box = definition.viewBox.trim().split(/[\s,]+/).map(Number);
  if (box.length !== 4 || box.some((n) => !Number.isFinite(n) || Math.abs(n) > 100000) || box[2] <= 0 || box[3] <= 0) throw new Error('Invalid SVG viewBox');
  let count = 0;
  const visit = (nodes: SvgNode[], depth: number): SvgNode[] => {
    if (!Array.isArray(nodes) || depth > 10) throw new Error('Invalid SVG structure');
    return nodes.map((node) => {
      if (++count > 256 || !node || !tags.has(node.tag)) throw new Error('Unsupported SVG element');
      return { tag: node.tag, attrs: attrsOf(node.attrs), children: node.children ? visit(node.children, depth + 1) : [] };
    });
  };
  const nodes = visit(definition.nodes, 0);
  if (!count) throw new Error('SVG has no shapes');
  return { viewBox: box.join(' '), attrs: attrsOf(definition.attrs), nodes };
}
