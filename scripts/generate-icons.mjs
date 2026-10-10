/**
 * 从 lucide-react 生成扩展图标清单。
 *
 * 用法：
 *   node scripts/generate-icons.mjs           # 生成 src/client/lucide-icons.ts
 *   node scripts/generate-icons.mjs --report  # 只打印统计信息，不写文件
 *
 * 过滤规则：
 *   1. 只保留 lucide 的“正式图标”文件（别名文件只有 re-export，没有 __iconNode），
 *      顺带去掉 lucide 内部的重复别名（AlertCircle / CircleAlert 这类）。
 *   2. 去掉与 Ant Design 内置图标同名或语义重复的图标（名称归一化 + ALIAS_DUPES 映射），
 *      这些图标系统里已经有，没必要再放一份。
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.resolve(scriptDir, '..');
const outFile = path.join(pluginDir, 'src', 'client', 'lucide-icons.ts');
const reportOnly = process.argv.includes('--report');

/** 与 Ant Design 内置图标语义重复、但名字不同的 lucide 图标 -> antd 名称（会自动校验是否存在） */
const ALIAS_DUPES = {
  AlertCircle: ['ExclamationCircle'],
  AlertTriangle: ['Warning'],
  ArrowDownCircle: ['DownCircle'],
  ArrowDownToLine: ['Download'],
  ArrowLeftCircle: ['LeftCircle'],
  ArrowRightCircle: ['RightCircle'],
  ArrowUpCircle: ['UpCircle'],
  ArrowUpToLine: ['Upload'],
  Ban: ['Stop'],
  BarChart: ['BarChart'],
  BarChart2: ['BarChart'],
  BarChart3: ['BarChart'],
  BarChart4: ['BarChart'],
  BarChartBig: ['BarChart'],
  Bell: ['Bell'],
  Bookmark: ['Bookmark'],
  BoxSelect: ['Select'],
  Briefcase: ['Container'],
  Building: ['Bank'],
  Building2: ['Bank'],
  CalendarClock: ['Calendar'],
  CalendarDays: ['Calendar'],
  CalendarFold: ['Calendar'],
  CheckSquare: ['CheckSquare'],
  ChevronDownCircle: ['DownCircle'],
  ChevronsLeft: ['DoubleLeft'],
  ChevronsRight: ['DoubleRight'],
  CircleAlert: ['ExclamationCircle'],
  CircleArrowDown: ['DownCircle'],
  CircleArrowLeft: ['LeftCircle'],
  CircleArrowOutDownLeft: ['DownCircle'],
  CircleArrowOutDownRight: ['DownCircle'],
  CircleArrowOutUpLeft: ['UpCircle'],
  CircleArrowOutUpRight: ['UpCircle'],
  CircleArrowRight: ['RightCircle'],
  CircleArrowUp: ['UpCircle'],
  CircleCheck: ['CheckCircle'],
  CircleCheckBig: ['CheckCircle'],
  CircleChevronDown: ['DownCircle'],
  CircleChevronLeft: ['LeftCircle'],
  CircleChevronRight: ['RightCircle'],
  CircleChevronUp: ['UpCircle'],
  CircleHelp: ['QuestionCircle'],
  CircleMinus: ['MinusCircle'],
  CirclePlus: ['PlusCircle'],
  CirclePower: ['Poweroff'],
  CircleQuestionMark: ['QuestionCircle'],
  CircleUser: ['User'],
  CircleUserRound: ['User'],
  CircleX: ['CloseCircle'],
  Clipboard: ['Profile'],
  Clock: ['ClockCircle'],
  Clock2: ['ClockCircle'],
  Code: ['Code'],
  Code2: ['Code'],
  Contact: ['Contacts'],
  Container: ['Container'],
  Copy: ['Copy'],
  CreditCard: ['CreditCard'],
  Crop: ['Crop'],
  Database: ['Database'],
  DollarSign: ['Dollar'],
  Download: ['Download'],
  Edit: ['Edit'],
  Edit2: ['Edit'],
  Edit3: ['Edit'],
  EllipsisVertical: ['More'],
  Eye: ['Eye'],
  EyeOff: ['EyeInvisible'],
  FastForward: ['FastForward'],
  FileArchive: ['FileZip'],
  FileAudio: ['FileAudio'],
  FileCheck: ['FileDone'],
  FileCheck2: ['FileDone'],
  FileImage: ['FileImage'],
  FileJson: ['FileUnknown'],
  FileLock: ['FileProtect'],
  FileLock2: ['FileProtect'],
  FileMinus: ['FileExclamation'],
  FilePen: ['FileText'],
  FilePenLine: ['FileText'],
  FileSignature: ['FileDone'],
  FileTerminal: ['FileUnknown'],
  FileX: ['FileExclamation'],
  FileX2: ['FileExclamation'],
  Film: ['VideoCamera'],
  FolderCog: ['FolderOpen'],
  FolderDot: ['FolderOpen'],
  FolderKey: ['FolderOpen'],
  FolderLock: ['FolderOpen'],
  FolderOpenDot: ['FolderOpen'],
  FolderPen: ['FolderOpen'],
  FolderSearch: ['FolderOpen'],
  FolderSync: ['FolderOpen'],
  FolderTree: ['FolderOpen'],
  Gauge: ['Dashboard'],
  GaugeCircle: ['Dashboard'],
  Globe: ['Global'],
  Globe2: ['Global'],
  GlobeLock: ['Global'],
  Grid2X2: ['Appstore'],
  Handshake: ['Team'],
  Hash: ['Number'],
  Heart: ['Heart'],
  History: ['History'],
  Hourglass: ['Hourglass'],
  Image: ['Picture'],
  ImagePlus: ['Picture'],
  Info: ['Info'],
  Key: ['Key'],
  KeyRound: ['Key'],
  KeySquare: ['Key'],
  Layers: ['Layers'],
  Layers2: ['Layers'],
  Layers3: ['Layers'],
  LayoutDashboard: ['Dashboard'],
  LayoutGrid: ['Appstore'],
  LayoutList: ['UnorderedList'],
  LayoutPanelLeft: ['Layout'],
  Lightbulb: ['Bulb'],
  LightbulbOff: ['Bulb'],
  LineChart: ['LineChart'],
  Link: ['Link'],
  Link2: ['Link'],
  Link2Off: ['Disconnect'],
  List: ['UnorderedList'],
  ListFilter: ['Filter'],
  ListOrdered: ['OrderedList'],
  ListTodo: ['OrderedList'],
  Lock: ['Lock'],
  LockKeyhole: ['Lock'],
  LogIn: ['Login'],
  LogOut: ['Logout'],
  Mail: ['Mail'],
  MapPin: ['Environment'],
  MapPinned: ['Environment'],
  Maximize: ['Expand'],
  Maximize2: ['Expand'],
  Merge: ['MergeCells'],
  MessageCircle: ['Comment'],
  MessageCircleMore: ['Comment'],
  MessageSquare: ['Message'],
  MessageSquareMore: ['Message'],
  Mic: ['Audio'],
  MicOff: ['AudioMuted'],
  Minimize: ['Compress'],
  Minimize2: ['Compress'],
  MinusCircle: ['MinusCircle'],
  MinusSquare: ['MinusSquare'],
  Monitor: ['Desktop'],
  Moon: ['Moon'],
  MoreHorizontal: ['Ellipsis'],
  MousePointer: ['Select'],
  Move: ['Drag'],
  Move3D: ['Drag'],
  Navigation: ['Compass'],
  Pencil: ['Edit'],
  PencilLine: ['Edit'],
  PencilRuler: ['Edit'],
  Phone: ['Phone'],
  PhoneCall: ['Phone'],
  PieChart: ['PieChart'],
  PlusCircle: ['PlusCircle'],
  PlusSquare: ['PlusSquare'],
  Power: ['Poweroff'],
  Printer: ['Printer'],
  QrCode: ['Qrcode'],
  RefreshCcw: ['Reload'],
  RefreshCcwDot: ['Reload'],
  RefreshCw: ['Reload'],
  RefreshCwOff: ['Reload'],
  Repeat: ['Reload'],
  Repeat1: ['Reload'],
  Repeat2: ['Swap'],
  Rotate3D: ['Undo'],
  RotateCcw: ['Undo'],
  RotateCcwSquare: ['Undo'],
  RotateCw: ['Redo'],
  RotateCwSquare: ['Redo'],
  Save: ['Save'],
  Search: ['Search'],
  SearchCheck: ['Search'],
  SearchCode: ['Search'],
  SearchSlash: ['Search'],
  SearchX: ['Search'],
  Send: ['Send'],
  Settings: ['Setting'],
  Settings2: ['Setting'],
  Share: ['ShareAlt'],
  Share2: ['ShareAlt'],
  Shield: ['Safety'],
  ShieldAlert: ['Safety'],
  ShieldBan: ['Safety'],
  ShieldCheck: ['SafetyCertificate'],
  ShieldHalf: ['Safety'],
  ShieldMinus: ['Safety'],
  ShieldOff: ['Safety'],
  ShieldPlus: ['Safety'],
  ShieldQuestionMark: ['Safety'],
  ShieldUser: ['Safety'],
  ShieldX: ['Safety'],
  ShoppingBag: ['Shopping'],
  ShoppingCart: ['ShoppingCart'],
  Sliders: ['Control'],
  SlidersHorizontal: ['Control'],
  Square: ['Border'],
  SquareCheck: ['CheckSquare'],
  SquareCheckBig: ['CheckSquare'],
  SquareMinus: ['MinusSquare'],
  SquarePlus: ['PlusSquare'],
  SquareUser: ['User'],
  SquareUserRound: ['User'],
  SquareX: ['CloseSquare'],
  Sun: ['Sun'],
  Table: ['Table'],
  Table2: ['Table'],
  TableCellsMerge: ['MergeCells'],
  Tag: ['Tag'],
  ThumbsUp: ['Like'],
  ThumbsDown: ['Dislike'],
  Timer: ['FieldTime'],
  Trash: ['Delete'],
  Trash2: ['Delete'],
  TrendingDown: ['Fall'],
  TrendingUp: ['Rise'],
  TriangleAlert: ['Warning'],
  Trophy: ['Trophy'],
  Undo2: ['Undo'],
  Redo2: ['Redo'],
  Unlink: ['Disconnect'],
  Upload: ['Upload'],
  User: ['User'],
  UserCheck: ['UserSwitch'],
  UserCog: ['UserSwitch'],
  UserPlus: ['UserAdd'],
  UserRound: ['User'],
  UserRoundCheck: ['UserSwitch'],
  UserRoundCog: ['UserSwitch'],
  UserRoundPlus: ['UserAdd'],
  Users: ['Team'],
  Video: ['VideoCamera'],
  VideoOff: ['VideoCamera'],
  Wallet: ['Wallet'],
  WalletCards: ['Wallet'],
  Wand: ['Magic'],
  Wand2: ['Magic'],
  WandSparkles: ['Magic'],
  Wifi: ['Wifi'],
  WifiOff: ['Wifi'],
  X: ['Close'],
  XCircle: ['CloseCircle'],
  XOctagon: ['CloseSquare'],
  XSquare: ['CloseSquare'],
  Zap: ['Thunderbolt'],
  ZoomIn: ['ZoomIn'],
  ZoomOut: ['ZoomOut'],
};

