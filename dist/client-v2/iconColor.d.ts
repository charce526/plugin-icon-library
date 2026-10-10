import { CustomIcon, SvgDefinition } from '../svg';
/** Recover the chosen primary from existing saved variants without rewriting them. */
export declare function savedIconColor(entry?: CustomIcon): string | undefined;
/** Snapshot a locally rendered icon, dropping DOM metadata rather than accepting raw HTML. */
export declare function snapshotIcon(svg: SVGElement): SvgDefinition;
export declare function colorIcon(definition: SvgDefinition, color: string): SvgDefinition;
