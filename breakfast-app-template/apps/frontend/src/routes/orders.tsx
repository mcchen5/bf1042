import { createFileRoute, Link } from '@tanstack/react-router'
import { OrderTable } from '../components/OrderTable'
import { Card } from '../components/ui/Card'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/orders')({
  component: OrdersPage
})

function OrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">訂單管理</h1>
        <Link
          to="/order/new"
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增訂單
        </Link>
      </div>
      
      <Card>
        <OrderTable />
      </Card>
    </div>
  )
}
