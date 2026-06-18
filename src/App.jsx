import { useState, useEffect } from 'react'
import { loadPhotos } from './data/photos.js'
import { COUNTRY_BY_SLUG } from './data/countries.js'
import Header from './components/Header.jsx'
import Stats from './components/Stats.jsx'
import Passport from './components/Passport.jsx'
import WorldMap from './components/WorldMap.jsx'
import GalleryModal from './components/GalleryModal.jsx'
import Lightbox from './components/Lightbox.jsx'

// País a partir de la URL (/espana → país) y metadatos por país.
const countryFromPath = () => COUNTRY_BY_SLUG[decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g, ''))] || null
function applyMeta(country) {
  document.title = country ? `${country.name} — FLASHBACKPACK · Juan David Villa` : 'FLASHBACKPACK — Juan David Villa'
  const canon = document.querySelector('link[rel="canonical"]')
  if (canon) canon.setAttribute('href', country ? `https://juanvilla.pics/${country.slug}` : 'https://juanvilla.pics/')
}

export default function App() {
  const [active, setActive] = useState(null)
  const [photos, setPhotos] = useState([])
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (!active) { setPhotos([]); return }
    loadPhotos(active.country).then(setPhotos)
  }, [active])

  // Enlaces por galería: abre el país de la URL al cargar, sincroniza con
  // atrás/adelante (popstate) y refleja la URL al abrir/cerrar.
  useEffect(() => {
    const c = countryFromPath()
    if (c) setActive({ id: c.id, country: c })
    applyMeta(c)
    const onPop = () => {
      const c2 = countryFromPath()
      setActive(c2 ? { id: c2.id, country: c2 } : null)
      setLightbox(null)
      applyMeta(c2)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Abrir una galería = navegar a /slug (entra en el historial → "atrás" cierra).
  const navOpen = sel => {
    setActive(sel)
    window.history.pushState({ slug: sel.country.slug }, '', '/' + sel.country.slug)
    applyMeta(sel.country)
  }
  // Cerrar = volver atrás si llegamos abriendo; si se entró directo, ir a la raíz.
  const navClose = () => {
    setLightbox(null)
    if (window.history.state && window.history.state.slug) window.history.back()
    else { setActive(null); window.history.replaceState(null, '', '/'); applyMeta(null) }
  }

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') { if (lightbox) setLightbox(null); else navClose() }
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
        <Passport onSelect={navOpen} />
        <div id="map-wrapper" style={{ flex: 1, position: 'relative', minHeight: '500px', background: 'var(--bg)' }}>
          <WorldMap onSelect={navOpen} />
        </div>
      </div>
      {active && <GalleryModal active={active} photos={photos} onClose={navClose} onOpenLightbox={setLightbox} />}
      {lightbox && <Lightbox lightbox={lightbox} photos={photos} country={active?.country} onClose={() => setLightbox(null)} onPrev={prev} onNext={next} />}
    </div>
  )
}
