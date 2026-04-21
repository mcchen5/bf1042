# 早餐店 App 設計文件範例

這是 auto-dev 的輸入範例，展示如何準備設計文件。

## 檔案結構

```
docs/design/v1.0.0/
├── 00-brief.md           # 產品概述
├── 01-personas.md        # 用戶角色
├── 02-cjm.md            # 客戶旅程
├── 03-blueprint.md      # 服務藍圖
├── 04-user-stories.md   # ★ 主要輸入
└── 05-architecture.md   # ★ 主要輸入
```

## 04-user-stories.md 範例

```markdown
# 使用者故事

## Epic 1: 訂餐流程

### US-001: 瀏覽菜單
**身為** 顧客  
**我想要** 瀏覽早餐店的菜單  
**如此** 我可以決定要吃什麼

**驗收標準**:
- [ ] 顯示所有可售品項
- [ ] 顯示品項名稱、價格、描述
- [ ] 依分類分組顯示

---

### US-002: 建立訂單
**身為** 顧客  
**我想要** 選擇品項並建立訂單  
**如此** 我可以預訂早餐

**驗收標準**:
- [ ] 可以選擇品項和數量
- [ ] 可以添加客製化備註
- [ ] 顯示訂單總額
- [ ] 可以提交訂單

**API 需求**:
- GET /api/menu
- POST /api/orders
```

## 05-architecture.md 範例

```markdown
# 系統架構

## 技術棧

### 後端
- **框架**: Elysia + Bun
- **資料庫**: PostgreSQL
- **ORM**: Drizzle
- **驗證**: TypeBox

### 前端
- **框架**: React + Vite
- **狀態管理**: TanStack Query
- **表單**: React Hook Form
- **樣式**: Tailwind CSS

### 部署
- **平台**: Fly.io
- **資料庫**: Neon

## 架構原則

1. 端對端類型安全（Elysia + Eden Treaty）
2. RESTful API 設計
3. 分層架構（Routes → Services → Repositories）
```

## 執行 auto-dev

```bash
cd breakfast-app

# 初始化配置
auto-dev init

# 編輯配置
vim auto-dev.config.ts

# 開始自動開發
auto-dev start
```

## 預期輸出

auto-dev 會根據上述文件生成：

```
packages/api/src/schemas/
├── menu.ts              # 從 US-001 生成
└── order.ts             # 從 US-002 生成

apps/backend/src/routes/
├── menu.ts              # GET /api/menu
└── orders.ts            # POST /api/orders

apps/frontend/src/components/
├── MenuList.tsx         # 對應 US-001
└── OrderForm.tsx        # 對應 US-002
```
