# Runbook de cutover — juanvilla.pics

Cómo publicar el nuevo build Vite reemplazando el `index.html` estático actual.
Producción se sirve vía **Cloudflare**, **subida manual** (sin auto-deploy desde el repo).

> Recomendación del Tech Lead: hacer primero un **ensayo en staging** (subdominio/preview de Cloudflare, NO `juanvilla.pics`) para validar la cadena de publicación cuando equivocarse cuesta cero. Luego el cutover real.

## 0. Pre-requisitos
- `npm install` hecho, rama `main` al día.

## 1. Build
```bash
npm run build
```
Genera `dist/` con `index.html` + `assets/` (JS/CSS con hash). `vite.config.js` usa `base:'./'` → **rutas relativas**.

## 2. Verificación local del build (no del dev server)
```bash
npm run preview   # sirve el dist/ real
```
Comprobar contra `baseline-reference/snapshot.json`:
- Título, wordmark tricolor (FLASH / BACK gris / PACK), stats "38 países · 4 continentes · 800 fotos".
- 38 países en el pasaporte, 4 continentes en orden.
- Mapa: oscuro, recoloreado, **llena el contenedor**, **sin flash de color** al cargar.
- Galería abre, fotos cargan (Cloudinary), lightbox navega, Escape cierra.
- Consola sin errores.
- Móvil (≤768px): el mapa aparece **arriba**, el pasaporte debajo.

## 3. Cutover (subida a Cloudflare)
⚠️ **Subir el CONTENIDO de `dist/` a la raíz del sitio**, NO la carpeta `dist/`.
El `index.html` debe quedar en `/index.html`, y los assets en `/assets/...`.
Si el HTML queda en `/dist/index.html`, los assets relativos se rompen (error #1 de cutovers manuales).

Tras subir:
1. **Purgar la caché de Cloudflare** (el `index.html` viejo cacheado en el edge puede apuntar a assets que ya no existen → página rota intermitente).
2. Idealmente configurar cache headers: HTML `Cache-Control` corto (p.ej. `no-cache`), `assets/*` (con hash) caché larga.

## 4. Verificación en producción
Repetir los checks del paso 2 directamente en `https://juanvilla.pics` (mejor en una ventana de incógnito para evitar caché local).

## 5. Rollback (objetivo: < 2 min)
- El `index.html` estático anterior está versionado en `Web/index.html` (y en la rama/historial). Tener además una copia descargada del que está vivo hoy, por si difiere.
- Revertir = volver a subir ese `index.html` a la raíz + **purgar caché** de nuevo.

## Después del primer cutover exitoso (no antes)
- **Conectar Cloudflare Pages → repo** (deploy desde `main`) para eliminar la deriva repo↔producción de raíz. (Mientras sea manual, cada subida es una oportunidad de desincronizar — ya pasó una vez.)
- **Self-host del estilo/tiles del mapa** (`demotiles.maplibre.org` es un servicio *demo* sin SLA del que depende el recoloreo) y de la fuente Inter.
- Retomar **fotos dinámicas** (autodescubrir Cloudinary) cuando estén las credenciales y la estructura de carpetas confirmada.

## Deudas conocidas a vigilar
- Bundle JS ~995KB (maplibre dentro) — candidato a code-split / carga diferida del mapa.
- `demotiles` y sus nombres de capa (`countries-fill`, `countries-label`, `ADM0_A3`…) son load-bearing: si MapLibre cambia el estilo, el recoloreo se rompe en silencio.
