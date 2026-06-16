// Genera public/countries.svg.json: países proyectados a paths SVG (Mercator).
// Uso: node scripts/build-geo.mjs   (requiere red para el dataset)
import { feature } from 'topojson-client'
import { geoMercator, geoPath } from 'd3-geo'
import { writeFileSync, mkdirSync } from 'fs'
import { createRequire } from 'module'
const worldCountries = createRequire(import.meta.url)('world-countries')

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
const countries = features
  .map(f => ({ iso: f.properties.iso, name: f.properties.name, cont: CONT_BY_ISO[f.properties.iso] || 'xx', d: toPath(f) }))
  .filter(c => c.d)
mkdirSync('public', { recursive: true })
writeFileSync('public/countries.svg.json', JSON.stringify({ width: W, height: H, countries }))

console.log(`OK · ${countries.length} paths`)
