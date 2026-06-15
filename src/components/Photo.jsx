import { useState } from 'react'
import { cloudinary } from '../lib/cloudinary.js'

// Imagen de galería: tamaños responsive de Cloudinary (srcset) + lazy + fallback HONESTO.
// Si una foto propia falla, se muestra un marcador neutro — nunca stock ajeno.
export default function Photo({ url, alt, onClick }) {
  const [err, setErr] = useState(false)

  if (err) {
    return (
      <div style={{ breakInside: 'avoid', marginBottom: '6px', background: 'var(--img-bg)', borderRadius: '3px', aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-dim)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        imagen no disponible
      </div>
    )
  }

  return (
    <div style={{ breakInside: 'avoid', marginBottom: '6px', cursor: 'zoom-in' }} onClick={onClick}>
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
    </div>
  )
}
