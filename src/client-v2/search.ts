import { categories } from '../client/catalog';
import { iconKeywords } from './iconKeywords';

export const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
export const rawName = (value: string) => value.replace(/^xz/i, '').replace(/(Outlined|Filled|TwoTone)$/i, '');
export const cleanIconLabel = (value: string) => value.replace(/(?:\s+#[a-f0-9]{6})+\s*$/i, '').trim() || value.trim();

export function keywordsOf(name: string) {
  return iconKeywords[rawName(name).toLowerCase()] || '';
}

export function metadataKeywords(name: string, entry?: { label: string; keywords?: string }) {
  const builtIn = keywordsOf(name);
  if (builtIn) return builtIn;
  // Older colored copies stored guessed business/category words. Derive their
  // translation again from the source label rather than carrying those guesses.
  const sourceLabel = entry ? cleanIconLabel(entry.label) : '';
  const translated = keywordsOf(sourceLabel);
  if (translated && sourceLabel !== entry?.label) return translated;
  return [translated, entry?.keywords].filter(Boolean).join(' ');
}

// Industry shortcuts describe use cases, not the English meaning of each glyph.
// Keep these exact memberships separate from displayed/searchable translations.
const industryMembers: Record<string, Set<string>> = Object.fromEntries(Object.entries({
  industryBuilding: ['Construction', 'HardHat', 'House', 'HousePlus', 'HousePlug', 'HouseWifi', 'Factory', 'Warehouse', 'Ruler', 'RulerDimensionLine', 'Cuboid', 'Box', 'Boxes', 'Layers', 'Layers2', 'Hammer', 'Drill', 'DraftingCompass', 'BrickWall'],
  industryProject: ['Project', 'Kanban', 'FolderKanban', 'SquareKanban', 'SquareDashedKanban', 'Workflow', 'Clipboard', 'ClipboardList', 'ClipboardCheck', 'ListChecks', 'Calendar', 'CalendarCheck', 'Milestone', 'Gantt', 'ChartGantt', 'ChartNoAxesGantt'],
  industryFinance: ['AccountBook', 'Calculator', 'Coins', 'Dollar', 'DollarCircle', 'DollarSign', 'CircleDollarSign', 'Bank', 'Banknote', 'BanknoteArrowDown', 'BanknoteArrowUp', 'Receipt', 'ReceiptText', 'Wallet', 'WalletMinimal', 'CreditCard', 'PiggyBank', 'MoneyCollect', 'Reconciliation'],
  industryCRM: ['User', 'Users', 'UserRound', 'UsersRound', 'UserAdd', 'UserPlus', 'UserRoundSearch', 'UserSearch', 'Team', 'ContactRound', 'Contacts', 'CustomerService', 'Phone', 'Mail'],
}).map(([key, names]) => [key, new Set(names.map((name) => name.toLowerCase()))]));

export const industryCategories = [
  { key: 'industryBuilding', label: '建筑工程' },
  { key: 'industryProject', label: '项目管理' },
  { key: 'industryFinance', label: '财务与成本' },
  { key: 'industryCRM', label: '客户管理' },
];

export const pickerCategories = [
  { key: 'all', label: '全部图标' }, { key: 'extended', label: '扩展图标' },
  { key: 'recent', label: '最近使用' }, { key: 'favorites', label: '我的收藏' },
  { key: 'custom', label: '自定义图标' },
  ...categories.filter((c) => c.key !== 'all'), ...industryCategories,
];

export function matches(name: string, query: string, extra = '') {
  const tokens = query.trim().split(/\s+/).filter(Boolean).map(normalize);
  const text = normalize(`${name} ${rawName(name)} ${keywordsOf(name)} ${extra}`);
  return tokens.every((token) => text.includes(token));
}

export function inCategory(name: string, category: string) {
  if (category === 'all') return true;
  if (category === 'extended') return /^xz/i.test(name);
  if (category === 'custom') return /^xzcustom/i.test(name);
  if (category.startsWith('system')) {
    const suffix = category.slice(6).toLowerCase();
    return !/^xz/i.test(name) && name.toLowerCase().endsWith(suffix);
  }
  const industry = industryCategories.find((c) => c.key === category);
  if (industry) return industryMembers[category].has(rawName(name).toLowerCase());
  return categories.find((c) => c.key === category)?.keywords.test(rawName(name)) ?? true;
}
