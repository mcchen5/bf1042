import { Elysia } from 'elysia'
import {
  getPreviousOrders,
  getRecommendations,
  reorderItems,
  searchMenu,
  type ReorderRequest
} from '@auto-dev/api'

const port = Number(process.env.PORT ?? 3001)

const app = new Elysia()
  .onError(({ code, error, path }) => {
    console.error(`[backend:${code}] ${path}`, error)
  })
  .get('/health', () => ({
    status: 'ok'
  }))
  .get('/api/recommendations', ({ query }) => {
    const limit = Number(query.limit ?? 10)
    const category = typeof query.category === 'string' ? query.category : undefined

    return getRecommendations({
      category,
      limit: Number.isFinite(limit) ? limit : 10
    })
  })
  .get('/api/orders/previous', ({ query }) =>
    getPreviousOrders(typeof query.userId === 'string' ? query.userId : null)
  )
  .post('/api/orders/reorder', ({ body }) =>
    reorderItems(body as ReorderRequest)
  )
  .get('/api/menu/search', ({ query }) =>
    searchMenu({
      q: String(query.q ?? ''),
      limit: Number.isFinite(Number(query.limit))
        ? Number(query.limit)
        : 10
    })
  )
  .listen(port)

console.log(`AutoDev backend running at http://localhost:${port}`)

export type App = typeof app
