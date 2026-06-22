#!/bin/bash
# block_production_edit_without_plugin.sh — Fork-committed PreToolUse 攔截(移植自 CPCM,適配 approval-system)
#
# 沒裝 DS plugin 時,攔對 production product code 的 Edit/Write。把 CLAUDE.md「沒裝 plugin 不准動
# production code」的軟指示變成 mechanical first-time gate。committed in repo,不依賴 plugin(補 chicken-egg)。
#
# scope:approval-system 產品碼直接在 src/**(無 apps/**)→ gate src/** 的 .tsx/.ts/.css。
#        讀檔 / config / docs / .claude/* / *.stories.* 不在此硬擋範圍(stories 也算產品 demo,但屬檢視用途,放行)。
# 環境分流:
#   - 本機(CLAUDE_CODE_REMOTE 非 true):沒裝 plugin → 硬擋(exit 2)。
#   - 網頁/雲端(CLAUDE_CODE_REMOTE=true):/plugin 架構上裝不了 → 降級為「警告」(exit 0),不鎖死 session。
# fail-open on parse error;escape: CLAUDE_BYPASS_PLUGIN_BOOTSTRAP=1(極罕見,如純 prototype)。
set -uo pipefail

INPUT=$(cat 2>/dev/null || echo '{}')

# 可攜 JSON parse(repo 必有 node)
FILE=$(printf '%s' "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log((j.tool_input&&j.tool_input.file_path)||'')}catch{console.log('')}})" 2>/dev/null || echo "")

# 只 gate production product code(src/** 的 .tsx/.ts/.css)
case "$FILE" in
  */src/*.tsx|*/src/*.ts|*/src/*.css|src/*.tsx|src/*.ts|src/*.css) ;;
  *) exit 0 ;;
esac

# escape
[ "${CLAUDE_BYPASS_PLUGIN_BOOTSTRAP:-0}" = "1" ] && exit 0

HOME_DIR="${HOME:-$(echo ~)}"
CWD="$(pwd)"
# 真實 layout:marketplace cloned 到 ~/.claude/plugins/marketplaces/<name>/ + 記在 known_marketplaces.json。
MARKETPLACE="qijenchen-ds"
KM="$HOME_DIR/.claude/plugins/known_marketplaces.json"
if [ -d "$HOME_DIR/.claude/plugins/marketplaces/$MARKETPLACE" ] \
   || [ -d "$CWD/.claude/plugins/marketplaces/$MARKETPLACE" ] \
   || { [ -f "$KM" ] && grep -q "\"$MARKETPLACE\"" "$KM"; } \
   || [ -d "$HOME_DIR/.claude/plugins/design-system" ]; then
  exit 0   # 已裝 → 放行(plugin 自己的 hook 接手)
fi

# 網頁/雲端:plugin 裝不了 → 警告但放行(否則永久鎖死 src 編輯)
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  cat >&2 <<'EOF'
⚠️  提醒:DS governance plugin 未安裝(網頁/雲端環境 `/plugin` 不可用)。
   你正在改 production code(src/**),目前「沒有」22 skills + 59 hooks 的設計原則 / SSOT 機械防線
   → 容易寫出不合規 mock(漏 startIcon / 視覺跑版)。請對照 CLAUDE.md 與 DS canonical 手動把關。
   想要完整自動 enforce:改在本機跑 Claude Code 並裝 plugin。
EOF
  exit 0
fi

# 本機 + 沒裝 + 改 production code → BLOCK
cat >&2 <<'EOF'
🚨 BLOCKER:DS governance plugin 未安裝,不准改 production code(src/**)。

  沒裝 plugin = 沒有 22 skills + 59 hooks 的設計原則 / SSOT 機械防線
  → AI 會寫出不合規 mock(漏 startIcon / 視覺跑版)。

  先裝(Claude session 內):
    1. /plugin marketplace add github:ajenchen/design-system
    2. /plugin install design-system@qijenchen-ds
    3. restart session

  詳 CLAUDE.md「🛑 開啟本 repo 第一件事:裝 DS plugin」。
  Escape(極罕見,純 prototype 才用): 設環境變數 CLAUDE_BYPASS_PLUGIN_BOOTSTRAP=1
EOF
exit 2
