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
