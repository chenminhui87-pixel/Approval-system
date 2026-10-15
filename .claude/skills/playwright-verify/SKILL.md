---
name: playwright-verify
description: 用 Playwright 對本機 preview server 做 pixel-level 驗證(screenshot + getBoundingClientRect 量測),取代「改完憑感覺說完成」。Invoke 時機:CSS/排版/視覺類 fix 完成後要驗證、user 說「截圖看一下」「量一下距離」「確認一下有沒有跑版」、或任何要跑 preview + Playwright 的場合。本 skill 只管「怎麼跑驗證」(啟動 preview server、Playwright boilerplate、怎麼找到正確的 DOM),不管「改什麼」。
---

# playwright-verify — 本機 Playwright 驗證 SOP

## 存在意義

這個 repo 的視覺 fix 流程(改 code → build → preview → Playwright 截圖/量測 → 清掉 scratch → commit)每次都要重跑,但每次都在同樣幾個地方卡住、重新試錯:

1. Playwright 的 import 寫法(ESM directory import 會炸、CommonJS named export 會炸)
2. Preview server 用 `pkill -f "vite preview"` 關,pattern 太寬,偶爾連自己這次剛啟動的都誤殺
3. 不記得這個 app 的 mock data 裡哪筆記錄有多人簽核 step、DS `DataTable` 不是語意化 `<table><tr>`,選不到 row 要試好幾次
4. 螢幕截圖看起來「好像不見了」但其實是渲染正常只是對比度低(alpha token 疊層)——這類判斷不能只憑看圖,要直接 pixel-sample 實測顏色

本 skill 把這些「怎麼跑」的固定成本收斂成可直接複製貼上的做法,省下每次重新試錯的時間。

## 用法

### 1. Preview server 啟停(PID-based,不用 pkill -f)

```bash
# 啟動(記錄 PID,不要用 pkill -f 關 —— pattern 可能連自己這次也殺掉)
cd /home/user/Approval-system
nohup npm run preview -- --port 4188 > /tmp/preview.log 2>&1 & echo $! > /tmp/preview.pid
sleep 2; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4188   # 應回 200

# 改完 code 要重新驗證 → 一定要重新 build + 重啟 preview(vite preview 吃的是 dist/,
# 不會自動反映新 build,沿用舊 process 會驗到舊版本、白做工)
npm run build
kill $(cat /tmp/preview.pid) 2>/dev/null; sleep 1
nohup npm run preview -- --port 4188 > /tmp/preview.log 2>&1 & echo $! > /tmp/preview.pid

# 收尾:用 PID 關,不要 pkill -f
kill $(cat /tmp/preview.pid) 2>/dev/null
rm -f /tmp/preview.pid /tmp/preview.log
```

### 2. Playwright 啟動 + 量測(直接 import helper,不要重寫 boilerplate)

```js
import { launch, measure } from '/home/user/Approval-system/scripts/playwright-launch.mjs'

const { browser, page } = await launch({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4188')
// ...操作、量測...
await browser.close()
```

原始碼見 [`scripts/playwright-launch.mjs`](../../../scripts/playwright-launch.mjs)(跟 repo 既有的 `scripts/*.mjs` 機械工具放一起,不是 skill 專屬資產)——已驗證可用的 import 寫法(`/opt/node-tools/node_modules/playwright/index.js` 的 default export + `executablePath: '/opt/pw-browsers/chromium'`),不要再憑記憶重試別的路徑或 import 語法。

### 3. 先查 cheat sheet 再下 selector

導航路徑、已知多人簽核記錄、常用 selector、DataTable 不是 `<table><tr>` 這類踩坑,見 [references/app-fixtures.md](references/app-fixtures.md)。**連續猜 2 次 selector 都 timeout 就停下來**,改用 `page.evaluate(() => document.body.innerHTML)` 或截圖看實際 DOM,不要盲猜第 3 次。

### 4. 判斷「看起來消失了」先 pixel-sample,不要只憑截圖肉眼判斷

alpha 疊層 token(如 DS 的 `bg-muted` 4%)在截圖裡可能肉眼看不太出來,但實際上是有渲染、只是對比度低。**先用 `getComputedStyle` + `getBoundingClientRect` 確認 size/display/opacity 正常,再用截圖裁切 + 實際像素取樣確認顏色**,不要只看一眼截圖就斷定「不見了」或「正常」——這兩種判斷都可能跟實際渲染結果不符。

```js
// 裁切小區塊 + 用 PIL 數顏色分布,比單純看截圖準確
await page.screenshot({ path: '/tmp/.../sample.png', clip: { x, y, width: 60, height: 60 } })
```

```bash
python3 -c "
from PIL import Image
im = Image.open('sample.png').convert('RGB')
colors = {}
for x in range(im.width):
    for y in range(im.height):
        c = im.getpixel((x,y)); colors[c] = colors.get(c,0)+1
print(sorted(colors.items(), key=lambda kv: -kv[1])[:5])
"
```

### 5. 驗證完清乾淨

一次性驗證腳本放 scratchpad(`/tmp/claude-0/.../scratchpad/`),**驗證完、commit 前刪掉**(scratch script + 截圖),不要留在 repo 或 scratchpad 裡越積越多。`scripts/playwright-launch.mjs` 是跟其他 `scripts/*.mjs` 一樣的 repo 固定資產,不算 scratch,不要刪。

## Non-goals

- 不是 CI gate / mechanical audit script(那是 DS canonical `visual-audit` skill 的範疇,本 repo 是 fork,沒有那層機械工具,見該 skill 的 fork 註記)
- 不判斷「這樣改對不對」(設計/token 語意判斷是 code review 的事,本 skill 只負責「怎麼跑起來驗證」)
- `references/app-fixtures.md` 是 best-effort cheat sheet,不是 SSOT,mock data 改了就可能過期,過期就當場重新探並順手更新
