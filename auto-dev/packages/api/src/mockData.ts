import type {
  MenuItem,
  PreviousOrder,
  RecommendationItem,
  RecommendationResponse,
  SearchMenuResponse,
  PreviousOrdersResponse,
  ReorderRequest,
  ReorderResponse
} from './types'

export const menuItems: MenuItem[] = [
  {
    id: 'menu-1',
    name: '招牌蛋餅',
    description: '手工餅皮煎到微酥，搭配蔥花蛋香。',
    price: 45,
    category: '主食',
    image:
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'menu-2',
    name: '鮮奶茶',
    description: '厚茶底加鮮奶，尾韻滑順。',
    price: 40,
    category: '飲料',
    image:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1fcef?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'menu-3',
    name: '蘿蔔糕加蛋',
    description: '表面焦香，內層軟嫩。',
    price: 55,
    category: '主食',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'menu-4',
    name: '花生厚片',
    description: '現烤吐司抹上濃郁花生醬。',
    price: 35,
    category: '點心',
    available: true
  },
  {
    id: 'menu-5',
    name: '無糖豆漿',
    description: '每日現煮，豆香厚實。',
    price: 30,
    category: '飲料',
    available: true
  },
  {
    id: 'menu-6',
    name: '薯餅堡',
    description: '酥脆薯餅夾入漢堡，份量感十足。',
    price: 70,
    category: '主食',
    available: false
  }
]

export const previousOrders: PreviousOrder[] = [
  {
    id: 'order-101',
    orderDate: '2026-03-17T08:15:00.000Z',
    totalAmount: 125,
    items: [
      { id: 'menu-1', name: '招牌蛋餅', price: 45, quantity: 1 },
      { id: 'menu-2', name: '鮮奶茶', price: 40, quantity: 1 },
      { id: 'menu-4', name: '花生厚片', price: 35, quantity: 1 }
    ]
  },
  {
    id: 'order-102',
    orderDate: '2026-03-15T07:42:00.000Z',
    totalAmount: 140,
    items: [
      { id: 'menu-3', name: '蘿蔔糕加蛋', price: 55, quantity: 1 },
      { id: 'menu-5', name: '無糖豆漿', price: 30, quantity: 1 },
      { id: 'menu-1', name: '招牌蛋餅', price: 45, quantity: 1 }
    ]
  }
]

export const recommendations: RecommendationItem[] = [
  {
    id: 'rec-1',
    title: '今天適合來份招牌蛋餅',
    description: '根據你最近常點的主食與早晨時段，這份組合最符合你的口味。',
    category: '主食',
    score: 4.9,
    reason: '你最近 7 天內點了 3 次蛋餅類主食。',
    createdAt: '2026-03-19T07:30:00.000Z'
  },
  {
    id: 'rec-2',
    title: '鮮奶茶與花生厚片很搭',
    description: '高人氣甜鹹組合，適合通勤前快速帶走。',
    category: '飲料',
    score: 4.7,
    reason: '你偏好甜口味飲品，且常加購吐司類點心。',
    createdAt: '2026-03-19T07:35:00.000Z'
  },
  {
    id: 'rec-3',
    title: '換個口味試試蘿蔔糕加蛋',
    description: '熱銷排行前段班，適合喜歡酥香口感的顧客。',
    category: '主食',
    score: 4.6,
    reason: '你最近的主食選擇高度集中，系統推薦相近但不同品項。',
    createdAt: '2026-03-19T07:36:00.000Z'
  }
]

export function getRecommendations(params: {
  category?: string
  limit?: number
}): RecommendationResponse {
  const filtered = recommendations
    .filter(item => !params.category || item.category === params.category)
    .slice(0, params.limit ?? 10)

  return {
    data: filtered,
    total: filtered.length,
    hasMore: false
  }
}

export function getPreviousOrders(userId?: string | null): PreviousOrdersResponse {
  return {
    userId: userId ?? null,
    data: previousOrders
  }
}

export function reorderItems(payload: ReorderRequest): ReorderResponse {
  return {
    success: true,
    orderId: `reorder-${payload.previousOrderId}`,
    itemCount: payload.items.length
  }
}

export function searchMenu(params: {
  q: string
  limit?: number
}): SearchMenuResponse {
  const keyword = params.q.trim().toLowerCase()
  const filtered = menuItems
    .filter(item =>
      [item.name, item.description, item.category]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    )
    .slice(0, params.limit ?? 10)

  return {
    data: filtered,
    total: filtered.length
  }
}
