import { useState } from 'react'
import { cloudinary } from '../lib/cloudinary.js'

// Foto de galería: entra con BLUR-UP (un mini-borroso de Cloudinary de fondo que
// se sustituye por la imagen nítida al cargar) y reserva su PROPORCIÓN para que
// el grid justificado no salte. Si el servidor no da ancho/alto (fallback), se
// mide la proporción natural al cargar. Es un <button> (activable por teclado).
// Si una foto propia falla, marcador neutro — nunca stock ajeno.
export default function Photo({ photo, alt, onClick }) {
  const u = photo.u
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState(false)
  const [ar, setAr] = useState(photo.w && photo.h ? photo.w / photo.h : 1.5)

  // Tamaño en fila justificada: crece según su proporción hasta llenar la fila.
  const flex = { flexGrow: ar, flexBasis: `calc(${ar} * var(--row-h))`, maxWidth: `calc(${ar} * var(--row-h) * 1.5)`, aspectRatio: String(ar) }

  if (err) {
    return <div className="gphoto gphoto-err" style={flex} role="img" aria-label={`${alt} (no disponible)`}>imagen no disponible</div>
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Ampliar: ${alt}`}
      className="gphoto"
      style={{ ...flex, backgroundImage: `url("${cloudinary(u, 'w_40,e_blur:800,q_20')}")` }}
    >
      <img
        src={cloudinary(u, 'w_600,c_limit')}
        srcSet={`${cloudinary(u, 'w_400,c_limit')} 400w, ${cloudinary(u, 'w_800,c_limit')} 800w`}
        sizes="(max-width: 768px) 50vw, 360px"
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={e => { setLoaded(true); if (!(photo.w && photo.h) && e.target.naturalWidth) setAr(e.target.naturalWidth / e.target.naturalHeight) }}
        onError={() => setErr(true)}
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </button>
  )
}
