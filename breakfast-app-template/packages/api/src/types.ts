// ==========================================
// 輔助類型定義
// ==========================================

import type { Static } from '@sinclair/typebox'
import type { 
  MenuItemSchema, 
  OrderSchema,
  AiOrderParseResponseSchema 
} from './schemas'

// 提取 Schema 靜態類型的輔助型別
export type MenuItem = Static<typeof MenuItemSchema>
export type Order = Static<typeof OrderSchema>
export type AiOrderParseResponse = Static<typeof AiOrderParseResponseSchema>

// 分頁相關類型
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
