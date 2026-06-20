import { useRef } from 'react'
import Photo from './Photo.jsx'
import { useFocusTrap } from '../hooks/useFocusTrap.js'

export default function GalleryModal({ active, photos, onClose, onOpenLightbox }) {
  const ref = useRef(null)
  useFocusTrap(ref)
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay-1)', zIndex: 1000, overflowY: 'auto', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Galería de fotos de ${active.country.name}`}
        tabIndex={-1}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem', outline: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(12,12,13,0.94)', padding: '1rem 0', marginBottom: '1.5rem', zIndex: 2, backdropFilter: 'blur(12px)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--fg)', letterSpacing: '0.02em', textTransform: 'uppercase', margin: '0 0 0.2rem', lineHeight: 1 }}>{`${active.country.flag} ${active.country.name}`}</h2>
            <p style={{ fontSize: '0.6rem', color: 'var(--c-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-body)' }}>{`${active.country.continent} · ${photos.length} fotos`}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar galería" style={{ background: 'none', border: '0.5px solid var(--line-strong)', color: 'var(--c-muted-2)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}>✕</button>
        </div>
        <div className="gallery-grid">
          {photos.map((p, i) => (
            <Photo
              key={p.u}
              photo={p}
              alt={`${active.country.name} — foto ${i + 1}`}
              onClick={() => onOpenLightbox(p)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
