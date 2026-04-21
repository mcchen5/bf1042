// ==========================================
// 早餐店 API - Schema 定義
// 版本：v1.0.0
// 最後更新：2026-03-18
// 
// 本檔案是 API 規格的「唯一事實來源」
// 後端用於執行時驗證，前端用於編譯時類型檢查
// ==========================================

import { t } from 'elysia'

// ==========================================
// 基礎類型
// ==========================================

/** 訂單狀態 */
export const OrderStatusSchema = t.Union([
  t.Literal('pending', { description: '待處理' }),
  t.Literal('preparing', { description: '製作中' }),
  t.Literal('ready', { description: '可取餐' }),
  t.Literal('completed', { description: '已完成' }),
  t.Literal('cancelled', { description: '已取消' })
], { description: '訂單處理狀態' })

export type OrderStatus = typeof OrderStatusSchema.static

/** 菜單分類 */
export const CategorySchema = t.Union([
  t.Literal('主食', { description: '飽足主餐' }),
  t.Literal('飲料', { description: '搭配飲品' }),
  t.Literal('點心', { description: '輕食點心' })
], { description: '菜品分類' })

export type Category = typeof CategorySchema.static

// ==========================================
// 菜單相關 Schema
// ==========================================

/**
 * 菜單項目
 * 
 * 對應資料表：menu_items
 * 用途：顯示菜單、建立訂單時選擇
 */
export const MenuItemSchema = t.Object({
  id: t.Number({ 
    description: '唯一識別碼',
    minimum: 1 
  }),
  name: t.String({ 
    description: '菜品名稱（繁體中文）',
    minLength: 1,
    maxLength: 100
  }),
  price: t.Number({ 
    description: '價格（新台幣）',
    minimum: 0,
    multipleOf: 1  // 整數價格
  }),
  category: CategorySchema,
  description: t.Optional(t.String({ 
    description: '菜品描述（選填）',
    maxLength: 500
  })),
  isAvailable: t.Boolean({ 
    description: '是否供應中，false 時不顯示在菜單',
    default: true 
  }),
  imageUrl: t.Optional(t.String({ 
    description: '圖片 URL（選填）',
    format: 'uri'
  }))
}, { 
  description: '菜單項目',
  additionalProperties: false 
})

export type MenuItem = typeof MenuItemSchema.static

/**
 * 建立菜單項目請求
 */
export const CreateMenuItemSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  price: t.Number({ minimum: 0 }),
  category: CategorySchema,
  description: t.Optional(t.String({ maxLength: 500 })),
  isAvailable: t.Optional(t.Boolean({ default: true })),
  imageUrl: t.Optional(t.String({ format: 'uri' }))
}, { 
  description: '建立菜單項目請求',
  additionalProperties: false 
})

export type CreateMenuItem = typeof CreateMenuItemSchema.static

// ==========================================
// 訂單相關 Schema
// ==========================================

/**
 * 訂單項目
 * 
 * 包含菜品快照（價格、名稱在當下的值）
 */
export const OrderItemSchema = t.Object({
  menuItemId: t.Number({ description: '原始菜品 ID' }),
  name: t.String({ description: '下單時的菜品名稱（快照）' }),
  price: t.Number({ description: '下單時的價格（快照）' }),
  quantity: t.Number({ 
    description: '數量',
    minimum: 1,
    maximum: 100
  }),
  modifiers: t.Array(t.String(), { 
    description: '客製化選項（如：不要蔥、加辣）',
    default: [],
    maxItems: 10
  })
}, { 
  description: '訂單中的單一項目',
  additionalProperties: false 
})

export type OrderItem = typeof OrderItemSchema.static

/**
 * 訂單
 * 
 * 對應資料表：orders
 * 
 * 變更日誌：
 * - v1.0.0: 初始版本
 * - v1.0.1 (計劃): 新增 note 欄位
 */
export const OrderSchema = t.Object({
  id: t.Number({ description: '唯一識別碼' }),
  items: t.Array(OrderItemSchema, { 
    description: '訂單項目列表',
    minItems: 1,
    maxItems: 50
  }),
  total: t.Number({ 
    description: '總金額（自動計算）',
    minimum: 0 
  }),
  status: OrderStatusSchema,
  customerName: t.Optional(t.String({ 
    description: '顧客姓名（選填）',
    maxLength: 100
  })),
  customerPhone: t.Optional(t.String({ 
    description: '顧客電話（選填）',
    pattern: '^09\\d{8}$'  // 台灣手機格式
  })),
  note: t.Optional(t.String({ 
    description: '訂單備註（v1.0.1 新增，選填）',
    maxLength: 500,
    default: ''
  })),
  createdAt: t.String({ 
    description: '建立時間（ISO 8601）',
    format: 'date-time'
  }),
  updatedAt: t.String({ 
    description: '更新時間（ISO 8601）',
    format: 'date-time'
  })
}, { 
  description: '訂單',
  additionalProperties: false 
})

