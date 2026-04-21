import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef
} from '@tanstack/react-table'
import { useState } from 'react'
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders'
import type { Order } from '@breakfast/api'

const statusMap = {
  pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: '製作中', color: 'bg-blue-100 text-blue-800' },
  ready: { label: '可取餐', color: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' }
}

export function OrderTable() {
  const { data: orders, isLoading } = useOrders()
  const updateStatus = useUpdateOrderStatus()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: '訂單編號',
      cell: info => `#${info.getValue()}`
    },
    {
      accessorKey: 'customerName',
      header: '顧客',
      cell: info => info.getValue() || '未具名'
    },
    {
      accessorKey: 'items',
      header: '品項',
      cell: info => {
        const items = info.getValue() as Order['items']
        return (
          <div className="max-w-xs truncate">
            {items.map(i => `${i.name}x${i.quantity}`).join(', ')}
          </div>
        )
      }
    },
    {
      accessorKey: 'total',
      header: '總金額',
      cell: info => `NT$ ${info.getValue()}`
    },
    {
      accessorKey: 'status',
      header: '狀態',
      cell: info => {
        const status = info.getValue() as keyof typeof statusMap
        const config = statusMap[status]
        return (
          <select
            value={status}
            onChange={e => {
              const order = info.row.original
              updateStatus.mutate({ id: order.id, status: e.target.value as Order['status'] })
            }}
            className={`px-2 py-1 rounded text-sm font-medium border-0 cursor-pointer ${config.color}`}
          >
            {Object.entries(statusMap).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: '建立時間',
      cell: info => new Date(info.getValue() as string).toLocaleString('zh-TW')
    }
  ]

  const table = useReactTable({
    data: orders || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  if (isLoading) return <div className="text-center py-8">載入中...</div>

  return (
    <div>
      {/* 搜尋 */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="搜尋訂單..."
          className="form-input max-w-sm"
        />
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽'
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="btn btn-secondary disabled:opacity-50"
          >
            上一頁
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="btn btn-secondary disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
        <span className="text-sm text-gray-600">
          第 {table.getState().pagination.pageIndex + 1} 頁 / 共 {table.getPageCount()} 頁
          （共 {table.getFilteredRowModel().rows.length} 筆）
        </span>
      </div>
    </div>
  )
}
