# 早餐店訂餐系統 - 完整模板

技術棧：Elysia + Bun + TanStack (Query, Router, Table, Form) + Eden Treaty + Spec-Kit

## 專案結構

```
breakfast-app/
├── .specify/
│   └── memory/
│       └── constitution.md      # API 契約規範
├── specs/
│   └── 001-ai-order/
│       ├── spec.md             # 功能規格
│       ├── plan.md             # 技術方案
│       └── tasks.md            # 任務列表
├── packages/
│   └── api/
│       ├── src/
│       │   ├── schemas.ts      # TypeBox Schema（唯一事實來源）
│       │   ├── types.ts        # 輔助類型
│       │   └── index.ts
│       └── package.json
├── apps/
│   ├── backend/                # Elysia API
│   └── frontend/               # Vite + React + TanStack
└── package.json
```

## 快速開始

```bash
# 1. 安裝依賴
bun install

# 2. 設定資料庫
createdb breakfast
cd apps/backend && cp .env.example .env

# 3. 執行遷移
cd apps/backend && bun run db:migrate

# 4. 啟動開發環境
bun run dev

# 訪問 http://localhost:5173
```

## 技術特性

| 技術 | 用途 |
|------|------|
| Elysia | 後端 API 框架 |
| Eden Treaty | 端對端類型安全 |
| TanStack Query | 服務端狀態管理 |
| TanStack Router | 類型安全路由 |
| TanStack Table | 複雜資料表格 |
| TanStack Form | 表單驗證 |
| Drizzle ORM | 資料庫 ORM |
| Spec-Kit | 規範驅動開發 |

## API 規格（重要！）

**唯一事實來源**：`packages/api/src/schemas.ts`

```
packages/api/src/schemas.ts  ← 後端驗證 + 前端類型
       ↑                           ↓
Elysia 執行時驗證            Eden Treaty 編譯時檢查
```

## Spec-Kit 工作流程

```
.specify/memory/constitution.md  →  專案章程（API 契約策略）
            ↓
specs/001-ai-order/spec.md       →  功能規格
            ↓
specs/001-ai-order/plan.md       →  技術方案
            ↓
specs/001-ai-order/tasks.md      →  可執行任務
            ↓
packages/api/src/schemas.ts      →  TypeBox Schema
            ↓
apps/backend + apps/frontend    →  實作
```

## API 端點

- `GET /api/menu` - 取得菜單
- `POST /api/orders` - 建立訂單
- `GET /api/orders` - 取得訂單列表
- `PATCH /api/orders/:id` - 更新訂單狀態
- `POST /api/ai-order/parse` - AI 自然語言解析

## 文件

- [SETUP.md](./SETUP.md) - 詳細設定步驟
- [.specify/memory/constitution.md](./.specify/memory/constitution.md) - API 契約規範
- [specs/001-ai-order/](./specs/001-ai-order/) - AI 訂餐功能規格範例
