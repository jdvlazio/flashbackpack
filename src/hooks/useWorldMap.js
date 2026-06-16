import { useEffect } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { VISITED } from '../data/countries.js'
import { COUNTRY_FILL, VISITED_IDS } from '../data/mapColors.js'

// Mapa AUTOCONTENIDO: dibuja los países desde un GeoJSON propio (servido por
// nuestro hosting, public/countries.geo.json) con un estilo MapLibre mínimo e
// inline. Sin dependencias externas en runtime. `onSelect({id, country})` abre
// la galería del país.
// MapLibre (~1MB) se carga con import DINÁMICO: va en su propio chunk y se
// descarga después del shell (header/stats/pasaporte), para que la página sea
// usable antes. El GeoJSON se pide en paralelo.
export function useWorldMap(wrapRef, onSelect) {
  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    let map, ro, resetBtn, tooltip
    let cancelled = false

    // Anti-FOUC: oculto hasta tener los países dibujados; revelado con fundido.
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.45s ease'

    // Fetch del GeoJSON en paralelo con la carga diferida de MapLibre.
    const geoPromise = fetch(`${import.meta.env.BASE_URL}countries.geo.json`).then(r => r.json())

    ;(async () => {
      const maplibregl = (await import('maplibre-gl')).default
      if (cancelled || !wrapRef.current) return

      map = new maplibregl.Map({
        container: el,
        style: {
          version: 8,
          sources: {},
          layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0a0a0a' } }],
        },
        center: [15, 10], zoom: 1.3, minZoom: 1, maxZoom: 6,
        attributionControl: false,
      })

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

      resetBtn = document.createElement('button')
      resetBtn.innerHTML = '⟳'
      resetBtn.title = 'Restaurar vista'
      resetBtn.style.cssText = 'position:absolute;top:80px;right:10px;z-index:10;background:rgba(6,10,20,0.85);border:1px solid rgba(205,193,132,0.25);color:#CDC184;border-radius:4px;width:29px;height:29px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;'
      resetBtn.onclick = () => map.flyTo({ center: [15, 20], zoom: 1.4, duration: 600 })
      el.appendChild(resetBtn)

      tooltip = document.createElement('div')
      tooltip.style.cssText = 'position:absolute;background:rgba(6,10,20,0.95);border:1px solid rgba(237,229,221,0.35);border-radius:8px;padding:6px 14px;font-size:13px;color:#EDE5DD;pointer-events:auto;white-space:nowrap;z-index:10;display:none;transform:translateX(-50%) translateY(-130%);cursor:pointer;'
      el.appendChild(tooltip)

      ro = new ResizeObserver(() => map.resize())
      ro.observe(el)

      // Aplica los datos cuando el estilo (inline) esté listo. No depende de
      // 'load' (que puede no dispararse si el contenedor mide 0 al inicio).
      const applyData = geo => {
        if (cancelled || !map) return
        if (!map.isStyleLoaded()) { map.once('styledata', () => applyData(geo)); return }
        if (map.getSource('countries')) return

        map.addSource('countries', { type: 'geojson', data: geo, promoteId: 'iso' })

        // Base: todos los países en gris muy oscuro (tierra vs océano) + borde tenue.
        map.addLayer({ id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#16161a' } })
        map.addLayer({ id: 'land-border', type: 'line', source: 'countries', paint: { 'line-color': '#26262c', 'line-width': 0.5 } })

        // Visitados: relleno gris por país (mismos valores que el baseline).
        const fillExpr = ['match', ['get', 'iso'], ...Object.entries(COUNTRY_FILL).flatMap(([id, hex]) => [id, hex]), '#16161a']
        map.addLayer({
          id: 'visited-fill', type: 'fill', source: 'countries',
          filter: ['in', ['get', 'iso'], ['literal', VISITED_IDS]],
          paint: { 'fill-color': fillExpr, 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1.0, 0.85] },
        })
        map.addLayer({
          id: 'visited-border', type: 'line', source: 'countries',
          filter: ['in', ['get', 'iso'], ['literal', VISITED_IDS]],
          paint: { 'line-color': '#f5f5f7', 'line-width': 0.5, 'line-opacity': 0.3 },
        })

        let hovered = null
        map.on('mousemove', 'visited-fill', e => {
          if (!e.features.length) return
          const iso = e.features[0].properties.iso
          if (hovered !== iso) {
            if (hovered !== null) map.setFeatureState({ source: 'countries', id: hovered }, { hover: false })
            hovered = iso
            map.setFeatureState({ source: 'countries', id: iso }, { hover: true })
          }
          const ctry = VISITED.find(v => v.id === iso)
          if (ctry) {
            tooltip.style.display = 'block'
            tooltip.style.left = e.point.x + 'px'
            tooltip.style.top = e.point.y + 'px'
            tooltip.textContent = ctry.flag + ' ' + ctry.name + ' →'
            tooltip.onclick = () => onSelect({ id: iso, country: ctry })
            map.getCanvas().style.cursor = 'pointer'
          }
        })
        map.on('mouseleave', 'visited-fill', () => {
          if (hovered !== null) map.setFeatureState({ source: 'countries', id: hovered }, { hover: false })
          hovered = null
          tooltip.style.display = 'none'
          map.getCanvas().style.cursor = ''
        })
        map.on('click', 'visited-fill', e => {
          if (!e.features.length) return
          const iso = e.features[0].properties.iso
          const ctry = VISITED.find(v => v.id === iso)
          if (ctry) onSelect({ id: iso, country: ctry })
        })

        map.resize()
        requestAnimationFrame(() => { el.style.opacity = '1' })
      }

      geoPromise.then(geo => { if (!cancelled) applyData(geo) }).catch(() => { el.style.opacity = '1' })
    })()

    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      if (resetBtn) resetBtn.remove()
      if (tooltip) tooltip.remove()
      if (map) map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
