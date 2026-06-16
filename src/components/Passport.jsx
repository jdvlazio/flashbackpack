import { VISITED, CONTINENT_ORDER } from '../data/countries.js'

export default function Passport({ onSelect }) {
  return (
    <div id="sidebar" style={{ width: '360px', flexShrink: 0, borderRight: '1px solid var(--line)', background: 'var(--bg)', overflowY: 'auto' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', color: 'var(--c-muted)', letterSpacing: '0.28em', textTransform: 'uppercase', padding: '1.2rem 1.4rem 0.8rem', margin: 0, borderBottom: '1px solid var(--line-3)' }}>Pasaporte</p>
      {CONTINENT_ORDER.map(cont => {
        const entries = VISITED.filter(v => v.continent === cont)
        if (!entries.length) return null
        return (
          <div key={cont} style={{ borderBottom: '1px solid var(--line-3)', padding: '0.8rem 1.4rem 1rem' }}>
            <p style={{ fontSize: '0.5rem', color: 'var(--c-muted-3)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 0.6rem', fontFamily: 'var(--font-body)' }}>{cont}</p>
            <div className="passport-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px' }}>
              {entries.map(ctry => (
                <button
                  key={ctry.id}
                  className="passport-flag"
                  onClick={() => onSelect({ id: ctry.id, country: ctry })}
                  title={ctry.name}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.2rem', borderRadius: '6px', fontFamily: 'inherit', position: 'relative', transition: 'background 0.12s' }}
                >
                  <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{ctry.flag}</span>
                  <span style={{ fontSize: '0.52rem', color: 'var(--c-muted-2)', fontFamily: 'var(--font-body)', letterSpacing: '0.01em', textAlign: 'center', lineHeight: 1.2 }}>{ctry.name}</span>
                  {ctry.multi && <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '8px', color: 'var(--c-dim)', lineHeight: 1 }}>↵</span>}
                  {ctry.showYear && <span style={{ fontSize: '0.5rem', color: 'var(--c-muted-4)', letterSpacing: '0.04em' }}>{ctry.year}</span>}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
