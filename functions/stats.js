// Cloudflare Pages Function — GET /stats
// Devuelve el total REAL de fotos en Cloudinary (cuenta todas las imágenes,
// paginando). Así el contador del encabezado refleja lo que de verdad hay.
// Credenciales en variables de entorno (igual que /photos); nunca al cliente.
export async function onRequestGet(context) {
  const { env } = context
  const cloud = env.CLOUDINARY_CLOUD || 'deb88gq1x'
  const key = env.CLOUDINARY_KEY
  const secret = env.CLOUDINARY_SECRET
  if (!key || !secret) return json({ error: 'missing Cloudinary credentials' }, 500)

  const creds = btoa(`${key}:${secret}`)
  try {
    let total = 0, cursor = null, pages = 0
    do {
      const u = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/image`)
      u.searchParams.set('max_results', '500')
      if (cursor) u.searchParams.set('next_cursor', cursor)
      const res = await fetch(u, { headers: { Authorization: `Basic ${creds}` } })
      const data = await res.json()
      if (data.error) return json({ error: data.error.message || 'cloudinary error' }, 502)
      total += (data.resources || []).length
      cursor = data.next_cursor
      pages++
    } while (cursor && pages < 8) // tope de seguridad (8×500 = 4000)
    // Cache 1h: el conteo no cambia a menudo.
    return json({ photos: total }, 200, { 'Cache-Control': 'public, max-age=3600' })
  } catch (e) {
    return json({ error: String(e) }, 502)
  }
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra },
  })
}
