# 待開發項目(Backlog)

> 記錄時間:2026-10-08 · 分支 `claude/design-sync-yqjrmw`
> 本檔追蹤已討論但尚未動工的開發項目。動工時把項目搬到 commit / PR 描述並附上決策 rationale。

---

## 1. 各 panel 寬度可拉動調整(Resizable panel widths)

**現況**
- 右側詳情面板固定寬度(`DetailAside` 桌機 `w-[380px] xl:w-[420px]`)。
- 左側導覽 sidebar、中間清單 DataTable 欄寬皆為固定值。

**目標**
- 讓使用者可拖曳調整各區域(sidebar / 清單 / 右側詳情面板)寬度,適應不同內容量與螢幕尺寸。

**考量 / 待釐清**
- DS 是否已有 Resizable / SplitPane / 拖曳把手 primitive?沒有的話走哪種合規做法(避免自刻)。
- 拖曳把手的 a11y:鍵盤可調整(方向鍵)、`aria-valuenow` / role=separator。
- min / max clamp(`AppShellAside` 本身已 clamp 240–640px,可沿用語意)。
- 寬度狀態是否持久化(per-viewer `localStorage`,非共享狀態)。

**優先度**:中

---

## 2. 簽核流程:收折區域範圍 + 資訊優化(Approval route collapse scope & info hierarchy)

**現況**
- 簽核流程以 `ApprovalRoute`(富節點)/ DS `Steps`(簡易)呈現。
- 各節點的收合/展開範圍、資訊密度尚未系統性檢視。

**目標**
- 定義每個簽核節點「預設收起 vs 常駐」的資訊範圍。
- 優化資訊層級:簽核人 / 時間 / 意見 / 狀態 的呈現優先序與視覺權重。

**考量 / 待釐清**
- 預設是否只展開「當前節點」,收合已完成與未來節點?
- 「查看全部」的觸發方式與展開範圍(逐節點 vs 整條流程)。
- 平行簽核(parallel)的群組化呈現,避免與序列節點混淆。
- 避免資訊過載:長意見是否截斷 + 展開。

**優先度**:中高

---

## 3. 申請單內容排列:DS 規則與元件使用稽核(Form content DS-compliance audit)

**現況**
- 申請內容以 DS `DescriptionList`(`orientation="vertical"`)呈現 `fixedFields` / `customFields`。

**目標**
- 稽核申請單內容的排列與元件使用是否符合 design system 規範:
  - `DescriptionList` orientation 選用是否正確(vertical vs horizontal)。
  - 欄位分組、間距是否走 DS space token(非魔術數字)。
  - 是否有自刻排版應改用 DS 元件。

**做法**
- 可直接走 `/product-ui-audit` skill(DS usage discipline 7 維稽核),對 `ApprovalDetailPanel` + `ApprovalModal` 做掃描。

**優先度**:中

---

### 備註
- 以上三項均為「優化 / 稽核」性質,非阻斷性 bug;可排入下一個開發迭代。
- 動工前先查 DS canonical(`node_modules/@qijenchen/design-system/ds-canonical/`)有無現成 primitive / rule,不發明新 pattern。

---

## PM 討論新增(2026-10-13)

> 與 PM 討論後確認的三項優化;本區為「要做」的方向,細節待各自動工前敲定。

### A. Table 欄位內容 Filter

**目標**
- 針對清單 DataTable 的欄位內容新增 filter(例如:狀態 / 緊急程度 / 申請人 / 到期 等)。

**考量 / 待釐清**
- 走 DS DataTable 既有的 column filter 能力,還是另做一列 filter bar?先查 `data-table.spec.md`。
- 哪些欄位需要 filter、各欄 filter 型別(多選 enum / 日期區間 / 文字搜尋)。
- 與現有「分類 chip」「搜尋框」的關係 —— filter 是否整併到同一層,避免三套篩選各自為政。
- filter 與批次選取、跨 tab 的互動(沿用「子狀態隨母集重算」原則)。

**優先度**:中高

---

