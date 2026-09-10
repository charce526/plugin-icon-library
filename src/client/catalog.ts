export type IconCategory = { key: string; label: string; keywords: RegExp };

/**
 * 分类按常见图标站的分类习惯组织（数字与序号 / 通用操作 / 箭头与方向 / 用户与人物 …），
 * 规则为按图标名（去掉 Xz 前缀与 Outlined 后缀）做正则匹配，一个图标可以命中多个分类。
 * `system*` 是特殊分类，会在选择器里单独从系统图标中筛选。
 */
export const categories: IconCategory[] = [
  { key: 'all', label: '全部扩展图标', keywords: /.*/i },
  { key: 'systemOutlined', label: '系统 · 线框', keywords: /.*/i },
  { key: 'systemFilled', label: '系统 · 实底', keywords: /.*/i },
  { key: 'systemTwoTone', label: '系统 · 双色', keywords: /.*/i },
  { key: 'number', label: '数字与序号', keywords: /^Number/i },
  { key: 'action', label: '通用操作', keywords: /Check|Plus|Minus|^X$|XCircle|Edit|Pencil|Copy|Clipboard|Delete|Trash|Save|Search|Filter|Funnel|Refresh|Reload|Undo|Redo|Ellipsis|MoreHorizontal|MoreVertical|Move|Drag|Pin|Eye|Star|Heart|Share|Download|Upload|Sort|ArrowUpDown|Settings|Wrench|Sliders|Wand|Repeat|Shuffle|Rotate|Crop|Scissors|Grip|Bring|Send|Import|Export|Power|Unlink|Link/i },
  { key: 'arrow', label: '箭头与方向', keywords: /Arrow|Chevron|CornerUp|CornerDown|CornerLeft|CornerRight|Navigation|Compass|Route|Signpost|Milestone|Locate|Crosshair|Maximize|Minimize|Expand|Shrink|ZoomIn|ZoomOut|MoveHorizontal|MoveVertical|MoveDiagonal|Flip|Redo|Undo|Forward|Reply|Jump/i },
  { key: 'layout', label: '编辑与布局', keywords: /Layout|Panel|Grid|Rows|Columns|Align|Table|List|Kanban|Split|Combine|Merge|Ruler|Crop|Paintbrush|Palette|PenTool|Brush|Droplet|Type|Text|Heading|Indent|Outdent|Frame|Crop|Blend|Spline|Wrap|Pilcrow|Pipette|Layers|Group|Ungroup/i },
  { key: 'user', label: '用户与人物', keywords: /User|Users|Contact|Person|Group|Team|Baby|Accessibility|Handshake|Crown|Award|Badge|IdCard|Mask|Smile|Angry|Frown|Meh|Laugh|Venus|Mars|Transgender|PersonStanding|Speech|Footprints|Venetian/i },
  { key: 'business', label: '商务与办公', keywords: /Briefcase|Bank|Landmark|Office|Presentation|Projector|Target|Goal|Trending|Rise|Fall|Receipt|Invoice|Percent|Calculator|Scale|Gavel|Signature|Stamp|Trophy|Medal|PiggyBank|Coins|Banknote|Wallet|CreditCard|Dollar|Euro|Pound|Yen|Rupee|Handshake|Megaphone|Scroll|Building|Factory|Warehouse|Store/i },
  { key: 'file', label: '文件与文档', keywords: /File|Files|Folder|Archive|Book|Notebook|Newspaper|Paperclip|Library|Sticky|Bookmark|Album|Clipboard|FileText|FileCheck|FilePlus|FileMinus|FileX|ScanText/i },
  { key: 'communication', label: '通信与消息', keywords: /Mail|Message|Send|Phone|Bell|Megaphone|Mic|Headphone|Speaker|Radio|Rss|Share|AtSign|Hash|Voicemail|Chat|Comment|Reply|Forward|Inbox|Mailbox|Voicemail|MessageSquare|MessageCircle/i },
  { key: 'media', label: '多媒体与娱乐', keywords: /Play|Pause|StopCircle|Skip|Rewind|FastForward|Volume|Music|Mic|Video|Film|Camera|Image|Clapperboard|Guitar|Piano|Drum|Tv|Gamepad|Dice|Puzzle|Joystick|PartyPopper|Candy|Disc|Headphones|Speaker|Podcast|Radio|Palette/i },
  { key: 'chart', label: '图表与数据', keywords: /Chart|Database|Pie|Bar|LineChart|AreaChart|Scatter|Trending|Gauge|Activity|Binary|Sigma|Function|Calculator|Kanban|Percent|Sum|Workflow|Table2|GitCompare|ChartNoAxes/i },
  { key: 'dev', label: '开发与技术', keywords: /Terminal|Code|Braces|Brackets|Curly|Regex|Command|Binary|Bug|Webhook|Workflow|Git|Github|Gitlab|Figma|Framer|Chrome|Slack|Discord|Youtube|Twitch|Twitter|Linkedin|Instagram|Codepen|Codesandbox|Blocks|Component|Boxes|Package|Container|Cpu|CircuitBoard|Network|Router|Cable|Usb|Shuffle|Combine|Split|Merge|Puzzle/i },
  { key: 'device', label: '设备与硬件', keywords: /Monitor|Laptop|Smartphone|Tablet|Desktop|Keyboard|Mouse|Printer|Camera|Webcam|HardDrive|MemoryStick|Battery|Cpu|CircuitBoard|Usb|Plug|Cable|Server|Cloud|Wifi|Bluetooth|Cast|Tv|Watch|Speaker|Projector|Scan|QrCode|Barcode/i },
  { key: 'building', label: '建筑与家居', keywords: /Building|House|Home|Factory|Warehouse|Door|Window|Fence|Crane|Drill|Hammer|Wrench|Shovel|HardHat|PaintRoller|Ladder|Blinds|Lamp|Sofa|Armchair|Bed|Bath|Shower|Toilet|Fridge|Microwave|WashingMachine|Iron|Fan|TreePine|Construction|Brick|Anvil|Bolt|Nut|Screwdriver|Ruler/i },
  { key: 'transport', label: '交通与运输', keywords: /Car|Bus|Truck|Bike|Ship|Boat|Plane|Train|Tram|Rocket|Sailboat|Anchor|Fuel|Gauge|MapPin|Route|TrafficCone|Ambulance|Caravan|Luggage|Tent|Wheelchair|Parking|Forklift|Tractor/i },
  { key: 'time', label: '时间与日历', keywords: /Clock|Timer|Alarm|Calendar|Hourglass|Watch|History|Stopwatch|Sunrise|Sunset|Time|Schedule|Deadline|Sand/i },
  { key: 'weather', label: '天气与自然', keywords: /Sun|Moon|Cloud|Rain|Snow|Wind|Storm|Leaf|Tree|Flower|Sprout|Mountain|Waves|Droplet|Thermometer|Rainbow|Snowflake|Fire|Flame|Bird|Fish|Cat|Dog|Bug|PawPrint|Egg|Rabbit|Squirrel|Turtle|Snail|Shell|Wheat|Vegan|Carrot|Apple|Banana|Cherry|Grape|Citrus|Feather|Gem|Dna|Recycle|Biohazard|Trees|Birdhouse/i },
  { key: 'life', label: '生活与饮食', keywords: /Coffee|Cup|Pizza|Cake|IceCream|Beer|Wine|Utensils|CookingPot|Soup|Salad|Sandwich|Cookie|Croissant|Drumstick|Ham|Shirt|Backpack|Umbrella|Glasses|Soap|Brush|Iron|WashingMachine|EggFried|Popcorn|Martini|Milk|Beef|Carrot|Wheat|Handbag|Footprints|Baby|PersonStanding/i },
  { key: 'medical', label: '医疗与健康', keywords: /Pill|Syringe|Stethoscope|HeartPulse|Cross|Bandage|Cigarette|Ambulance|Hospital|Thermometer|Microscope|TestTube|TestTubes|Beaker|Flask|Dna|Activity|Dumbbell|Accessibility|Brain|Bone|Eye|Ear|Hand|Tooth|Pulse|FirstAid|Wheelchair|Hospital/i },
  { key: 'education', label: '教育与科研', keywords: /Graduation|School|Book|Notebook|Library|Award|Medal|Trophy|Microscope|Beaker|Flask|TestTube|Atom|Brain|Presentation|Pencil|Backpack|University|Teacher|Student|Certificate|Scroll/i },
  { key: 'shopping', label: '购物与电商', keywords: /Shopping|Cart|Store|Package|Box|Truck|Ship|Warehouse|Tag|Tags|Ticket|Gift|Receipt|Barcode|QrCode|Scan|Percent|Coins|Wallet|Pallet|BadgePercent|BadgeDollar|Percent/i },
  { key: 'security', label: '安全与隐私', keywords: /Shield|Lock|Key|Fingerprint|ScanFace|EyeOff|UserCheck|BadgeCheck|FileLock|Unlock|Gavel|Scale|Siren|Ban|Radiation|Vault|Safe|Incognito|Spy|Detective|Shredder|Eye/i },
  { key: 'social', label: '社交与品牌', keywords: /Github|Gitlab|Figma|Framer|Chrome|Firefox|Safari|Slack|Discord|Youtube|Twitch|Twitter|Linkedin|Instagram|Facebook|Codepen|Codesandbox|Dribbble|Behance|Skype|Telegram|Wechat|Whatsapp|Google|Apple|Windows|Android|Docker|Npm|Vercel|Netlify|Rss|AtSign|Hash/i },
  { key: 'status', label: '状态与符号', keywords: /Alert|Info|Circle|Triangle|Octagon|Flag|Star|Heart|Thumbs|Lightbulb|Sparkle|Zap|Check|XCircle|Ban|Loader|Waves|Signal|Badge|Award|Crown|Trophy|Medal|Goal|Infinity|Question|Exclamation|Percent|Hash|Asterisk|Shapes|Square|Diamond|Hexagon|Pentagon|Cone|Cylinder|Pyramid|SquareDashed|Dot|Spline/i },
];

