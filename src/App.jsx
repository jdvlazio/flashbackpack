import { useState, useEffect } from 'react'
import { loadPhotos } from './data/photos.js'
import Header from './components/Header.jsx'
import Stats from './components/Stats.jsx'
import Passport from './components/Passport.jsx'
import WorldMap from './components/WorldMap.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import Lightbox from './components/Lightbox.jsx'

export default function App() {
  const [active, setActive] = useState(null)
  const [photos, setPhotos] = useState([])
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (!active) { setPhotos([]); return }
    loadPhotos(active.country).then(setPhotos)
  }, [active])

  // Atajos de teclado. Depende de `photos`/`lightbox` para navegar sobre la
  // lista actual (el baseline tenía deps `[]` y las flechas eran no-op).
  // Escape cierra por capas: primero el lightbox, si no, la galería — así el
  // foco se restaura por niveles (foto → pasaporte).
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') { if (lightbox) setLightbox(null); else setActive(null) }
      if (e.key === 'ArrowRight') { setLightbox(prev => { if (!prev) return prev; const i = photos.indexOf(prev); return i < photos.length - 1 ? photos[i + 1] : prev }) }
      if (e.key === 'ArrowLeft') { setLightbox(prev => { if (!prev) return prev; const i = photos.indexOf(prev); return i > 0 ? photos[i - 1] : prev }) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photos, lightbox])

  const prev = () => { const i = photos.indexOf(lightbox); if (i > 0) setLightbox(photos[i - 1]) }
  const next = () => { const i = photos.indexOf(lightbox); if (i < photos.length - 1) setLightbox(photos[i + 1]) }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--fg)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <Header />
      <Stats />
      <div id="main-layout" style={{ display: 'flex', alignItems: 'stretch', position: 'relative' }}>
        <Passport onSelect={setActive} />
        <div id="map-wrapper" style={{ flex: 1, position: 'relative', minHeight: '500px', background: 'var(--bg)' }}>
          <WorldMap onSelect={setActive} />
        </div>
      </div>
      {active && <GalleryModal active={active} photos={photos} onClose={() => setActive(null)} onOpenLightbox={setLightbox} />}
      {lightbox && <Lightbox lightbox={lightbox} photos={photos} countryName={active?.country?.name} onClose={() => setLightbox(null)} onPrev={prev} onNext={next} />}
    </div>
  )
}
