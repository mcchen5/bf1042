import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface PreviousOrder {
  id: string
  orderDate: string
  items: OrderItem[]
  totalAmount: number
}

interface Props {
  userId: string
}

interface ReorderRequest {
  previousOrderId: string
  items: Array<{
    itemId: string
    quantity: number
  }>
}

export function QuickReorder({ userId }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { 
    data: previousOrders, 
    isLoading: isLoadingOrders, 
    error: ordersError 
  } = useQuery({
    queryKey: ['previousOrders', userId],
    queryFn: () => api.orders.previous.get({ params: { userId } }),
    enabled: !!userId
  })

  const reorderMutation = useMutation({
    mutationFn: (reorderData: ReorderRequest) => 
      api.orders.reorder.post({ body: reorderData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] })
      queryClient.invalidateQueries({ queryKey: ['orders', userId] })
      setSelectedOrder(null)
    }
  })

  const handleReorder = (order: PreviousOrder) => {
    const reorderData: ReorderRequest = {
      previousOrderId: order.id,
      items: order.items.map(item => ({
        itemId: item.id,
        quantity: item.quantity
      }))
    }
    
    reorderMutation.mutate(reorderData)
  }

  const handleQuickReorder = (orderId: string) => {
    const order = previousOrders?.data.find((o: PreviousOrder) => o.id === orderId)
    if (order) {
      handleReorder(order)
    }
  }

  if (isLoadingOrders) {
    return (
      <div 
        className="flex items-center justify-center p-6"
        role="status"
        aria-label="載入中"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">載入訂單記錄中...</span>
      </div>
    )
  }

  if (ordersError) {
    return (
      <div 
        className="bg-red-50 border border-red-200 rounded-lg p-4"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">載入訂單記錄失敗：{ordersError.message}</span>
        </div>
      </div>
    )
  }

  if (!previousOrders?.data?.length) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-600">尚無訂單記錄</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">快速再點「老樣子」</h2>
        <p className="text-sm text-gray-600 mt-1">選擇之前的訂單，一鍵重新下單</p>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {previousOrders.data.map((order: PreviousOrder) => (
          <div
            key={order.id}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              selectedOrder === order.id 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-gray-600">
                  {new Date(order.orderDate).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  NT$ {order.totalAmount.toLocaleString()}
                </div>
              </div>
              
              <button
                onClick={() => handleQuickReorder(order.id)}
                disabled={reorderMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                aria-label={`重新訂購 ${new Date(order.orderDate).toLocaleDateString()} 的訂單`}
              >
                {reorderMutation.isPending && selectedOrder === order.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    處理中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    再點一次
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center text-sm">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-8 h-8 rounded object-cover mr-3"
                    />
                  )}
                  <span className="text-gray-700 flex-1">{item.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                  <span className="text-gray-900 font-medium ml-2">
                    NT$ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              
              {order.items.length > 3 && (
                <div className="text-sm text-gray-500 pl-11">
                  還有 {order.items.length - 3} 項商品...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {reorderMutation.error && (
        <div 
          className="p-4 bg-red-50 border-t border-red-200"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center text-red-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            重新下單失敗：{reorderMutation.error.message}
          </div>
        </div>
      )}

      {reorderMutation.isSuccess && (
        <div 
          className="p-4 bg-green-50 border-t border-green-200"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center text-green-800">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已成功加入購物車！
          </div>
        </div>
      )}
    </div>
  )
}
