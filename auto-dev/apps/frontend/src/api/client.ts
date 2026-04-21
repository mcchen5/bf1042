import type {
  PreviousOrdersResponse,
  RecommendationResponse,
  ReorderRequest,
  ReorderResponse,
  SearchMenuResponse
} from '@auto-dev/api'

const apiBaseUrl = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Request failed: ${response.status}${detail ? ` ${detail}` : ''}`)
  }

  return (await response.json()) as T
}

export const api = {
  recommendations: {
    get: ({ params }: { params: { userId: string; category?: string; limit?: number } }) => {
      const search = new URLSearchParams()
      search.set('userId', params.userId)
      if (params.category) {
        search.set('category', params.category)
      }
      if (params.limit !== undefined) {
        search.set('limit', String(params.limit))
      }

      return request<RecommendationResponse>(`/recommendations?${search.toString()}`)
    }
  },
  orders: {
    previous: {
      get: ({ params }: { params: { userId: string } }) => {
        const search = new URLSearchParams({ userId: params.userId })
        return request<PreviousOrdersResponse>(`/orders/previous?${search.toString()}`)
      }
    },
    reorder: {
      post: ({ body }: { body: ReorderRequest }) =>
        request<ReorderResponse>('/orders/reorder', {
          method: 'POST',
          body: JSON.stringify(body)
        })
    }
  },
  menu: {
    search: {
      get: ({ params }: { params: { q: string; limit?: number } }) => {
        const search = new URLSearchParams({ q: params.q })
        if (params.limit !== undefined) {
          search.set('limit', String(params.limit))
        }

        return request<SearchMenuResponse>(`/menu/search?${search.toString()}`)
      }
    }
  }
}
