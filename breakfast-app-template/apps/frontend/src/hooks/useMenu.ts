import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

// 取得菜單
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await api.api.menu.get()
      if (res.error) throw new Error(res.error.status.toString())
      return res.data.data
    }
  })
}

// 取得單一菜單項目
export function useMenuItem(id: number) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: async () => {
      const res = await api.api.menu[":id"].get({ params: { id } })
      if (res.error) throw new Error(res.error.status.toString())
      return res.data.data
    },
    enabled: !!id
  })
}

// 建立菜單項目
export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      name: string
      price: number
      category: '主食' | '飲料' | '點心'
      description?: string
    }) => {
      const res = await api.api.menu.post(data)
      if (res.error) throw new Error(res.error.status.toString())
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] })
    }
  })
}
