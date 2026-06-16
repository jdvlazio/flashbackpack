import { useState, useEffect, useRef } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity } from 'd3-zoom'
import { VISITED } from '../data/countries.js'

// Mapa SVG autocontenido: países proyectados (public/countries.svg.json).
// Los visitados se marcan con un tinte sutil + borde (sin banderas sobre la
// geografía: rellenar la silueta con la bandera la deforma — mala práctica).
// La bandera vive en el tooltip al hover y en el pasaporte. Zoom/arrastre/
// pellizco vía d3-zoom (transform sobre el <g>, sin re-render). Paleta = tokens.
const BASE = import.meta.env.BASE_URL
const VISITED_BY_ISO = {}
VISITED.forEach(v => { VISITED_BY_ISO[v.id] = v })

export default function WorldMap({ onSelect }) {
  const [data, setData] = useState(null)
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const tipRef = useRef(null)
  const zoomRef = useRef(null)
  const draggedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${BASE}countries.svg.json`).then(r => r.json()).then(d => { if (!cancelled) setData(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  // d3-zoom: rueda, arrastre y pellizco táctil. El transform se aplica al <g>
  // por DOM (no provoca re-render de los ~180 nodos del mapa).
  useEffect(() => {
    if (!data || !svgRef.current || !gRef.current) return
    const z = zoom()
      .scaleExtent([1, 9])
      .translateExtent([[0, 0], [data.width, data.height]])
      .on('start', () => { draggedRef.current = false })
      .on('zoom', e => {
        gRef.current.setAttribute('transform', e.transform.toString())
        const t = e.sourceEvent && e.sourceEvent.type
        if (t === 'mousemove' || t === 'touchmove' || t === 'pointermove') draggedRef.current = true
      })
    zoomRef.current = z
    const sel = select(svgRef.current)
    sel.call(z).on('dblclick.zoom', null)
    return () => { sel.on('.zoom', null) }
  }, [data])

  const zoomBy = k => { if (zoomRef.current) zoomRef.current.scaleBy(select(svgRef.current), k) }
  const zoomReset = () => { if (zoomRef.current) zoomRef.current.transform(select(svgRef.current), zoomIdentity) }

  const moveTip = (e, c) => {
    const t = tipRef.current; if (!t) return
    t.textContent = `${c.flag} ${c.name}`
    t.style.left = e.clientX + 'px'
    t.style.top = e.clientY + 'px'
    t.style.display = 'block'
  }
  const hideTip = () => { if (tipRef.current) tipRef.current.style.display = 'none' }
  const click = (c, v) => { if (!draggedRef.current) { hideTip(); onSelect({ id: c.iso, country: v }) } }

  return (
    <div id="flashback-map" style={{ opacity: data ? 1 : 0, transition: 'opacity 0.45s ease' }}>
      {data && (
        <svg ref={svgRef} viewBox={`0 0 ${data.width} ${data.height}`} preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block', background: 'var(--map-bg)', touchAction: 'none', cursor: 'grab' }}>
          <g ref={gRef}>
            {data.countries.map(c => {
              const v = VISITED_BY_ISO[c.iso]
              if (!v) return <path key={c.iso} className="cl" d={c.d} />
              return (
                <path key={c.iso} className="cv" d={c.d}
                  onMouseEnter={e => moveTip(e, v)}
                  onMouseMove={e => moveTip(e, v)}
                  onMouseLeave={hideTip}
                  onClick={() => click(c, v)} />
              )
            })}
          </g>
        </svg>
      )}
      <div className="map-zoom">
        <button type="button" aria-label="Acercar" onClick={() => zoomBy(1.6)}>+</button>
        <button type="button" aria-label="Alejar" onClick={() => zoomBy(1 / 1.6)}>−</button>
        <button type="button" aria-label="Restablecer vista" onClick={zoomReset}>⤢</button>
      </div>
      <div ref={tipRef} className="map-tip" />
    </div>
  )
}
