# 專案設定步驟

## 1. 安裝 PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# 建立資料庫
createdb breakfast
```

## 2. 設定後端

```bash
cd apps/backend
cp .env.example .env
# 編輯 .env 設定資料庫連線

# 執行資料庫遷移
bun run db:generate
bun run db:migrate
```

## 3. 安裝依賴

```bash
# 根目錄
bun install
```

## 4. 啟動開發環境

```bash
# 終端 1：啟動後端
cd apps/backend
bun run dev

# 終端 2：啟動前端
cd apps/frontend
bun run dev
```

## 5. 訪問應用

- 前端: http://localhost:5173
- 後端 API: http://localhost:3001
- API 文件: http://localhost:3001/swagger

## 主要功能

- `/` - 首頁儀表板
- `/menu` - 瀏覽菜單
- `/orders` - 訂單管理（含表格分頁、排序、篩選）
- `/order/new` - 建立新訂單（TanStack Form）
