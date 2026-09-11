export type IconCategory = {
    key: string;
    label: string;
    keywords: RegExp;
};
/**
 * 分类按常见图标站的分类习惯组织（数字与序号 / 通用操作 / 箭头与方向 / 用户与人物 …），
 * 规则为按图标名（去掉 Xz 前缀与 Outlined 后缀）做正则匹配，一个图标可以命中多个分类。
 * `system*` 是特殊分类，会在选择器里单独从系统图标中筛选。
 */
export declare const categories: IconCategory[];
/**
 * 中文关键词，用于中文搜索（图标本身只有英文名）。
 * key 为 lucide 图标名，value 为可搜索的中文关键词。
 */
export declare const searchableLabels: Record<string, string>;
