# 技術方案：AI 自然語言訂餐

> Spec ID：001-ai-order  
> 對應 Spec：[spec.md](./spec.md)  
> 狀態：Plan（方案規劃階段）  

---

## 1. 技術架構

### 1.1 資料流

```
使用者輸入
    ↓
┌─────────────────────────────────────────────────────────────┐
│  前端 (React)                                                │
│  ├── UI：AIOrderChat.tsx                                    │
│  └── Hook：useAiOrderParse()                                │
│       ↓ Eden Treaty                                          │
└─────────────────────────────────────────────────────────────┘
    ↓ POST /api/ai-order/parse
┌─────────────────────────────────────────────────────────────┐
│  後端 (Elysia)                                               │
│  ├── Route：/api/ai-order/parse                             │
│  ├── Service：AiOrderService                                │
│  │   ├── 語意搜索（向量匹配）                               │
│  │   └── Kimi API 呼叫                                      │
│  └── Repository：SessionRepository                          │
│       ↓                                                      │
│  資料儲存（Redis）                                           │
└─────────────────────────────────────────────────────────────┘
    ↓
Kimi API (Moonshot)
```

---

## 2. 資料庫設計

### 2.1 新增表格

```typescript
// apps/backend/src/db/schema.ts

export const aiSessions = pgTable('ai_sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),  // UUID
  context: jsonb('context').$type<{
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    lastOrderIntent?: ParsedOrderItem[]
  }>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull()  // 30 分鐘後過期
})

export const aiLogs = pgTable('ai_logs', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 36 }),
  input: text('input').notNull(),
  output: jsonb('output').notNull(),
  latency: integer('latency'),  // 毫秒
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
```

---

## 3. API 實作

### 3.1 路由層

```typescript
// apps/backend/src/routes/ai-order.ts
import { Elysia } from 'elysia'
import { AiOrderService } from '../services/ai-order'
import { 
  AiOrderParseRequestSchema, 
  AiOrderParseResponseSchema 
} from '@breakfast/api'

export const aiOrderRoutes = new Elysia({ prefix: '/api/ai-order' })
  .post('/parse', 
    async ({ body, request }) => {
      const startTime = Date.now()
      
      try {
        const result = await AiOrderService.parse({
          text: body.text,
          sessionId: body.sessionId,
          userAgent: request.headers.get('user-agent')
        })
        
        // 記錄日誌（非同步，不阻塞回應）
        AiOrderService.log({
          sessionId: body.sessionId,
          input: body.text,
          output: result,
          latency: Date.now() - startTime
        })
        
        return {
          success: true,
          data: result
        }
      } catch (error) {
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : '解析失敗',
            code: 'AI_PARSE_ERROR'
          }
        }
      }
    },
    {
      body: AiOrderParseRequestSchema,
      response: {
        200: t.Object({
          success: t.Literal(true),
          data: AiOrderParseResponseSchema
        }),
        400: t.Object({
          success: t.Literal(false),
          error: t.Object({
            message: t.String(),
            code: t.String()
          })
        })
      }
    }
  )
```

### 3.2 服務層

```typescript
// apps/backend/src/services/ai-order.ts
import { MenuEmbeddingService } from './menu-embedding'
import { KimiService } from './kimi'
import { SessionRepository } from '../repositories/session'

export class AiOrderService {
  static async parse(params: {
    text: string
    sessionId?: string
    userAgent?: string | null
  }): Promise<AiOrderParseResponse> {
    const { text, sessionId } = params
    
    // 1. 取得或建立 session
    const session = sessionId 
      ? await SessionRepository.get(sessionId)
      : await SessionRepository.create()
    
    // 2. 語意搜索：找出可能的菜單項目
    const candidates = await MenuEmbeddingService.search(text, 5)
    
    // 3. 準備 Kimi 提示詞
    const menuContext = candidates.map(c => 
      `- ${c.name}: ${c.description} (${c.category})`
    ).join('\n')
    
    const prompt = `
使用者輸入：「${text}」

可能的菜單項目：
${menuContext}

請解析使用者的訂餐意圖，回傳 JSON 格式：
{
  "items": [
    {
      "name": "使用者描述的名稱",
      "matchedMenuItemId": 匹配到的ID或null,
      "quantity": 數量,
      "modifiers": ["客製化選項"],
      "confidence": 0-1
    }
  ],
  "needsConfirmation": 是否需要確認,
  "clarificationQuestion": "需要澄清時的問題或null"
}

規則：
- 台灣口語中，"脆脆的"通常指蔥油餅，"軟軟有蛋的"是蛋餅
- "加料"可能是加蛋、加起司、加培根
- 數量預設為 1
`

    // 4. 呼叫 Kimi API
    const aiResult = await KimiService.chat({
      messages: [
        ...session.context.messages,
        { role: 'user', content: prompt }
      ],
      responseFormat: 'json'
    })
    
    // 5. 計算總價
    const totalEstimate = await this.calculateTotal(aiResult.items)
    
    // 6. 更新 session
    await SessionRepository.update(session.id, {
      messages: [
        ...session.context.messages,
        { role: 'user', content: text },
        { role: 'assistant', content: JSON.stringify(aiResult) }
      ]
    })
    
    return {
      originalText: text,
      understood: aiResult.items.length > 0,
      items: aiResult.items,
      totalEstimate,
      needsConfirmation: aiResult.needsConfirmation || 
        aiResult.items.some(i => (i.confidence || 0) < 0.85),
      clarificationQuestion: aiResult.clarificationQuestion,
      suggestedReply: this.generateReply(aiResult.items),
      sessionId: session.id  // 回傳給前端用於多輪對話
    }
  }
  
  private static async calculateTotal(
    items: ParsedOrderItem[]
  ): Promise<number> {
    let total = 0
    for (const item of items) {
      if (item.matchedMenuItemId) {
        const menuItem = await db.query.menuItems.findFirst({
          where: eq(menuItems.id, item.matchedMenuItemId)
        })
        if (menuItem) {
          total += menuItem.price * item.quantity
        }
      }
    }
    return total
  }
  
  private static generateReply(items: ParsedOrderItem[]): string {
    if (items.length === 0) return '不好意思，我不太理解，能再描述一下嗎？'
    
    const names = items.map(i => i.matchedName || i.name).join('、')
    return `好的，您要的是 ${names}，對嗎？`
  }
}
```

