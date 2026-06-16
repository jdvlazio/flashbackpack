import { useState, useEffect, useRef } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity } from 'd3-zoom'
import { VISITED } from '../data/countries.js'
import { flagToAlpha2 } from '../lib/flags.js'

// Mapa SVG autocontenido (public/countries.svg.json). Tierra coloreada por
// continente (tonos apagados). Los visitados llevan un PIN con su bandera (chip
// redondeado + sombra, anclado por punto ámbar) sobre el centroide — la bandera
// nunca se deforma. La capa de pines NO escala con el zoom (tamaño constante);
// el zoom solo recoloca cada pin. Zoom/arrastre/pellizco vía d3-zoom.
const BASE = import.meta.env.BASE_URL
const CONT_KEY = { Europa: 'eu', Asia: 'as', 'América': 'am', 'Oceanía': 'oc', 'África': 'af' }
const VISITED_BY_ISO = {}
VISITED.forEach(v => { VISITED_BY_ISO[v.id] = { ...v, alpha2: flagToAlpha2(v.flag), cont: CONT_KEY[v.continent] || 'xx' } })

export default function WorldMap({ onSelect }) {
  const [data, setData] = useState(null)
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const pinsRef = useRef(null)
  const tipRef = useRef(null)
  const zoomRef = useRef(null)
  const draggedRef = useRef(false)
  const lastTfRef = useRef(zoomIdentity)
  const pinScaleRef = useRef(1)

  // Recoloca (y reescala) cada pin: tamaño constante en pantalla (~24px) sea
  // cual sea el ancho del SVG; el zoom solo cambia su posición, no su tamaño.
  const positionPins = tf => {
    const pins = pinsRef.current; if (!pins) return
    const s = pinScaleRef.current
    for (const p of pins.children) {
      const [X, Y] = tf.apply([+p.dataset.cx, +p.dataset.cy])
      p.setAttribute('transform', `translate(${X} ${Y}) scale(${s})`)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetch(`${BASE}countries.svg.json`).then(r => r.json()).then(d => { if (!cancelled) setData(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Escala de los pines = unidades-viewBox por px de pantalla → 24 uds ≈ 24px
  // en cualquier dispositivo. Se recalcula al redimensionar el SVG.
  useEffect(() => {
    if (!data || !svgRef.current) return
    const svg = svgRef.current
    const update = () => { pinScaleRef.current = data.width / (svg.clientWidth || data.width); positionPins(lastTfRef.current) }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(svg)
    return () => ro.disconnect()
  }, [data])

  // d3-zoom: rueda, arrastre y pellizco táctil. El mapa se transforma por DOM
  // (sin re-render); los pines se recolocan con la misma transformación pero
  // mantienen su tamaño (no van dentro del <g> escalado).
  useEffect(() => {
    if (!data || !svgRef.current || !gRef.current) return
    const z = zoom()
      .scaleExtent([1, 24]) // zoom alto: permite separar pares muy juntos (Israel/Palestina)
      .translateExtent([[0, 0], [data.width, data.height]])
      .on('start', () => { draggedRef.current = false })
      .on('zoom', e => {
        gRef.current.setAttribute('transform', e.transform.toString())
        lastTfRef.current = e.transform
        positionPins(e.transform)
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

  const pins = data ? data.countries.filter(c => c.cen && VISITED_BY_ISO[c.iso]) : []

  return (
    <div id="flashback-map" style={{ opacity: data ? 1 : 0, transition: 'opacity 0.45s ease' }}>
      {data && (
        <svg ref={svgRef} viewBox={`0 0 ${data.width} ${data.height}`} preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block', background: 'var(--map-bg)', touchAction: 'none', cursor: 'grab' }}>
          <defs>
            <clipPath id="pinclip"><rect x="-12" y="-19" width="24" height="18" rx="3" /></clipPath>
            <filter id="pinshadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodColor="#000" floodOpacity="0.6" />
            </filter>
            {/* Tallo del pin: degradado ámbar que se desvanece hacia el chip */}
            <linearGradient id="pinstem" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-11">
              <stop className="pin-stem-stop" offset="0" stopOpacity="0.8" />
              <stop className="pin-stem-stop" offset="1" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <g ref={gRef}>
            {data.countries.map(c => {
              const v = VISITED_BY_ISO[c.iso]
              if (!v) return <path key={c.iso} className={`cl ${c.cont || 'xx'}`} d={c.d} />
              return (
                <path key={c.iso} className={`cv ${v.cont}`} d={c.d}
                  onMouseEnter={e => moveTip(e, v)}
                  onMouseMove={e => moveTip(e, v)}
                  onMouseLeave={hideTip}
                  onClick={() => click(c, v)} />
              )
            })}
          </g>
          <g ref={pinsRef} className="pins">
            {pins.map(c => {
              const v = VISITED_BY_ISO[c.iso]
              const np = v.alpha2 === 'np' // Nepal: bandera no rectangular, sin caja
              return (
                <g key={c.iso} className="pin" data-cx={c.cen[0]} data-cy={c.cen[1]} transform={`translate(${c.cen[0]} ${c.cen[1]})`}>
                  <line className="pin-stem" x1="0" y1="0" x2="0" y2="-11" stroke="url(#pinstem)" />
                  <circle className="pin-dot" r="1.5" />
                  <g className="pin-chip" transform="translate(0 -11)" filter="url(#pinshadow)">
                    {np ? (
                      <image className="pin-flag" href={`${BASE}flags/np.svg`} x="-8" y="-21" width="16" height="20" preserveAspectRatio="xMidYMid meet" />
                    ) : (
                      <>
                        <rect className="pin-bg" x="-13" y="-20" width="26" height="20" rx="4" />
                        <image className="pin-flag" href={`${BASE}flags/${v.alpha2}.svg`} x="-12" y="-19" width="24" height="18" clipPath="url(#pinclip)" preserveAspectRatio="xMidYMid slice" />
                      </>
                    )}
                  </g>
                </g>
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
