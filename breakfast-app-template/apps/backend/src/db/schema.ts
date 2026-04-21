import { pgTable, serial, varchar, integer, boolean, timestamp, text, jsonb } from 'drizzle-orm/pg-core'

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  price: integer('price').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  items: jsonb('items').notNull().$type<Array<{
    menuItemId: number
    name: string
    price: number
    quantity: number
    modifiers: string[]
  }>>(),
  total: integer('total').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  customerName: varchar('customer_name', { length: 100 }),
  customerPhone: varchar('customer_phone', { length: 20 }),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
