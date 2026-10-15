// 可直接 import 的 Playwright 啟動 helper — 本 session 已驗證成功的寫法,
// 不要重新試 import 語法(directory import / CommonJS named export 都會炸)。
//
// 用法(scratchpad 一次性驗證腳本,見 .claude/skills/playwright-verify/SKILL.md):
//   import { launch, measure } from '/home/user/Approval-system/scripts/playwright-launch.mjs'
//   const { browser, page } = await launch()
//   await page.goto('http://localhost:4188')
//   ...
//   await browser.close()

import pkg from '/opt/node-tools/node_modules/playwright/index.js'
const { chromium } = pkg

export async function launch({ viewport = { width: 1440, height: 900 } } = {}) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  const page = await browser.newPage({ viewport })
  return { browser, page }
}

// 量測 helper:傳入 { label: selector } map,回傳每個 selector 的 getBoundingClientRect()。
// 選不到的 selector 回傳 null(不丟整個 script,方便一次量多個同時看哪個選不到)。
export async function measure(page, selectorMap) {
  return page.evaluate((map) => {
    const out = {}
    for (const [label, sel] of Object.entries(map)) {
      const el = document.querySelector(sel)
      out[label] = el ? el.getBoundingClientRect().toJSON() : null
    }
    return out
  }, selectorMap)
}
