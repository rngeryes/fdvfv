import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Telegram Web App init
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        requestFullscreen: () => void
        isExpanded: boolean
        isFullscreen: boolean
      }
    }
  }
}

// Enable fullscreen for Telegram Mini App
function initTelegramApp() {
  if (typeof window.Telegram?.WebApp !== 'undefined') {
    const { WebApp } = window.Telegram
    WebApp.ready()
    if (!WebApp.isExpanded) {
      WebApp.expand()
    }
    if (!WebApp.isFullscreen) {
      WebApp.requestFullscreen()
    }
    console.log('Telegram Mini App initialized')
  } else {
    console.warn('Telegram WebApp SDK not loaded – running in browser mode')
  }
}

// Call initialization before React
initTelegramApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
