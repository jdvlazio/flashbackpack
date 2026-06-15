# FLASHBACKPACK — juanvilla.pics

Portafolio de fotografía de viaje de Juan David Villa: mapa-mundi interactivo + "pasaporte" de países, con galería por país (fotos servidas desde Cloudinary).

## Estado del repositorio

- **`main`** → versión **en producción** (`juanvilla.pics`). Sitio **estático** (`Web/index.html`), una sola página, React + MapLibre por CDN. Las URLs de fotos están en el objeto `REAL_PHOTOS`.
- **`legacy-v3`** (+ tag `v3-netlify`) → arquitectura **dinámica** anterior: backend en Netlify (`netlify/functions/photos.js`) que autodescubre las fotos de cada carpeta de Cloudinary por API. **No está desplegada**; se conserva como referencia para recuperar la carga dinámica.

## Despliegue

`juanvilla.pics` se sirve a través de **Cloudflare**. Este repositorio **no** dispara despliegues automáticos (sin webhooks ni deployments): la publicación es manual.

## Hoja de ruta (en curso)

Refactor a proyecto estructurado con **Vite**, recuperando la carga **dinámica** de fotos, y corrigiendo los defectos de UX/UI conocidos (mapa que no llena su contenedor, flash de estilo al cargar, orden en móvil). Cada paso se construye, se verifica de forma objetiva y se audita de forma independiente antes de consolidar.
