import { CustomIcon, SvgDefinition, SvgNode, validateDefinition } from '../svg';

/** Recover the chosen primary from existing saved variants without rewriting them. */
export function savedIconColor(entry?: CustomIcon): string | undefined {
  if (!entry) return undefined;
  const hex = (value?: string) => value && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase()
    : value && /^#[\da-f]{3}$/i.test(value) ? '#' + [...value.slice(1)].map((digit) => digit + digit).join('').toLowerCase() : undefined;
  const paints = new Set<string>();
  const collect = (attrs: Record<string, string>) => {
    for (const key of ['fill', 'stroke']) { const value = hex(attrs[key]); if (value) paints.add(value); }
  };
  const scan = (node: SvgNode) => { collect(node.attrs); node.children?.forEach(scan); };
  collect(entry.definition.attrs); entry.definition.nodes.forEach(scan);
  const labeled = hex(entry.label.match(/\s+(#[\da-f]{6})$/i)?.[1]);
  if (labeled && paints.has(labeled)) return labeled;
  return hex(entry.definition.attrs.stroke) || hex(entry.definition.attrs.fill)
    || (paints.size === 1 ? [...paints][0] : undefined);
}

const paintAttributes = new Set(['fill', 'stroke']);
const drawingAttributes = new Set(['d','points','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','strokeWidth','opacity','fillOpacity','strokeOpacity','strokeDashoffset','strokeDasharray','transform','strokeLinecap','strokeLinejoin','fillRule','clipRule']);
/** Snapshot a locally rendered icon, dropping DOM metadata rather than accepting raw HTML. */
export function snapshotIcon(svg: SVGElement): SvgDefinition {
  const attrs = (element: Element, root = false) => Object.fromEntries([...element.attributes].flatMap((attribute) => {
    const name = attribute.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (root && ['width','height'].includes(name)) return [];
    return paintAttributes.has(name) || drawingAttributes.has(name) ? [[name, attribute.value]] : [];
  }));
  const visit = (element: Element): SvgNode => ({ tag: element.localName, attrs: attrs(element), children: [...element.children].map(visit) });
  return validateDefinition({ viewBox: svg.getAttribute('viewBox'), attrs: attrs(svg, true), nodes: [...svg.children].map(visit) });
}
export function colorIcon(definition: SvgDefinition, color: string): SvgDefinition {
  if (!/^#[\da-f]{6}$/i.test(color)) throw new Error('Invalid icon color');
  const hex = (value: string) => {
    value = ({ white: '#ffffff', black: '#000000' } as Record<string, string>)[value.toLowerCase()] || value;
    if (/^#[\da-f]{3}$/i.test(value)) return '#' + [...value.slice(1)].map((digit) => digit + digit).join('').toLowerCase();
    return /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : undefined;
  };
  const paints = new Set<string>();
  const collect = (attrs: Record<string, string>) => {
    for (const key of paintAttributes) { const value = hex(attrs[key] || ''); if (value) paints.add(value); }
  };
  const scan = (node: SvgNode) => { collect(node.attrs); node.children?.forEach(scan); };
  collect(definition.attrs); definition.nodes.forEach(scan);
  // Keep the light layer of a two-tone/multi-paint icon instead of flattening it.
  const brightness = (value: string) => [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => sum + weight * parseInt(value.slice(1 + index * 2, 3 + index * 2), 16), 0);
  const lightPaint = paints.size > 1 ? [...paints].sort((a, b) => brightness(b) - brightness(a))[0] : undefined;
  // Very light primaries need a darker secondary; white-on-white would collapse too.
  const weight = brightness(color) > 220 ? 0.8 : 0.14;
  const background = brightness(color) > 220 ? 0 : 255;
  const secondary = '#' + [0, 1, 2].map((index) => Math.round(parseInt(color.slice(1 + index * 2, 3 + index * 2), 16) * weight + background * (1 - weight)).toString(16).padStart(2, '0')).join('');
  const attrs = (value: Record<string,string>) => Object.fromEntries(Object.entries(value).map(([key,item]) =>
    [key, paintAttributes.has(key) && item !== 'none' && item !== 'transparent'
      ? lightPaint && hex(item) === lightPaint ? secondary : color : item]));
  const visit = (node: SvgNode): SvgNode => ({ ...node, attrs: attrs(node.attrs), children: node.children?.map(visit) });
  return validateDefinition({ ...definition, attrs: { fill: color, ...attrs(definition.attrs) }, nodes: definition.nodes.map(visit) });
}
