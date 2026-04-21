import { createFileRoute } from '@tanstack/react-router'
import { CreateOrderForm } from '../components/CreateOrderForm'

export const Route = createFileRoute('/order/new')({
  component: CreateOrderPage
})

function CreateOrderPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新增訂單</h1>
      <CreateOrderForm />
    </div>
  )
}
