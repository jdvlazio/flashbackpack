import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css' // Inter auto-hospedada (sin depender de Google Fonts)
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
