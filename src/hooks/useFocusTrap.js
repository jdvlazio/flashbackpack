import { useEffect } from 'react'

// Atrapa el foco dentro de `ref` mientras está montado (los modales solo se
// montan cuando están abiertos). Al montar: guarda el foco previo y mueve el
// foco al primer elemento focusable. Al desmontar: restaura el foco previo.
// Tab/Shift+Tab hacen ciclo dentro del contenedor.
const SELECTOR = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref) {
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const prevFocused = document.activeElement

    const focusables = () => [...node.querySelectorAll(SELECTOR)].filter(el => el.offsetParent !== null)
    const first = focusables()[0]
    ;(first || node).focus()

    const onKey = e => {
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) { e.preventDefault(); return }
      const a = f[0], z = f[f.length - 1]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    node.addEventListener('keydown', onKey)

    return () => {
      node.removeEventListener('keydown', onKey)
      if (prevFocused && typeof prevFocused.focus === 'function') prevFocused.focus()
    }
  }, [ref])
}