/**
 * 软件开发 / 网页设计高频图标：即使 antd 里有同名图标也强制保留，
 * 这些是「找更多开发图标」的核心诉求，不要在去重时误删。
 */
const FORCE_KEEP = new Set([
  'Terminal', 'SquareTerminal', 'FileCode', 'FileCode2', 'FolderCode', 'SquareCode',
  'Braces', 'Brackets', 'CurlyBraces', 'Regex', 'Command', 'Binary', 'Bug', 'BugPlay', 'BugOff',
  'Webhook', 'WebhookOff', 'Workflow', 'Blocks', 'Component', 'Boxes', 'Box', 'Package', 'Package2',
  'PackageCheck', 'PackageOpen', 'PackageSearch', 'Container',
  'GitBranch', 'GitBranchPlus', 'GitCommit', 'GitCommitHorizontal', 'GitCommitVertical', 'GitFork', 'GitGraph',
  'GitMerge', 'GitPullRequest', 'GitCompare', 'GitCompareArrows',
  'Github', 'Gitlab', 'Figma', 'Framer', 'Chrome', 'Slack', 'Discord', 'Youtube', 'Twitch', 'Twitter',
  'Linkedin', 'Instagram', 'Codepen', 'Codesandbox',
  'Database', 'DatabaseBackup', 'DatabaseZap', 'Server', 'ServerCog', 'ServerCrash', 'ServerOff',
  'Cpu', 'HardDrive', 'MemoryStick', 'CircuitBoard', 'Network', 'Router', 'Cable', 'Usb',
  'Keyboard', 'Mouse', 'MousePointer2', 'MousePointerClick', 'Monitor', 'MonitorSmartphone', 'MonitorCog',
  'MonitorPlay', 'Laptop', 'Smartphone', 'Tablet', 'QrCode', 'ScanQrCode', 'Barcode', 'ScanBarcode', 'ScanLine',
  'Cloud', 'CloudUpload', 'CloudDownload', 'CloudCog', 'Wifi', 'Bluetooth', 'Rocket', 'Sparkles', 'Bot',
  'PenTool', 'Palette', 'TestTube', 'TestTubes', 'Beaker', 'FlaskConical', 'Microscope', 'Braces',
]);

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function readAntdIconNames() {
  const antd = require('@ant-design/icons');
  const names = new Set();
  for (const key of Object.keys(antd)) {
    if (!/(Outlined|Filled|TwoTone)$/.test(key)) continue;
    const base = key.replace(/(Outlined|Filled|TwoTone)$/, '');
    if (base) names.add(normalize(base));
  }
  return names;
}

