import { useState } from 'react'

// Imagen de galería con fallback (comportamiento del baseline: si falla, cae a picsum).
// NOTA: este fallback a stock ajeno es un known-issue a corregir en un paso posterior;
// en Paso 1 se preserva tal cual.
export default function Photo({ id, index, url, onClick }) {
  const [err, setErr] = useState(false)
  const src = err ? `https://picsum.photos/seed/${id}${index}/600/400` : url
  return (
    <div style={{ breakInside: 'avoid', marginBottom: '6px', cursor: 'zoom-in' }} onClick={onClick}>
      <img
        src={src}
        alt=""
        onError={() => setErr(true)}
        style={{ width: '100%', display: 'block', borderRadius: '3px', background: 'var(--img-bg)' }}
      />
    </div>
  )
}
