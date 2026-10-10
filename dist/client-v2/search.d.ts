export declare const normalize: (value: string) => string;
export declare const rawName: (value: string) => string;
export declare const cleanIconLabel: (value: string) => string;
export declare function keywordsOf(name: string): string;
export declare function metadataKeywords(name: string, entry?: {
    label: string;
    keywords?: string;
}): string;
export declare const industryCategories: {
    key: string;
    label: string;
}[];
export declare const pickerCategories: {
    key: string;
    label: string;
}[];
export declare function matches(name: string, query: string, extra?: string): boolean;
export declare function inCategory(name: string, category: string): boolean;
