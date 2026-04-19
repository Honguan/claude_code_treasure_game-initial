你正在幫助用戶把後端（`server/`）部署到 Render 免費方案。依序執行每個階段，每步都使用 Bash 工具確認結果再繼續。

---

## Phase 1：前置確認

### 1a. 確認 git 是否安裝
執行 `git --version`。
- 若找不到：告知用戶安裝 Git，然後停止。

### 1b. 確認已 push 最新程式碼
執行 `git status` 和 `git remote get-url origin`。
- 若有未 commit 的變更，提醒用戶先 commit 並 push，再繼續部署後端。
- 若沒有 remote：告知用戶需要先執行 `/deploy_github_page` 把專案連到 GitHub，再回來部署後端。

---

## Phase 2：說明 Render 部署方式

告知用戶：

> **Render 免費方案限制提醒：**
> - 免費服務在閒置 15 分鐘後會休眠，第一次請求需等約 30 秒喚醒
> - SQLite 資料庫存在伺服器本地，**每次重新部署都會重置**（用戶資料、分數清空）
> - 若需要持久化資料，未來可考慮升級付費方案或改用外部資料庫
>
> 這對測試和展示已足夠。繼續嗎？

等待用戶確認再繼續。

---

## Phase 3：確認 render.yaml 設定

讀取專案根目錄的 `render.yaml`。

若 `render.yaml` 不存在：
建立以下內容（將 `USERNAME` 替換為實際的 GitHub 用戶名，從 `git remote get-url origin` 取得）：

```yaml
services:
  - type: web
    name: treasure-game-server
    env: node
    plan: free
    region: singapore
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && node dist/index.js
    envVars:
      - key: NODE_VERSION
        value: "22"
      - key: JWT_SECRET
        generateValue: true
      - key: ALLOWED_ORIGINS
        value: https://USERNAME.github.io
      - key: PORT
        value: "10000"
```

若已存在：確認 `ALLOWED_ORIGINS` 的值是否包含正確的 GitHub Pages 網址（`https://USERNAME.github.io`）。如果不正確則修正。

---

## Phase 4：確認後端 TypeScript 可以編譯

執行：
```bash
cd server && npm install && npm run build
```

若編譯失敗，顯示完整錯誤並停止。不要部署失敗的建置。

成功後告知用戶：「後端編譯成功，可以部署。」

---

## Phase 5：Commit render.yaml

執行 `git status` 確認 `render.yaml` 是否已被追蹤。

若是新增或已修改：
```bash
git add render.yaml server/index.ts
git commit -m "chore: add Render deployment config and dynamic CORS"
git push
```

---

## Phase 6：引導用戶在 Render 建立服務

告知用戶以下步驟（無法自動完成，需手動操作）：

> **在 Render 部署後端（約 3 分鐘）：**
>
> 1. 前往 https://render.com 並用 GitHub 帳號登入（免費）
> 2. 點擊右上角 **"New +"** → 選擇 **"Web Service"**
> 3. 選擇 **"Build and deploy from a Git repository"** → 點 **"Next"**
> 4. 找到並選擇你的 repo：`USERNAME/REPO`
> 5. Render 會自動偵測到 `render.yaml`，設定會自動填入
> 6. 確認以下設定：
>    - **Build Command**：`cd server && npm install && npm run build`
>    - **Start Command**：`cd server && node dist/index.js`
>    - **Environment**：Node
>    - **Plan**：Free
> 7. 點擊 **"Create Web Service"**
> 8. 等待部署完成（約 2-5 分鐘），部署日誌會即時顯示
> 9. 部署成功後，複製頁面頂部的網址（格式：`https://treasure-game-server-xxxx.onrender.com`）
>
> 完成後告訴我你的 Render 網址。

等待用戶提供 Render 網址。

---

## Phase 7：更新前端 API 設定

取得用戶提供的 Render 網址後：

搜尋前端程式碼中所有 API 呼叫的 base URL（通常在 `src/` 目錄下，搜尋 `localhost:3001` 或 `VITE_API_URL` 或 `/api`）。

若前端有寫死 `http://localhost:3001`：
1. 在根目錄建立 `.env.example`（若不存在）：
   ```
   VITE_API_URL=http://localhost:3001
   ```
2. 建立 `.env.production`：
   ```
   VITE_API_URL=https://RENDER_URL
   ```
   （將 `RENDER_URL` 替換為實際網址）
3. 更新前端程式碼，把寫死的 URL 改為 `import.meta.env.VITE_API_URL ?? 'http://localhost:3001'`

若前端已使用環境變數：只需更新 `.env.production` 中的值。

將 `.env.production` 加入 `.gitignore`（避免 commit secrets），並告知用戶需要在部署前端前手動設定。

---

## Phase 8：提示重新部署前端

告知用戶：

> ✅ 後端部署完成！
>
> **後端 API：** `https://RENDER_URL/api/health`（可點擊測試是否正常）
>
> **接下來：**
> - 執行 `/deploy_github_page` 重新部署前端，讓它指向新的後端 API
> - 本地開發時後端仍在 `http://localhost:3001`，不受影響
>
> **注意：** Render 免費服務閒置後會休眠。第一位玩家登入時可能需要等 20-30 秒。
