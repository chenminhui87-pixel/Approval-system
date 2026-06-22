#!/bin/bash
# check_plugin_bootstrap.sh — Fork-committed SessionStart 提醒(移植自 CPCM,適配 approval-system)
#
# Why committed in repo(非靠 plugin):DS governance plugin 的硬性 hook 隨 plugin 一起裝 → 沒裝前無任何
# mechanical 防線(chicken-egg)。本 hook + block_production_edit_without_plugin.sh 是 repo 自帶、不依賴
# plugin 的 bootstrap 層,補 first-time gap。對應 CLAUDE.md「🛑 開啟本 repo 第一件事:裝 DS plugin」。
#
# fail-open:純提醒,任何情況 exit 0,絕不擋 session。plugin 裝了 → silent。
set -uo pipefail

HOME_DIR="${HOME:-$(echo ~)}"
CWD="$(pwd)"
# 真實 Claude Code layout = marketplaces/<name>/ + known_marketplaces.json。marketplace name = qijenchen-ds。
MARKETPLACE="qijenchen-ds"
KM="$HOME_DIR/.claude/plugins/known_marketplaces.json"
if [ -d "$HOME_DIR/.claude/plugins/marketplaces/$MARKETPLACE" ] \
   || [ -d "$CWD/.claude/plugins/marketplaces/$MARKETPLACE" ] \
   || { [ -f "$KM" ] && grep -q "\"$MARKETPLACE\"" "$KM"; } \
   || [ -d "$HOME_DIR/.claude/plugins/design-system" ]; then
  exit 0   # 已裝 → silent
fi

# 網頁/雲端環境:/plugin 不可用(架構限制)→ 提示走本機才拿得到完整 governance。
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  cat <<'EOF'
ℹ️  DS governance plugin 未安裝,且目前是 Claude Code 網頁/雲端環境 —— `/plugin` 在此不可用(架構限制)。

   → 想拿完整 22 skills + 59 hooks governance,請在「本機」跑 Claude Code:
       git clone <repo> && npm install && npm i -g @anthropic-ai/claude-code && claude
     再於 session 內:
       1. /plugin marketplace add github:ajenchen/design-system
       2. /plugin install design-system@qijenchen-ds
       3. restart session

   網頁環境下:DS 套件與 Storybook 檢閱器照常可用;product code 編輯會收到 repo 自帶 hook 的「警告」
   (非硬擋,見 block_production_edit_without_plugin.sh)。詳 CLAUDE.md。
EOF
  exit 0
fi

cat <<'EOF'
🛑 DS governance plugin 尚未安裝 — 用 Claude 做產品前必先裝(否則沒有設計原則 / SSOT 的機械防線,
   AI 會憑記憶寫出跑版 mock)。

   1. /plugin marketplace add github:ajenchen/design-system
   2. /plugin install design-system@qijenchen-ds
   3. 裝完 restart session(plugin/addon 需 restart 才 apply)

   裝好後拿到:22 skills + 59 hooks + 31 M-rules + 88 audit dims 全套 governance。
   詳 CLAUDE.md「🛑 開啟本 repo 第一件事」。本提醒由 repo 自帶 bootstrap hook 觸發(不依賴 plugin)。
EOF
exit 0
