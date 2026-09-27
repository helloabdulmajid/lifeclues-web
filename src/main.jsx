import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA service worker. Only built into production builds (see vite.config.js),
// and registered with a strategy that never reloads the page, so an update can
// never interrupt a memory being written. LifeClues works fine without it.
registerSW({
  immediate: true,
  onRegisterError() {
    /* ignore — the app runs without a service worker */
  },
})
