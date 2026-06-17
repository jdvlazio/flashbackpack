// Cloudflare Pages Function — GET /photos?folder=<nombre de país>
// Lista en tiempo real las fotos de una carpeta (asset_folder) de Cloudinary,
// para que al subir fotos nuevas aparezcan solas sin tocar código.
// Las credenciales viven en variables de entorno del proyecto Pages
// (CLOUDINARY_KEY / CLOUDINARY_SECRET) y NUNCA llegan al navegador:
// esta función corre en el servidor (edge) y solo devuelve URLs de imagen.
export async function onRequestGet(context) {
  const { request, env } = context
  const folder = new URL(request.url).searchParams.get('folder')
  const cloud = env.CLOUDINARY_CLOUD || 'deb88gq1x'
  const key = env.CLOUDINARY_KEY
  const secret = env.CLOUDINARY_SECRET

  if (!folder) return json({ error: 'folder required' }, 400)
  if (!key || !secret) return json({ error: 'missing Cloudinary credentials' }, 500)

  const creds = btoa(`${key}:${secret}`)
  const api = `https://api.cloudinary.com/v1_1/${cloud}/resources/by_asset_folder`
    + `?asset_folder=${encodeURIComponent(folder)}&max_results=200`

  try {
    const res = await fetch(api, { headers: { Authorization: `Basic ${creds}` } })
    const data = await res.json()
    if (data.error) return json({ error: data.error.message || 'cloudinary error' }, 502)
    // Cada foto: url + ancho/alto reales (para justificar la galería sin saltos).
    const photos = (data.resources || [])
      .sort((a, b) => String(a.public_id).localeCompare(String(b.public_id)))
      .map(r => ({ u: `https://res.cloudinary.com/${cloud}/image/upload/q_auto,f_auto/${r.public_id}`, w: r.width, h: r.height }))
    // Cache 10 min en el edge: equilibra "aparecen solas" con no llamar a la API en cada visita.
    return json({ folder, total: photos.length, photos, urls: photos.map(p => p.u) }, 200, { 'Cache-Control': 'public, max-age=600' })
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
