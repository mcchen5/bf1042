# 系統架構設計

> 技術架構與元件設計

---

## 整體架構

```mermaid

flowchart TB
    subgraph 客戶端
        web["Web App
React + Vite"]
        mobile["Mobile App
(未來)"]
    end

    subgraph API閘道層
        elysia["Elysia
Bun Runtime"]
    end

    subgraph 業務層
        menu["菜單服務"]
        order["訂單服務"]
        ai["AI 服務
Kimi 整合"]
        auth["認證服務
Lucia"]
    end

    subgraph 資料層
        postgres[("PostgreSQL
主要資料")]
        redis[("Redis
快取")]
    end

    subgraph 外部服務
        kimi["Kimi API"]
        firebase["Firebase
推播"]
        payment["金流閘道"]
    end

    web --> elysia
    elysia --> menu
    elysia --> order
    elysia --> ai
    elysia --> auth

    menu --> postgres
    order --> postgres
    order --> redis
    ai --> kimi
    auth --> postgres

    order -.-> firebase
    order -.-> payment

```

---

## 技術選型理由

| 技術               | 選擇理由                               | 替代方案         |
| ------------------ | -------------------------------------- | ---------------- |
| **Bun**            | 執行快速、內建 TypeScript、適合 Elysia | Node.js          |
| **Elysia**         | 端對端類型安全、效能高、Bun 原生       | Express, Fastify |
| **Eden Treaty**    | 與 Elysia 整合、類型自動同步           | tRPC, GraphQL    |
| **TanStack Query** | 資料快取、背景更新、樂觀更新           | SWR, Apollo      |
| **Drizzle**        | SQL-like、類型安全、與 Elysia 搭配     | Prisma           |
| **Kimi**           | 中文理解佳、成本低                     | GPT-4, Gemini    |

---

## 資料模型

