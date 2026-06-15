// Inserta una transformación de Cloudinary ENTRE `/upload/` y el resto de la URL.
// Las URLs vienen como `.../upload/q_auto,f_auto/<public_id>`; al insertar
// `w_600,c_limit` quedan como `.../upload/w_600,c_limit/q_auto,f_auto/<id>`
// (transformación encadenada válida). `c_limit` evita reescalar hacia arriba.
// No toca el public_id (que puede llevar acentos), solo el prefijo.
// IMPORTANTE: pasar SIEMPRE la URL base de Cloudinary, no una ya transformada
// (insertaría un segundo segmento y degradaría la calidad). No es idempotente.
export function cloudinary(url, transform) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}
