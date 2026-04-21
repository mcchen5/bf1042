# 任務列表：AI 自然語言訂餐

> Spec ID：001-ai-order  
> 對應 Spec：[spec.md](./spec.md)  
> 對應 Plan：[plan.md](./plan.md)  

---

## Phase 1：基礎建設

### 1.1 packages/api - Schema 定義
- [ ] 在 `packages/api/src/schemas.ts` 新增：
  - `ParsedOrderItemSchema`
  - `AiOrderParseResponseSchema`
  - `AiOrderParseRequestSchema`
- [ ] 執行 `bun install` 更新 workspace
- [ ] 驗證前端能正確導入新類型

**驗收標準**：
```typescript
import type { AiOrderParseResponse } from '@breakfast/api'
// 無編譯錯誤，類型自動推導正確
```

### 1.2 資料庫遷移
- [ ] 新增 `ai_sessions` 表格
- [ ] 新增 `ai_logs` 表格
- [ ] 執行 `bun run db:generate`
- [ ] 執行 `bun run db:migrate`

**驗收標準**：
```bash
$ psql -d breakfast -c "\dt"
# 顯示 ai_sessions 和 ai_logs
```

---

## Phase 2：後端實作

### 2.1 向量搜索服務
- [ ] 建立 `apps/backend/src/services/menu-embedding.ts`
- [ ] 實作 `generateEmbeddings()` - 為菜單項目生成向量
- [ ] 實作 `search()` - 語意搜索 Top-K

**驗收標準**：
```typescript
const results = await MenuEmbeddingService.search("脆脆的有蛋的", 3)
// results[0].name === '蛋餅'
```

### 2.2 Kimi 整合
- [ ] 建立 `apps/backend/src/services/kimi.ts`
- [ ] 實作 `chat()` 方法
- [ ] 設定環境變數 `KIMI_API_KEY`

**驗收標準**：
```typescript
const response = await KimiService.chat({
  messages: [{ role: 'user', content: '你好' }]
})
// 成功取得回應
```

### 2.3 Session 儲存
- [ ] 建立 `apps/backend/src/repositories/session.ts`
- [ ] 實作 `create()`, `get()`, `update()`
- [ ] 設定 Redis 連線

### 2.4 AI Order 服務
- [ ] 建立 `apps/backend/src/services/ai-order.ts`
- [ ] 實作 `parse()` 主流程
- [ ] 實作 `calculateTotal()`
- [ ] 實作 `generateReply()`

### 2.5 API 路由
- [ ] 建立 `apps/backend/src/routes/ai-order.ts`
- [ ] 使用 `AiOrderParseRequestSchema` 驗證請求
- [ ] 使用 `AiOrderParseResponseSchema` 驗證回應
- [ ] 整合到主應用 `index.ts`

**驗收標準**：
```bash
$ curl -X POST http://localhost:3001/api/ai-order/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "蛋餅加豆漿"}'
# 回傳正確的 JSON 格式
```

---

## Phase 3：前端實作

### 3.1 API Hook
- [ ] 建立 `apps/frontend/src/hooks/useAiOrder.ts`
- [ ] 實作 `useAiOrderParse()`
- [ ] 類型正確推導

**驗收標準**：
```typescript
const mutation = useAiOrderParse()
// mutation.data 自動推導為 AiOrderParseResponse | undefined
```

### 3.2 聊天組件
- [ ] 建立 `apps/frontend/src/components/AiOrderChat.tsx`
- [ ] 實作輸入框與送出按鈕
- [ ] 顯示解析結果
- [ ] 確認/澄清流程

### 3.3 整合頁面
- [ ] 建立 `apps/frontend/src/routes/ai-order.tsx`
- [ ] 整合 `AiOrderChat` 組件
- [ ] 加入導航連結

---

## Phase 4：測試與優化

### 4.1 單元測試
- [ ] 測試 `MenuEmbeddingService.search()`
- [ ] 測試 `AiOrderService.parse()`
- [ ] 測試 `calculateTotal()`

### 4.2 整合測試
- [ ] 測試完整 API 流程
- [ ] 測試多輪對話
- [ ] 測試錯誤處理

### 4.3 使用者測試
- [ ] 收集 10 個常用口語描述
- [ ] 驗證解析準確率 > 85%
- [ ] 根據反饋優化提示詞

---

## 任務依賴圖

```
Phase 1: 基礎建設
├── 1.1 Schema 定義
│   └── 1.2 資料庫遷移
│       └── Phase 2
│
Phase 2: 後端實作
├── 2.1 向量搜索
├── 2.2 Kimi 整合
├── 2.3 Session 儲存
│   └── 2.4 AI Order 服務
│       └── 2.5 API 路由
│           └── Phase 3
│
Phase 3: 前端實作
├── 3.1 API Hook
│   └── 3.2 聊天組件
│       └── 3.3 整合頁面
│           └── Phase 4
│
Phase 4: 測試與優化
├── 4.1 單元測試
├── 4.2 整合測試
└── 4.3 使用者測試
```

---

## 估計工時

| Phase | 任務數 | 估計工時 |
|-------|--------|---------|
| Phase 1 | 2 | 2 小時 |
| Phase 2 | 5 | 6 小時 |
| Phase 3 | 3 | 4 小時 |
| Phase 4 | 3 | 4 小時 |
| **總計** | **13** | **16 小時** |

---

## 執行記錄

| 日期 | 任務 | 執行人 | 狀態 |
|------|------|--------|------|
| | | | |

---

**注意**：每個任務完成後，執行 `bun run build` 確保無編譯錯誤。
