import { PROFILE } from '../data/countries.js'

const word = { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }

export default function Header() {
  return (
    <header style={{ padding: '2rem 2rem 1.2rem', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
        <span style={{ ...word, color: 'var(--fg)' }}>FLASH</span>
        <span style={{ ...word, color: 'var(--wordmark-back)' }}>BACK</span>
        <span style={{ ...word, color: 'var(--fg)' }}>PACK</span>
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 400, color: 'var(--c-dim)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0 }}>
        {PROFILE.name}
      </p>
    </header>
  )
}
