#!/bin/bash
# check_orphan_ds_css.sh — P0 BLOCKER
#
# 防 DS CSS file orphan(在 src 但不在 tokens.css aggregator + 沒被任何 tsx import)
# (2026-05-27 user verbatim「之前不就已經整理過一次 token 了?還沒搞好?那到底還要搞幾次?
# 你他媽最好給我保證這是最後一次」永久 codify)
#
# Anchor 錨點:
# - 2026-05-26 sidebar-width token 從 globals.css 搬 uiSize.css(part 1 fix)
# - 但 header-canonical.css / data-table.css 兩個 non-token-home CSS 沒一起 sweep
# - 兩者都在 globals.css 為 DS internal 載入,但 tokens.css consumer aggregator 漏
# - Consumer install DS + import @qijenchen/design-system/styles/tokens 拿不到
#   → sidebar 收合 logo 跑版(--chrome-header-avatar-size missing)+ DataTable cell grid 跑掉
# - User 抓「sidebar 修了一百次都白做,真 root 在 token bundle pipeline」
#
# Stop hook(post-assistant turn)scan packages/design-system/src/**/*.css:
# Orphan condition:file NOT in tokens.css aggregator AND NOT imported by any tsx/ts in DS
# → BLOCKER exit 2 強制 fix
#
# Defense layer 補 gen-figma-make-artifacts.mjs auto-scan(generator 自動抓,本 hook 額外驗)。

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -uo pipefail

INPUT=$(cat 2>/dev/null || echo "{}")
EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // ""' 2>/dev/null)

case "${EVENT:-}" in
  Stop|SubagentStop) ;;
  *) exit 0 ;;
esac

DS_SRC="${CLAUDE_PROJECT_DIR:-.}/packages/design-system/src"
AGGREGATOR="$DS_SRC/styles/tokens.css"

if [ ! -d "$DS_SRC" ] || [ ! -f "$AGGREGATOR" ]; then
  exit 0
fi

ORPHANS=""
while IFS= read -r css; do
  rel="${css#$DS_SRC/}"
  # Skip aggregator itself
  if [ "$rel" = "styles/tokens.css" ]; then continue; fi
  # In aggregator?
  if grep -qF "$rel" "$AGGREGATOR" 2>/dev/null; then continue; fi
  # Imported by any tsx/ts in DS?
  basename=$(basename "$css")
  if grep -rln "import.*${basename}\|@import.*${basename}" "$DS_SRC" --include='*.tsx' --include='*.ts' --include='*.css' 2>/dev/null | grep -v "${css}" | grep -q .; then continue; fi
  ORPHANS="${ORPHANS}  - $rel\n"
done < <(find "$DS_SRC" -name '*.css' -type f)

if [ -n "$ORPHANS" ]; then
  printf '🚨 ORPHAN-DS-CSS BLOCKER(2026-05-27 user 永久糾正「之前不就已經整理過一次 token 了?最後一次」)\n\n' >&2
  printf '  DS src 內 CSS 既不在 tokens.css aggregator 也不被任何 tsx/ts import:\n' >&2
  printf '%b' "$ORPHANS" >&2
  printf '\n  Consumer install DS + import @qijenchen/design-system/styles/tokens 拿不到 → 跑版。\n' >&2
  printf '  修法 2 選 1:\n' >&2
  printf '    (a) 加進 tokens.css aggregator(若是 :root token / @theme 宣告):\n' >&2
  printf '        node scripts/gen-figma-make-artifacts.mjs(自動掃 patterns/+components/)\n' >&2
  printf '    (b) 在對應 tsx file 加 `import ./xxx.css`(若是 component-internal scoped style)\n' >&2
  exit 2
fi

exit 0