function readLucideIcons() {
  const iconDir = path.join(pluginDir, '..', '..', '..', '..', 'node_modules', 'lucide-react', 'dist', 'esm', 'icons');
  const resolvedIconDir = fs.existsSync(iconDir) ? iconDir : null;
  if (!resolvedIconDir) {
    throw new Error(`lucide-react icons not found at ${iconDir}`);
  }
  const icons = [];
  for (const file of fs.readdirSync(resolvedIconDir)) {
    if (!file.endsWith('.js')) continue;
    const source = fs.readFileSync(path.join(resolvedIconDir, file), 'utf8');
    // 别名文件只是 re-export，没有 __iconNode，直接跳过（避免 lucide 内部重复图标）
    if (!source.includes('__iconNode')) continue;
    const pascalMatch = source.match(/export\s*\{\s*__iconNode\s*,\s*([A-Za-z0-9_$]+)\s+as\s+default/);
    const nameMatch = source.match(/createLucideIcon\(\s*"([^"]+)"/);
    if (!pascalMatch || !nameMatch) continue;
    icons.push({ pascal: pascalMatch[1], kebab: nameMatch[1], file });
  }
  return icons.sort((a, b) => a.pascal.localeCompare(b.pascal));
}

const antdNames = readAntdIconNames();
const lucideIcons = readLucideIcons();

const hasAntd = (name) => antdNames.has(normalize(name));

const skipped = { antdSameName: [], antdAlias: [] };
const kept = [];
for (const icon of lucideIcons) {
  if (FORCE_KEEP.has(icon.pascal)) {
    kept.push(icon);
    continue;
  }
  if (hasAntd(icon.pascal)) {
    skipped.antdSameName.push(icon.pascal);
    continue;
  }
  const aliases = ALIAS_DUPES[icon.pascal];
  if (aliases?.some((alias) => hasAntd(alias))) {
    skipped.antdAlias.push(icon.pascal);
    continue;
  }
  kept.push(icon);
}

const missingAliasTargets = Object.entries(ALIAS_DUPES)
  .filter(([, targets]) => !targets.some((target) => hasAntd(target)))
  .map(([name]) => name);

// Published names are a persistent-data contract, even if future dedup rules change.
const manifestPath = path.join(scriptDir, 'icon-manifest.json');
const publishedNames = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const lucideExports = require('lucide-react');
for (const name of publishedNames) {
  if (!lucideExports[name]) throw new Error(`Published icon missing from dependency: ${name}. Keep the previous dependency or provide a compatible replacement.`);
  if (!kept.some((icon) => icon.pascal === name)) kept.push({ pascal: name });
}
kept.sort((a, b) => a.pascal.localeCompare(b.pascal));

console.log(`antd 基础图标名: ${antdNames.size}`);
console.log(`lucide 正式图标: ${lucideIcons.length}`);
console.log(`  与 antd 同名被跳过: ${skipped.antdSameName.length}`);
console.log(`  语义重复被跳过: ${skipped.antdAlias.length}`);
console.log(`  保留: ${kept.length}`);
console.log(`  ALIAS_DUPES 中目标不存在的条目(自动忽略): ${missingAliasTargets.length}`);

if (reportOnly) {
  console.log('\n保留示例: ' + kept.slice(0, 30).map((i) => i.pascal).join(', '));
  console.log('同名跳过示例: ' + skipped.antdSameName.slice(0, 30).join(', '));
  console.log('语义重复跳过示例: ' + skipped.antdAlias.slice(0, 30).join(', '));
  process.exit(0);
}

const header = `/**
 * AUTO-GENERATED by scripts/generate-icons.mjs — 请勿手动修改。
 *
 * 数据来源：lucide-react
 * 已排除与 Ant Design 内置图标同名或语义重复的图标，共 ${kept.length} 个。
 */
import {
`;
const importLines = kept.map((icon) => `  ${icon.pascal},`).join('\n');
const mapLines = kept.map((icon) => `  ${icon.pascal},`).join('\n');
const content = `${header}${importLines}
} from 'lucide-react';

export const lucideIcons: Record<string, React.ComponentType<any>> = {
${mapLines}
};
`;

fs.writeFileSync(outFile, content, 'utf8');
fs.writeFileSync(manifestPath, JSON.stringify(kept.map((icon) => icon.pascal), null, 2) + '\n');
console.log(`\n已写入 ${path.relative(process.cwd(), outFile)}`);
