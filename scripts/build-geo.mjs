// Genera public/countries.svg.json: países proyectados a paths SVG (Mercator).
// Uso: node scripts/build-geo.mjs   (requiere red para el dataset)
import { feature } from 'topojson-client'
import { geoMercator, geoPath } from 'd3-geo'
import { writeFileSync, readFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { createRequire } from 'module'
import { VISITED } from '../src/data/countries.js'
import { flagToAlpha2 } from '../src/lib/flags.js'
const require = createRequire(import.meta.url)
const worldCountries = require('world-countries')
const _polylabel = require('polylabel')
const polylabel = _polylabel.default || _polylabel

// ISO numérico -> clave de continente (para colorear la tierra por continente).
const REGION_KEY = { Europe: 'eu', Asia: 'as', Americas: 'am', Africa: 'af', Oceania: 'oc' }
const CONT_BY_ISO = {}
worldCountries.forEach(c => { if (c.ccn3) CONT_BY_ISO[c.ccn3] = REGION_KEY[c.region] || 'xx' })

const SRC = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Recorte de ultramar de Francia: conservar solo metropolitana + Córcega
// (los países son los que son, no colonizaciones).
const inMetroFR = pt => pt[0] >= -6 && pt[0] <= 10 && pt[1] >= 41 && pt[1] <= 52

const topo = await (await fetch(SRC)).json()
const geo = feature(topo, topo.objects.countries)
geo.features.forEach(f => {
  const id = f.id == null ? null : String(f.id).padStart(3, '0')
  f.id = id
  f.properties = { ...(f.properties || {}), iso: id }
  if (id === '250' && f.geometry && f.geometry.type === 'MultiPolygon') {
    f.geometry.coordinates = f.geometry.coordinates.filter(poly => inMetroFR(poly[0][0]))
  }
})

// Proyección MERCATOR (plana, todo en una vista; las banderas encajan mejor).
// Excluimos la Antártida (010): en Mercator se deforma enorme y no es visitada.
// d3-geo recorta el antimeridiano por sí solo (Rusia/Fiji/USA bien).
const features = geo.features.filter(f => f.properties.iso !== '010')
const fc = { type: 'FeatureCollection', features }
const W = 1000
const projection = geoMercator().fitWidth(W, fc)
let toPath = geoPath(projection)
// Encuadre vertical ajustado: trasladar para que el contenido empiece en y=0.
const [[x0, y0], [, y1]] = toPath.bounds(fc)
const tr = projection.translate()
projection.translate([tr[0] - x0, tr[1] - y0])
toPath = geoPath(projection)
const H = Math.ceil(y1 - y0)
const VISITED_IDS = new Set(VISITED.map(v => v.id))
const r = n => Math.round(n * 10) / 10

// Colocación del pin = CENTRO VISUAL (polylabel) del polígono MÁS GRANDE del
// país, proyectado. Garantiza un punto DENTRO de la tierra; el centroide
// ponderado por área falla con islas lejanas o formas cóncavas (Noruega con
// Svalbard, USA con Alaska/Hawái, etc.).
const ringArea = ring => { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]; return a / 2 }
const polysOf = f => f.geometry ? (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []) : []
const projectRings = poly => poly.map(ring => ring.map(pt => projection(pt)).filter(p => p && isFinite(p[0]) && isFinite(p[1]))).filter(ring => ring.length >= 4)
const largestProjPoly = f => {
  let best = null, bestArea = -1
  for (const poly of polysOf(f)) {
    const proj = projectRings(poly)
    if (proj.length && Math.abs(ringArea(proj[0])) > bestArea) { bestArea = Math.abs(ringArea(proj[0])); best = proj }
  }
  return best
}
const pinPoint = f => {
  const best = largestProjPoly(f)
  if (!best) return null
  const xs = best[0].map(p => p[0])
  if (Math.max(...xs) - Math.min(...xs) > W * 0.6) return null // wrap antimeridiano -> descarta
  const p = polylabel(best, 1)
  return [r(p[0]), r(p[1])]
}
const inRing = (pt, ring) => { const [x, y] = pt; let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside } return inside }
const inCountry = (pt, f) => polysOf(f).some(poly => { const proj = projectRings(poly); return proj[0] && inRing(pt, proj[0]) })

const countries = features
  .map(f => {
    const c = { iso: f.properties.iso, name: f.properties.name, cont: CONT_BY_ISO[f.properties.iso] || 'xx', d: toPath(f) }
    if (VISITED_IDS.has(f.properties.iso)) {
      let pp = pinPoint(f)
      if (!pp) { const [cx, cy] = toPath.centroid(f); if (cx === cx) pp = [r(cx), r(cy)] } // fallback
      if (pp) c.cen = pp
    }
    return c
  })
  .filter(c => c.d)

// Microestados ausentes del dataset 110m (su polígono sería sub-píxel a escala
// mundial). Se colocan por coordenada real (lon, lat) y se emiten como pines
// CLICABLES aparte (no tienen polígono debajo que reciba el clic).
const MICRO = { '336': [12.4534, 41.9029], '344': [114.1694, 22.3193], '702': [103.8198, 1.3521] }
const presentIds = new Set(countries.map(c => c.iso))
const micros = Object.entries(MICRO)
  .filter(([iso]) => VISITED_IDS.has(iso) && !presentIds.has(iso))
  .map(([iso, ll]) => { const p = projection(ll); return { iso, name: (VISITED.find(v => v.id === iso) || {}).name, cen: [r(p[0]), r(p[1])] } })
  .filter(m => m.cen[0] === m.cen[0])

// AUDITORÍA: cada pin de país debe caer DENTRO de su país (test punto-en-polígono).
const featByIso = {}; features.forEach(f => { featByIso[f.properties.iso] = f })
const withPin = countries.filter(c => c.cen)
const outside = withPin.filter(c => !inCountry(c.cen, featByIso[c.iso]))
const stillAbsent = [...VISITED_IDS].filter(id => !presentIds.has(id) && !micros.some(m => m.iso === id))
console.log(`AUDIT · pines país ${withPin.length} · DENTRO ${withPin.length - outside.length} · FUERA ${outside.length}` + (outside.length ? ': ' + outside.map(c => c.name).join(', ') : ''))
console.log(`AUDIT · microestados (pin por coordenada): ${micros.map(m => m.name).join(', ') || 'ninguno'}` + (stillAbsent.length ? ` · SIN PIN: ${stillAbsent.join(', ')}` : ''))

mkdirSync('public', { recursive: true })
writeFileSync('public/countries.svg.json', JSON.stringify({ width: W, height: H, countries, micros }))

// Copiar banderas (4x3) de los países visitados a public/flags/ (para los pines)
mkdirSync('public/flags', { recursive: true })
let copied = 0, missing = []
for (const code of new Set(VISITED.map(v => flagToAlpha2(v.flag)))) {
  const src = `node_modules/flag-icons/flags/4x3/${code}.svg`
  if (!existsSync(src)) { missing.push(code); continue }
  if (code === 'np') {
    // Nepal: única bandera no rectangular. Recortamos el viewBox al banderín
    // (fondo transparente) para mostrar su forma real sin caja ni recorte.
    writeFileSync('public/flags/np.svg', readFileSync(src, 'utf8').replace('viewBox="0 0 640 480"', 'viewBox="0 0 380 480"'))
  } else copyFileSync(src, `public/flags/${code}.svg`)
  copied++
}
console.log(`OK · ${countries.length} paths · ${copied} banderas` + (missing.length ? ` · faltan: ${missing.join(',')}` : ''))
