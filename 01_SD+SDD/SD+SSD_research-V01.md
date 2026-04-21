# 服務設計 + 規範驅動開發 研究對話記錄

> Session ID: breakfast-app-architecture-2024  
> 日期：2024-03-18  
> 參與者：使用者 + Kimi Code (AI Assistant)  

---

## 目錄

1. [專案背景與初期需求](#專案背景與初期需求)
2. [技術架構探索](#技術架構探索)
3. [前端框架選型](#前端框架選型)
4. [服務設計方法論](#服務設計方法論)
5. [規範驅動開發 (SDD)](#規範驅動開發-sdd)
6. [自動化工具開發](#自動化工具開發)
7. [結論與產出](#結論與產出)

---

## 專案背景與初期需求

### 初始請求

**使用者**：
> 請將index.ts中，Bun.serve的寫法改成bun的router寫法

**AI**：提供原生 Bun.serve routes 物件寫法的轉換範例

**使用者**：Bun.Router物件不存在，我說的應該是Bun.serve中的routes物件的寫法

**AI**：立即修正為正確的 `Bun.serve({ routes: {...} })` 寫法

### 框架選型討論

**使用者**：你知道elysia框架嗎？

**AI**：詳細介紹 Elysia 框架的特點：
- 為 Bun 打造的現代 TypeScript Web 框架
- 端對端類型安全
- 類似 Express 的語法
- 內建驗證、WebSocket、自動文件

**關鍵提問**：Bun.serve 原生支援 WebSocket，為何需要 Elysia？

**AI 分析**：
| 特性 | Bun 原生 | Elysia |
|------|---------|--------|
| 類型安全 | ❌ 手動 | ✅ 自動推導 |
| Schema 驗證 | ❌ 手動 | ✅ Zod/TypeBox |
| 文件生成 | ❌ 無 | ✅ Swagger |
| 生態整合 | ❌ 自寫 | ✅ JWT、CORS 等 |

**結論**：Elysia 是技術債最低的選擇

---

## 技術架構探索

### 資料庫與 ORM

**AI 推薦**：Drizzle ORM + PostgreSQL
- SQL-like 語法
- 零運行時開銷
- 完美 TypeScript 支援
- drizzle-typebox 自動生成驗證 Schema

### 認證機制

**使用者**：打算使用 better auth + Google OAuth

**AI 分析**：Better Auth 適合 Next.js，對於純 API 架構建議使用 **Lucia + Arctic**

**理由**：
- Better Auth 基於 Cookie，與 Elysia 純 API 架構有阻抗不匹配
- Lucia 輕量、與 Drizzle 深度整合、完全可控

### OCR 服務

**需求**：發票辨識
**推薦**：Google Cloud Vision API
- 繁體中文準確率高
- 免費 1000 次/月
- 文件模式更準確

### PDF 處理

**需求**：上傳 PDF、檢測簽名/印章
**儲存方案**：Dropbox（利用既有 1TB）
**技術流程**：
```
PDF → pdf-parse（文字提取）→ Google Vision（手寫識別）→ 驗證結果
```

### AI 自然語言訂餐

**需求**：口語轉換為菜色
**推薦**：Kimi (Moonshot)
- 中文理解最佳
- 200K 上下文
- 與 Elysia 整合順暢

**技術架構**：
```
口語輸入 → 向量搜索（pgvector）→ Kimi 解析 → 確認 → 建立訂單
```

### 雲服務選型

| 服務 | 選擇 | 理由 |
|------|------|------|
| 資料庫 | Neon | Serverless、Bun 兼容、免費額度足 |
| 部署 | Fly.io | Bun 原生支援、新加坡節點、Auto-suspend |
| AI | Kimi | 中文最佳、成本低 |
| 儲存 | Dropbox | 既有訂閱、零額外成本 |

**預估月費**：$5-10

---

## 前端框架選型

### 關鍵討論：Next.js vs Vite

**使用者**：前端使用 Next.js 開發是否適切？

**AI 分析**：
- ❌ Next.js 與 Bun 兼容性有問題
- ❌ 架構重疊（已有 Elysia 後端）
- ❌ 部署複雜度增加

**推薦**：Vite + React + TanStack
- ✅ Bun 原生支援
- ✅ 與 Elysia + Eden 完美整合
- ✅ 輕量、快速

### TanStack 生態系

**完整介紹**：
| 工具 | 用途 |
|------|------|
| TanStack Query | 服務端狀態管理 |
| TanStack Router | 類型安全路由 |
| TanStack Table | 複雜表格（訂單管理） |
| TanStack Form | 表單驗證 |

---

## 服務設計方法論

### GitHub Spec-Kit 介紹

**使用者**：你知道 github spec-kit 嗎？

**AI 詳細介紹**：
- GitHub 官方的規範驅動開發（SDD）工具包
- 解決 "Vibe Coding" 的不可控問題
- 流程：Constitution → Specify → Plan → Tasks → Implement

### 核心問題：Eden Treaty 在 Spec-Kit 中的定位

**使用者提問**：API 規格要放在哪個 md 檔案？

**AI 回答**：
```
constitution.md  → 定義「類型即規格」原則
     ↓
packages/api/src/schemas.ts  → 實際 Schema（唯一事實來源）
     ↓
spec.md  → 引用 Constitution，說明使用哪些 Schema
```

### 文件化決策

**使用者**：希望只要口說大致描述，跟 AI 互動就能產生高品質文件

**AI 設計完整方法論**：

#### 文件結構
```
docs/design/v1.0.0/
├── 00-brief.md          # 需求摘要
├── 01-personas.md       # 人物誌（Mermaid）
├── 02-cjm.md           # 客戶旅程地圖（Mermaid）
├── 03-blueprint.md     # 服務藍圖（Mermaid）
├── 04-user-stories.md  # 使用者故事
└── 05-architecture.md  # 系統架構（Mermaid）
```

#### AI 協作流程
```
口語描述 → Kimi 服務設計專家 → 提問澄清 → 產出設計文件
```

#### 工具鏈
- **AI 對話**：Kimi（中文最佳）
- **視覺化**：Mermaid + VitePress（靜態網頁）
- **版本控制**：Git
- **部署**：GitHub Pages

---

## 規範驅動開發 (SDD)

### 完整工作流程

```
服務設計階段              SDD 階段                開發階段
─────────────────────────────────────────────────────────────
Persona → CJM →      →  /specify  → spec.md  →  Schema
User Stories          →  /plan     → plan.md  →  API
Architecture          →  /tasks    → tasks.md →  UI
                      →  /implement→ code     →  Deploy
```

### Spec-Kit 指令操作詳解

**核心原則**：上下文感知而非參數驅動

#### /specify 正確用法
```bash
# 1. 先載入設計文件到上下文
@docs/design/v1.0.0/04-user-stories.md

# 2. 執行指令
/specify "根據上述 User Stories 產生規格"
```

**常見錯誤**：
- ❌ `specify --input user-stories.md`（不支援 CLI 參數）
- ✅ 在 AI 對話中提供上下文

### 多平台支援

| 平台 | 啟動 | 檔案引用 | 特點 |
|------|------|---------|------|
| Claude Code | `claude` | `@file` | 原生支援 `/specify` |
| Gemini CLI | `gemini code` | `@file` | Google 官方 |
| Kimi 網頁 | 瀏覽器 | 手動貼上 | 中文理解最佳 |
| Kimi API | Python | 讀取檔案 | 可自動化 |

---

## 自動化工具開發

### 終極問題

**使用者**：只要透過服務設計產生了 user-stories.md 及 architecture.md，後續幾乎都可以自動化進行

**AI**：完全可行！這是 "AI-Native Software Development" 的終極形態

### AutoDev 架構設計

```
┌─────────────────────────────────────────────────────────────┐
│                    AutoDev Agent                           │
├─────────────────────────────────────────────────────────────┤
│  Input: 設計文件 (Markdown)                                  │
│      ↓                                                      │
│  Document Parser → Context Builder → Planning Agent         │
│      ↓                                                      │
│  檢查點？ → 是 → 詢問使用者                                  │
│      ↓ 否                                                   │
│  Code Generation Agent (Schema → API → UI)                  │
│      ↓                                                      │
│  Validation Agent (類型檢查 → 建置 → 測試)                   │
│      ↓                                                      │
│  Deployment Agent (遷移 → 建置 → 部署)                       │
└─────────────────────────────────────────────────────────────┘
```

### 實現細節

#### 核心類別
- `AutoDevAgent`: 主控制器
- `PlanGenerator`: AI 規劃代理
- `SchemaAgent`: TypeBox Schema 生成
- `BackendAgent`: Elysia API 生成
- `FrontendAgent`: React 組件生成
- `ValidationAgent`: 自動驗證

#### 人機協作檢查點
```typescript
const checkpoints = [
  { phase: 'schema', condition: 'always' },
  { phase: 'api', condition: 'external-service' },
  { phase: 'deploy', condition: 'production' }
]
```

#### 預估效果
| 指標 | 傳統開發 | AutoDev | 提升 |
|------|---------|---------|------|
| Schema 生成 | 30 min | 2 min | **15x** |
| API 開發 | 2 hrs | 15 min | **8x** |
| 前端組件 | 2 hrs | 20 min | **6x** |
| **總計** | **6 hrs** | **45 min** | **8x** |

### 風險與限制

| 風險 | 緩解策略 |
|------|---------|
| 複雜業務邏輯錯誤 | 強制檢查點 |
| 安全性問題 | 金流/認證必須人工審查 |
| 創新性不足 | 突破性創新仍需人工 |

---

## 結論與產出

### 主要產出文件

| 文件 | 用途 | 位置 |
|------|------|------|
| 技術架構研究-01.md | 完整技術選型記錄 | 專案根目錄 |
| 服務設計＋SDD技術架構.md | 方法論完整指南 | 專案根目錄 |
| SDD對話腳本模板.md | 多平台操作指南 | 專案根目錄 |
| breakfast-app-template/ | 完整專案模板 | 專案根目錄 |
| auto-dev/ | 自動化工具原型 | 獨立目錄 |

### 關鍵決策摘要

1. **後端框架**：Elysia + Bun（端對端類型安全）
2. **前端框架**：Vite + React + TanStack（輕量高效）
3. **資料庫**：PostgreSQL + Drizzle ORM
4. **認證**：Lucia + Arctic（取代 Better Auth）
5. **AI**：Kimi（中文理解最佳）
6. **部署**：Fly.io + Neon
7. **方法論**：服務設計 + SDD + 自動化

### 創新貢獻

1. **純 Markdown 文件流**：Mermaid + VitePress 取代專業設計工具
2. **類型即規格**：packages/api 作為 API 唯一事實來源
3. **AI-Native 開發**：80% 自動化的軟體開發流程
4. **多平台 SDD**：Claude/Gemini/Kimi 統一操作方法

---

## 附錄：完整文件清單

### 技術文件
- 技術架構研究-01.md
- 服務設計＋SDD技術架構.md
- SDD對話腳本模板.md

### 專案模板
```
breakfast-app-template/
├── .specify/memory/constitution.md
├── docs/design/v1.0.0/
│   ├── 00-brief.md
│   ├── 01-personas.md
│   ├── 02-cjm.md
│   ├── 03-blueprint.md
│   ├── 04-user-stories.md
│   └── 05-architecture.md
├── specs/001-ai-order/
├── packages/api/
├── apps/backend/
└── apps/frontend/
```

### 自動化工具
```
auto-dev/
├── src/
│   ├── core/Agent.ts
│   ├── agents/
│   ├── parsers/
│   └── utils/
├── prompts/
└── examples/
```

---

## 未來展望

1. **AutoDev 強化**：實現真正的 80% 自動化
2. **知識累積**：建立可重用的設計模式庫
3. **團隊協作**：多人協同的 AI 輔助開發
4. **持續學習**：從成功/失敗中優化生成品質

---

*本記錄涵蓋從技術選型到方法論建立，再到自動化工具實現的完整探索過程。*
*總對話輪數：約 50+ 輪*  
*總產出文件：10+ 個完整文件*  
*總程式碼行數：約 5000+ 行*
