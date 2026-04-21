export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
}

export interface PreviousOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface PreviousOrder {
  id: string
  orderDate: string
  totalAmount: number
  items: PreviousOrderItem[]
}

export interface RecommendationItem {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  score: number
  reason: string
  createdAt: string
}

export interface RecommendationResponse {
  data: RecommendationItem[]
  total: number
  hasMore: boolean
}

export interface PreviousOrdersResponse {
  userId: string | null
  data: PreviousOrder[]
}

export interface SearchMenuResponse {
  data: MenuItem[]
  total: number
}

export interface ReorderRequest {
  previousOrderId: string
  items: Array<{
    itemId: string
    quantity: number
  }>
}

export interface ReorderResponse {
  success: boolean
  orderId: string
  itemCount: number
}
