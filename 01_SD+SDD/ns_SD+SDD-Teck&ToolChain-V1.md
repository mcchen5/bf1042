# 早餐店訂餐系統：技術與工具鏈選型報告

> **版本**: v1.0  
> **日期**: 2024-03-18  
> **專案**: 早餐店訂餐系統（AI-Native Software Development）  
> **方法論**: Service Design + SDD (Spec-Driven Development)

---

## 目錄

1. [決策總覽](#決策總覽)
2. [後端技術棧](#後端技術棧)
3. [前端技術棧](#前端技術棧)
4. [資料層架構](#資料層架構)
5. [認證與授權](#認證與授權)
6. [AI 整合方案](#ai-整合方案)
7. [檔案與儲存](#檔案與儲存)
8. [部署與基礎設施](#部署與基礎設施)
9. [開發工具鏈](#開發工具鏈)
10. [Monorepo 架構](#monorepo-架構)
11. [創新貢獻](#創新貢獻)
12. [附錄：替代方案比較](#附錄替代方案比較)

---

## 決策總覽

### 核心技術選型

| 層級 | 選定技術 | 替代方案 | 選擇理由 |
|------|----------|----------|----------|
| **執行環境** | Bun 1.1+ | Node.js | 效能、TypeScript 原生支援 |
| **後端框架** | Elysia | Hono、Express | 端對端類型安全、Eden Treaty |
| **前端框架** | Vite + React | Next.js、Vue | Bun 相容性、輕量高效 |
| **狀態管理** | TanStack Query | Redux、Zustand | 伺服器狀態管理最佳實踐 |
| **資料庫** | PostgreSQL (Neon) | MySQL、MongoDB | JSON 支援、向量擴展 |
| **ORM** | Drizzle | Prisma、TypeORM | 輕量、SQL-like、型別安全 |
| **認證** | Lucia + Arctic | Better Auth、NextAuth | 框架相容性、輕量 |
| **AI 模型** | Kimi API | GPT-4、Claude | 中文理解最佳 |
| **向量搜尋** | pgvector | Pinecone、Weaviate | 成本、整合度 |
| **部署平台** | Fly.io | Vercel、Railway | 後端友善、全球網路 |
| **文件系統** | Markdown + Mermaid | Notion、Confluence | Git 版本控制、AI 友善 |

---

## 後端技術棧

### 執行環境：Bun

#### 決策過程

**初始考慮**：Node.js vs Deno vs Bun

**評估維度**：
| 維度 | Node.js | Deno | Bun |
|------|---------|------|-----|
| 執行效能 | 基準 | 快 2-3x | 快 4-5x |
| TypeScript | 需編譯 | 原生 | 原生 |
| 套件相容 | 100% | 80% | 95%+ |
| 啟動速度 | 慢 | 快 | 極快 |
| 工具整合 | 需 webpack等 | 內建 | 內建 bundler |

**關鍵發現**：
- Bun 的 `bun:test` 內建測試框架，無需 Jest
- Bun 的 package manager 比 npm/yarn 快 10x
- 與現有 npm 套件高度相容

**最終決定**：採用 Bun 1.1+ 作為執行環境

### 後端框架：Elysia

#### 決策過程

**初始考慮**：Express vs Hono vs Elysia

**深度比較**：

```typescript
// Express: 傳統但無類型安全
app.post('/order', (req, res) => {
  // req.body 是 any 類型
  // 需手動驗證
})

// Hono: 輕量，但類型推導有限
app.post('/order', validator('json', schema), (c) => {
  // 有類型但需手動定義 schema
})

// Elysia: 端對端類型安全
app.post('/order', 
  { body: t.Object({ items: t.Array(ItemSchema) }) },
  ({ body }) => {
    // body 完全類型安全，無需手動驗證
  }
)
```

**Elysia 核心優勢**：
1. **TypeBox 整合**：Schema 即類型，自動推導
2. **Eden Treaty**：前端調用時享受完整類型提示
3. **效能**：基於 Bun，比 Express 快 10x+
4. **生態**：
   - `@elysiajs/swagger` 自動 API 文件
   - `@elysiajs/cors`、`@elysiajs/jwt` 等插件

**風險評估**：
- Elysia 較新（v1.0 於 2024 發布）
- 社群資源少於 Express
- **風險緩解**：框架核心穩定，且 TypeBox 是成熟標準

**最終決定**：採用 Elysia 作為後端框架

### API 契約：TypeBox + Eden Treaty

#### 設計理念

> **「類型即規格，規格即代碼」**

```typescript
// packages/api/src/schemas.ts - 單一事實來源
export const MenuItemSchema = t.Object({
  id: t.Number(),
  name: t.String({ minLength: 1 }),
  price: t.Number({ minimum: 0 }),
  category: t.Union([t.Literal('主食'), t.Literal('飲料')]),
  imageUrl: t.Optional(t.String()),
  description: t.Optional(t.String()),
  isAvailable: t.Boolean({ default: true })
})

export type MenuItem = typeof MenuItemSchema.static
```

**端對端類型安全**：
```typescript
// 後端：apps/backend/src/routes/menu.ts
import { MenuItemSchema } from '@breakfast/api'

app.get('/menu', () => {
  return db.query.menuItems.findMany()
  // 返回類型自動驗證
})

// 前端：apps/frontend/src/api/client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@breakfast/backend'

const client = treaty<App>('http://localhost:3000')

// 完整類型提示 + 自動完成
const { data } = await client.menu.get()
// data: MenuItem[] | null
```

---

## 前端技術棧

### 為何不用 Next.js

#### 決策過程

**初始誘惑**：Next.js 是 React 生態的「預設選擇」

**深度評估**：

| 考量因素 | Next.js | Vite + React |
|----------|---------|--------------|
| Bun 相容性 | ⚠️ 實驗性支援 | ✅ 原生支援 |
| 啟動速度 | 慢（需編譯） | 極快 |
| 部署複雜度 | 高（Vercel 鎖定） | 低（純靜態） |
| 後端整合 | 複雜 | 簡單（Elysia） |
| 學習曲線 | 陡峭 | 平緩 |
| 可控性 | 低（框架決定多） | 高 |

**關鍵發現**：
- Next.js 14+ 雖支援 Bun，但為實驗性質
- App Router 與 Pages Router 的混亂
- Server Components 心智負擔重
- 部署到非 Vercel 平台需額外配置

**最終決定**：採用 Vite + React，捨棄 Next.js

### 狀態管理：TanStack 生態

#### 選型策略

採用 **TanStack 全家桶** 作為前端基礎設施：

```
@tanstack/react-query    → 伺服器狀態管理
@tanstack/react-router   → 類型安全路由
@tanstack/react-table    → 資料表格
@tanstack/react-form     → 表單管理
@tanstack/virtual        → 虛擬滾動
```

#### TanStack Query 深度分析

**替代方案比較**：
| 方案 | 優點 | 缺點 |
|------|------|------|
| Redux | 生態成熟 | 樣板碼多、過度設計 |
| Zustand | 簡潔 | 無快取策略 |
| SWR | Vercel 出品 | 功能較 Query 少 |
| **TanStack Query** | 快取、重試、分頁、即時更新 | 學習曲線 |

**關鍵優勢**：
```typescript
// 自動快取 + 背景更新
const { data, isLoading } = useQuery({
  queryKey: ['menu', category],
  queryFn: () => api.menu.get({ category }),
  staleTime: 5 * 60 * 1000, // 5分鐘內視為新鮮
  refetchOnWindowFocus: true // 切回視窗自動更新
})

// 樂觀更新
const mutation = useMutation({
  mutationFn: addToCart,
  onMutate: async (item) => {
    // 立即更新 UI，不等待伺服器
    await queryClient.cancelQueries(['cart'])
    const prev = queryClient.getQueryData(['cart'])
    queryClient.setQueryData(['cart'], old => [...old, item])
    return { prev }
  },
  onError: (err, item, context) => {
    // 失敗時回滾
    queryClient.setQueryData(['cart'], context.prev)
  }
})
```

#### TanStack Router

**取代 React Router 的理由**：
- 類型安全的路由參數
- 巢狀路由設計
- 內建 loader 模式
- 支援程式化導航

```typescript
// 類型安全的路由定義
const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/menu/$category',
  component: MenuPage,
  loader: ({ params }) => 
    queryClient.fetchQuery(['menu', params.category])
})
// params.category 完全類型安全
```

---

## 資料層架構

### 資料庫：PostgreSQL (Neon)

#### 決策過程

**初始考慮**：SQLite vs MySQL vs PostgreSQL

**深度評估**：

| 特性 | SQLite | MySQL | PostgreSQL |
|------|--------|-------|------------|
| 複雜查詢 | 有限 | 良好 | 優秀 |
| JSON 支援 | 基本 | 5.7+ | 原生 + 索引 |
| 全文搜尋 | 基本 | 需外掛 | 內建強大 |
| 向量擴展 | 無 | 無 | pgvector |
| 擴展性 | 低 | 中等 | 高 |

**關鍵需求驅動**：
1. **AI 語義搜尋**：需要向量資料庫功能（pgvector）
2. **菜單靈活結構**：JSONB 存儲可變規格
3. **地理位置**：PostGIS 擴展（未來外送功能）

**Neon 選擇理由**：
- Serverless PostgreSQL，自動擴展
- 分支功能（Branching）：開發/測試/生產隔離
- 與 Vercel/Netlify 類似的開發體驗
- 免費額度充足

**最終決定**：Neon PostgreSQL + pgvector

### ORM：Drizzle

#### 決策過程

**深度比較**：Prisma vs Drizzle vs TypeORM

| 特性 | Prisma | Drizzle | TypeORM |
|------|--------|---------|---------|
| 類型安全 | 優秀 | 優秀 | 一般 |
| 查詢語法 | 專有 DSL | SQL-like | 裝飾器 |
| 執行效能 | 中等 | 快 | 慢 |
| Bundle 大小 | 大 | 小 | 大 |
| 遷移工具 | 內建 | 內建 | 需 typeorm-cli |
| 學習曲線 | 中等 | 低（懂 SQL 即可） | 高 |

**關鍵差異**：
```typescript
// Prisma: 專有 DSL
const users = await prisma.user.findMany({
  where: { age: { gt: 18 } },
  include: { posts: true }
})

// Drizzle: SQL-like，更直觀
const users = await db
  .select()
  .from(usersTable)
  .where(gt(usersTable.age, 18))
  .leftJoin(postsTable, eq(usersTable.id, postsTable.userId))
// 寫法接近實際 SQL，調試更容易
```

**選擇 Drizzle 的核心原因**：
1. **輕量**：對 Bun 友善，啟動快
2. **SQL-like**：團隊已有 SQL 知識可複用
3. **TypeBox 整合**：可與 API Schema 共享類型定義
4. **遷移**：純 SQL 遷移檔，透明可控

**最終決定**：Drizzle ORM

### 向量資料庫：pgvector

#### 設計方案

```sql
-- 啟用 pgvector 擴展
CREATE EXTENSION vector;

-- 菜單品項向量表
CREATE TABLE menu_embeddings (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER REFERENCES menu_items(id),
  embedding VECTOR(1536), -- Kimi embedding 維度
  content TEXT, -- 原始文字（用於顯示）
  created_at TIMESTAMP DEFAULT NOW()
);

-- 相似度搜尋索引
CREATE INDEX ON menu_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**應用場景**：
- 自然語言點餐：「我要一杯少冰的奶茶」→ 匹配品項
- 智能推薦：基於向量相似度的相關品項推薦

---

## 認證與授權

### 方案演進：Better Auth → Lucia + Arctic

#### 初始選擇：Better Auth

**選擇理由**：
- 標榜「下一代認證方案」
- 支援多種策略（OAuth、Magic Link、Credentials）
- 社群討論度高

**遇到的問題**：
```typescript
// Better Auth 與 Elysia 整合問題
// 1. 依賴 Next.js 的 request/response 對象
// 2. 與 Bun 的相容性問題
// 3. Session 管理方式與 Elysia 衝突

// 實際測試發現：
// - 文件不完善，Elysia 整合範例缺失
// - 部分功能在 Bun 環境下異常
// - Bundle 體積過大（包含未使用的 adapter）
```

#### 重新評估：Lucia + Arctic

**Lucia 優勢**：
| 特性 | Better Auth | Lucia |
|------|-------------|-------|
| 框架耦合 | 緊密（Next.js 優先） | 無耦合 |
| 彈性 | 中等 | 高（可自定義所有環節） |
| Bun 相容 | 有問題 | ✅ 原生支援 |
| Bundle 大小 | 大 | 小 |
| TypeScript | 良好 | 優秀 |

**Arctic 角色**：
- 輕量 OAuth 客戶端集合
- 支援 Google、Line、Facebook 等
- 與 Lucia 完美搭配

#### 最終架構

```typescript
// 核心設定
import { Lucia } from 'lucia'
import { BunSQLiteAdapter } from '@lucia-auth/adapter-sqlite'

const adapter = new BunSQLiteAdapter(db, {
  user: 'users',
  session: 'sessions'
})

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (data) => ({
    email: data.email,
    name: data.name,
    role: data.role
  })
})

// Google OAuth
import { Google } from 'arctic'

const google = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
)

// Elysia 整合
app.get('/auth/google', async () => {
  const url = await google.createAuthorizationURL(state, codeVerifier)
  return redirect(url.toString())
})
```

**最終決定**：Lucia + Arctic，捨棄 Better Auth

---

## AI 整合方案

### 核心模型：Kimi API

#### 決策過程

**評估對象**：GPT-4 vs Claude vs Kimi vs 文心一言

| 維度 | GPT-4 | Claude | Kimi | 文心一言 |
|------|-------|--------|------|----------|
| 中文理解 | 良好 | 良好 | **優秀** | 優秀 |
| 台灣繁體 | 一般 | 一般 | **優秀** | 差 |
| 餐飲語境 | 一般 | 一般 | **良好** | 一般 |
| 價格 | 高 | 中等 | **低** | 低 |
| API 穩定 | 優秀 | 良好 | 良好 | 不穩定 |
| 回應速度 | 快 | 快 | 快 | 慢 |

**關鍵測試**：
```
測試輸入：「我要一杯大杯的拿鐵，半糖去冰，加珍珠」

GPT-4：理解正確，但輸出格式需大量調教
Claude：同 GPT-4
Kimi：
  - 自動識別「大杯」= Large
  - 「拿鐵」= Latte
  - 「半糖」= 50% sugar
  - 「去冰」= No ice
  - 「加珍珠」= Add boba
  - 輸出結構化 JSON 無需複雜 prompt

測試輸入：「老闆，來個總匯，不要美乃滋」
Kimi：
  - 識別「總匯」= 總匯三明治
  - 「不要美乃滋」= 客製化選項
  - 正確對應到菜單項目
```

**選擇理由**：
1. **中文語境原生優化**：對台灣餐飲術語理解準確
2. **成本效益**：價格約為 GPT-4 的 1/5
3. **無需複雜 Prompt Engineering**：對結構化輸出友好
4. **國內服務**：網路延遲低，客服響應快

**最終決定**：Kimi API 作為主要 AI 模型

### 向量嵌入策略

```typescript
// 使用 Kimi 的 text-embedding 模型
async function createEmbedding(text: string) {
  const response = await fetch('https://api.moonshot.cn/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'text-embedding-v1',
      input: text
    })
  })
  const { data } = await response.json()
  return data[0].embedding // 1536 維向量
}

// 應用：菜單品項向量化
for (const item of menuItems) {
  const text = `${item.name}。${item.description}。類別：${item.category}`
  const embedding = await createEmbedding(text)
  await db.insert(menuEmbeddings).values({
    menuItemId: item.id,
    embedding,
    content: text
  })
}
```

### AI 對話架構

```
用戶輸入 → 意圖識別 → 實體提取 → 槽位填充 → 確認 → 建立訂單
              ↓
         向量搜尋（匹配菜單）
              ↓
         Kimi 結構化輸出
              ↓
         驗證邏輯（價格、庫存）
              ↓
         訂單建立
```

---

## 檔案與儲存

### 檔案儲存：Dropbox

#### 決策過程

**評估方案**：
| 方案 | 成本 | 整合難度 | 容量 |
|------|------|----------|------|
| AWS S3 | 按需付費 | 中等 | 無限 |
| Cloudflare R2 | 免費額度高 | 低 | 無限 |
| **Dropbox** | **已有 1TB** | **低** | **1TB** |
| Google Drive | 免費 15GB | 中等 | 付費擴展 |

**關鍵因素**：
- 團隊已有 Dropbox 1TB 訂閱（未充分利用）
- Dropbox API 成熟，文件操作簡單
- 無需額外基礎設施成本

**應用場景**：
- 菜單圖片上傳
- 訂單 PDF 收據存儲
- 促銷素材管理

```typescript
// Dropbox 整合
import { Dropbox } from 'dropbox'

const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN })

// 上傳菜單圖片
export async function uploadMenuImage(
  buffer: Buffer, 
  filename: string
) {
  const response = await dbx.filesUpload({
    path: `/menu-images/${filename}`,
    contents: buffer,
    mode: { '.tag': 'overwrite' }
  })
  
  // 獲取分享連結
  const link = await dbx.sharingCreateSharedLinkWithSettings({
    path: response.result.path_display
  })
  
  return link.result.url.replace('?dl=0', '?raw=1')
}
```

### OCR：Google Vision API

#### 決策過程

**評估方案**：
| 方案 | 準確率 | 中文支援 | 成本 | 速度 |
|------|--------|----------|------|------|
| Tesseract | 中等 | 需訓練 | 免費 | 慢 |
| Google Vision | **高** | **原生** | 中等 | 快 |
| AWS Textract | 高 | 良好 | 高 | 快 |
| Azure Computer Vision | 高 | 良好 | 高 | 快 |

**選擇理由**：
- Google Vision 對中文印刷體識別最準確
- 支援台灣繁體字型
- 價格合理（前 1000 次/月免費）

**應用場景**：
- 上傳紙本菜單 → 自動轉為數位菜單
- 發票識別（會計用途）

```typescript
// Vision API 整合
import vision from '@google-cloud/vision'

const client = new vision.ImageAnnotatorClient()

export async function parseMenuImage(imageUrl: string) {
  const [result] = await client.textDetection(imageUrl)
  const detections = result.textAnnotations
  
  // 結構化處理：品項名稱、價格、類別
  return structureMenuText(detections[0].description)
}
```

---

## 部署與基礎設施

### 後端部署：Fly.io

#### 決策過程

**評估方案**：
| 方案 | 價格 | 全球網路 | Docker 支援 | 後端友善 |
|------|------|----------|-------------|----------|
| Vercel | 免費額度高 | 優秀 | 有限 | 僅 Edge |
| Railway | 中等 | 一般 | 良好 | 良好 |
| **Fly.io** | **中等** | **優秀** | **原生** | **優秀** |
| AWS | 複雜 | 優秀 | 原生 | 複雜 |

**選擇理由**：
1. **後端原生設計**：不同於 Vercel 的 Serverless，Fly.io 支援長連接、WebSocket
2. **全球 Anycast 網路**：自動路由到最近節點
3. **Docker 原生**：`fly deploy` 直接部署 Dockerfile
4. **PostgreSQL 託管**：與 Neon 或 Fly Postgres 整合

```dockerfile
# Dockerfile
FROM oven/bun:1.1

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
```

```yaml
# fly.toml
app = "breakfast-backend"
primary_region = "hkg"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### 前端部署：Cloudflare Pages

#### 決策過程

**選擇理由**：
- Vite 靜態構建輸出
- 全球 CDN 邊緣部署
- 免費額度充足
- 與 Elysia 後端分離，獨立擴展

```typescript
// 部署流程
1. bun run build → 輸出 dist/
2. wrangler pages deploy dist/
3. 自動獲得 *.pages.dev 域名
```

### 資料庫：Neon

**部署配置**：
```yaml
# 生產環境：Neon Serverless Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db

# 開發環境：本地 Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
```

---

## 開發工具鏈

### 包管理器：Bun

```bash
# 安裝依賴
bun install

# 執行腳本
bun run dev
bun run build
bun run test

# 新增套件
bun add package-name
bun add -d package-name  # dev dependency
```

### 測試框架

```bash
# Bun 內建測試
bun test

# 覆蓋率報告
bun test --coverage
```

```typescript
// 測試範例
import { describe, it, expect } from 'bun:test'
import { app } from '../src/app'

describe('Menu API', () => {
  it('GET /menu returns menu items', async () => {
    const response = await app.handle(
      new Request('http://localhost/menu')
    )
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })
})
```

### 程式碼品質

```bash
# TypeScript
bunx tsc --noEmit

# ESLint
bunx eslint src/

# Prettier
bunx prettier --write src/

# 全部檢查
bun run lint
```

---

## Monorepo 架構

### 目錄結構

```
breakfast-ordering/
├── apps/
│   ├── backend/           # Elysia 後端
│   │   ├── src/
│   │   │   ├── routes/    # API 路由
│   │   │   ├── models/    # Drizzle schema
│   │   │   ├── services/  # 業務邏輯
│   │   │   ├── plugins/   # Elysia 插件
│   │   │   └── index.ts   # 入口
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── frontend/          # Vite + React
│       ├── src/
│       │   ├── components/
│       │   ├── routes/    # TanStack Router
│       │   ├── hooks/     # TanStack Query
│       │   ├── stores/    # 客戶端狀態
│       │   └── api/       # Eden Treaty 客戶端
│       └── package.json
│
├── packages/
│   └── api/               # 共享 API 契約
│       ├── src/
│       │   ├── schemas.ts # TypeBox schemas
│       │   └── types.ts   # 類型導出
│       └── package.json
│
├── docs/                  # VitePress 文件
│   ├── design/            # 服務設計文件
│   │   └── v1.0.0/
│   │       ├── 01-personas.md
│   │       ├── 02-cjm.md
│   │       ├── 03-blueprint.md
│   │       ├── 04-user-stories.md
│   │       ├── 05-architecture.md
│   │       └── 06-ux-design.md
│   └── .vitepress/
│
├── auto-dev/              # 自動化開發工具
│   └── src/
│       ├── core/
│       │   └── Agent.ts   # AutoDev 核心
│       └── templates/
│
├── package.json           # Root workspace 配置
├── bun.lock
└── turbo.json             # 構建管道
```

### Workspace 配置

```json
// root package.json
{
  "name": "breakfast-ordering",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.12"
  }
}
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### 依賴關係

```
apps/backend
├── @breakfast/api (workspace)
├── elysia
├── drizzle-orm
├── lucia
└── @elysiajs/*

apps/frontend
├── @breakfast/api (workspace)
├── @elysiajs/eden
├── @tanstack/react-query
├── @tanstack/react-router
└── react

packages/api
└── @sinclair/typebox
```

---

## 創新貢獻

### 1. 純 Markdown 文件流

**傳統做法**：
- 服務設計：Miro、Figma、專業工具
- 開發文件：Confluence、Notion
- 問題：AI 難以讀取、版本控制困難

**創新方案**：
```
Git 管理的 Markdown + Mermaid 圖表 → VitePress 渲染
```

**優勢**：
- ✅ AI 可直接讀取（純文字）
- ✅ 版本控制（Git history）
- ✅ 協作友善（Pull Request 審查）
- ✅ 自動部署（Git push → VitePress）

**實現**：
```markdown
<!-- docs/design/v1.0.0/03-blueprint.md -->
# 服務藍圖

## 前台接觸點

```mermaid
flowchart TB
  subgraph 用戶層
    U1[打開 App]
    U2[語音輸入]
  end
  
  subgraph 前台層
    F1[AI 對話框]
    F2[解析結果卡片]
  end
  
  U1 --> F1
  U2 --> F1
  F1 --> F2
```
```

### 2. 類型即規格

**核心理念**：
```
TypeBox Schema = API 契約 = 驗證邏輯 = 類型定義
```

**實現機制**：
```typescript
// packages/api/src/schemas.ts（單一事實來源）
export const OrderSchema = t.Object({
  id: t.Number(),
  items: t.Array(OrderItemSchema),
  total: t.Number(),
  status: t.Union([
    t.Literal('pending'),
    t.Literal('preparing'),
    t.Literal('ready'),
    t.Literal('completed')
  ])
})

// 後端：自動驗證
app.post('/orders', 
  { body: OrderSchema },
  ({ body }) => { /* body 已驗證 */ }
)

// 前端：完整類型
const { data } = await client.orders.post({
  items: [...]  // 自動提示、類型檢查
})
```

**價值**：
- 零同步成本（Single Source of Truth）
- 編譯時錯誤檢測
- 重構安全

### 3. AI-Native 開發流程

**自動化程度**：約 80%

```
服務設計（人工）
  ├── CJM（AI 輔助生成）
  ├── 藍圖（AI 輔助生成）
  └── User Stories（AI 輔助生成）
      ↓
UX 設計（人工 + AI）
  ├── 線框圖（AI 生成）
  └── 交互說明（人工審核）
      ↓
技術實現（高度自動化）
  ├── Spec-Kit 生成規格（AI）
  ├── 資料庫 Schema（AI）
  ├── API 端點（AI）
  ├── 前端組件（AI）
  └── 測試用例（AI）
      ↓
部署（自動化）
  ├── Git push
  ├── CI/CD 管道
  └── 自動部署到 Fly.io
```

**AI 工具分工**：
| 工具 | 角色 | 應用場景 |
|------|------|----------|
| Kimi | 服務設計助理 | CJM、藍圖、Personas |
| Claude Code | 技術架構師 | SDD、Spec-Kit、實現 |
| Cursor | 代碼生成器 | 前端組件、API 實現 |
| Gemini | 研究助理 | 技術調研、方案比較 |

### 4. 多平台 SDD 統一方法

**挑戰**：Claude、Gemini、Kimi 各有不同特性，如何統一工作流程？

**解決方案**：標準化文件格式

```markdown
# SDD 標準輸入格式

## 需求描述
[User Story 格式]

## 設計參考
- @03-blueprint.md
- @06-ux-design.md

## 輸出要求
1. 技術規格（Markdown）
2. 風格：簡潔、具體、可執行
3. 必須包含：API、Schema、組件接口
```

**各平台指令**：
```
Kimi（網頁版）：
"請閱讀以下設計文件，並完成技術規格..."
[貼上文件內容]

Claude Code：
@04-user-stories.md @06-ux-design.md /specify

Gemini：
"基於以下服務設計，請生成技術規格..."
```

**價值**：
- 不受限於單一 AI 平台
- 根據任務選擇最適合的 AI
- 統一的輸出品質

---

## 附錄：替代方案比較

### A. 後端框架

| 框架 | 適用場景 | 不適用場景 |
|------|----------|------------|
| **Elysia** ✅ | 新專案、Bun、型別安全優先 | 需大量現成插件 |
| Hono | 跨平台（Edge + Node）、輕量 | 複雜型別推導 |
| Express | 遺留系統、團隊熟悉 | 新專案、效能要求 |
| Fastify | 高效能 Node | 需 Eden Treaty 類型安全 |
| NestJS | 企業級、複雜架構 | 輕量快速開發 |

### B. 前端框架

| 框架 | 適用場景 | 不適用場景 |
|------|----------|------------|
| **Vite+React** ✅ | 輕量、可控、Bun 相容 | 需 SSR 渲染 |
| Next.js | SEO 優先、全功能 | Bun 相容性問題 |
| Remix | 資料驅動、表單密集 | 學習曲線陡峭 |
| SvelteKit | 極致效能 | 生態較小 |

### C. 認證方案

| 方案 | 適用場景 | 不適用場景 |
|------|----------|------------|
| **Lucia+Arctic** ✅ | Elysia、自定義需求 | 快速開發 MVP |
| Better Auth | Next.js、快速啟動 | 非 Next.js 框架 |
| Auth0 | 企業級、SSO 需求 | 成本控制、數據自主 |
| Supabase Auth | 已用 Supabase | 已有資料庫 |

### D. AI 模型

| 模型 | 適用場景 | 不適用場景 |
|------|----------|------------|
| **Kimi** ✅ | 中文語境、台灣繁體 | 英文長文本 |
| GPT-4 | 通用、英文為主 | 成本控制 |
| Claude | 長文本、分析 | 中文語境 |
| 文心一言 | 大陸市場 | 台灣繁體 |

---

## 總結

### 關鍵決策矩陣

| 決策 | 選擇 | 核心理由 |
|------|------|----------|
| 執行環境 | Bun | 效能、TypeScript 原生 |
| 後端框架 | Elysia | 端對端類型安全、Eden Treaty |
| 前端框架 | Vite + React | 輕量、Bun 相容 |
| 狀態管理 | TanStack Query | 伺服器狀態最佳實踐 |
| 資料庫 | PostgreSQL (Neon) | 向量支援、Serverless |
| ORM | Drizzle | 輕量、SQL-like |
| 認證 | Lucia + Arctic | 框架相容、輕量 |
| AI 模型 | Kimi | 中文理解最佳 |
| 部署 | Fly.io + Neon | 後端友善、全球網路 |
| 文件 | Markdown + Mermaid | Git 版本控制、AI 友善 |

### 創新價值

1. **純 Markdown 文件流**：打破設計與開發的資訊孤島
2. **類型即規格**：消除前後端契約同步成本
3. **AI-Native 開發**：80% 自動化，專注創造性工作
4. **多平台 SDD**：不被單一 AI 平台綁定

---

*本報告記錄了早餐店訂餐系統從需求分析到技術選型的完整決策過程。*
