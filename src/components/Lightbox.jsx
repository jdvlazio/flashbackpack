import { cloudinary } from '../lib/cloudinary.js'

const arrow = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'var(--btn-bg-2)', border: '0.5px solid var(--line-strong)', color: 'var(--fg)', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }

export default function Lightbox({ lightbox, photos, countryName, onClose, onPrev, onNext }) {
  const i = photos.indexOf(lightbox)
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay-2)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.15s ease' }}
      onClick={onClose}
    >
      <img src={cloudinary(lightbox, 'w_1600,c_limit')} alt={`${countryName ? countryName + ' — ' : ''}foto ${i + 1} de ${photos.length}`} className="lb-img" style={{ maxWidth: '60vw', maxHeight: '60vh', objectFit: 'contain', borderRadius: '4px', display: 'block' }} onClick={e => e.stopPropagation()} />
      <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--btn-bg)', border: '0.5px solid var(--line-strong)', color: 'var(--c-muted-2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
      <button onClick={e => { e.stopPropagation(); onPrev() }} className="lb-arrow" style={{ ...arrow, left: '1.5rem' }}>←</button>
      <button onClick={e => { e.stopPropagation(); onNext() }} className="lb-arrow" style={{ ...arrow, right: '1.5rem' }}>→</button>
      <div style={{ position: 'absolute', bottom: '1.5rem', color: 'var(--c-dim)', fontSize: '0.68rem', letterSpacing: '0.15em', fontFamily: 'var(--font-body)' }}>
        {`${photos.indexOf(lightbox) + 1} / ${photos.length}`}
      </div>
    </div>
  )
}
