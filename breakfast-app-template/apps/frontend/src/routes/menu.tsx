import { createFileRoute } from '@tanstack/react-router'
import { MenuList } from '../components/MenuList'
import { Card } from '../components/ui/Card'

export const Route = createFileRoute('/menu')({
  component: MenuPage
})

function MenuPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">菜單</h1>
      <Card>
        <MenuList />
      </Card>
    </div>
  )
}
