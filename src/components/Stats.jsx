import { useState, useEffect } from 'react'
import { VISITED } from '../data/countries.js'
import { TOTAL_PHOTOS } from '../data/photos.js'

// Países y continentes se derivan de los datos (coinciden siempre con el mapa
// y el pasaporte). El total de fotos se pide a /stats (conteo REAL en Cloudinary);
// hasta que responda, se muestra el número estático como fallback.
export default function Stats() {
  const totalC = VISITED.length
  const conts = [...new Set(VISITED.map(v => v.continent))].length
  const [photos, setPhotos] = useState(TOTAL_PHOTOS)

  useEffect(() => {
    fetch('/stats')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && typeof d.photos === 'number' && d.photos > 0) setPhotos(d.photos) })
      .catch(() => { /* mantiene el fallback estático */ })
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '0.6rem 2rem', borderBottom: '1px solid var(--line-2)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--c-dim-2)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
        {`${totalC} países · ${conts} continentes · ${photos} fotos`}
      </p>
    </div>
  )
}
