# @xiezuo/plugin-icon-library

**English** | [简体中文](./README.md)

An extended icon-library plugin for NocoBase, developed and maintained by [Xiezuo BIM](https://www.xzbim.cn). It provides 1400+ icons with semantic categories for menus, buttons, page tabs and other visual configuration slots.

## Features

- 1426 built-in icons from open-source icon libraries:
  - **lucide** (ISC): 1371 line icons, with entries that duplicate Ant Design names or meanings removed (e.g. `User/Users/UserPlus/Trash/Pencil/Settings` are no longer duplicated);
  - **Material Design Icons / MDI** (Apache-2.0): 55 numeric icons `0`~`10`, each with 5 variants (solid / circle / circle-outline / square / square-outline);
- High-frequency software / web-design icons are force-kept and never removed by the dedup rules: `Terminal`, `Server`, `Package`, `Braces/Brackets`, `Regex`, `Command`, the `Git` family, `Github/Gitlab/Figma/Chrome`, `Database`, `Blocks/Component`, `Bot/Sparkles`, `MonitorSmartphone`, `MousePointer`, etc.;
- 27 categories organized like popular icon sites: numbers & ordinals, general actions, arrows & directions, edit & layout, users & people, business & office, files & documents, communication & messaging, media & entertainment, charts & data, development & tech, devices & hardware, buildings & home, transport, time & calendar, weather & nature, life & food, health & medical, education & research, shopping & e-commerce, security & privacy, social & brand, status & symbols, plus system-icon wireframe / filled / duotone groups;
- Search by English name and Chinese keywords (e.g. `序号`, `终端`, `服务器`, `useradd → 用户`); results cover both extended and system icons;
- Icons are registered into **both** registries (`@nocobase/client` and `@nocobase/client-v2`), so they render in menus, tabs and buttons (including FlowEngine-rendered row buttons);
- The icon picker takes over both the legacy schema renderer and the FlowEngine settings form;
- The picker loads 240 icons per page to avoid rendering everything at once;
- Icon names use the `Xz` prefix + `Outlined` suffix to avoid colliding with system icons; stored values remain plain strings;
- Reuses NocoBase's native `Icon` registry: no data table, no server API, no external network request.

## Compatibility

- Primary target: NocoBase 2.x (build baseline 2.2.9)
- Build environment: Node.js 18 or later
- React 18

## Installation

Download `plugin-icon-library-1.0.0.tgz` from [GitHub Releases](https://github.com/charce526/plugin-icon-library/releases), then upload, install and enable it in the NocoBase Plugin Manager.

Package name:

```text
@xiezuo/plugin-icon-library
```

Once enabled, the extended icons appear in the icon picker.

## Source development

Place the repository at `packages/plugins/@xiezuo/plugin-icon-library` inside a NocoBase source tree, then install dependencies and build:

```bash
yarn install
yarn build @xiezuo/plugin-icon-library                # build only, output in dist/
yarn build @xiezuo/plugin-icon-library --tar          # build and pack into a tgz
```

Build output: `storage/tar/@xiezuo/plugin-icon-library-<version>.tgz`, containing `package.json`, `README.md`, `LICENSE`, `LICENSE-THIRD-PARTY`, `CHANGELOG.md`, entry shims (`client.js`/`server.js` and their `.d.ts`) and `dist/`; the `src/` and `scripts/` directories are not packaged.

The `postbuild` script in `package.json` is only a local dev hook: this machine cannot traverse symlinks, so after building it copies the output into `node_modules/@xiezuo/plugin-icon-library` so the app can resolve the plugin. In environments that support symlinks the `scripts` field can be removed.

Icon lists are generated; regenerate after upgrading the icon libraries (results are committed directly into `src/client/`, the runtime does not depend on those icon packages):

```bash
node scripts/generate-icons.mjs               # lucide icons -> src/client/lucide-icons.ts
node scripts/generate-icons.mjs --report      # show filter statistics only
node scripts/generate-number-icons.mjs        # MDI numeric icons -> src/client/number-icons.generated.ts
```

- `generate-icons.mjs`: reads lucide-react's real icons (skipping re-export aliases), filters out entries that duplicate Ant Design by name or by the `ALIAS_DUPES` semantic mapping; `FORCE_KEEP` high-frequency dev/web icons are exempt;
- `generate-number-icons.mjs`: extracts `numeric-0`~`numeric-10` path data (and their circle/square variants) from `@mdi/js` (prefers local node_modules, otherwise `npm pack` into a temp dir).

## Icon naming

Extended icons use the `Xz` prefix + `Outlined` suffix, e.g. `XzTerminalOutlined`. The prefix avoids colliding with system icons, and **published icon names are a stable contract** — upgrades never rename or remove them, so user-saved icon values keep working.

## Third-party icon licenses

- [lucide](https://github.com/lucide-icons/lucide) — ISC License (the Feather-derived parts are MIT)
- [Material Design Icons](https://github.com/Templarian/MaterialDesign-JS) — Apache-2.0

The icon data and component implementations are inlined into `dist/client/index.js`; the full license texts are in [LICENSE-THIRD-PARTY](./LICENSE-THIRD-PARTY).

## Author and maintenance

- Author: [Xiezuo BIM](https://www.xzbim.cn)
- Maintainer: [Xiezuo BIM](https://www.xzbim.cn)
- Package: `@xiezuo/plugin-icon-library`
- Repository: [charce526/plugin-icon-library](https://github.com/charce526/plugin-icon-library)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE)
