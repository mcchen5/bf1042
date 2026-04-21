import { Elysia, t } from 'elysia'
import { db, menuItems, orders } from '../db'
import { eq, desc } from 'drizzle-orm'
import { OrderSchema, CreateOrderSchema, UpdateOrderStatusSchema } from '@breakfast/api'

export const orderRoutes = new Elysia({ prefix: '/api/orders' })
  // 取得所有訂單
  .get('/', async () => {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
    
    return {
      success: true,
      data: allOrders
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(OrderSchema)
      })
    }
  })
  
  // 取得單一訂單
  .get('/:id', async ({ params, error }) => {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, params.id))
      .limit(1)
    
    if (!order) {
      return error(404, { success: false, error: { message: 'Order not found' } })
    }
    
    return {
      success: true,
      data: order
    }
  }, {
    params: t.Object({ id: t.Number() }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: OrderSchema
      }),
      404: t.Object({
        success: t.Boolean(),
        error: t.Object({ message: t.String() })
      })
    }
  })
  
  // 建立新訂單
  .post('/', async ({ body }) => {
    // 計算總價
    let total = 0
    const orderItems = []
    
    for (const item of body.items) {
      const [menuItem] = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, item.menuItemId))
        .limit(1)
      
      if (!menuItem) {
        return { success: false, error: { message: `Menu item ${item.menuItemId} not found` } }
      }
      
      const itemTotal = menuItem.price * item.quantity
      total += itemTotal
      
      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        modifiers: item.modifiers || []
      })
    }
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        items: orderItems,
        total,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        note: body.note,
        status: 'pending'
      })
      .returning()
    
    return {
      success: true,
      data: newOrder
    }
  }, {
    body: CreateOrderSchema,
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Optional(OrderSchema),
        error: t.Optional(t.Object({ message: t.String() }))
      })
    }
  })
  
  // 更新訂單狀態
  .patch('/:id', async ({ params, body }) => {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status: body.status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, params.id))
      .returning()
    
    return {
      success: true,
      data: updatedOrder
    }
  }, {
    params: t.Object({ id: t.Number() }),
    body: UpdateOrderStatusSchema,
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: OrderSchema
      })
    }
  })
  
  // 取消訂單
  .delete('/:id', async ({ params }) => {
    await db
      .update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(orders.id, params.id))
    
    return {
      success: true,
      message: 'Order cancelled'
    }
  }, {
    params: t.Object({ id: t.Number() }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  })
