import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { menuRoutes } from './routes/menu'
import { orderRoutes } from './routes/orders'

const port = Number(process.env.PORT ?? 3001)
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
const backendOrigin = `http://localhost:${port}`

// 初始化資料（示範用）
const initData = async () => {
  const { db, menuItems } = await import('./db')
  const { eq } = await import('drizzle-orm')
  
  // 檢查是否已有資料
  const existing = await db.select().from(menuItems).limit(1)
  if (existing.length === 0) {
    await db.insert(menuItems).values([
      { name: '蛋餅', price: 30, category: '主食', description: '酥脆餅皮加蛋', isAvailable: true },
      { name: '鮮奶茶', price: 50, category: '飲料', description: '紅茶加鮮奶', isAvailable: true },
      { name: '蔥油餅', price: 25, category: '主食', description: '香酥蔥油餅', isAvailable: true },
      { name: '豆漿', price: 20, category: '飲料', description: '濃郁傳統豆漿', isAvailable: true },
      { name: '飯糰', price: 45, category: '主食', description: '古早味飯糰', isAvailable: true }
    ])
    console.log('📝 初始菜單資料已建立')
  }
}

const app = new Elysia()
  .use(cors({
    origin: [frontendOrigin],
    credentials: true
  }))
  .use(swagger({
    documentation: {
      info: {
        title: '早餐店 API',
        version: '1.0.0',
        description: '早餐店訂餐系統 API'
      }
    }
  }))
  .get('/', () => ({
    message: '早餐店 API 運行中',
    docs: '/swagger'
  }))
  .use(menuRoutes)
  .use(orderRoutes)
  .onStart(() => {
    console.log(`🍳 早餐店 API 運行在 ${backendOrigin}`)
    console.log(`📚 API 文件: ${backendOrigin}/swagger`)
    initData()
  })
  .listen(port)

export type App = typeof app
