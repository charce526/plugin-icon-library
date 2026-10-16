# NocoBase Extended Icon Library

English | [简体中文](./README.md)

A unified icon picker for NocoBase menus, buttons, tabs and icon fields, with Chinese search, SVG imports, and color and size settings.

Maintained by [Xiezuo BIM](https://www.xzbim.cn). Package: `@xiezuo/plugin-icon-library`. Version: **2.0.1**.

## Features

- **1,426 extended icons**: 1,371 Lucide icons and 55 numeric icons, bundled without an external icon service.
- **Unified search** across native, extended and imported icons, using English names, Chinese keywords, multiple terms or complete stored identifiers.
- **Exact Chinese translations** covering 2,257 built-in glyphs and 1,885 base names.
- **Categories** for icon styles and semantics, plus Construction, Project management, Finance and cost, and Customer management shortcuts.
- **Favorites and recents**: up to 100 favorites and 30 recent selections, scoped to the application and user in the current browser.
- **Color and size editing**, with button, menu and tab examples before applying changes.
- **Shared SVG imports** from files or source, stored in the application database and available to signed-in users.
- **V1 and V2 entry points**, including mobile menu settings and the V2 icon field.

## Compatibility

Supports **NocoBase 2.x starting with 2.2.0** (`>=2.2.0 <3.0.0`), across V1 and V2 pages. Version 2.2.26 is one compatibility reference, not the minimum requirement. The build toolchain uses NocoBase 2.2.10 and React 18. Use the Node.js version required by your NocoBase installation.

The package contains V1, V2 and server entry points. V2 pages use `/v2/admin/`.

## Installation and upgrade

1. Get the corresponding package from [GitHub Releases](https://github.com/charce526/plugin-icon-library/releases). The 2.0.1 package is `plugin-icon-library-2.0.1.tgz`.
2. Back up the application database and existing plugin version before upgrading.
3. Upload the package in the NocoBase plugin manager, install or upgrade, and enable it.
4. Complete any NocoBase upgrade steps, restart as instructed, and refresh the browser.

The server creates `xzIconLibraryIcons` on plugin load if the table is missing. Replacing browser assets alone does not enable SVG imports.

Published `Xz…Outlined` identifiers remain compatible. Existing menu and button values need no rewriting. Include shared icons in application database backups.

### Install from source

Clone the repository into `packages/plugins/@xiezuo/plugin-icon-library` in a NocoBase workspace. Run `yarn install` at the workspace root, then enable the plugin in the plugin manager. The repository contains `dist/`; rebuild after source changes.

## Using the picker

### Selection and preview

Search by name or Chinese keywords, or choose a category. Clicking an icon opens its name, keywords, color and size settings on the right. Details are collapsible on narrow screens.

Clicking stages a selection. **Apply** commits it; **Cancel** or closing the picker discards the draft. Hovering does not change the preview. Recents update only after applying.

The upper glyph stays at a fixed display size. Collapsible button, menu and tab examples stay at the bottom of the detail panel.

### Color

A slash indicates no fixed color: the icon keeps its original colors or follows the theme. The preview updates after completing color selection, reducing work while dragging.

Reopening a colored icon restores its saved color. Restore original color discards a color draft; icons without a fixed color can return to the default. Two-tone layers remain distinct, and visible names do not accumulate previous color codes.

### Size

| Preset | Size in use |
| --- | --- |
| Compact | 12 px |
| Default | Original size inherited from the host control |
| Larger | 20 px |
| Largest | 24 px |

Size changes affect usage examples, while the upper glyph stays fixed. Apply saves the size; reopen to edit it. The host controls the final layout, and an explicit `size` prop can override the saved default.

Changing color or size creates an independent shared SVG variant and saves its identifier. The source icon and other references remain intact. Saving variants requires SVG import permission.

## SVG imports and permissions

Choose **Import SVG**, provide a label and keywords, and upload a file or paste source.

| Item | Limit |
| --- | --- |
| SVG file | 50,000 bytes |
| SVG source | 50,000 characters |
| Coordinates | Valid `viewBox` required |
| Nodes | 256 |
| Nesting depth | 10 |
| Shared icons | 5,000 total, including imported icons and color/size variants |

Supported elements are `path`, `g`, `circle`, `ellipse`, `rect`, `line`, `polyline` and `polygon`, with allowlisted drawing attributes. Scripts, events, CSS styles, external references, images, text, gradients, filters and `use` are unsupported. Convert complex SVGs to paths. Use `currentColor` to inherit the host text color.

Reading shared icons requires sign-in. Importing and saving variants requires the `pm.plugin-icon-library` permission snippet; sign-in alone does not grant it. Existing identifiers cannot be overwritten. Deletion is unavailable to preserve saved references.

Favorites and recents remain in the current browser and do not synchronize across devices. Shared SVGs belong to the application database and its backups.

## Development and validation

Build at the NocoBase workspace root without creating an archive:

```sh
yarn build @xiezuo/plugin-icon-library
```

From the plugin directory:

```sh
node scripts/generate-keywords.cjs --check
node scripts/check-keywords.cjs
node scripts/check-v1.cjs --version=2.2.0
node scripts/check-v1.cjs --version=2.2.10
node scripts/check-v1.cjs --version=2.2.26
node scripts/check-v2.cjs --version=2.2.0
node scripts/check-v2.cjs
node scripts/check-v2.cjs --legacy
node scripts/check-server.cjs
```

Server tests require SQLite by default. Set `ICON_TEST_MARIADB=1` to use local MariaDB with isolated table prefixes and cleanup. Client tests use React, Ant Design, Formily and JSDOM. `check-v1.cjs --version=VERSION` covers official V1 icon controls and schema contexts from 2.2.0, 2.2.10 and 2.2.26. `check-v2.cjs --version=2.2.0` uses official V2 Icon and Plugin sources from the minimum supported version. Reference sources are SHA-256 pinned and downloaded into an ignored cache on first use. Application lifecycle and some registration facilities remain fixtures. Default V2 tests use the locally installed version; `--legacy` adds shared-picker coverage. Component tests do not replace installation, upgrade and authenticated page testing in complete applications.

Prepare a local package from the plugin directory:

```sh
node scripts/release.mjs 2.0.1
node scripts/check-package.cjs
```

The archive and checksum are written to `release/`. These commands do not create tags, push code or publish a GitHub Release. Publication is triggered only by a version tag or a manual workflow, after acceptance approval.

The local postbuild hook validates keywords and synchronizes runtime files. Source, generators, development logs and temporary files are excluded from installation packages. Preserve published identifiers when regenerating icons, and recheck keywords, counts and licenses after dependency changes.

## Changes and licenses

See [CHANGELOG.md](./CHANGELOG.md) and the [source repository](https://github.com/charce526/plugin-icon-library).

The plugin is [MIT licensed](./LICENSE). Lucide uses ISC, with some MIT-derived content; numeric icons from Material Design Icons use Apache-2.0. Full notices are in [LICENSE-THIRD-PARTY](./LICENSE-THIRD-PARTY).
