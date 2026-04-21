import { QuickReorder } from '../components/US-002'

export function ReorderPage() {
  return (
    <section>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem' }}>快速再點「老樣子」</h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          這頁聚焦於歷史訂單與一鍵重複下單。
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
        <QuickReorder userId="demo-user-001" />
      </div>
    </section>
  )
}
