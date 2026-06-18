import { VISITED, CONTINENT_ORDER } from '../data/countries.js'
import { flagToAlpha2 } from '../lib/flags.js'

// Banderas SVG (flag-icons, las mismas que el mapa) en vez de emojis: nítidas,
// consistentes y sin el fallo de Windows/Android (emojis que salen como letras).
const BASE = import.meta.env.BASE_URL

export default function Passport({ onSelect }) {
  return (
    <div id="sidebar" style={{ width: '360px', flexShrink: 0, background: 'var(--bg)', overflowY: 'auto' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', color: 'var(--c-muted)', letterSpacing: '0.28em', textTransform: 'uppercase', padding: '1.2rem 1.4rem 0.8rem', margin: 0 }}>Pasaporte</p>
      {CONTINENT_ORDER.map(cont => {
        const entries = VISITED.filter(v => v.continent === cont)
        if (!entries.length) return null
        return (
          <div key={cont} style={{ padding: '0.8rem 1.4rem 1rem' }}>
            <p style={{ fontSize: '0.5rem', color: 'var(--c-muted-3)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 0.6rem', fontFamily: 'var(--font-body)' }}>{cont}</p>
            <div className="passport-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px' }}>
              {entries.map(ctry => {
                const a2 = flagToAlpha2(ctry.flag)
                return (
                  <button
                    key={ctry.id}
                    className="passport-flag"
                    onClick={() => onSelect({ id: ctry.id, country: ctry })}
                    title={ctry.name}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '0.55rem 0.2rem', borderRadius: '6px', fontFamily: 'inherit', position: 'relative', transition: 'background 0.12s' }}
                  >
                    <img className={`pflag${a2 === 'np' ? ' pflag-np' : ''}`} src={`${BASE}flags/${a2}.svg`} alt="" loading="lazy" />
                    <span className="pname" style={{ fontSize: '0.52rem', color: 'var(--c-muted-2)', fontFamily: 'var(--font-body)', letterSpacing: '0.01em', textAlign: 'center', lineHeight: 1.2 }}>{ctry.name}</span>
                    {ctry.multi && (
                      <svg className="revisit" viewBox="0 0 24 24" width="11" height="11" aria-label="Revisitado" style={{ position: 'absolute', top: '3px', right: '3px', fill: 'var(--c-dim)' }}>
                        <title>Revisitado</title>
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                      </svg>
                    )}
                    {ctry.showYear && <span className="pyear" style={{ fontSize: '0.5rem', color: 'var(--c-muted-4)', letterSpacing: '0.04em' }}>{ctry.year}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
