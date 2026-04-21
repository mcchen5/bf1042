import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '../components/ui/Card'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">歡迎使用早餐店訂餐系統</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/menu">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <h2 className="text-xl font-bold mb-2">📋 瀏覽菜單</h2>
            <p className="text-gray-600">查看所有餐點與價格</p>
          </Card>
        </Link>

        <Link to="/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <h2 className="text-xl font-bold mb-2">📝 管理訂單</h2>
            <p className="text-gray-600">查看與更新訂單狀態</p>
          </Card>
        </Link>

        <Link to="/order/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-blue-50 border-blue-200">
            <h2 className="text-xl font-bold mb-2 text-blue-900">➕ 新增訂單</h2>
            <p className="text-blue-700">快速建立新訂單</p>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">系統特色</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ 端對端類型安全（Elysia + Eden + TanStack）</li>
            <li>✅ 即時資料同步（TanStack Query）</li>
            <li>✅ 類型安全路由（TanStack Router）</li>
            <li>✅ 強大表格管理（TanStack Table）</li>
            <li>✅ 表單驗證（TanStack Form + Zod）</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
