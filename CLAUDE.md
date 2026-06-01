# approval-system — Claude Code Instructions

簽核管理系統，消費 [`@qijenchen/design-system`](https://www.npmjs.com/package/@qijenchen/design-system) 作為設計基礎。

## 🛑 開啟本 repo 第一件事：裝 DS plugin

DS 的 22 個 skills + 59 個 governance hooks 走 Claude Code plugin marketplace ship。沒裝 = 視覺/互動容易跑版，且 AI 容易憑記憶寫 simplified mock。

```bash
/plugin marketplace add github:ajenchen/design-system
/plugin install design-system@qijenchen-ds
```

裝完後 Claude Code session 必 restart 才生效。

之後同步用：`/plugin marketplace update`。

## 🚨 第 0 步：Cross-load DS canonical

本 repo 消費 `@qijenchen/design-system`。DS 的設計原則 / M-rules / spec / rules / references 是 **SSOT 在 DS repo**，隨 npm package 自動 ship 到本地 `node_modules/`。Claude 開啟本 repo 必執行：

```
@node_modules/@qijenchen/design-system/CLAUDE.md
@node_modules/@qijenchen/design-system/ds-canonical/rules/meta-patterns.md
```

完整 canonical 在 `node_modules/@qijenchen/design-system/ds-canonical/`：
- `rules/` — 31 M-rules + ui-development / spec-rules / story-rules / self-verify
- `references/` — naming-conventions / ssot-consultation / tailwind-gotchas / props-naming 等
- `skills/` — 22 skills

→ **DS canonical 永遠是 SSOT，本 repo 規則只 extend / override consumer-specific 部分**。

## Stack

Vite + React 19 + TypeScript + Tailwind v4 + `@qijenchen/design-system`。

必要 file：
- `src/main.tsx` / `src/App.tsx` — entry
- `src/globals.css` — 載入 `@qijenchen/design-system/styles/{base,tokens}` + `@source '../node_modules/@qijenchen/design-system/src/**'`
- `src/data.ts` — 簽核記錄與類別資料
- `src/ApprovalModal.tsx` — 詳情 modal
- `src/ApprovalRoute.tsx` — 進階簽核流程元件（在 DS Steps 之上組合 Avatar 等做進階表現）

## Consumer-specific 規範

1. **只 import `@qijenchen/design-system` 的 public exports** — 禁 import internal primitive（`@qijenchen/design-system/internal/*`）
2. **DialogContent 寬度用 `maxWidth` prop**，不要用 className `max-w-*`（會被 inline style 蓋掉）
3. **iconOnly SegmentedControlItem 的 active state** — 因 Tooltip wrap 會覆蓋 `data-state`，需用 `aria-checked:` variant 補 active 樣式
4. **divider 貫穿 dialog 全高** — 不要包在 DS DialogBody（ScrollArea wrapper 會讓 inner height 縮 11px），直接用 plain `<div data-dialog-body>`
5. **Tag 標籤** — 統一 `size="sm"`；低緊急程度（low）不渲染 tag 避免視覺雜訊

## Workflow

- 1 chat = 1 working branch（如有 branch 需要）；目前 solo dev 直接走 main
- 動完 code 自動跑 `npm run build`（含 tsc + vite build）作為 verification baseline
- Push 完才通知 user（per memory `feedback_run_tests_before_notify`）
- Netlify per-branch preview 預設啟用，main push → production deploy

## Deploy

Netlify 連 GitHub repo，自動部署。安全設定走 Netlify dashboard → Visitor access → Password Protection（free-tier 可用）。

## Storybook + ds-devmode（設計檢視工具）

本 repo 配置了 `@qijenchen/storybook-config` shared preset，含 DS 自製 **ds-devmode** addon（Figma Dev Mode 等級的元件 inspect）：

```bash
npm run storybook         # 本機 dev,localhost:6006
npm run build-storybook   # 產 static,輸出到 storybook-static/(gitignore)
```

Storybook 內可以：
- 左側 navigation 瀏覽元件 stories
- 底部「DS Devmode」tab → Off / Live / Pin 三模式
- 點任何元件 → 看 computed CSS、token 反查、anatomy box、distance label
- Alt+I 快捷切換

新增 story：在 `src/*.stories.tsx`，title 格式 `App / X` 或 `Components / X`。

