import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Sin StrictMode: el modo Rogue usa un generador con semilla y la doble
// invocación de desarrollo alteraría la reproducibilidad de las partidas.
createRoot(document.getElementById('root')).render(<App />)
