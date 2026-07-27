import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function initTelegramApp() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = (window as any)?.Telegram?.WebApp
  if (tg) {
    tg.ready()
    if (!tg.isExpanded) tg.expand()
    if (!tg.isFullscreen) {
      try { tg.requestFullscreen() } catch (_) { /* not supported on all clients */ }
    }
  }
}

// Ждём полной загрузки DOM — telegram-web-app.js гарантированно выполнится
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTelegramApp)
} else {
  initTelegramApp()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
