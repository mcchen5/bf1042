# 早餐店 API - 專案章程

> 版本：v1.0.0  
> 更新日期：2026-03-18  
> 本章程定義專案的技術約束與開發規範，所有 AI 與開發者必須遵守。

---

## 1. 技術棧

### 1.1 核心技術
| 層級 | 技術 | 版本 | 用途 |
|------|------|------|------|
| 運行時 | Bun | ^1.0 | JavaScript 運行時 |
| 後端框架 | Elysia | ^1.0 | API 伺服器 |
| 前端框架 | React | ^18 | UI 框架 |
| 構建工具 | Vite | ^5 | 前端建置 |
| 資料庫 | PostgreSQL | 15+ | 資料儲存 |
| ORM | Drizzle | ^0.30 | 資料庫操作 |

### 1.2 API 契約技術
| 技術 | 用途 |
|------|------|
| **TypeBox** | Schema 定義與驗證 |
| **Eden Treaty** | 端對端類型安全 HTTP 客戶端 |
| **TanStack Query** | 前端狀態管理與快取 |

---

## 2. API 規範（核心）

### 2.1 共享類型原則（重要！）

```
┌─────────────────────────────────────────────────────────┐
│                    API 契約架構                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   packages/api/src/schemas.ts                           │
│   ├── TypeBox Schema (唯一事實來源)                      │
│   └── 自動推導 TypeScript 類型                          │
│            ↑                    ↓                       │
│   Elysia 驗證              Eden Treaty                 │
│            ↑                    ↓                       │
│   後端 API 實作 ←──────→ 前端 API 呼叫                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**黃金法則**：
- ✅ `packages/api` 是 API 規格的**唯一事實來源**
- ✅ 後端使用 Schema 進行**執行時驗證**
- ✅ 前端透過 Eden Treaty **編譯時類型檢查**
- ❌ **禁止**前後端獨立定義相同類型

### 2.2 目錄結構約束

```
packages/api/                    # Workspace 共享套件
├── src/
│   ├── schemas.ts              # TypeBox Schema（核心）
│   ├── types.ts                # 額外輔助類型（可選）
│   └── index.ts                # 統一導出
└── package.json                # 定義為 workspace 依賴

apps/backend/
├── src/
│   ├── routes/                 # API 路由實作
│   │   ├── menu.ts            # 導入 MenuItemSchema
│   │   └── orders.ts          # 導入 OrderSchema
│   └── db/
│       └── schema.ts          # Drizzle Schema（與 API Schema 對應）

apps/frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # Eden Treaty 客戶端
│   └── hooks/
│       ├── useMenu.ts         # 使用 api.client
│       └── useOrders.ts
```

### 2.3 API 變更規範

#### 向後兼容（允許）
```typescript
// ✅ 新增可選欄位
const OrderSchema = t.Object({
  // ... 既有欄位
  note: t.Optional(t.String())  // 新增可選欄位，不影響既有客戶端
})
```

#### Breaking Change（禁止直接修改）
```typescript
// ❌ 禁止：刪除欄位
const OrderSchema = t.Object({
  // customerName 被刪除 - 會導致既有客戶端編譯錯誤
})

// ❌ 禁止：修改類型
price: t.String()  // 原本是 t.Number()

// ✅ 正確做法：建立 v2 Schema
const OrderV2Schema = t.Object({
  // 新版本的定義
})
```

#### 變更流程
```
1. 在 packages/api 修改 Schema
   └── 更新版本註釋：// API 版本：v1.1.0 - 新增 note 欄位

2. 後端實作變更
   └── 更新資料庫 migration
   └── 更新路由處理

3. 前端自動獲得新類型
   └── 執行 bun install（更新 workspace 連結）
   └── TypeScript 編譯檢查

4. 如有 breaking change
   └── 前端編譯錯誤，提示需要修改的檔案
   └── 逐一修復後部署
```

### 2.4 Schema 定義規範

#### 必須包含
```typescript
export const MenuItemSchema = t.Object({
  // 欄位定義
}, {
  // 中繼資料
  description: '菜單項目',           // 用途說明
  additionalProperties: false        // 嚴格模式，禁止額外欄位
})

// 導出靜態類型
export type MenuItem = typeof MenuItemSchema.static
```

#### 欄位註釋規範
```typescript
{
  id: t.Number({ description: '唯一識別碼' }),
  price: t.Number({ 
    minimum: 0, 
    description: '價格（新台幣），必須 >= 0' 
  }),
  category: t.Union([...], { 
    description: '分類，決定顯示區塊' 
  })
}
```

### 2.5 錯誤處理規範

#### 統一回應格式
```typescript
// 成功
{
  success: true,
  data: T
}