---

## 4. 前端實作

### 4.1 API Hook

```typescript
// apps/frontend/src/hooks/useAiOrder.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '../api/client'
import type { AiOrderParseRequest, AiOrderParseResponse } from '@breakfast/api'

export function useAiOrderParse() {
  return useMutation({
    mutationFn: async (params: AiOrderParseRequest) => {
      const res = await api.api['ai-order'].parse.post(params)
      if (res.error) throw new Error(res.error.value.error?.message)
      return res.data.data  // 自動推導為 AiOrderParseResponse
    }
  })
}
```

### 4.2 組件

```typescript
// apps/frontend/src/components/AiOrderChat.tsx
import { useState } from 'react'
import { useAiOrderParse } from '../hooks/useAiOrder'
import { useCreateOrder } from '../hooks/useOrders'

export function AiOrderChat() {
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string>()
  const [parsedResult, setParsedResult] = useState<AiOrderParseResponse>()
  
  const parseMutation = useAiOrderParse()
  const createOrder = useCreateOrder()
  
  const handleSubmit = async () => {
    const result = await parseMutation.mutateAsync({
      text: input,
      sessionId
    })
    
    setParsedResult(result)
    setSessionId(result.sessionId)
    setInput('')
  }
  
  const handleConfirm = async () => {
    if (!parsedResult) return
    
    await createOrder.mutateAsync({
      items: parsedResult.items
        .filter(i => i.matchedMenuItemId)
        .map(i => ({
          menuItemId: i.matchedMenuItemId!,
          quantity: i.quantity,
          modifiers: i.modifiers
        }))
    })
    
    // 重置狀態
    setParsedResult(undefined)
    setSessionId(undefined)
  }
  
  return (
    <div className="space-y-4">
      {/* 輸入區 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="例如：我要蛋餅加豆漿"
          className="form-input flex-1"
          onKeyPress={e => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          onClick={handleSubmit}
          disabled={parseMutation.isPending}
          className="btn btn-primary"
        >
          {parseMutation.isPending ? '解析中...' : '送出'}
        </button>
      </div>
      
      {/* 解析結果 */}
      {parsedResult && (
        <div className="card bg-blue-50">
          <p className="text-lg mb-4">{parsedResult.suggestedReply}</p>
          
          <div className="space-y-2 mb-4">
            {parsedResult.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.matchedName || item.name} 
                  {item.modifiers.length > 0 && 
                    ` (${item.modifiers.join(', ')})`
                  }
                  x{item.quantity}
                </span>
                <span className="text-sm text-gray-500">
                  信心度: {Math.round(item.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="text-xl font-bold mb-4">
            預估總額: NT$ {parsedResult.totalEstimate}
          </div>
          
          {parsedResult.needsConfirmation ? (
            <div className="space-y-2">
              <p className="text-amber-600">
                {parsedResult.clarificationQuestion}
              </p>
              <input
                type="text"
                placeholder="請補充說明..."
                className="form-input"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    setInput(e.currentTarget.value)
                    handleSubmit()
                  }
                }}
              />
            </div>
          ) : (
            <button 
              onClick={handleConfirm}
              disabled={createOrder.isPending}
              className="btn btn-success w-full"
            >
              {createOrder.isPending ? '建立中...' : '確認訂單'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 5. 類型同步檢查清單

- [ ] `packages/api` 已新增 `AiOrderParseRequestSchema`
- [ ] `packages/api` 已新增 `AiOrderParseResponseSchema`
- [ ] 後端 `ai-order.ts` 路由使用 Schema 驗證
- [ ] 前端 `useAiOrderParse` hook 類型正確
- [ ] 前端 `AiOrderChat` 組件無 TypeScript 錯誤
- [ ] 執行 `bun install` 後 workspace 連結更新

---

## 6. 部署考量

### 6.1 環境變數
```bash
# Kimi API
KIMI_API_KEY=sk-xxx
KIMI_MODEL=moonshot-v1-8k

# Redis（Session 儲存）
REDIS_URL=redis://localhost:6379
```

### 6.2 監控
- AI 解析延遲 P95 < 2s
- 錯誤率 < 5%
- Kimi API 費用監控

---

## 7. 風險與因應

| 風險 | 因應措施 |
|------|---------|
| Kimi API 延遲高 | 實作 loading 狀態，考慮降級到 Gemini |
| 向量搜索不準確 | 持續優化菜單描述，收集錯誤案例 |
| Session 儲存失敗 | 降級到無狀態模式（單輪對話） |

---

## 8. 下一步任務

見 [tasks.md](./tasks.md)
