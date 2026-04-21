import { Elysia, t } from 'elysia'
import { db, menuItems } from '../db'
import { eq } from 'drizzle-orm'
import { MenuItemSchema, CreateOrderSchema } from '@breakfast/api'

export const menuRoutes = new Elysia({ prefix: '/api/menu' })
  // 取得所有菜單項目
  .get('/', async () => {
    const items = await db.select().from(menuItems).where(eq(menuItems.isAvailable, true))
    return {
      success: true,
      data: items
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(MenuItemSchema)
      })
    }
  })
  
  // 取得單一菜單項目
  .get('/:id', async ({ params, error }) => {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, params.id))
      .limit(1)
    
    if (!item) {
      return error(404, { success: false, error: { message: 'Menu item not found' } })
    }
    
    return {
      success: true,
      data: item
    }
  }, {
    params: t.Object({ id: t.Number() }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: MenuItemSchema
      }),
      404: t.Object({
        success: t.Boolean(),
        error: t.Object({ message: t.String() })
      })
    }
  })
  
  // 建立新菜單項目（管理員功能）
  .post('/', async ({ body }) => {
    const [newItem] = await db
      .insert(menuItems)
      .values(body)
      .returning()
    
    return {
      success: true,
      data: newItem
    }
  }, {
    body: t.Omit(MenuItemSchema, ['id', 'createdAt', 'updatedAt']),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: MenuItemSchema
      })
    }
  })
