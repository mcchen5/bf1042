import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useMenu } from '../hooks/useMenu'
import { useCreateOrder } from '../hooks/useOrders'
import { Card } from './ui/Card'

const orderSchema = z.object({
  customerName: z.string().min(2, '姓名至少2個字').optional(),
  customerPhone: z.string().regex(/^09\d{8}$/, '請輸入有效的手機號碼').optional(),
  note: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
    modifiers: z.array(z.string())
  })).min(1, '至少選擇一項商品')
})

export function CreateOrderForm() {
  const { data: menu } = useMenu()
  const createOrder = useCreateOrder()

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      customerName: '',
      customerPhone: '',
      note: '',
      items: []
    },
    onSubmit: async (values) => {
      await createOrder.mutateAsync({
        items: values.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          modifiers: item.modifiers
        })),
        customerName: values.customerName || undefined,
        customerPhone: values.customerPhone || undefined,
        note: values.note || undefined
      })
      form.reset()
    }
  })

  const addItem = (menuItem: { id: number; name: string; price: number }) => {
    const currentItems = form.getFieldValue('items') || []
    const existing = currentItems.find(i => i.menuItemId === menuItem.id)
    
    if (existing) {
      form.setFieldValue('items', currentItems.map(i =>
        i.menuItemId === menuItem.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      form.setFieldValue('items', [...currentItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        modifiers: []
      }])
    }
  }

  const removeItem = (menuItemId: number) => {
    const currentItems = form.getFieldValue('items') || []
    form.setFieldValue('items', currentItems.filter(i => i.menuItemId !== menuItemId))
  }

  const items = form.getFieldValue('items') || []
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 菜單選擇 */}
      <Card>
        <h2 className="text-xl font-bold mb-4">選擇品項</h2>
        <div className="grid grid-cols-2 gap-2">
          {menu?.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItem(item)}
              className="p-3 text-left border rounded hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">${item.price}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* 訂單表單 */}
      <Card>
        <h2 className="text-xl font-bold mb-4">訂單明細</h2>
        
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          {/* 已選品項 */}
          <div className="mb-4 space-y-2">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">請選擇品項</p>
            ) : (
              items.map(item => (
                <div key={item.menuItemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>${item.price * item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 總計 */}
          <div className="text-xl font-bold text-right mb-4">
            總計: NT$ {total}
          </div>

          {/* 顧客資訊 */}
          <form.Field name="customerName">
            {(field) => (
              <div className="mb-3">
                <label className="form-label">顧客姓名</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-input"
                  placeholder="選填"
                />
                {field.state.meta.errors && (
                  <p className="form-error">{field.state.meta.errors}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="customerPhone">
            {(field) => (
              <div className="mb-3">
                <label className="form-label">手機號碼</label>
                <input
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-input"
                  placeholder="09xxxxxxxx"
                />
                {field.state.meta.errors && (
                  <p className="form-error">{field.state.meta.errors}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <div className="mb-4">
                <label className="form-label">備註</label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="form-input"
                  rows={2}
                  placeholder="例如：不要加蔥、少鹽等"
                />
              </div>
            )}
          </form.Field>

          {/* 提交 */}
          <button
            type="submit"
            disabled={items.length === 0 || createOrder.isPending}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {createOrder.isPending ? '處理中...' : '確認訂單'}
          </button>
        </form>
      </Card>
    </div>
  )
}
