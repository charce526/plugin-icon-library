export type SvgNode = {
    tag: string;
    attrs: Record<string, string>;
    children?: SvgNode[];
};
export type SvgDefinition = {
    viewBox: string;
    attrs: Record<string, string>;
    nodes: SvgNode[];
};
export type CustomIcon = {
    name: string;
    label: string;
    keywords: string;
    definition: SvgDefinition;
};
export declare function validateDefinition(value: unknown): SvgDefinition;
