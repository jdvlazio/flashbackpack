// Genera public/countries.geo.json (mapa autocontenido) desde world-atlas.
// Uso: node scripts/build-geo.mjs
// Requiere: devDependency `topojson-client` y red para descargar el dataset.
import { feature } from 'topojson-client'
import { writeFileSync } from 'fs'

const SRC = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const OUT = 'public/countries.geo.json'

// Corrige el cruce del antimeridiano (Rusia, Fiji, USA/Alaska): evita que un
// anillo "salte" >180° de longitud, lo que pintaría una banda a lo ancho del mapa.
const fixRing = ring => {
  for (let i = 1; i < ring.length; i++) {
    const d = ring[i][0] - ring[i - 1][0]
    if (d > 180) ring[i][0] -= 360
    else if (d < -180) ring[i][0] += 360
  }
  return ring
}
const fixCoords = (type, coords) =>
  type === 'Polygon' ? coords.map(fixRing)
  : type === 'MultiPolygon' ? coords.map(p => p.map(fixRing))
  : coords

const topo = await (await fetch(SRC)).json()
const geo = feature(topo, topo.objects.countries)
geo.features.forEach(f => {
  // ISO 3166-1 numérico, 3 dígitos. Algunos territorios disputados (Kosovo,
  // Chipre del Norte, Somalilandia) no tienen ISO en el dataset: iso = null
  // (se pintan como tierra, nunca se resaltan) en vez del literal "undefined".
  const id = f.id == null ? null : String(f.id).padStart(3, '0')
  f.id = id
  f.properties = { ...(f.properties || {}), iso: id }
  if (f.geometry) f.geometry.coordinates = fixCoords(f.geometry.type, f.geometry.coordinates)
})
writeFileSync(OUT, JSON.stringify(geo))
console.log(`OK · ${geo.features.length} países · ${OUT}`)