/**
 * 中文关键词，用于中文搜索（图标本身只有英文名）。
 * key 为 lucide 图标名，value 为可搜索的中文关键词。
 */
export const searchableLabels: Record<string, string> = {
  // 人员组织
  User: '用户 人员 个人', Users: '团队 组织 多人 成员', UserRound: '用户 人员', UserPlus: '新增用户 添加成员',
  UserCheck: '用户通过 审核', UserCog: '用户设置 权限', UserX: '禁用用户 删除用户', Contact: '联系人 通讯录',
  Handshake: '合作 握手 协议', Crown: '皇冠 管理员 VIP', Award: '奖章 荣誉', GraduationCap: '毕业 学历 教育',
  IdCard: '证件 身份证 名片', Baby: '婴儿 儿童', Accessibility: '无障碍 辅助',
  // 通用操作
  Check: '确认 完成 对勾 通过', Plus: '新增 添加 加号', Minus: '减少 减号 移除', X: '关闭 取消 删除',
  XCircle: '关闭 失败 错误', CircleX: '关闭 失败 错误', Pencil: '编辑 修改 铅笔', Edit: '编辑 修改',
  Copy: '复制 拷贝', Trash: '删除 垃圾桶', Trash2: '删除 垃圾桶', Save: '保存 存储', Search: '搜索 查询 查找',
  Filter: '筛选 过滤', RefreshCw: '刷新 重新加载', RefreshCcw: '刷新 撤销', RotateCcw: '撤销 还原 回退',
  RotateCw: '重做 恢复', Undo: '撤销 返回', Redo: '重做 前进', Download: '下载 导出', Upload: '上传 导入',
  Share: '分享 共享', Share2: '分享 共享', Settings: '设置 配置', Wrench: '工具 扳手 维修', Hammer: '锤子 施工',
  Star: '收藏 星标 重要', Heart: '喜欢 爱心 收藏', Pin: '固定 置顶', Lock: '锁定 加密', Unlock: '解锁',
  Eye: '查看 预览 显示', EyeOff: '隐藏 不可见', Ellipsis: '更多 省略', MoreHorizontal: '更多 省略',
  MoreVertical: '更多 省略', Maximize2: '放大 全屏', Minimize2: '缩小 还原', ZoomIn: '放大', ZoomOut: '缩小',
  Wand: '魔法 智能 美化', Sparkles: '闪亮 智能 AI', Zap: '闪电 快速 触发', Power: '电源 开关',
  // 文件资料
  File: '文件 文档', FileText: '文本 文档 文件', Files: '文件 多文件', Folder: '文件夹 目录',
  FolderOpen: '打开文件夹', FolderPlus: '新建文件夹', FilePlus2: '新建文件 添加文件',
  FileCheck2: '文件校验 完成', FileSearch: '文件搜索', FileImage: '图片文件', FileSpreadsheet: '表格文件 Excel',
  FileArchive: '压缩包 归档', BookOpen: '文档 手册 阅读', Book: '书 手册', Notebook: '笔记本 记录',
  Bookmark: '书签 收藏', Newspaper: '新闻 报纸 资讯', Paperclip: '附件 回形针', Archive: '归档 存档',
  // 沟通协作
  Mail: '邮件 邮箱 消息', MessageCircle: '消息 聊天', MessageSquare: '消息 聊天 评论', Send: '发送 提交',
  Bell: '通知 提醒 铃铛', BellRing: '通知 提醒', Phone: '电话 联系', PhoneCall: '通话 拨打',
  Megaphone: '公告 广播 通知', Mic: '麦克风 语音', Headphones: '耳机 客服', Speaker: '扬声器 音量',
  Radio: '广播 电台', Rss: '订阅 聚合', AtSign: '提及 @',
  // 数据图表
  BarChart3: '柱状图 数据报表', ChartNoAxesCombined: '图表 报表', PieChart: '饼图 占比', LineChart: '折线图 趋势',
  AreaChart: '面积图', TrendingUp: '上升 增长 趋势', TrendingDown: '下降 减少 趋势',
  Database: '数据库 数据', Table2: '表格 数据表', Gauge: '仪表盘 监控 性能', Activity: '活动 监控 心跳',
  Layers3: '图层 层级 模型', Workflow: '流程 工作流', ListChecks: '清单 任务 检查项',
  ClipboardList: '清单 任务 记录', ClipboardCheck: '审核 检查 完成',
  // 技术设备
  Cpu: '处理器 CPU 芯片', Code2: '代码 编程', Terminal: '终端 命令行', Server: '服务器 主机',
  Cloud: '云 云端', CloudDownload: '云端下载 同步', CloudUpload: '云端上传 同步', Wifi: '无线 网络 wifi',
  Bluetooth: '蓝牙', Battery: '电池 电量', Monitor: '显示器 屏幕 桌面', Laptop: '笔记本 电脑',
  Tablet: '平板', Smartphone: '手机 移动端', HardDrive: '硬盘 存储', Network: '网络 拓扑',
  Router: '路由器 网关', Bug: '缺陷 故障 调试', GitBranch: '分支 版本', GitCommit: '提交 版本',
  Webhook: '回调 接口', CircuitBoard: '电路板 硬件', Keyboard: '键盘', Mouse: '鼠标',
  Printer: '打印机 打印', QrCode: '二维码', ScanLine: '扫描', Camera: '相机 拍照 截图', Webcam: '摄像头',
  Plug: '插件 电源 接入', Cable: '线缆 连接', Fingerprint: '指纹 生物识别',
  // 建筑工程
  Building: '建筑 楼宇', Building2: '大楼 公司 企业', Factory: '工厂 工业', Warehouse: '仓库 库存',
  Landmark: '地标 政府 机构', HardHat: '安全帽 施工', Drill: '电钻 施工', Ruler: '尺子 测量',
  Paintbrush: '画笔 设计 涂装', Palette: '调色板 主题 设计', Projector: '投影仪 演示',
  Construction: '施工 建设', Tractor: '拖拉机 农业', Forklift: '叉车 搬运',
  // 交通出行
  Car: '汽车 车辆', Bus: '公交车 巴士', Truck: '卡车 物流 货运', Bike: '自行车 骑行',
  Plane: '飞机 航空', Train: '火车 列车', Ship: '轮船 物流 航运', Route: '路线 路径',
  MapPin: '位置 地址 定位', Compass: '指南针 导航', Navigation: '导航 方向', Anchor: '锚 固定',
  Rocket: '火箭 发布 上线', Fuel: '燃料 加油',
  // 时间日程
  Clock: '时间 时钟', Timer: '计时器 倒计时', AlarmClock: '闹钟 提醒', Calendar: '日历 日期 日程',
  CalendarDays: '日历 日程', History: '历史 记录 日志', Hourglass: '沙漏 等待 超时', Watch: '手表 时间',
  Sunrise: '日出 早晨', Sunset: '日落 傍晚', Moon: '月亮 夜间 深色', Sun: '太阳 白天 浅色',
  // 状态标识
  Info: '信息 说明 提示', CircleAlert: '警告 异常 注意', CircleHelp: '帮助 疑问 说明', HelpCircle: '帮助 疑问',
  ShieldCheck: '安全 已审核 可信', Shield: '安全 防护', ShieldAlert: '风险 警告', Flag: '标记 旗帜 里程碑',
  ThumbsUp: '点赞 通过 赞同', ThumbsDown: '反对 不赞同', Lightbulb: '灵感 提示 点子', CheckCircle2: '成功 完成 通过',
  CircleCheck: '成功 完成 通过', AlertTriangle: '警告 风险', Ban: '禁止 禁用', Signature: '签署 签名 审核',
  Gavel: '审批 裁决 规则', Scale: '平衡 权重 规则', KeyRound: '密钥 权限 密码',
  // 自然天气
  CloudRain: '下雨 降雨', Snowflake: '下雪 雪花', Wind: '风 天气', Leaf: '叶子 环保 自然',
  TreePine: '树 森林 自然', Flower: '花 美化', Mountain: '山 高峰 目标', Waves: '波浪 水', Droplet: '水滴 液体',
  Thermometer: '温度 温度计', Rainbow: '彩虹', Flame: '火焰 热门', Bird: '鸟 飞禽', Fish: '鱼',
  Cat: '猫', Dog: '狗 宠物', PawPrint: '宠物 脚印', Gem: '宝石 钻石 会员',
  // 生活健康
  Coffee: '咖啡 休息 餐饮', Utensils: '餐具 餐饮 食堂', Pizza: '披萨 餐饮', Cake: '蛋糕 生日 庆祝',
  Beer: '啤酒 聚会', Wine: '红酒 宴会', HeartPulse: '健康 心率 医疗', Pill: '药 药品 医疗',
  Syringe: '注射 疫苗 医疗', Stethoscope: '听诊器 医疗 医生', Dumbbell: '健身 运动 锻炼',
  Bed: '床 休息 酒店', Bath: '沐浴 洗浴', Glasses: '眼镜 查看',
  Shirt: '服装 衣服', Backpack: '背包 出行', Umbrella: '雨伞 保护', Hospital: '医院 医疗',
  // 媒体娱乐
  Play: '播放 开始 运行', Pause: '暂停', StopCircle: '停止', SkipForward: '下一首 下一个',
  Rewind: '快退 回退', FastForward: '快进', Volume2: '音量 声音', Music: '音乐 音频',
  Video: '视频 录制', Film: '影片 视频', Image: '图片 图像', Clapperboard: '拍摄 视频制作',
  Guitar: '吉他 音乐', Tv: '电视 大屏', Gamepad: '游戏 手柄',
  Dice: '骰子 随机', Puzzle: '拼图 组件 插件', Trophy: '奖杯 冠军 排名', Medal: '奖牌 荣誉',
  PartyPopper: '庆祝 礼花', Candy: '糖果 奖励', Disc: '光盘 唱片', Podcast: '播客 音频',
  // 电商与业务
  ShoppingCart: '购物车 下单 电商', ShoppingBag: '购物袋 商城', Store: '商店 店铺 门店',
  Package: '包裹 库存 物资', Boxes: '箱 库存 物资', Tag: '标签 分类 价格', Tags: '标签 多标签',
  Ticket: '工单 票据 优惠券', Gift: '礼物 奖励 权益', Receipt: '发票 收据 账单',
  Barcode: '条形码 扫码', CreditCard: '信用卡 支付 银行卡', Banknote: '纸币 现金 金额',
  Wallet: '钱包 账户 资金', Coins: '金币 积分 金额', PiggyBank: '储蓄 预算 存钱',
  Percent: '百分比 折扣 比例', Calculator: '计算器 计算 核算', Target: '目标 靶心 指标',
  Briefcase: '公文包 业务 项目', Presentation: '演示 汇报 会议',
  Clipboard: '剪贴板 记录 表单',
  // 数字序号
  Number: '序号 数字 编号 一二三四五六七八九十 第 步骤 排行',
  // 软件开发 / 网页设计
  SquareTerminal: '终端 命令行 控制台',
  Code: '代码 源码 编程', FileCode: '代码文件 脚本', FileCode2: '代码文件 脚本',
  SquareCode: '代码 代码块', Braces: '花括号 变量', Brackets: '方括号 数组', CurlyBraces: '花括号 对象',
  Regex: '正则 表达式', Command: '命令 快捷键', Binary: '二进制 编码',
  BugPlay: '调试 运行', BugOff: '修复 已解决',
  Blocks: '模块 积木', Component: '组件 模块', Container: '容器 装箱',
  Package2: '包 依赖 包裹', PackageOpen: '拆包 打开包裹', PackageCheck: '包校验 依赖检查',
  PackageSearch: '查找依赖 搜索包',
  Github: '代码托管 开源', Gitlab: '代码托管 开源', GitBranchPlus: '新建分支',
  GitCommitHorizontal: '提交 版本', GitCommitVertical: '提交 版本',
  GitFork: '派生 分叉', GitGraph: '提交历史 分支图', GitMerge: '合并 代码合并',
  GitPullRequest: '合并请求 拉取请求', GitCompare: '比较 差异', GitCompareArrows: '比较 差异',
  Figma: '设计稿 原型', Framer: '原型 设计', Chrome: '浏览器 谷歌', Slack: '协作 团队沟通',
  Discord: '社区 聊天', Youtube: '视频 频道', Twitch: '直播 游戏', Twitter: '社交 微博',
  Linkedin: '职场 社交', Instagram: '图片 社交', Codepen: '在线编程', Codesandbox: '在线沙箱',
  DatabaseBackup: '数据库备份', DatabaseZap: '数据库加速',
  ServerCog: '服务器配置', ServerCrash: '服务器故障', ServerOff: '服务器停机',
  MemoryStick: '内存 存储条', Usb: 'U盘 接口',
  MousePointer2: '鼠标指针 光标', MousePointerClick: '点击 单击',
  MonitorSmartphone: '响应式 多端适配', MonitorCog: '显示器设置', MonitorPlay: '演示 播放',
  ScanQrCode: '扫码 二维码', ScanBarcode: '扫码 条形码',
  Bot: '机器人 智能体', PenTool: '钢笔 设计 绘制', TestTube: '测试 实验', Beaker: '实验 测试',
  FlaskConical: '实验 测试', Microscope: '分析 观察 研究', Globe: '全球 国际化 语言',
};