export type Order = typeof OrderSchema.static

/**
 * 建立訂單請求
 */
export const CreateOrderSchema = t.Object({
  items: t.Array(t.Object({
    menuItemId: t.Number(),
    quantity: t.Number({ minimum: 1, maximum: 100 }),
    modifiers: t.Optional(t.Array(t.String(), { maxItems: 10 }))
  }), { minItems: 1, maxItems: 50 }),
  customerName: t.Optional(t.String({ maxLength: 100 })),
  customerPhone: t.Optional(t.String({ pattern: '^09\\d{8}$' })),
  note: t.Optional(t.String({ maxLength: 500 }))
}, { 
  description: '建立訂單請求',
  additionalProperties: false 
})

export type CreateOrder = typeof CreateOrderSchema.static

/**
 * 更新訂單狀態請求
 */
export const UpdateOrderStatusSchema = t.Object({
  status: OrderStatusSchema
}, { 
  description: '更新訂單狀態請求',
  additionalProperties: false 
})

export type UpdateOrderStatus = typeof UpdateOrderStatusSchema.static

// ==========================================
// AI 訂餐相關 Schema
// ==========================================

/**
 * AI 解析結果
 * 
 * 自然語言輸入的結構化結果
 */
export const ParsedOrderItemSchema = t.Object({
  name: t.String({ description: '使用者描述的原始名稱' }),
  matchedMenuItemId: t.Optional(t.Number({ 
    description: '匹配到的菜品 ID（未匹配時為 null）' 
  })),
  matchedName: t.Optional(t.String({ 
    description: '匹配到的菜品正式名稱' 
  })),
  quantity: t.Number({ description: '數量', default: 1 }),
  confidence: t.Number({ 
    description: '匹配信心度（0-1）',
    minimum: 0,
    maximum: 1
  }),
  modifiers: t.Array(t.String(), { description: '客製化選項' })
}, { 
  description: 'AI 解析的單一項目',
  additionalProperties: false 
})

export type ParsedOrderItem = typeof ParsedOrderItemSchema.static

/**
 * AI 訂單解析回應
 */
export const AiOrderParseResponseSchema = t.Object({
  originalText: t.String({ description: '使用者原始輸入' }),
  understood: t.Boolean({ description: '是否成功理解意圖' }),
  items: t.Array(ParsedOrderItemSchema, { description: '解析出的項目' }),
  totalEstimate: t.Number({ description: '預估總金額' }),
  needsConfirmation: t.Boolean({ 
    description: '是否需要使用者確認（信心度低時為 true）' 
  }),
  clarificationQuestion: t.Optional(t.String({ 
    description: '需要澄清時的詢問問題' 
  })),
  suggestedReply: t.String({ description: '給使用者的回覆建議' })
}, { 
  description: 'AI 訂單解析結果',
  additionalProperties: false 
})

export type AiOrderParseResponse = typeof AiOrderParseResponseSchema.static

/**
 * AI 訂單解析請求
 */
export const AiOrderParseRequestSchema = t.Object({
  text: t.String({ 
    description: '使用者自然語言輸入',
    minLength: 1,
    maxLength: 500
  }),
  sessionId: t.Optional(t.String({ 
    description: '對話 session ID（多輪對話用）' 
  }))
}, { 
  description: 'AI 訂單解析請求',
  additionalProperties: false 
})

export type AiOrderParseRequest = typeof AiOrderParseRequestSchema.static

// ==========================================
// API 回應包裝 Schema
// ==========================================

/**
 * 成功回應
 */
export function SuccessResponseSchema<T extends TSchema>(dataSchema: T) {
  return t.Object({
    success: t.Literal(true),
    data: dataSchema
  }, { additionalProperties: false })
}

/**
 * 錯誤回應
 */
export const ErrorResponseSchema = t.Object({
  success: t.Literal(false),
  error: t.Object({
    message: t.String({ description: '錯誤訊息' }),
    code: t.Optional(t.String({ description: '錯誤碼' })),
    details: t.Optional(t.Unknown({ description: '額外錯誤資訊' }))
  }, { additionalProperties: false })
}, { additionalProperties: false })

export type ErrorResponse = typeof ErrorResponseSchema.static

// ==========================================
// 重新導出（向後兼容）
// ==========================================

export * from './types'
