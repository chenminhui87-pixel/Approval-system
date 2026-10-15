# 專案現況 / 交接筆記(Handoff)

> 更新:2026-10-15 · 開新對話時,先讀本檔 + `CLAUDE.md` + `docs/BACKLOG.md` 即可快速接手。

## 這是什麼
`approval-system` web 原型,是 **native iOS 簽核產品的設計參考**,消費 `@qijenchen/design-system`(DS)。
目標是用 DS 元件做出合規、可給 PM/designer/QA 看的 product UI;DS 元件一律先查既有規範/元件,不自造。

## 開發 / 發佈流程
- **開發分支**:`claude/design-sync-yqjrmw`(所有改動在此)。
- **發 production**:FF merge `claude/design-sync-yqjrmw` → `main` → push;Netlify 自動 build。
  **只有使用者明說「發 production」才 deploy。**
- **驗證**:`npm run build`(tsc + vite)+ Playwright 截圖(`npm run preview -- --port 4188` 後跑
  `/opt/node22/.../playwright`,`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`)。
- commit 尾註:`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: <url>`。

## 已完成(除另註外皆已上 production)
**簽核中心(approvals section)**
- 左側 DS Sidebar 導航(待簽核/已簽核/已申請/轉寄給我,offcanvas 收合);內容 header 麵包屑。
- 清單走 DS DataTable(凍結欄、scroll shadow、autoRowHeight)。
- **A — 欄位 filter**:外層 `DataTableFilterPanel`(狀態/緊急/申請人/到期)+ 表頭「依此欄篩選」捷徑;
  filter 在 data 層以 DS `evaluateTree` 套用(DS dist 自帶 bundled TanStack,consumer 無法驅動內部 globalFilter)。
- **B — 批次模式**:保留單張唯讀預覽、隱藏面板操作列、底部全寬 BulkActionBar。
- 右側詳情面板(DetailAside + ApprovalDetailPanel);核准/退件二次確認 Dialog。
- 「新增申請單」在 header 右側(tertiary 弱化,只在「已申請」tab)。

**表單管理模組(C)**
- Sidebar 新增「表單管理」section;角色 3 種 **owner / admin / viewer**(下游系統指派,本系統只呈現差異,
  不做角色管理介面);底部固定「檢視身分(demo)」切換器。
- 權限矩陣在 `src/formsData.ts`(`can()`):owner 全權 / admin 可編輯內容+代理操作不可刪表單 / viewer 全唯讀。
- 表單清單 DataTable;列操作 = 「查看送審單」文字鈕 + ⋯ overflow(編輯/停用);「建立表單」在 header(tertiary)。
- **表單內容頁**:完整表單 view(公版預覽)/ 編輯模式 builder(新增/刪欄位、標題、型別、必填)。
- **送審清單子頁**(從清單列「查看送審單」進;麵包屑 表單管理 / 表單名):複用簽核 DataTable 呈現所有簽核狀態,
  點 info 開**右側詳情面板**(複用 ApprovalDetailPanel);owner/admin 可代理核准/退件/轉寄/移交/退回/作廢,viewer 唯讀。

## 尚未上 production(目前在 feature branch 領先 main)
- `9533fc10` — 送審清單右側面板頂到 header(面板改左欄同層全高)。**← 下次發 production 會含此。**

## 已知待辦 / 可接續
- 送審明細面板的代理動作目前是 **toast 佔位**;「催辦 / 撤回」尚未進明細面板的 ⋯(只有 轉寄/移交/退回/作廢)。
- 表單 builder 的編輯為 **session 本地草稿**,未真的 persist。
- 存取控管(哪些人能進表單管理模組)目前對所有人開放,未做「有權限 vs 無權限」demo。
- 其他優化見 `docs/BACKLOG.md`(panel 寬度拉動 / 簽核流程收折 / 申請單 DS 稽核 等)。

## 相關文件 / Artifacts
- `docs/BACKLOG.md` — 待開發項目。
- 決策摘要一頁圖(Claude artifact)、C 模組 scoping 一頁圖(Claude artifact)— 由使用者保管連結。

## 主要檔案
- `src/App.tsx` — 主 app(ApprovalPage:section 切換 approvals/forms、header、state)。
- `src/data.ts` — 簽核 mock 資料。
- `src/ApprovalDetailPanel.tsx` / `ApprovalModal.tsx` / `DetailAside.tsx` — 簽核詳情。
- `src/formsData.ts` — 表單管理資料 + 角色權限矩陣。
- `src/FormManagementView.tsx` / `FormDetailView.tsx` / `FormSubmissionsView.tsx` — 表單管理模組。
