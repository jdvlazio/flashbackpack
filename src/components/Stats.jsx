import { useState, useEffect } from 'react'
import { VISITED } from '../data/countries.js'
import { TOTAL_PHOTOS } from '../data/photos.js'

// Países y continentes se derivan de los datos (coinciden siempre con el mapa
// y el pasaporte). El total de fotos se pide a /stats (conteo REAL en Cloudinary);
// hasta que responda, se muestra el número estático como fallback.
export default function Stats() {
  const totalC = VISITED.length
  const conts = [...new Set(VISITED.map(v => v.continent))].length
  // Valor inicial = último conteo REAL recordado (localStorage); así quien ya
  // visitó la web ve el número correcto al instante, sin el parpadeo del
  // estático. Solo la primera visita de todas cae al fallback derivado.
  const [photos, setPhotos] = useState(() => {
    try { const c = localStorage.getItem('fb_photos'); if (c) return Number(c) } catch { /* ignore */ }
    return TOTAL_PHOTOS
  })

  useEffect(() => {
    fetch('/stats')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && typeof d.photos === 'number' && d.photos > 0) {
          setPhotos(d.photos)
          try { localStorage.setItem('fb_photos', String(d.photos)) } catch { /* ignore */ }
        }
      })
      .catch(() => { /* mantiene el fallback */ })
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '0.6rem 2rem' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--c-dim-2)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
        {totalC} países <span style={{ color: 'var(--accent)' }}>·</span> {conts} continentes <span style={{ color: 'var(--accent)' }}>·</span> {photos} fotos
      </p>
    </div>
  )
}
