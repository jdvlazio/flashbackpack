// Cloudflare Pages Function — GET /stats
// Devuelve el total REAL de fotos en Cloudinary. Antes paginaba TODOS los
// recursos (varias llamadas secuenciales → ~3s) y no se cacheaba. Ahora:
//  - 1 sola llamada a la Search API (devuelve total_count directamente)
//  - se cachea en el borde (Cache API) → respuestas siguientes casi instantáneas
// Credenciales en variables de entorno; nunca llegan al cliente.
export async function onRequestGet(context) {
  const { request, env } = context
  const cache = caches.default
  const cacheKey = new Request(new URL('/stats', request.url).toString(), { method: 'GET' })

  const hit = await cache.match(cacheKey)
  if (hit) return hit

  const cloud = env.CLOUDINARY_CLOUD || 'deb88gq1x'
  const key = env.CLOUDINARY_KEY
  const secret = env.CLOUDINARY_SECRET
  if (!key || !secret) return json({ error: 'missing Cloudinary credentials' }, 500)

  const creds = btoa(`${key}:${secret}`)
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/search`, {
      method: 'POST',
      headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: 'resource_type:image', max_results: 1 }),
    })
    const data = await res.json()
    if (data.error) return json({ error: data.error.message || 'cloudinary error' }, 502)
    // Cache 10 min: rápido para las visitas, y refleja fotos nuevas en poco tiempo.
    const resp = json({ photos: data.total_count || 0 }, 200, { 'Cache-Control': 'public, max-age=600' })
    context.waitUntil(cache.put(cacheKey, resp.clone()))
    return resp
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
