你正在幫助用戶把專案部署到 GitHub Pages。依序執行每個階段，每步都使用 Bash 工具確認結果再繼續。

---

## Phase 1：確認前置工具

### 1a. 確認 gh CLI

執行 `gh --version 2>&1`。

**若找不到 gh CLI：**
根據作業系統嘗試自動安裝：

先執行 `uname -s 2>/dev/null || echo "Windows"` 判斷作業系統。

- **Windows**：執行 `winget install --id GitHub.cli -e --source winget`
  - 若 winget 不可用，執行 `choco install gh -y`
  - 若兩者都不可用，告知用戶手動安裝：https://cli.github.com，然後停止。
- **macOS**：執行 `brew install gh`
  - 若 brew 不可用，告知用戶安裝 Homebrew 後再試。
- **Linux**：執行以下命令：
  ```bash
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
  sudo apt update && sudo apt install gh -y
  ```

安裝完成後重新執行 `gh --version` 確認成功。

### 1b. 確認 GitHub 登入狀態

執行 `gh auth status 2>&1`。

**若顯示已登入（含 `Logged in to github.com`）：** 繼續下一步。

**若顯示未登入：**

告知用戶：

> **需要登入 GitHub CLI**
>
> 請在下方輸入框輸入以下指令（`!` 前綴會在你的終端機直接執行，可完成互動式登入）：
>
> ```
> ! gh auth login
> ```
>
> **登入步驟說明：**
> 1. 選擇 **GitHub.com**（按 Enter）
> 2. 選擇 **HTTPS**（按 Enter）
> 3. 選擇 **Login with a web browser**（按 Enter）
> 4. 複製畫面上的 8 位數 one-time code
> 5. 瀏覽器會自動開啟，貼上 code 並授權
> 6. 回到終端機確認登入成功
>
> 完成後告訴我「已登入」，我會繼續後續步驟。

等待用戶確認後，重新執行 `gh auth status 2>&1` 驗證登入成功。
若仍未登入，再次引導用戶重試。

### 1c. 確認 git

執行 `git --version 2>&1`。

**若找不到 git：**
根據作業系統嘗試自動安裝：
- **Windows**：執行 `winget install --id Git.Git -e --source winget`
- **macOS**：執行 `xcode-select --install`（會安裝 Xcode Command Line Tools，包含 git）
- **Linux**：執行 `sudo apt install git -y`

安裝完成後重新確認。若無法自動安裝，告知用戶前往 https://git-scm.com 手動安裝。

---

## Phase 2：GitHub Repository 設定

### 2a. 確認是否有現有 remote

執行 `git remote get-url origin 2>&1`。

**若已有 remote：**
- 從 URL 取得 USERNAME 和 REPO。
- 告知用戶 repo 已連接，跳到 Phase 3。

**若沒有 remote：**
- 告知用戶尚未連接 GitHub repo。
- 詢問：「請問 repository 要命名為什麼？（預設：當前資料夾名稱）」
- 執行：`gh repo create <NAME> --public --source=. --remote=origin`
- 再執行 `git push -u origin main`（若分支是 master 則用 master）。
- 從新 remote URL 取得 USERNAME 和 REPO。

---

## Phase 3：後端限制警告與選項

告知用戶：

> ⚠️ **重要提醒：** GitHub Pages 只能託管靜態檔案。登入、註冊、儲存分數等功能需要 Express 後端（`server/`），**無法在 GitHub Pages 上執行**。
>
> **你有兩個選擇：**
>
> **A. 只部署前端**（現在繼續）
> - 遊戲可玩，但登入/排行榜功能不可用
>
> **B. 同時部署後端到 Render 免費服務**（建議）
> - 完整功能，包含登入、分數儲存、排行榜
> - 執行 `/deploy_backend` 指令來部署後端（約 5-10 分鐘）
> - 後端部署完成後再回來繼續這個指令
>
> 請選擇 A 或 B：

等待用戶確認選擇 A 後繼續（若選 B，引導用戶先執行 `/deploy_backend`）。

---

## Phase 4：修正 Vite Base Path

GitHub Pages 會在 `https://USERNAME.github.io/REPO/` 路徑下提供服務，Vite 必須設定正確的 `base` 否則資源會 404。

讀取 `vite.config.ts`：
- 若 repo 名稱是 `USERNAME.github.io`（特殊用戶頁面 repo），設定 `base: '/'`
- 否則，在 `defineConfig({})` 內新增或更新：`base: '/REPO/',`

告知用戶修改的行。並說明本地開發時需把 base 改回 `'/'`（或使用 `process.env.NODE_ENV === 'production' ? '/REPO/' : '/'`）。

---

## Phase 5：安裝 gh-pages 套件

檢查 `package.json` 的 devDependencies 中是否有 `gh-pages`。

**若缺少：**
1. 執行 `npm install --save-dev gh-pages`
2. 在 `package.json` 的 `scripts` 區塊新增：
   ```json
   "deploy": "gh-pages -d dist"
   ```

**注意：** Vite 的輸出目錄是 `dist`（不是 `build`），請確認 `deploy` 腳本使用 `-d dist`。

---

## Phase 6：建置

執行 `npm run build`。

若建置失敗，顯示完整錯誤並停止。**不要部署失敗的建置。**

---

## Phase 7：部署

執行 `npm run deploy`。

這會把 `dist/` 資料夾推送到 GitHub 的 `gh-pages` 分支。

---

## Phase 8：透過 API 啟用 GitHub Pages

執行：
```
gh api repos/USERNAME/REPO/pages --method POST -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1 || gh api repos/USERNAME/REPO/pages --method PUT -f "source[branch]=gh-pages" -f "source[path]=/"
```
（POST 建立新設定，PUT 更新現有設定，其中一個會成功。）

---

## Phase 9：完成 — 顯示網址

告知用戶：

> ✅ **部署完成！**
>
> 你的網站將在 **1-2 分鐘內**上線：
> 🔗 **https://USERNAME.github.io/REPO/**
>
> 若出現空白頁面，請稍等後強制重新整理（Ctrl+Shift+R）。
>
> 查看你的 repository：https://github.com/USERNAME/REPO
>
> 若要部署含登入功能的完整版本，執行 `/deploy_backend` 部署後端。
