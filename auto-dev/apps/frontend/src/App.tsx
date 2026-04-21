import { HomePage } from './pages/HomePage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { ReorderPage } from './pages/ReorderPage'
import { SearchPage } from './pages/SearchPage'
import { navigate, useRoute, type AppRoute } from './router'

const shellStyle = {
  minHeight: '100vh',
  background:
    'linear-gradient(180deg, #f9efe3 0%, #fff8f2 42%, #f3f6fb 100%)',
  color: '#1f2937'
} satisfies React.CSSProperties

const contentStyle = {
  width: 'min(1180px, calc(100% - 32px))',
  margin: '0 auto',
  padding: '32px 0 64px'
} satisfies React.CSSProperties

const navItems: Array<{ route: AppRoute; label: string }> = [
  { route: '/', label: '首頁' },
  { route: '/search', label: '搜尋菜單' },
  { route: '/reorder', label: '老樣子' },
  { route: '/recommendations', label: '推薦' }
]

function RouteView({ route }: { route: AppRoute }) {
  switch (route) {
    case '/search':
      return <SearchPage />
    case '/reorder':
      return <ReorderPage />
    case '/recommendations':
      return <RecommendationsPage />
    default:
      return <HomePage />
  }
}

export function App() {
  const route = useRoute()

  return (
    <main style={shellStyle}>
      <div style={contentStyle}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '28px'
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              border: 0,
              background: 'transparent',
              fontSize: '1.1rem',
              fontWeight: 800,
              cursor: 'pointer',
              color: '#111827'
            }}
          >
            AutoDev Breakfast
          </button>

          <nav
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            {navItems.map(item => (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                style={{
                  borderRadius: '999px',
                  padding: '10px 14px',
                  border: route === item.route ? '1px solid #111827' : '1px solid #cbd5e1',
                  background: route === item.route ? '#111827' : 'rgba(255,255,255,0.72)',
                  color: route === item.route ? '#fff7ed' : '#334155',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <RouteView route={route} />
      </div>
    </main>
  )
}
