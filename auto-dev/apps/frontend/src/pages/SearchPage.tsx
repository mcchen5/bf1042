import { useState } from 'react'
import type { MenuItem } from '@auto-dev/api'
import { SearchMenu } from '../components/US-003'

export function SearchPage() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  return (
    <section>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem' }}>搜尋菜單</h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          即時搜尋早餐品項，點選結果後會在右側顯示詳細資訊。
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 0.9fr)'
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.82)',
            borderRadius: '24px',
            border: '1px solid rgba(148,163,184,0.18)',
            boxShadow: '0 22px 60px rgba(15,23,42,0.08)',
            padding: '24px'
          }}
        >
          <SearchMenu onItemSelect={setSelectedItem} />
        </div>

        <aside
          style={{
            background: '#fffaf5',
            borderRadius: '24px',
            border: '1px solid #fed7aa',
            padding: '24px'
          }}
        >
          <div style={{ color: '#9a3412', fontSize: '0.85rem', marginBottom: '8px' }}>
            Current Selection
          </div>
          {selectedItem ? (
            <>
              <h2 style={{ margin: '0 0 8px' }}>{selectedItem.name}</h2>
              <p style={{ color: '#7c2d12', lineHeight: 1.7 }}>{selectedItem.description}</p>
              <div style={{ marginTop: '14px', fontWeight: 700 }}>
                NT$ {selectedItem.price}
              </div>
              <div style={{ marginTop: '8px', color: '#9a3412' }}>{selectedItem.category}</div>
            </>
          ) : (
            <p style={{ margin: 0, color: '#9ca3af' }}>尚未選擇任何餐點。</p>
          )}
        </aside>
      </div>
    </section>
  )
}
