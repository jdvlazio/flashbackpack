import { useState, useEffect, useRef } from 'react'
import { VISITED } from '../data/countries.js'
import { flagToAlpha2 } from '../lib/flags.js'

// Mapa SVG autocontenido: países proyectados (public/countries.svg.json).
// Los visitados se rellenan con su bandera (patrón recortado a la silueta) a
// baja opacidad; hover y click vía eventos del path. Sin MapLibre (mucho más
// ligero). La paleta viene de los tokens CSS (var(--map-*), var(--accent)).
const BASE = import.meta.env.BASE_URL
const VISITED_BY_ISO = {}
VISITED.forEach(v => { VISITED_BY_ISO[v.id] = { ...v, alpha2: flagToAlpha2(v.flag) } })

export default function WorldMap({ onSelect }) {
  const [data, setData] = useState(null)
  const tipRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${BASE}countries.svg.json`).then(r => r.json()).then(d => { if (!cancelled) setData(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const moveTip = (e, c) => {
    const t = tipRef.current; if (!t) return
    t.textContent = `${c.flag} ${c.name} →`
    t.style.left = e.clientX + 'px'
    t.style.top = e.clientY + 'px'
    t.style.display = 'block'
  }
  const hideTip = () => { if (tipRef.current) tipRef.current.style.display = 'none' }

  const visitedPresent = data ? data.countries.filter(c => VISITED_BY_ISO[c.iso]) : []

  return (
    <div id="flashback-map" style={{ opacity: data ? 1 : 0, transition: 'opacity 0.45s ease' }}>
      {data && (
        <svg viewBox={`0 0 ${data.width} ${data.height}`} preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block', background: 'var(--map-bg)' }}>
          <defs>
            {visitedPresent.map(c => (
              <pattern key={c.iso} id={`flag-${c.iso}`} patternContentUnits="objectBoundingBox" width="1" height="1">
                <image href={`${BASE}flags/${VISITED_BY_ISO[c.iso].alpha2}.svg`} width="1" height="1" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
          </defs>
          {data.countries.map(c => {
            const v = VISITED_BY_ISO[c.iso]
            if (!v) return <path key={c.iso} className="cl" d={c.d} />
            return (
              <path key={c.iso} className="cv" d={c.d} fill={`url(#flag-${c.iso})`}
                onMouseEnter={e => moveTip(e, v)}
                onMouseMove={e => moveTip(e, v)}
                onMouseLeave={hideTip}
                onClick={() => { hideTip(); onSelect({ id: c.iso, country: v }) }}
              />
            )
          })}
        </svg>
      )}
      <div ref={tipRef} className="map-tip" />
    </div>
  )
}
