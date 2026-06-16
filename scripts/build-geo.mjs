// Genera public/countries.svg.json: países proyectados a paths SVG (Natural
// Earth) + copia las banderas de los países visitados a public/flags/.
// Uso: node scripts/build-geo.mjs   (requiere red para el dataset)
import { feature } from 'topojson-client'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { VISITED } from '../src/data/countries.js'
import { flagToAlpha2 } from '../src/lib/flags.js'

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

// Proyección a un viewBox fijo; el SVG escala responsivo vía viewBox.
// d3-geo recorta el antimeridiano por sí solo (Rusia/Fiji/USA bien).
const W = 1000, H = 500
const projection = geoNaturalEarth1().fitSize([W, H], geo)
const toPath = geoPath(projection)
const countries = geo.features
  .map(f => ({ iso: f.properties.iso, name: f.properties.name, d: toPath(f) }))
  .filter(c => c.d)
mkdirSync('public', { recursive: true })
writeFileSync('public/countries.svg.json', JSON.stringify({ width: W, height: H, countries }))

// Copiar banderas (4x3) de los países visitados a public/flags/
mkdirSync('public/flags', { recursive: true })
const codes = new Set(VISITED.map(v => flagToAlpha2(v.flag)))
let copied = 0, missing = []
for (const code of codes) {
  const src = `node_modules/flag-icons/flags/4x3/${code}.svg`
  if (existsSync(src)) { copyFileSync(src, `public/flags/${code}.svg`); copied++ }
  else missing.push(code)
}
console.log(`OK · ${countries.length} paths · ${copied} banderas` + (missing.length ? ` · faltan: ${missing.join(',')}` : ''))
