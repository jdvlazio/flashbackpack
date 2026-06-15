import { useState } from 'react'
import { cloudinary } from '../lib/cloudinary.js'

// Imagen de galería: tamaños responsive de Cloudinary (srcset) + lazy + fallback HONESTO.
// Es un <button> para que sea activable por teclado (Enter/Espacio abren el lightbox).
// Si una foto propia falla, se muestra un marcador neutro — nunca stock ajeno.
export default function Photo({ url, alt, onClick }) {
  const [err, setErr] = useState(false)

  if (err) {
    return (
      <div role="img" aria-label={`${alt} (no disponible)`} style={{ breakInside: 'avoid', marginBottom: '6px', background: 'var(--img-bg)', borderRadius: '3px', aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-dim)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        imagen no disponible
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Ampliar: ${alt}`}
      style={{ breakInside: 'avoid', marginBottom: '6px', cursor: 'zoom-in', display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', borderRadius: '3px' }}
    >
      <img
        src={cloudinary(url, 'w_600,c_limit')}
        srcSet={`${cloudinary(url, 'w_400,c_limit')} 400w, ${cloudinary(url, 'w_800,c_limit')} 800w`}
        sizes="(max-width: 768px) 50vw, 200px"
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setErr(true)}
        style={{ width: '100%', display: 'block', borderRadius: '3px', background: 'var(--img-bg)' }}
      />
    </button>
  )
}
