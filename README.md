# @xiezuo/plugin-icon-library

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NocoBase](https://img.shields.io/badge/NocoBase-2.x-2f54eb.svg)](https://docs.nocobase.com/cn/plugin-development/)

为 NocoBase 2.x 的菜单、按钮、页面标签等可视化配置位置扩展图标库。

- 仓库：https://github.com/charce526/plugin-icon-library
- 发行包：https://github.com/charce526/plugin-icon-library/releases

## 功能

- 内置 1426 个图标，全部来自开源图标库：
  - **lucide**（ISC）1371 个线性图标，已剔除与 Ant Design 同名或语义重复的部分（例如 `User/Users/UserPlus/Trash/Pencil/Settings` 不再重复提供）；
  - **Material Design Icons / MDI**（Apache-2.0）55 个数字序号图标：`0`~`10`，每个数字有实心 / 圆形 / 圆形描边 / 方形 / 方形描边 5 种样式；
- 软件开发 / 网页设计高频图标强制保留，不会被去重规则误删：`Terminal`、`Server`、`Package`、`Braces/Brackets`、`Regex`、`Command`、`Git 系列`、`Github/Gitlab/Figma/Chrome`、`Database`、`Blocks/Component`、`Bot/Sparkles`、`MonitorSmartphone`、`MousePointer` 等；
- 27 个分类，按常见图标站的分类习惯组织：数字与序号、通用操作、箭头与方向、编辑与布局、用户与人物、商务与办公、文件与文档、通信与消息、多媒体与娱乐、图表与数据、开发与技术、设备与硬件、建筑与家居、交通与运输、时间与日历、天气与自然、生活与饮食、医疗与健康、教育与科研、购物与电商、安全与隐私、社交与品牌、状态与符号，另有系统图标的线框 / 实底 / 双色分类；
- 支持英文名称与中文关键词搜索（`序号`、`终端`、`服务器`、`useradd → 用户` 都能命中），命中范围同时覆盖扩展图标与系统图标；
- 图标同时注册进 **两套** 图标注册表（`@nocobase/client` 与 `@nocobase/client-v2`），因此菜单、页签、按钮（FlowEngine 渲染的表格行按钮等）的图标都能正常显示；
- 图标选择器同时接管旧版 schema 渲染与 FlowEngine 设置表单；
- 图标数量较多，弹层按 240 个一页滚动加载，避免一次性渲染卡顿；
- 图标名称统一使用 `Xz` 前缀 + `Outlined` 后缀，避免覆盖系统图标，保存值仍是普通字符串；
- 复用 NocoBase 原生 `Icon` 注册机制：无需数据表、无服务端接口、无外部网络请求。

## 安装

打包产物为 `storage/tar/@xiezuo/plugin-icon-library-1.0.0.tgz`（包名带作用域，因此多了一层 `@xiezuo/` 目录），导入到 NocoBase：

```bash
nb plugin import storage/tar/@xiezuo/plugin-icon-library-1.0.0.tgz
```

导入后插件位于 `storage/plugins/@xiezuo/plugin-icon-library`，在插件管理器中启用「扩展图标库」并刷新管理界面即可。

## 开发构建

将源码目录放到 NocoBase 项目的 `packages/plugins/@xiezuo/plugin-icon-library` 后执行：

```bash
yarn install
yarn build @xiezuo/plugin-icon-library                # 仅编译，产物在 dist/
yarn build @xiezuo/plugin-icon-library --tar          # 编译并打包成 tgz
```

打包产物：`storage/tar/@xiezuo/plugin-icon-library-<version>.tgz`，其中包含 `package.json`、`README.md`、`LICENSE`、`LICENSE-THIRD-PARTY`、`CHANGELOG.md`、入口文件（`client.js`/`server.js` 及其 `.d.ts`）与 `dist/`；源码目录 `src/` 与 `scripts/` 不会进包。

`package.json` 里的 `postbuild` 只是一个本地开发钩子：本机文件系统无法遍历符号链接，构建后用它把产物复制到 `node_modules/@xiezuo/plugin-icon-library`，使应用能解析到插件。在支持符号链接的环境中可以删除该 `scripts` 字段。

图标清单都是生成出来的，升级图标库后重新生成即可（生成结果会直接提交到 `src/client/`，运行时不依赖这些图标包）：

```bash
node scripts/generate-icons.mjs               # lucide 图标 -> src/client/lucide-icons.ts
node scripts/generate-icons.mjs --report      # 只看过滤统计（同名 / 语义重复跳过多少）
node scripts/generate-number-icons.mjs        # MDI 数字图标 -> src/client/number-icons.generated.ts
```

- `generate-icons.mjs`：读取 `lucide-react` 的正式图标（跳过只有 re-export 的别名文件），再按「与 antd 图标同名」「`ALIAS_DUPES` 语义重复映射」两轮过滤，`FORCE_KEEP` 里的开发/网页高频图标不参与过滤；
- `generate-number-icons.mjs`：从 `@mdi/js` 提取 `numeric-0` ~ `numeric-10` 及其圆形/方形变体的路径数据（优先用本地 node_modules，没有则 `npm pack` 下载到系统临时目录）。

## 图标命名

扩展图标统一使用 `Xz` 前缀 + `Outlined` 后缀，例如 `XzTerminalOutlined`。前缀用于避免覆盖系统图标，**已发布图标的名称视为稳定契约**，升级版本不会重命名或移除，用户已保存的图标值不会失效。

## 第三方图标许可

- [lucide](https://github.com/lucide-icons/lucide) — ISC License（其中派生自 Feather 的部分为 MIT）
- [Material Design Icons](https://github.com/Templarian/MaterialDesign-JS) — Apache-2.0

这些图标的数据与组件实现会被内联进 `dist/client/index.js`，完整的许可原文见 [LICENSE-THIRD-PARTY](./LICENSE-THIRD-PARTY)。

## 兼容性

- NocoBase 2.x（构建基线 2.2.9）
- Node.js >= 18
- React 18

## 发布

发行包为 `plugin-icon-library-<版本>.tgz`，随 GitHub Releases 发布；发行包内 `package.json` 的 `version` 与发行版本号一致。

### 一键发行

```bash
node scripts/release.mjs 1.0.1        # 写入版本号 -> 编译 -> 生成 release/plugin-icon-library-1.0.1.tgz
git add -A && git commit -m "chore: release 1.0.1"
git tag v1.0.1 && git push origin main --tags
```

推送 `v*` 标签（或推送包含 `release/*.tgz` 改动的 main 提交）后，`.github/workflows/release.yml` 会校验「`package.json` 版本 = 发行包文件名版本 = 包内 `package.json` 版本」三者一致，然后自动创建 Release 并上传发行包。

发行包由本地构建而不是在 CI 中构建：插件编译依赖 NocoBase 工作区的 `@nocobase/build`，在 CI 里需要完整检出并安装 NocoBase 仓库（耗时长、易受上游改动影响）；发行包仅 130 KB 左右，直接随源码提交更稳定、可复现。

### 版本约定

- `package.json` 的 `version` 是唯一版本来源，编译产物与发行包都取自它；
- 版本号遵循语义化版本：新增图标或分类升 minor，修复渲染/搜索问题升 patch；
- 图标名（`Xz` 前缀 + `Outlined` 后缀）不随版本变化，用户在界面上已保存的图标值长期有效。

## 作者

偕作BIM（xzbim）

## 更新日志

见 [CHANGELOG.md](./CHANGELOG.md)。

## License

MIT © 偕作BIM (xzbim)
