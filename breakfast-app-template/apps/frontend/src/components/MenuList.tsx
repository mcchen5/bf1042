import { useMenu } from '../hooks/useMenu'
import { Card } from './ui/Card'

export function MenuList() {
  const { data: menu, isLoading, error } = useMenu()

  if (isLoading) {
    return <div className="text-center py-8">載入中...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">載入失敗</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {menu?.map(item => (
        <Card key={item.id}>
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                {item.category}
              </span>
              <h3 className="text-lg font-bold mt-2">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              )}
            </div>
            <span className="text-xl font-bold text-blue-600">${item.price}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
