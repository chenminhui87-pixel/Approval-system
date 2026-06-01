# 公司電腦雲端開發 — 操作步驟

## 第一次開啟（約 3 分鐘）

1. 打開瀏覽器，登入 GitHub
2. 進入 repo：[chenminhui87-pixel/Approval-system](https://github.com/chenminhui87-pixel/Approval-system)
3. 點綠色 **Code** 按鈕 → **Codespaces** tab → **Create codespace on main**
4. 等 1~3 分鐘（第一次比較久，要建環境）
5. 跑完會自動開啟瀏覽器版 VS Code

期間 Codespaces 會自動：
- 跑 `npm install`
- 裝 Claude Code CLI
- 開好 port 5173

## 啟動 Claude Code

在瀏覽器版 VS Code 裡：

1. 開啟終端機（`Ctrl + ` 或 Menu → Terminal → New Terminal）
2. 輸入：
   ```bash
   claude
   ```
3. 第一次會要你登入 — 它會給一個 `https://...` 網址
4. 點那個網址 → 登入你的 Claude 帳號
5. 完成後回終端機，可以開始用了

## 啟動 Vite Dev Server（看預覽）

在另一個終端機：

```bash
npm run dev
```

Codespaces 會跳出小視窗問要不要 forward port 5173 → 點 **Open in Browser**，就能看到 app。

## 之後再進來

不用再建環境，去 GitHub repo → Code → Codespaces tab，會看到你之前建的環境，點一下就接著用。

## 用量管理

- **免費額度：** 每月 60 小時 + 15GB 儲存
- **看用了多少：** [github.com/settings/billing](https://github.com/settings/billing) → Codespaces 區段
- **不用的時候：** 關閉瀏覽器分頁就好（30 分鐘沒動會自動暫停，不算時間）
- **想徹底清掉：** repo → Code → Codespaces → ⋯ → Delete

## 注意

- Claude Code 需要 Claude 訂閱（Pro / Max）或 Anthropic API key
- 你目前用的 Claude 帳號應該直接能登入 Claude Code
- 公司電腦的 token / GitHub 認證跟你家裡的 Mac 是各自獨立的，第一次要重設一次
