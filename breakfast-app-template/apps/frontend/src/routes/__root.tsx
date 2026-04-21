import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Home, UtensilsCrossed, ClipboardList } from 'lucide-react'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">🍳 早餐店系統</h1>
            <div className="flex space-x-4">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                activeProps={{ className: 'bg-blue-100 text-blue-900' }}
              >
                <Home className="w-4 h-4 mr-2" />
                首頁
              </Link>
              <Link
                to="/menu"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                activeProps={{ className: 'bg-blue-100 text-blue-900' }}
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                菜單
              </Link>
              <Link
                to="/orders"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                activeProps={{ className: 'bg-blue-100 text-blue-900' }}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                訂單
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
