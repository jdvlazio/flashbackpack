import Photo from './Photo.jsx'

export default function GalleryModal({ active, photos, onClose, onOpenLightbox }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--overlay-1)', zIndex: 1000, overflowY: 'auto', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.94)', padding: '1rem 0', marginBottom: '1.5rem', zIndex: 2, backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, color: 'var(--fg)', letterSpacing: '-0.01em', textTransform: 'uppercase', margin: '0 0 0.15rem', lineHeight: 1 }}>{`${active.country.flag} ${active.country.name}`}</h2>
            <p style={{ fontSize: '0.6rem', color: 'var(--c-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-body)' }}>{`${active.country.continent} · ${photos.length} fotos`}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '0.5px solid var(--line-strong)', color: 'var(--c-muted-2)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}>✕</button>
        </div>
        <div className="gallery-grid" style={{ columns: '3 200px', gap: '6px' }}>
          {photos.map((url, i) => (
            <Photo
              key={i}
              id={active.id}
              index={i}
              url={url}
              onClick={e => { e.stopPropagation(); onOpenLightbox(url) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
