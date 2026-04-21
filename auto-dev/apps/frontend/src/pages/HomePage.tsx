import { navigate, type AppRoute } from '../router'

const cards: Array<{
  route: AppRoute
  title: string
  description: string
  eyebrow: string
}> = [
  {
    route: '/search',
    title: '搜尋菜單',
    description: '快速篩選早餐品項，查看當前選擇與價格。',
    eyebrow: 'Search'
  },
  {
    route: '/reorder',
    title: '老樣子',
    description: '查看歷史訂單，一鍵重新加入購物車。',
    eyebrow: 'Reorder'
  },
  {
    route: '/recommendations',
    title: '個人化推薦',
    description: '依據用戶行為顯示推薦內容與理由。',
    eyebrow: 'Recommendations'
  }
]

export function HomePage() {
  return (
    <section>
      <div
        style={{
          display: 'grid',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            width: 'fit-content',
            padding: '6px 12px',
            borderRadius: '999px',
            background: '#1f2937',
            color: '#fff7ed',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          AutoDev Demo
        </span>
        <h1 style={{ fontSize: 'clamp(2.6rem, 5vw, 4.8rem)', margin: 0 }}>
          早餐店智慧點餐控制台
        </h1>
        <p
          style={{
            maxWidth: '760px',
            margin: 0,
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: '#475569'
          }}
        >
          這個首頁提供 3 條主要體驗路徑，讓你直接查看 AutoDev 生成的搜尋、再點一次與個人化推薦頁面。
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}
      >
        {cards.map(card => (
          <button
            key={card.route}
            onClick={() => navigate(card.route)}
            style={{
              textAlign: 'left',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(14px)',
              padding: '24px',
              boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                color: '#b45309',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px'
              }}
            >
              {card.eyebrow}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>
              {card.title}
            </div>
            <div style={{ color: '#475569', lineHeight: 1.7 }}>{card.description}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