### 核心實體關係

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER {
        int id PK
        string email
        string name
        string phone
        datetime created_at
    }

    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        int id PK
        int user_id FK
        jsonb items
        int total
        string status
        datetime pickup_time
        string customer_name
        string customer_phone
        string note
        datetime created_at
    }

    MENU_ITEM ||--o{ ORDER_ITEM : referenced_by
    MENU_ITEM {
        int id PK
        string name
        int price
        string category
        string description
        boolean is_available
        vector embedding
    }

    AI_SESSION ||--o{ AI_LOG : generates
    AI_SESSION {
        string id PK
        jsonb context
        datetime expires_at
    }
```

### 向量儲存（AI 搜尋）

```mermaid
flowchart LR
    A[用戶輸入] --> B[生成向量]
    B --> C[pgvector 相似度搜索]
    C --> D[Top-K 匹配結果]

    subgraph PostgreSQL
        E[(menu_items)]
        F[embedding 欄位]
    end

    C --> E
    E --> F
```

---

## API 架構

### RESTful 設計

```
/api
├── /menu
│   ├── GET /           # 取得菜單
│   └── GET /:id        # 取得單一項目
├── /orders
│   ├── GET /           # 取得訂單列表
│   ├── POST /          # 建立訂單
│   ├── GET /:id        # 取得單一訂單
│   ├── PATCH /:id      # 更新訂單狀態
│   └── DELETE /:id     # 取消訂單
├── /ai-order
│   └── POST /parse     # AI 解析自然語言
└── /auth
    ├── POST /google    # Google OAuth
    └── POST /logout    # 登出
```

### WebSocket 事件

```
ws://api/orders/:id/stream

Events:
- order:confirmed    # 店家確認
- order:preparing    # 開始製作
- order:ready        # 即將完成
- order:completed    # 可取餐
```

---

## 前端架構

### 元件層次

```mermaid
flowchart TD
    subgraph 頁面層
        P1[首頁]
        P2[菜單頁]
        P3[訂單頁]
        P4[AI 點餐頁]
    end

    subgraph 元件層
        C1[MenuList]
        C2[OrderTable]
        C3[AiOrderChat]
        C4[CreateOrderForm]
    end

    subgraph Hooks 層
        H1[useMenu]
        H2[useOrders]
        H3[useAiOrder]
    end

    subgraph API 層
        A1[Eden Treaty]
    end

    P1 --> C1
    P3 --> C2
    P4 --> C3
    P2 --> C4

    C1 --> H1
    C2 --> H2
    C3 --> H3
    C4 --> H2

    H1 --> A1
    H2 --> A1
    H3 --> A1
```

### 狀態管理

```typescript
// 全域狀態（TanStack Query）
- menu: MenuItem[]          // 菜單快取
- orders: Order[]           // 訂單列表
- currentOrder: Order       // 當前訂單詳情

// 本地狀態（React State）
- cart: CartItem[]          // 購物車
- aiSession: Session        // AI 對話上下文
```

---

## AI 服務架構

### 語意搜尋流程

```mermaid
sequenceDiagram
    participant 用戶
    participant API
    participant Embedding
    participant VectorDB
    participant Kimi

    用戶->>API: 「脆脆的有蛋的」
    API->>Embedding: 生成查詢向量
    Embedding->>VectorDB: 相似度搜索
    VectorDB->>API: Top-5 候選
    API->>Kimi: 候選 + 原始輸入
    Kimi->>API: 最佳匹配 + 信心度
    API->>用戶: 解析結果
```

### Prompt 設計

```typescript
const SYSTEM_PROMPT = `
你是早餐店點餐助手，專精於理解台灣人的口語描述。

任務：
1. 分析用戶輸入，匹配到最可能的菜單項目
2. 識別數量（預設 1）
3. 識別客製化（不要蔥、加辣等）
4. 回傳 JSON 格式

台灣口語對應：
- "脆脆的" → 蔥油餅
- "軟軟有蛋的" → 蛋餅
- "那個餅" → 需確認是蛋餅還是蔥油餅
- "老樣子" → 上次訂單

回傳格式：
{
  "items": [...],
  "confidence": 0-1,
  "needsConfirmation": boolean
}
`;
```

---

## 部署架構

### 生產環境

```mermaid
flowchart TB
    subgraph CDN
        CF[Cloudflare]
    end

    subgraph 運算層
        FLY["Fly.io
        Elysia + Bun"]
    end

    subgraph 資料層
        NEON[(Neon
        PostgreSQL)]
        UPSTASH[(Upstash
        Redis)]
    end

    subgraph 外部
        K[Kimi API]
        FB[Firebase]
    end

    CF --> FLY
    FLY --> NEON
    FLY --> UPSTASH
    FLY --> K
    FLY --> FB
```

### 監控

| 層級 | 工具           | 指標             |
| ---- | -------------- | ---------------- |
| 應用 | Sentry         | 錯誤追蹤         |
| 效能 | Fly Metrics    | 延遲、吞吐量     |
| 業務 | 自建 Dashboard | 訂單量、轉換率   |
| AI   | 自建 Log       | 解析準確率、成本 |

---

## 安全設計

### 認證流程

```mermaid
sequenceDiagram
    participant 用戶
    participant 前端
    participant 後端
    participant Google

    用戶->>前端: 點擊 Google 登入
    前端->>Google: OAuth 授權
    Google->>前端: ID Token
    前端->>後端: POST /auth/google
    後端->>後端: 驗證 Token
    後端->>後端: 建立 Session
    後端->>前端: Set-Cookie: session
```

### 防護措施

- Rate Limiting：每 IP 每分鐘 100 請求
- CORS：僅允許特定域名
- Input Validation：TypeBox Schema 嚴格驗證
- SQL Injection：Drizzle ORM 參數化查詢
- XSS：React 自動跳脫

---

## 擴展規劃

### Phase 1: MVP（v1.0.0）

- 基礎訂餐流程
- 簡易管理後台

### Phase 2: 智慧化（v1.1.0）

- AI 語音點餐
- 會員點數系統
- 推播通知

### Phase 3: 平台化（v2.0.0）

- 多店管理
- 外送整合
- 數據分析儀表板

---

## 技術債管理

| 類型 | 項目           | 嚴重度 | 計劃處理時間 |
| ---- | -------------- | ------ | ------------ |
| 測試 | 缺乏 E2E 測試  | 中     | v1.1.0       |
| 監控 | 基礎日誌 only  | 中     | v1.1.0       |
| 文件 | API 文件自動化 | 低     | v1.2.0       |

---

## 參考文件

- [Constitution](../.specify/memory/constitution.md) - 技術約束
- [packages/api](../../../packages/api/src/schemas.ts) - Schema 定義
- [Backend README](../../../apps/backend/README.md) - 後端詳細文件