// 失敗
{
  success: false,
  error: {
    message: string,      // 人類可讀錯誤訊息
    code?: string,        // 機器可處理錯誤碼
    details?: unknown     // 額外細節
  }
}
```

#### Elysia 實作
```typescript
.post('/', 
  async ({ body }) => { ... },
  {
    response: {
      200: t.Object({
        success: t.Literal(true),
        data: OrderSchema
      }),
      400: t.Object({
        success: t.Literal(false),
        error: t.Object({
          message: t.String(),
          code: t.Optional(t.String())
        })
      })
    }
  }
)
```

---

## 3. 前後端協作流程

### 3.1 新功能開發流程

```
Phase 1: Specify（定義規格）
├── 在 packages/api 定義新 Schema
├── 更新既有 Schema（如需要）
└── 確認所有欄位都有 description

Phase 2: Backend（後端實作）
├── 更新 Drizzle schema
├── 執行 migration
├── 實作 API 路由
└── 使用 packages/api 的 Schema 驗證

Phase 3: Frontend（前端實作）
├── 執行 bun install（更新類型）
├── 使用 Eden Treaty 建立 API hooks
└── TypeScript 確保類型正確

Phase 4: Integration（整合測試）
├── 確認前後端類型一致
├── 驗證 API 回應符合 Schema
└── 測試錯誤處理流程
```

### 3.2 Git 工作流程

```bash
# 功能分支命名
feature/api-add-order-note      # API 變更
feature/ai-order-parser         # 功能實作

# Commit 訊息規範
api(schema): 新增 Order.note 欄位
backend(order): 實作備註儲存
frontend(order): 新增備註輸入框
```

---

## 4. 禁止事項

### 4.1 絕對禁止
```typescript
// ❌ 禁止：前端手寫獨立 interface
// apps/frontend/src/types.ts
interface Order {               // 錯誤！
  id: number
  items: OrderItem[]
}

// ✅ 正確：從 packages/api 導入
import type { Order } from '@breakfast/api'

// ❌ 禁止：後端回傳 any
return { data: order as any }   // 失去類型安全

// ❌ 禁止：繞過 Eden 使用 fetch
fetch('/api/orders')            // 失去類型檢查

// ✅ 正確：使用 Eden Treaty
const res = await api.api.orders.get()
```

### 4.2 Schema 定義禁止
```typescript
// ❌ 禁止：沒有 description
t.Object({ id: t.Number() })    // 錯誤

// ✅ 正確：所有欄位都有說明
t.Object({ 
  id: t.Number({ description: '唯一識別碼' }) 
})

// ❌ 禁止：鬆散的物件驗證
t.Object({...})                 // 預設允許額外屬性

// ✅ 正確：嚴格驗證
t.Object({...}, { additionalProperties: false })
```

---

## 5. 工具與指令

### 5.1 常用指令
```bash
# 更新 workspace 依賴（取得最新類型）
bun install

# 後端開發
cd apps/backend && bun run dev

# 前端開發
cd apps/frontend && bun run dev

# 資料庫遷移
cd apps/backend && bun run db:generate
```

### 5.2 除錯技巧
```typescript
// 檢查 Eden 類型是否正確
import type { App } from '@breakfast/api'
import { treaty } from '@elysiajs/eden'

const api = treaty<App>('http://localhost:3000')

// 懸浮在 api.api.orders.get 上查看類型
// 如果顯示 any，檢查 packages/api 是否正確導出
```

---

## 6. 附錄

### 6.1 相關文件
- `packages/api/src/schemas.ts` - Schema 定義
- `apps/backend/src/index.ts` - Elysia App 類型
- `apps/frontend/src/api/client.ts` - Eden 客戶端

### 6.2 參考資源
- [Elysia 官方文件](https://elysiajs.com/)
- [Eden Treaty 文件](https://elysiajs.com/eden/overview.html)
- [TypeBox 文件](https://github.com/sinclairzx81/typebox)

---

**記住**：
> 在 Eden Treaty 架構中，**TypeBox Schema 就是 API 規格文件**，它同時服務於：
> 1. 執行時驗證（Elysia）
> 2. 編譯時類型檢查（TypeScript）
> 3. API 文件（Swagger）
