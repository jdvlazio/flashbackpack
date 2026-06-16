// Convierte un emoji de bandera (indicadores regionales) a código ISO alpha-2
// (el nombre de archivo de flag-icons). Inglaterra (🏴 + etiquetas) -> "gb-eng".
export function flagToAlpha2(emoji) {
  const cps = [...emoji].map(c => c.codePointAt(0))
  if (cps.includes(0x1F3F4)) return 'gb-eng' // bandera negra + tags (Inglaterra)
  const ri = cps.filter(cp => cp >= 0x1F1E6 && cp <= 0x1F1FF)
  if (ri.length === 2) return ri.map(cp => String.fromCharCode(cp - 0x1F1E6 + 97)).join('')
  return 'xx'
}
