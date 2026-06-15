import { useState, useEffect, useRef } from 'react'
import { loadPhotos } from './data/photos.js'
import { useWorldMap } from './hooks/useWorldMap.js'
import Header from './components/Header.jsx'
import Stats from './components/Stats.jsx'
import Passport from './components/Passport.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import Lightbox from './components/Lightbox.jsx'

export default function App() {
  const wrapRef = useRef(null)
  const [active, setActive] = useState(null)
  const [photos, setPhotos] = useState([])
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (!active) { setPhotos([]); return }
    loadPhotos(active.id).then(setPhotos)
  }, [active])

  // Handler de teclado portado VERBATIM del baseline, incluido su deps `[]`.
  // (Las flechas de teclado son no-op por closure obsoleto de `photos` — known issue
  //  preservado; las flechas en pantalla del Lightbox sí funcionan.)
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') { setActive(null); setLightbox(null) }
      if (e.key === 'ArrowRight') { setLightbox(prev => { if (!prev) return prev; const i = photos.indexOf(prev); return i < photos.length - 1 ? photos[i + 1] : prev }) }
      if (e.key === 'ArrowLeft') { setLightbox(prev => { if (!prev) return prev; const i = photos.indexOf(prev); return i > 0 ? photos[i - 1] : prev }) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useWorldMap(wrapRef, setActive)

  const prev = () => { const i = photos.indexOf(lightbox); if (i > 0) setLightbox(photos[i - 1]) }
  const next = () => { const i = photos.indexOf(lightbox); if (i < photos.length - 1) setLightbox(photos[i + 1]) }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--fg)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <Header />
      <Stats />
      <div id="main-layout" style={{ display: 'flex', alignItems: 'stretch', position: 'relative' }}>
        <Passport onSelect={setActive} />
        <div id="map-wrapper" style={{ flex: 1, position: 'relative', minHeight: '500px', background: 'var(--bg)' }}>
          <div ref={wrapRef} id="flashback-map"></div>
        </div>
      </div>
      {active && <GalleryModal active={active} photos={photos} onClose={() => setActive(null)} onOpenLightbox={setLightbox} />}
      {lightbox && <Lightbox lightbox={lightbox} photos={photos} onClose={() => setLightbox(null)} onPrev={prev} onNext={next} />}
    </div>
  )
}
