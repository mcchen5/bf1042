import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { CreateOrder, UpdateOrderStatus } from '@breakfast/api'

// 取得所有訂單
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.api.orders.get()
      if (res.error) throw new Error(res.error.status.toString())
      return res.data.data
    }
  })
}

// 取得單一訂單
export function useOrder(id: number) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await api.api.orders[':id'].get({ params: { id } })
      if (res.error) throw new Error(res.error.status.toString())
      return res.data.data
    },
    enabled: !!id
  })
}

// 建立訂單
export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateOrder) => {
      const res = await api.api.orders.post(data)
      if (res.error) throw new Error(res.error.value.error?.message || '建立失敗')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

// 更新訂單狀態
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: UpdateOrderStatus['status'] }) => {
      const res = await api.api.orders[':id'].patch({ params: { id }, body: { status } })
      if (res.error) throw new Error(res.error.status.toString())
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] })
    }
  })
}

// 取消訂單
export function useCancelOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.api.orders[':id'].delete({ params: { id } })
      if (res.error) throw new Error(res.error.status.toString())
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
