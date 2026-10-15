# 已知可用的 navigation / selector cheat sheet

目的:減少每次重新摸索 mock data 要點哪一筆才有多人簽核流程、按鈕 aria-label 是什麼。
**這份是 best-effort,不是 SSOT** —— mock data(`src/data.ts`)或路由改了就可能過期。
選不到就當場重新探一次,順手更新本檔,不要死守過期值硬 retry。

## 待簽核清單(首頁)

- 路徑:登入後預設頁,左側 nav「待簽核」
- 開啟一筆記錄的完整 Modal:點該列「標題」文字(不是 info icon,info icon 開的是右側面板,行為跟 Modal 不同)

## 含多人簽核 step 的記錄(`src/data.ts` 截至 2026-10-15)

| 記錄標題(可用 `getByText` 模糊比對) | step label | mode | 說明 |
|---|---|---|---|
| `2026 年 Q2 產品發布公告` | `起草` | single | 已完成,無收折 |
| 同上 | `部門審核` | `parallel-all` | **預設展開**(status=current),2 人(王大明已簽 / 陳美惠待簽) |
| 同上 | `法務審閱` | `parallel-any` | 預設收折,2 人皆待簽,收折文案「任一人簽核即通過」 |
| 同上 | `處長核准` | single | 預設收折 |

→ 要測 multi-person 收折區塊(灰底 / 連接線 / chevron),直接開這筆最快,不用再逐筆試。

## 常用 selector

- Modal 內簽核流程收折箭頭:`button[aria-label="展開"]` / `button[aria-label="收合"]`
- `ApprovalRoute.tsx` 的收折灰底背景層:`li [aria-hidden="true"]`(絕對定位 bg div,注意:同一個 selector 在非 multi 的 step 也可能誤中 lucide icon 的 `aria-hidden="true"` svg,量測時搭配 `li` 範圍一起看,不要只看 bottom 數字就斷定)
- 收折連接線:`li .w-px.flex-1`
- `FormSubmissionsView.tsx` 展開明細按鈕:`button[aria-label="展開明細"]`

## 常見踩坑

- DS `DataTable` 不一定是語意化 `<table><tr>`,**不要**假設 `table tbody tr` 選得到列,改用文字內容模糊比對(`page.getByText(...)`)或先 `page.evaluate` dump DOM 確認結構再下 selector。
- 連續猜 2 次 selector 都 timeout → 停下來先截圖或 `page.content()` 看實際 DOM,不要繼續盲猜第 3 次。