### B. 批次模式保留瀏覽 detail,但隱藏右側面板操作列

**目標(已與前次提案一致)**
- 批次勾選時**保留**右側面板可瀏覽單張 detail(唯讀預覽),**不清除**勾選。
- 批次模式下**隱藏面板底的單張操作列**(退件 / 核准),批次只透過底部 BulkActionBar 操作,作用域清楚。
- 空狀態只在「有勾選但尚未點任一張來看」時顯示;點了 info 就換成該張唯讀預覽。

**實作要點**
- `openRecord`:批次時不 `clearSelection()`。
- `ApprovalDetailPanel`:批次中隱藏 footer 單張動作(傳 readOnly / hideActions)。
- 右側面板內容切換邏輯:批次 + 未選看 → 空狀態;批次 + 選看某張 → 唯讀預覽。

**優先度**:高(已可動工,直接替代現行「點 info 清空勾選」行為)

---

### C. 創建表單搬進 Sidebar + 表單管理生態系(RBAC)

**目標**
- 把「創建申請單表單」從現在的 header ⋯ 入口搬到 **sidebar**,擴成一個完整的**表單管理模組**:
  - **創建表單** / **編輯表單**
  - **瀏覽該表單的使用情況**:有多少人用此表單送出審核、各單狀態追蹤(呈現資訊可比照「待簽核」清單)。
  - **操作按鈕依登入者身份別權限顯示/隱藏**(有權限才顯示對應動作)。
- **存取控管(平台層)**:只有「向簽核系統提出需要創建表單」的部分人,才能使用本模組。
- **協作角色**:發起人(owner)可新增 **共同管理者 / 編輯者 / 瀏覽者**。

**待釐清(動工前必敲定)**
- 這是 **prototype**:權限/存取預期以 **mock 當前使用者角色** 呈現(非真 auth),是否加「角色切換器」讓 stakeholder 看各角色視角?
- **權限 → 動作** 對照矩陣:owner / 共同管理者 / 編輯者 / 瀏覽者 各自可見哪些按鈕(建立 / 編輯 / 刪除 / 管理協作者 / 看送審清單 / 對送審單操作)。
- 表單層狀態(草稿 / 已發布 / 停用)與送審單狀態(簽核中 / 已核准 / 已退件)如何並呈。
- 「送審清單」是否直接複用現有 approval table + 右側面板元件。
- Sidebar 資訊架構:表單管理與現有簽核導航如何並存(新增一個 group?)。

**優先度**:中(規模最大,接近一個子模組,需獨立設計 pass;建議排在 A / B 之後)

---

### 建議執行順序
1. **B**(已完全 scoped,直接動工)→ 2. **A**(小中型,先定 filter 併入哪一層)→ 3. **C**(最大,需先定權限矩陣與 prototype mock 策略,再分階段做)。

---

## D. 申請單內容資訊優化與更新(2026-10-15)

**現況**
- 申請單內容(`fixedFields` / `customFields`)目前是 mock 靜態資料,各分類(採購 / 請假 / 出差 / 招募…)的欄位內容在初版建立後就沒再檢視過。
- 項目 3(DS 規則與元件使用稽核)已完成,但那是「排版/元件用法」稽核,**不含**內容本身是否足夠 / 正確 / 符合各表單分類實際需求。

**目標**
- 檢視各分類申請單的 `fixedFields` / `customFields` 內容是否完整、欄位是否貼合實際業務情境(例如:採購單有無單價/供應商、請假單有無假別/時數、出差單有無交通方式/預算)。
- 更新過時或不合理的 mock 內容(資料本身,非排版)。

**待釐清(動工前先問 PM/user)**
- 「優化」範圍是全部分類都檢視,還是先挑使用頻率高的幾類(採購 / 請假 / 出差)?
- 是否需要新增欄位(如需求理由、核准額度門檻),還是只調整既有欄位的資料內容?
- 與項目 3 的稽核成果是否需要合併成單一 pass,避免同一元件改兩次。

**優先度**:待定(需先敲定範圍)
