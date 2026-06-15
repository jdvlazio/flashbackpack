import { VISITED } from '../data/countries.js'
import { TOTAL_PHOTOS } from '../data/photos.js'

export default function Stats() {
  const totalC = VISITED.length
  const conts = [...new Set(VISITED.map(v => v.continent))].length
  return (
    <div style={{ textAlign: 'center', padding: '0.6rem 2rem', borderBottom: '1px solid var(--line-2)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--c-dim-2)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
        {`${totalC} países · ${conts} continentes · ${TOTAL_PHOTOS} fotos`}
      </p>
    </div>
  )
}
