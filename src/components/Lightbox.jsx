import { useRef } from 'react'
import { cloudinary } from '../lib/cloudinary.js'
import { useFocusTrap } from '../hooks/useFocusTrap.js'

const arrow = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'var(--btn-bg-2)', border: '0.5px solid var(--line-strong)', color: 'var(--fg)', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }

export default function Lightbox({ lightbox, photos, countryName, onClose, onPrev, onNext }) {
  const ref = useRef(null)
  useFocusTrap(ref)
  const i = photos.indexOf(lightbox)
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
      tabIndex={-1}
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay-2)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.15s ease', outline: 'none' }}
      onClick={onClose}
    >
      <img src={cloudinary(lightbox, 'w_1600,c_limit')} alt={`${countryName ? countryName + ' — ' : ''}foto ${i + 1} de ${photos.length}`} className="lb-img" style={{ maxWidth: '60vw', maxHeight: '60vh', objectFit: 'contain', borderRadius: '4px', display: 'block' }} onClick={e => e.stopPropagation()} />
      <button onClick={e => { e.stopPropagation(); onClose() }} aria-label="Cerrar visor" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--btn-bg)', border: '0.5px solid var(--line-strong)', color: 'var(--c-muted-2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
      <button onClick={e => { e.stopPropagation(); onPrev() }} aria-label="Foto anterior" className="lb-arrow" style={{ ...arrow, left: '1.5rem' }}>←</button>
      <button onClick={e => { e.stopPropagation(); onNext() }} aria-label="Foto siguiente" className="lb-arrow" style={{ ...arrow, right: '1.5rem' }}>→</button>
      <div style={{ position: 'absolute', bottom: '1.5rem', color: 'var(--c-dim)', fontSize: '0.68rem', letterSpacing: '0.15em', fontFamily: 'var(--font-body)' }}>
        {`${i + 1} / ${photos.length}`}
      </div>
    </div>
  )
}
