// Convierte una bandera emoji (indicadores regionales) a código ISO alpha-2
// en minúsculas, p.ej. "🇪🇸" -> "es". Inglaterra usa un emoji de subdivisión
// (no indicadores regionales) -> se mapea a "gb-eng" (flag-icons).
export function flagToAlpha2(emoji) {
  const cp = [...emoji].map(c => c.codePointAt(0))
  if (cp.length === 2 && cp[0] >= 0x1f1e6 && cp[0] <= 0x1f1ff && cp[1] >= 0x1f1e6 && cp[1] <= 0x1f1ff) {
    return String.fromCharCode(cp[0] - 0x1f1e6 + 97) + String.fromCharCode(cp[1] - 0x1f1e6 + 97)
  }
  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 (Inglaterra) y otros con etiquetas de subdivisión
  return 'gb-eng'
}
