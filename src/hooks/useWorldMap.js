import { useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { VISITED, A3_TO_NUM } from '../data/countries.js'

// Lógica del mapa MapLibre portada VERBATIM del baseline (Web/index.html, líneas 182-290).
// Recolorea el estilo demotiles (CDN runtime) sobre la propiedad ADM0_A3.
// `onSelect({id, country})` reemplaza la llamada directa a setActive del baseline.
export function useWorldMap(wrapRef, onSelect) {
  useEffect(() => {
    if (!wrapRef.current) return

    const VISITED_A3 = new Set(Object.keys(A3_TO_NUM))

    const map = new maplibregl.Map({
      container: wrapRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [15, 10], zoom: 1.3, minZoom: 1, maxZoom: 18,
      attributionControl: false,
    })

    // Controles: zoom + / - y reset
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")

    // Botón de reset
    const resetBtn = document.createElement("button")
    resetBtn.innerHTML = "⟳"
    resetBtn.title = "Restaurar vista"
    resetBtn.style.cssText = "position:absolute;top:80px;right:10px;z-index:10;background:rgba(6,10,20,0.85);border:1px solid rgba(205,193,132,0.25);color:#CDC184;border-radius:4px;width:29px;height:29px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;"
    resetBtn.onclick = () => map.flyTo({ center: [15, 20], zoom: 1.4, duration: 600 })
    wrapRef.current.appendChild(resetBtn)

    const tooltip = document.createElement("div")
    tooltip.style.cssText = "position:absolute;background:rgba(6,10,20,0.95);border:1px solid rgba(237,229,221,0.35);border-radius:8px;padding:6px 14px;font-size:13px;color:#EDE5DD;pointer-events:auto;white-space:nowrap;z-index:10;display:none;transform:translateX(-50%) translateY(-130%);cursor:pointer;"
    wrapRef.current.appendChild(tooltip)

    map.on("load", () => {
      // Ocultar TODOS los colores originales de demotiles
      map.setPaintProperty("background", "background-color", "#0a0a0a")
      map.setPaintProperty("coastline", "line-color", "#111111")
      map.setPaintProperty("coastline", "line-blur", 0)
      map.setPaintProperty("geolines", "line-opacity", 0)
      map.setPaintProperty("countries-label", "text-color", "rgba(180,180,190,0.7)")
      if (map.getLayer("geolines-label")) map.setPaintProperty("geolines-label", "text-opacity", 0)
      // Ocultar Crimea (capa especial del estilo con color morado)
      if (map.getLayer("crimea-fill")) map.setLayoutProperty("crimea-fill", "visibility", "none")
      // Labels: negro sobre visitados, gris claro sobre no visitados
      map.setPaintProperty("countries-label", "text-color", ["case", ["in", ["get", "ADM0_A3"], ["literal", ["ESP", "FRA", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]], "rgba(15,10,5,0.95)", "rgba(200,195,190,0.85)"])
      map.setPaintProperty("countries-label", "text-halo-color", ["case", ["in", ["get", "ADM0_A3"], ["literal", ["ESP", "FRA", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]], "rgba(247,226,119,0.5)", "rgba(30,28,18,0.75)"])
      map.setPaintProperty("countries-label", "text-halo-width", 1.5)

      // Recolorear el fill de países del estilo (mismo dataset = alineación perfecta)
      const fillExpr = ["match", ["get", "ADM0_A3"], "FRA", "#e8e8ed", "ESP", "#e8e8ed", "DEU", "#e4e4e9", "CHE", "#e0e0e5", "CZE", "#dcdce1", "DNK", "#ececef", "NOR", "#eaeaef", "SWE", "#e6e6eb", "NLD", "#e2e2e7", "BEL", "#dedee3", "HUN", "#dadade", "AUT", "#e8e2e9", "SVK", "#e4e4e9", "ITA", "#e0e0e5", "VAT", "#dcdce1", "FIN", "#eeeeef", "RUS", "#d8d8dc", "GBR", "#d4d4d8", "PRT", "#dcdce0", "TUR", "#aeaeb2", "CHN", "#aaaaae", "HKG", "#a6a6aa", "VNM", "#a2a2a6", "KHM", "#b2b2b6", "LAO", "#aeaeb2", "THA", "#aaaaae", "KOR", "#a6a6aa", "ISR", "#b6b6ba", "PSE", "#a2a2a6", "IND", "#b0b0b4", "NPL", "#acacb0", "SGP", "#b4b4b8", "TWN", "#aaaab0", "COL", "#8e8e93", "MEX", "#8a8a8f", "ARG", "#86868b", "USA", "#929297", "AUS", "#636366", "#1a1a1a"]

      // Filtrar: solo mostrar países visitados en el fill layer
      map.setFilter("countries-fill", ["in", ["get", "ADM0_A3"], ["literal", ["FRA", "ESP", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]])
      map.setPaintProperty("countries-fill", "fill-color", fillExpr)
      map.setPaintProperty("countries-fill", "fill-opacity", 0.85)
      map.setFilter("countries-boundary", ["in", ["get", "ADM0_A3"], ["literal", ["FRA", "ESP", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]])
      // (filtros reaplicados igual que el baseline)
      map.setFilter("countries-fill", ["in", ["get", "ADM0_A3"], ["literal", ["FRA", "ESP", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]])
      map.setFilter("countries-boundary", ["in", ["get", "ADM0_A3"], ["literal", ["FRA", "ESP", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]])

      // Ocultar territorios de ultramar de Francia con máscara de bboxes
      const overseasPolys = [
        [[-54.6, -4.2], [-51.5, -4.2], [-51.5, 5.8], [-54.6, 5.8], [-54.6, -4.2]], // Guyana Francesa
        [[-61.3, 14.3], [-60.7, 14.3], [-60.7, 14.95], [-61.3, 14.95], [-61.3, 14.3]], // Martinica
        [[-61.9, 15.8], [-60.95, 15.8], [-60.95, 16.55], [-61.9, 16.55], [-61.9, 15.8]], // Guadalupe
        [[55.1, -21.5], [55.9, -21.5], [55.9, -20.8], [55.1, -20.8], [55.1, -21.5]], // Reunión
        [[44.9, -13.1], [45.4, -13.1], [45.4, -12.5], [44.9, -12.5], [44.9, -13.1]]  // Mayotte
      ]
      try {
        map.addSource("om-src", { type: "geojson", data: { type: "FeatureCollection", features: overseasPolys.map(c => ({ type: "Feature", geometry: { type: "Polygon", coordinates: [c] }, properties: {} })) } })
        map.addLayer({ id: "om-mask", type: "fill", source: "om-src", paint: { "fill-color": "#1a1910", "fill-opacity": 1 } })
      } catch (e) { }

      let hovA3 = null
      map.on("mousemove", "countries-fill", e => {
        if (!e.features.length) return
        const a3 = e.features[0].properties.ADM0_A3
        if (!VISITED_A3.has(a3)) { tooltip.style.display = "none"; map.getCanvas().style.cursor = ""; return }
        if (hovA3 !== a3) {
          hovA3 = a3
          map.setPaintProperty("countries-fill", "fill-opacity", ["case", ["==", ["get", "ADM0_A3"], a3], 1.0, ["in", ["get", "ADM0_A3"], ["literal", ["ESP", "FRA", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]], 0.70, 0.0])
        }
        const num = A3_TO_NUM[a3]
        const ctry = VISITED.find(v => v.id === num)
        if (ctry) {
          tooltip.style.display = "block"
          tooltip.style.left = e.point.x + "px"
          tooltip.style.top = e.point.y + "px"
          tooltip.textContent = ctry.flag + " " + ctry.name + " →"
          tooltip.onclick = () => onSelect({ id: num, country: ctry })
          map.getCanvas().style.cursor = "pointer"
        }
      })
      map.on("mouseleave", "countries-fill", () => {
        hovA3 = null
        tooltip.style.display = "none"
        map.getCanvas().style.cursor = ""
        map.setPaintProperty("countries-fill", "fill-opacity", ["case", ["in", ["get", "ADM0_A3"], ["literal", ["ESP", "FRA", "DEU", "CHE", "CZE", "DNK", "NOR", "SWE", "NLD", "BEL", "HUN", "AUT", "SVK", "ITA", "VAT", "FIN", "RUS", "GBR", "PRT", "TUR", "CHN", "HKG", "VNM", "KHM", "LAO", "THA", "KOR", "ISR", "PSE", "IND", "NPL", "SGP", "TWN", "COL", "MEX", "ARG", "USA", "AUS"]]], 0.80, 0.0])
      })
      map.on("click", "countries-fill", e => {
        if (!e.features.length) return
        const a3 = e.features[0].properties.ADM0_A3
        if (!VISITED_A3.has(a3)) return
        const num = A3_TO_NUM[a3]
        const ctry = VISITED.find(v => v.id === num)
        if (ctry) onSelect({ id: num, country: ctry })
      })
    })

    return () => map.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
