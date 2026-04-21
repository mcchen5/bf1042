import { PersonalizedRecommendations } from '../components/US-001'

export function RecommendationsPage() {
  return (
    <section>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem' }}>個人化推薦</h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          顯示推薦內容、分數與推薦原因，方便直接做體驗展示。
        </p>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.82)',
          borderRadius: '24px',
          border: '1px solid rgba(148,163,184,0.18)',
          boxShadow: '0 22px 60px rgba(15,23,42,0.08)',
          padding: '24px'
        }}
      >
        <PersonalizedRecommendations userId="demo-user-001" limit={6} />
      </div>
    </section>
  )
}
