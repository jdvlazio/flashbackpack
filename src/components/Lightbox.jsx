import { useRef, useState, useEffect } from 'react'
import { cloudinary } from '../lib/cloudinary.js'
import { useFocusTrap } from '../hooks/useFocusTrap.js'

const arrow = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'var(--btn-bg-2)', border: '0.5px solid var(--line-strong)', color: 'var(--fg)', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }

export default function Lightbox({ lightbox, photos, country, onClose, onPrev, onNext }) {
  const ref = useRef(null)
  useFocusTrap(ref)
  const i = photos.indexOf(lightbox)
  const [loaded, setLoaded] = useState(false)
  const [zoom, setZoom] = useState(null)      // null = ajustada; {ox,oy} = ampliada
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)                 // arrastre para desplazar en zoom
  const movedRef = useRef(false)
  const touchRef = useRef(null)                // swipe para navegar

  const full = cloudinary(lightbox.u, 'w_1600,c_limit')
  const lqip = cloudinary(lightbox.u, 'w_40,e_blur:800,q_20')
  const cap = `${country?.name ? country.name + ' — ' : ''}foto ${i + 1} de ${photos.length}`

  // Al cambiar de foto: reinicia blur-up y zoom.
  useEffect(() => { setLoaded(false); setZoom(null); setPan({ x: 0, y: 0 }) }, [lightbox.u])

  // Precarga la anterior y la siguiente → navegar es instantáneo.
  useEffect(() => {
    [photos[i + 1], photos[i - 1]].forEach(p => { if (p) { const im = new Image(); im.src = cloudinary(p.u, 'w_1600,c_limit') } })
  }, [i, photos])

  const toggleZoom = e => {
    e.stopPropagation()
    if (movedRef.current) { movedRef.current = false; return } // fue arrastre, no clic
    if (zoom) { setZoom(null); setPan({ x: 0, y: 0 }); return }
    const r = e.currentTarget.getBoundingClientRect()
    setZoom({ ox: ((e.clientX - r.left) / r.width) * 100, oy: ((e.clientY - r.top) / r.height) * 100 })
  }
  const onPointerDown = e => { if (zoom) { dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; movedRef.current = false } }
  const onPointerMove = e => {
    if (!zoom || !dragRef.current) return
    const dx = e.clientX - dragRef.current.x, dy = e.clientY - dragRef.current.y
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true
    setPan({ x: dragRef.current.px + dx, y: dragRef.current.py + dy })
  }
  const endDrag = () => { dragRef.current = null }

  // Swipe horizontal para navegar (solo si no está ampliada).
  const onTouchStart = e => { if (!zoom && e.touches[0]) touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = e => {
    if (zoom || !touchRef.current || !e.changedTouches[0]) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onNext : onPrev)()
  }

  const transform = zoom ? `translate(${pan.x}px, ${pan.y}px) scale(2.4)` : 'none'

  return (
    <div
      ref={ref} role="dialog" aria-modal="true" aria-label="Visor de imagen" tabIndex={-1}
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay-2)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.15s ease', outline: 'none', cursor: 'zoom-out', touchAction: 'none' }}
      onClick={onClose}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag}
    >
      <div className="lb-stage" onClick={e => e.stopPropagation()} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={lqip} aria-hidden="true" className="lb-img lb-blur" style={{ position: 'absolute', opacity: loaded ? 0 : 1, transition: 'opacity 0.4s ease' }} />
        <img
          src={full} alt={cap} className="lb-img"
          onLoad={() => setLoaded(true)}
          onClick={toggleZoom}
          onPointerDown={onPointerDown}
          style={{ opacity: loaded ? 1 : 0, transform, transformOrigin: zoom ? `${zoom.ox}% ${zoom.oy}%` : 'center', transition: dragRef.current ? 'none' : 'opacity 0.4s ease, transform 0.25s ease', cursor: zoom ? 'grab' : 'zoom-in' }}
        />
      </div>
      <button onClick={e => { e.stopPropagation(); onClose() }} aria-label="Cerrar visor" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--btn-bg)', border: '0.5px solid var(--line-strong)', color: 'var(--c-muted-2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', zIndex: 2 }}>✕</button>
      <button onClick={e => { e.stopPropagation(); onPrev() }} aria-label="Foto anterior" className="lb-arrow" style={{ ...arrow, left: '1.5rem' }}>←</button>
      <button onClick={e => { e.stopPropagation(); onNext() }} aria-label="Foto siguiente" className="lb-arrow" style={{ ...arrow, right: '1.5rem' }}>→</button>
      <div className="lb-cap">
        {country?.name && <span>{country.name}{country.year ? ` · ${country.year}` : ''}</span>}
        <span className="lb-count">{i + 1} / {photos.length}</span>
      </div>
    </div>
  )
}
