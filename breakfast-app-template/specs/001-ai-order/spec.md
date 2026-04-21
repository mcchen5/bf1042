# 功能規範：AI 自然語言訂餐

> Spec ID：001-ai-order  
> 狀態：Specify（規格定義階段）  
> 負責人：待分配  
> 建立日期：2026-03-18  

---

## 1. 背景與目標

### 1.1 問題陳述
目前的訂餐流程需要使用者瀏覽菜單、點選項目，步驟較多。許多顧客習慣用口語描述訂餐，例如：
- 「我要那個脆脆的、有蛋的、早餐店都有的」
- 「一份總匯，飲料換大杯」
- 「跟昨天一樣，但這次不要蔥」

### 1.2 目標
讓使用者透過自然語言描述即可訂餐，降低操作門檻，提升使用者體驗。

### 1.3 成功指標
- 使用者能用口語成功完成 80% 的訂單
- AI 理解準確率 > 85%
- 平均訂餐時間從 2 分鐘縮短至 30 秒

---

## 2. 使用者故事

### 2.1 主要場景

```gherkin
情境 1：模糊描述
身為：早餐店顧客
我想要：說「那個脆脆的有蛋的」就能點到蛋餅
如此：我不需要記住確切名稱

情境 2：組合訂餐
身為：常客
我想要：說「一份總匯加豆漿」就自動配對對應品項
如此：我可以快速點常用組合

情境 3：多輪對話
身為：猶豫的顧客
我想要：說「有推薦的嗎？」然後根據建議繼續對話
如此：我能獲得個人化建議
```

---

## 3. 功能範圍

### 3.1 In Scope（範圍內）
- ✅ 自然語言輸入解析
- ✅ 模糊描述匹配到菜單項目
- ✅ 確認對話（信心度低時）
- ✅ 客製化選項識別（不要蔥、加辣等）
- ✅ 基礎多輪對話（3 輪內）

### 3.2 Out of Scope（範圍外）
- ❌ 語音輸入（未來版本）
- ❌ 個人化推薦演算法（需歷史資料）
- ❌ 圖片識別點餐

---

## 4. API 介面

### 4.1 引用現有 API

根據 [Constitution](../../.specify/memory/constitution.md) 定義，本功能使用以下既有 API：

| 端點 | Schema | 用途 |
|------|--------|------|
| `GET /api/menu` | `MenuItemSchema` | 取得菜單用於語意匹配 |
| `POST /api/orders` | `CreateOrderSchema` | 確認後建立訂單 |

### 4.2 新增 API

#### POST /api/ai-order/parse
解析自然語言輸入為結構化訂單。

**Request Schema**：`AiOrderParseRequestSchema`（已定義於 packages/api）
```typescript
{
  text: string,           // 使用者輸入，1-500 字
  sessionId?: string      // 多輪對話 session（選填）
}
```

**Response Schema**：`AiOrderParseResponseSchema`（已定義於 packages/api）
```typescript
{
  originalText: string,
  understood: boolean,
  items: ParsedOrderItem[],
  totalEstimate: number,
  needsConfirmation: boolean,
  clarificationQuestion?: string,
  suggestedReply: string
}
```

**錯誤處理**：遵循 Constitution 第 2.5 節統一錯誤格式

---

## 5. 業務規則

### 5.1 匹配規則
- 信心度 >= 0.85：直接匹配，無需確認
- 信心度 0.6-0.85：顯示建議，請使用者確認
- 信心度 < 0.6：詢問澄清問題

### 5.2 客製化選項識別
```
「蛋餅不要蔥」 → { item: '蛋餅', modifiers: ['不要蔥'] }
「大杯豆漿」 → { item: '豆漿', modifiers: ['大杯'] }
```

### 5.3 價格計算
- 總價 = 所有匹配項目單價 × 數量總和
- 若有多個可能匹配，顯示價格區間

---

## 6. 驗收標準

### 6.1 功能驗收
- [ ] 輸入「蛋餅加豆漿」正確解析為兩個項目
- [ ] 輸入「那個脆脆的有蛋的」正確匹配到「蛋餅」
- [ ] 輸入「不要蔥」正確識別為客製化選項
- [ ] 模糊輸入顯示確認對話
- [ ] 確認後正確建立訂單

### 6.2 技術驗收
- [ ] API 回應符合 `AiOrderParseResponseSchema`
- [ ] 前端使用 Eden Treaty 無編譯錯誤
- [ ] 單元測試覆蓋率 > 80%
- [ ] AI 平均回應時間 < 2 秒

### 6.3 使用者體驗驗收
- [ ] 首次使用者無需教學即可使用
- [ ] 錯誤提示清楚易懂
- [ ] 手機端操作流暢

---

## 7. 非功能需求

### 7.1 效能
- AI 解析 API 回應時間 P95 < 2 秒
- 支援同時 100 個並發請求

### 7.2 安全
- 輸入內容過濾（XSS 防護）
- 速率限制：每用戶每分鐘 10 次請求

### 7.3 監控
- 記錄解析準確率
- 記錄常見失敗案例

---

## 8. 相依性

### 8.1 前端相依
- 需要 `packages/api` 的 `AiOrderParseResponseSchema`
- 需要 TanStack Query hook：`useAiOrderParse()`

### 8.2 後端相依
- 需要 `packages/api` 的 `AiOrderParseRequestSchema`
- 需要整合 Kimi API
- 需要建立 `session` 儲存多輪對話上下文

### 8.3 外部相依
- Kimi API 金鑰與額度

---

## 9. 風險與假設

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| Kimi API 不穩定 | 功能無法使用 | 實作 fallback 到 Gemini |
| 解析準確率低 | 使用者體驗差 | 持續優化提示詞，收集反饋 |
| 成本過高 | 預算超支 | 監控用量，設定上限 |

---

## 10. 待決定事項

- [ ] AI 模型選擇：Kimi vs Gemini vs GPT-4o-mini
- [ ] 多輪對話儲存：Redis vs PostgreSQL
- [ ] 是否需要離線模式（預設常用組合）

---

## 11. 附錄

### 11.1 相關文件
- [Constitution](../../.specify/memory/constitution.md) - API 契約規範
- [packages/api/src/schemas.ts](../../packages/api/src/schemas.ts) - Schema 定義
- plan.md（下一步生成）- 技術實作方案

### 11.2 參考範例
```
輸入：「我要那個脆脆的，有蛋在裡面，好像還有菜的」
輸出：{
  understood: true,
  items: [
    { matchedName: '蛋餅', confidence: 0.92, quantity: 1 }
  ],
  needsConfirmation: false,
  suggestedReply: '好的，蛋餅一份'
}

輸入：「那個餅，有蔥的」
輸出：{
  understood: true,
  items: [
    { matchedName: '蛋餅', confidence: 0.75 },
    { matchedName: '蔥油餅', confidence: 0.70 }
  ],
  needsConfirmation: true,
  clarificationQuestion: '您是指蛋餅還是蔥油餅呢？'
}
```
