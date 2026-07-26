import { useState, useEffect, useRef, useCallback } from 'react'
import LottiePlayer from 'react-lottie-player/dist/LottiePlayerLight'
import { motion } from 'framer-motion'
import './App.css'

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'profile' | 'gifts' | 'buy'

interface Gift {
  id: number
  name: string
  stars: number
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const GIFTS: Gift[] = [
  { id: 1,  name: 'Plush Pepe',       stars: 1000 },
  { id: 2,  name: 'Party Sparkler',   stars: 320  },
  { id: 3,  name: 'Chill Flame',      stars: 320  },
  { id: 4,  name: 'Cookie Heart',     stars: 280  },
  { id: 5,  name: 'Moon Pendant',     stars: 240  },
  { id: 6,  name: 'Crystal Ball',     stars: 200  },
  { id: 7,  name: 'Voodoo Doll',      stars: 110  },
  { id: 8,  name: 'Vice Cream',       stars: 90   },
  { id: 9,  name: 'Jolly Chimp',      stars: 90   },
  { id: 10, name: 'Snake Box',        stars: 80   },
  { id: 11, name: 'Lunar Snake',      stars: 50   },
  { id: 12, name: 'Loot Bag',         stars: 40   },
  { id: 13, name: 'Pet Snake',        stars: 25   },
  { id: 14, name: 'Instant Ramen',    stars: 25   },
]

// Маппинг подарков к SVG файлам
const GIFT_ICONS: Record<number, string> = {
  1: '/gifts/Pepe.svg',
  2: '/gifts/calendar.svg',
  3: '/gifts/lamp.svg',
  4: '/gifts/heartlocket.svg',
  5: '/gifts/lolipop.svg',
  6: '/gifts/astral.svg',
  7: '/gifts/parfume.svg',
  8: '/gifts/escimo.svg',
  9: '/gifts/durovcap.svg',
  10: '/gifts/nekohelmet.svg',
  11: '/gifts/spicedwine.svg',
  12: '/gifts/lootbag.svg',
  13: '/gifts/peach.svg',
  14: '/gifts/signetring.svg',
}

// ─── Plush Pepe CDN Data ──────────────────────────────────────────────────────
const PEPE_CDN = 'https://cdn.changes.tg/gifts'

// Backdrops for Plush Pepe (subset of nice ones from backdrops.json)
const PEPE_BACKDROPS = [
  { centerColor: '#7dd481', edgeColor: '#3a8c49', patternColor: '#1a5e2a', name: 'Green' },
  { centerColor: '#ca70c6', edgeColor: '#9662d4', patternColor: '#620fb4', name: 'Electric Purple' },
  { centerColor: '#7596f9', edgeColor: '#6862e4', patternColor: '#2828bc', name: 'Neon Blue' },
  { centerColor: '#f9b004', edgeColor: '#e07300', patternColor: '#7a2500', name: 'Golden' },
  { centerColor: '#f97f7f', edgeColor: '#d44040', patternColor: '#8b0000', name: 'Red' },
  { centerColor: '#58b4c8', edgeColor: '#538bc2', patternColor: '#07609b', name: 'Sky Blue' },
  { centerColor: '#363738', edgeColor: '#0e0f0f', patternColor: '#6c6868', name: 'Black' },
  { centerColor: '#b789e4', edgeColor: '#8a5abc', patternColor: '#5b10ab', name: 'Lavender' },
]

// Lottie model names for Plush Pepe
const PEPE_MODELS = [
  'Original',
  'Aqua Plush',
  'Gummy Frog',
  'Emerald Plush',
  'Hothead',
  'Hue Jester',
  'Kung Fu Pepe',
  'Midas Pepe',
  'Sketchy',
  'Yellow Hug',
  'Frozen',
  'Pepemint',
]

// Pattern transforms for backdrop SVG
const PEPE_PATTERN_TRANSFORMS = [
  { opacity: 0.1, tx: 106.08, ty: 29.12, scale: 0.3328 },
  { opacity: 0.1, tx: 309.92, ty: 29.12, scale: 0.3328 },
  { opacity: 0.1, tx: -2.08, ty: 166.4, scale: 0.3328 },
  { opacity: 0.1, tx: 418.08, ty: 166.4, scale: 0.3328 },
  { opacity: 0.1, tx: 208, ty: 395.2, scale: 0.3328 },
  { opacity: 0.15, tx: 208, ty: 37.44, scale: 0.3328 },
  { opacity: 0.15, tx: 38.688, ty: 97.76, scale: 0.3328 },
  { opacity: 0.15, tx: 377.728, ty: 97.76, scale: 0.3328 },
  { opacity: 0.15, tx: 26.208, ty: 270.4, scale: 0.3328 },
  { opacity: 0.15, tx: 389.376, ty: 270.4, scale: 0.3328 },
  { opacity: 0.24, tx: 141.44, ty: 81.12, scale: 0.416 },
  { opacity: 0.24, tx: 272.48, ty: 81.12, scale: 0.416 },
  { opacity: 0.24, tx: 68.64, ty: 201.76, scale: 0.4576 },
  { opacity: 0.24, tx: 346.528, ty: 201.76, scale: 0.4576 },
  { opacity: 0.24, tx: 208, ty: 320.32, scale: 0.3744 },
]

// ─── Lottie Player wrapper (react-lottie-player) ──────────────────────────────
function PepeLottie({
  modelName,
  onReady,
  className,
}: {
  modelName: string
  onReady?: () => void
  className?: string
}) {
  const url = `${PEPE_CDN}/models/Plush%20Pepe/lottie/${encodeURIComponent(modelName)}.json`
  const notified = useRef(false)

  const handleLoad = useCallback(() => {
    if (!notified.current) {
      notified.current = true
      onReady?.()
    }
  }, [onReady])

  return (
    <LottiePlayer
      path={url}
      play
      loop
      className={className}
      style={{ width: '100%', height: '100%' }}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
      onLoad={handleLoad}
    />
  )
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
const CYCLE_MS = 3500

function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const [allReady, setAllReady] = useState(false)
  const total = Math.min(PEPE_BACKDROPS.length, PEPE_MODELS.length)
  const loadedCount = useRef(0)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setIdx(0)
      setAllReady(false)
      loadedCount.current = 0
      // фолбэк — показываем TGS через 4 секунды даже если onLoad не сработал
      const fallback = setTimeout(() => setAllReady(true), 4000)
      return () => clearTimeout(fallback)
    }
  }, [isOpen])

  // Cycle every CYCLE_MS
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => setIdx(i => (i + 1) % total), CYCLE_MS)
    return () => clearInterval(timer)
  }, [isOpen, total])

  const handleTgsReady = useCallback(() => {
    loadedCount.current += 1
    if (loadedCount.current >= total) setAllReady(true)
  }, [total])

  const backdrop = PEPE_BACKDROPS[idx % PEPE_BACKDROPS.length]
  const modelName = PEPE_MODELS[idx % PEPE_MODELS.length]

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-sheet upgrade-modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="upgrade-header">
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ zIndex: 5, position: 'absolute', left: 8, top: 8 }}
          >
            <IconClose />
          </button>

          {/* Фон — плавно меняет цвет через framer-motion animate */}
          <motion.div
            className="upgrade-backdrop"
            animate={{
              background: `radial-gradient(50% 65% at 50% 35%, ${backdrop.centerColor} 0%, ${backdrop.edgeColor} 100%)`,
            }}
            transition={{ duration: CYCLE_MS / 1000 * 0.35, ease: 'easeInOut' }}
          >
            <svg
              width="100%" height="100%"
              viewBox="0 0 416 416"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <filter id="upflt" filterUnits="userSpaceOnUse" x="0" y="0" width="416" height="416">
                  <feFlood floodColor={backdrop.patternColor} />
                  <feComposite in2="SourceGraphic" operator="in" />
                </filter>
                <image id="uppat" x="-50" y="-50" width="100" height="100"
                  href="https://cdn.changes.tg/gifts/models/Plush%20Pepe/png/Original.png"
                  crossOrigin="anonymous"
                />
                <g id="upgrp">
                  {PEPE_PATTERN_TRANSFORMS.map((t, i) => (
                    <g key={i} opacity={t.opacity} transform={`translate(${t.tx}, ${t.ty}) scale(${t.scale})`}>
                      <use href="#uppat" />
                    </g>
                  ))}
                </g>
              </defs>
              <use href="#upgrp" filter="url(#upflt)" />
            </svg>
          </motion.div>

          {/* Все TGS грузятся скрытно; появляются когда все загружены */}
          <div
            className="upgrade-lottie-wrap"
            style={{ opacity: allReady ? 1 : 0, transition: 'opacity 0.5s ease' }}
          >
            {PEPE_MODELS.slice(0, total).map((name, i) => (
              <motion.div
                key={name}
                className="upgrade-lottie-slot"
                animate={{ opacity: i === idx ? 1 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <PepeLottie
                  modelName={name}
                  onReady={handleTgsReady}
                  className="upgrade-lottie"
                />
              </motion.div>
            ))}
          </div>

          {/* Бейдж — плавно меняется без мигания */}
          <motion.div
            key={modelName}
            className="upgrade-model-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {modelName}
          </motion.div>
        </div>

        {/* Title */}
        <h2 className="upgrade-title">Улучшение подарка</h2>
        <p className="upgrade-desc">
          Подарок станет уникальным коллекционным. Его можно будет передать или продать.
        </p>

        {/* Feature list */}
        <div className="upgrade-features">
          <div className="upgrade-feature-row">
            <div className="upgrade-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" fill="none" style={{ color: '#2EA6FF' }}>
                <g transform="translate(0,30) scale(1,-1)">
                  <path d="M 25.1407 18.5892 L 24.5996 18.2027 L 25.1407 18.5892 Z M 25.1020 16.2119 L 25.6302 15.8079 L 25.1020 16.2119 Z M 4.4018 23.5487 L 3.8606 23.9352 L 4.4018 23.5487 Z M 0.8980 16.2119 L 0.3698 15.8079 L 0.8980 16.2119 Z M 14.5887 2.4638 L 14.0605 2.8677 L 14.5887 2.4638 Z M 11.9395 2.8677 L 1.4263 16.6158 L 0.3698 15.8079 L 10.8830 2.0598 L 11.9395 2.8677 Z M 1.4004 18.2027 L 4.9429 23.1622 L 3.8606 23.9352 L 0.3182 18.9758 L 1.4004 18.2027 Z M 6.0292 23.7212 L 19.9708 23.7212 L 19.9708 25.0512 L 6.0292 25.0512 L 6.0292 23.7212 Z M 21.0571 23.1622 L 24.5996 18.2027 L 25.6818 18.9758 L 22.1394 23.9352 L 21.0571 23.1622 Z M 24.5737 16.6158 L 14.0605 2.8677 L 15.1170 2.0598 L 25.6302 15.8079 L 24.5737 16.6158 Z M 24.5996 18.2027 C 24.9405 17.7255 24.9300 17.0817 24.5737 16.6158 L 25.6302 15.8079 C 26.3414 16.7379 26.3623 18.0231 25.6818 18.9758 L 24.5996 18.2027 Z M 19.9708 23.7212 C 20.4019 23.7212 20.8065 23.5130 21.0571 23.1622 L 22.1394 23.9352 C 21.6391 24.6356 20.8314 25.0512 19.9708 25.0512 L 19.9708 23.7212 Z M 4.9429 23.1622 C 5.1935 23.5130 5.5981 23.7212 6.0292 23.7212 L 6.0292 25.0512 C 5.1686 25.0512 4.3609 24.6356 3.8606 23.9352 L 4.9429 23.1622 Z M 1.4263 16.6158 C 1.0700 17.0817 1.0595 17.7255 1.4004 18.2027 L 0.3182 18.9758 C -0.3623 18.0231 -0.3414 16.7379 0.3698 15.8079 L 1.4263 16.6158 Z M 10.8830 2.0598 C 11.9497 0.6650 14.0503 0.6650 15.1170 2.0598 L 14.0605 2.8677 C 13.5261 2.1690 12.4739 2.1690 11.9395 2.8677 L 10.8830 2.0598 Z" transform="matrix(1.000000 0.000000 0.000000 1.000000 2.000000 1.613770)" fill="currentColor" fillRule="nonzero"/>
                  <path d="M 0.0000 0.6651 L 26.0000 0.6651 L 26.0000 1.9951 L 0.0000 1.9951 L 0.0000 0.6651 Z" transform="matrix(1.000000 0.000000 0.000000 1.000000 2.000000 18.009766)" fill="currentColor" fillRule="nonzero"/>
                </g>
              </svg>
            </div>
            <div className="upgrade-feature-text">
              <div className="upgrade-feature-title">Уникальность</div>
              <div className="upgrade-feature-sub">Подарку будут присвоены уникальный номер, модель, фон и узор.</div>
            </div>
          </div>

          <div className="upgrade-feature-row">
            <div className="upgrade-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" fill="none" style={{ color: '#2EA6FF' }}>
                <g transform="translate(0,30) scale(1,-1)">
                  <path d="M -0.6650 1.3301 C -0.6650 0.9628 -0.3673 0.6651 0.0000 0.6651 C 0.3673 0.6651 0.6650 0.9628 0.6650 1.3301 L -0.6650 1.3301 Z M 11.3350 1.3301 C 11.3350 0.9628 11.6327 0.6651 12.0000 0.6651 C 12.3673 0.6651 12.6650 0.9628 12.6650 1.3301 L 11.3350 1.3301 Z M 0.6650 1.3301 L 0.6650 2.3301 L -0.6650 2.3301 L -0.6650 1.3301 L 0.6650 1.3301 Z M 2.0000 3.6651 L 10.0000 3.6651 L 10.0000 4.9951 L 2.0000 4.9951 L 2.0000 3.6651 Z M 11.3350 2.3301 L 11.3350 1.3301 L 12.6650 1.3301 L 12.6650 2.3301 L 11.3350 2.3301 Z M 10.0000 3.6651 C 10.7373 3.6651 11.3350 3.0674 11.3350 2.3301 L 12.6650 2.3301 C 12.6650 3.8019 11.4718 4.9951 10.0000 4.9951 L 10.0000 3.6651 Z M 0.6650 2.3301 C 0.6650 3.0674 1.2627 3.6651 2.0000 3.6651 L 2.0000 4.9951 C 0.5282 4.9951 -0.6650 3.8019 -0.6650 2.3301 L 0.6650 2.3301 Z" transform="matrix(1.000000 0.000000 0.000000 1.000000 3.000000 2.669922)" fill="currentColor" fillRule="nonzero"/>
                  <path d="M 0.0000 1.9951 C -0.3673 1.9951 -0.6650 1.6973 -0.6650 1.3301 C -0.6650 0.9628 -0.3673 0.6651 0.0000 0.6651 L 0.0000 1.9951 Z M 14.0000 0.6651 C 14.3673 0.6651 14.6650 0.9628 14.6650 1.3301 C 14.6650 1.6973 14.3673 1.9951 14.0000 1.9951 L 14.0000 0.6651 Z M 0.0000 0.6651 L 14.0000 0.6651 L 14.0000 1.9951 L 0.0000 1.9951 L 0.0000 0.6651 Z" transform="matrix(1.000000 0.000000 0.000000 1.000000 2.000000 2.669922)" fill="currentColor" fillRule="nonzero"/>
                </g>
              </svg>
            </div>
            <div className="upgrade-feature-text">
              <div className="upgrade-feature-title">Можно продать</div>
              <div className="upgrade-feature-sub">Подарок можно продать или выставить на аукцион на сторонних NFT-площадках.</div>
            </div>
          </div>

          <div className="upgrade-feature-row">
            <div className="upgrade-feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" fill="none" style={{ color: '#2EA6FF' }}>
                <g transform="translate(0,30) scale(1,-1)">
                  <path d="M 0.0000 1.3300 L 0.0000 0.6650 L 15.8333 0.6650 L 15.8333 1.3300 L 15.8333 1.9950 L 0.0000 1.9950 L 0.0000 1.3300 Z" transform="matrix(1.000000 -0.000000 0.000000 -1.000000 7.083313 21.607788)" fill="currentColor" fillRule="nonzero"/>
                </g>
              </svg>
            </div>
            <div className="upgrade-feature-text">
              <div className="upgrade-feature-title">Можно носить</div>
              <div className="upgrade-feature-sub">Подарок можно добавить в профиль и использовать как обложку или статус.</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="upgrade-cta-wrap">
          <button className="upgrade-btn">
            Улучшить
            <span className="upgrade-btn-arrow">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6 13 L12 7.5 L18 13" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 16.5 L12 11 L18 16.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconSettings() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M5 15 V5 a2 2 0 0 1 2-2 h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function IconGift() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 12 H21" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 8 V21" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 8 c-2 -3 3 -5 4 0" stroke="currentColor" strokeWidth="1.6" fill="none"/>
      <path d="M16 8 c2 -3 -3 -5 -4 0" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3.5 L5.5 8 L10 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  )
}

function IconStar({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M8.17 7.475L10.12 3.608C10.344 3.174 10.946 2.98 11.397 3.195C11.573 3.281 11.753 3.445 11.839 3.625L13.691 7.402C13.842 7.711 14.087 7.866 14.422 7.909L18.233 8.364C18.796 8.433 19.196 8.996 19.131 9.529C19.105 9.748 19.007 9.98 18.852 10.135L15.801 13.156C15.677 13.28 15.646 13.422 15.668 13.594L16.162 17.68C16.235 18.269 15.767 18.81 15.187 18.883C14.968 18.909 14.714 18.883 14.516 18.776L11.35 17.031C11.049 16.877 10.838 16.885 10.602 17.01L7.319 18.711C6.846 18.956 6.189 18.763 5.948 18.286C5.858 18.106 5.785 17.916 5.819 17.676L6.073 15.824C6.21 14.823 6.812 13.985 7.628 13.564L11.105 11.755C11.324 11.626 11.337 11.506 11.014 11.548L6.709 12.137C6.013 12.236 5.265 11.987 4.719 11.54L3.224 10.298C2.807 9.971 2.734 9.245 3.087 8.807C3.25 8.605 3.512 8.42 3.766 8.386L7.65 7.883C7.899 7.857 8.062 7.703 8.174 7.475Z" fill="url(#sg)" stroke="none"/>
      <defs>
        <linearGradient id="sg" x1="11" y1="3" x2="11" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB600"/>
          <stop offset="1" stopColor="#ED8200"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Badge (level badge SVG) ──────────────────────────────────────────────────
function LevelBadge({ color = '#2EA6FF' }: { color?: string }) {
  return (
    <span className="level-badge-wrap">
      <span className="level-badge-inner-wrap">
        <svg
          width="72px" height="72px" viewBox="0 0 72 72"
          className="badge-outer"
          style={{ color: 'transparent' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Badge / level1_outer</title>
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <path
              d="M48.5123886,13 C53.7585594,13.0015192 58.1116928,17.0569317 58.4845708,22.2918105 C59.216306,32.6367133 58.6862484,40.5903656 56.7947332,46.2649111 C54.2690969,53.8418199 42.0021357,62.1042926 35.9486315,61.9990662 C30.1753042,61.89871 17.4910652,53.1223062 15.2052668,46.2649111 C13.3137516,40.5903656 12.783694,32.6367133 13.5155689,22.2898424 C13.8883072,17.0569317 18.2414406,13.0015192 23.4887695,13 L48.5123886,13 Z"
              fill="currentColor"
            />
          </g>
        </svg>
        <svg
          width="72px" height="72px" viewBox="0 0 72 72"
          className="badge-inner"
          style={{ color }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Badge / level1_inner</title>
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <path
              d="M53,45 C54.6943359,39.9169922 55.1925159,32.4416725 54.49454,22.5740409 C54.2708931,19.4342396 51.6589867,17.0009114 48.5112305,17 L23.4887695,17 C20.3410133,17.0009114 17.7291069,19.4342396 17.50546,22.5740409 C16.8074841,32.4416725 17.3056641,39.9169922 19,45 C20.9999787,50.9999361 32.8055802,57.9438271 36.0181519,58.0000467 C39.2307237,58.0555136 50.70353,51.8894101 53,45 Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </span>
      <span className="badge-num">1</span>
    </span>
  )
}

// ─── Sparks for price ────────────────────────────────────────────────────────
function PriceSparks() {
  const sparks = [
    { left: '26.922%', bottom: '56.899%', width: '1.5632px', height: '1.5632px', delay: '1.12414s', dx: '-3.794276486690631px', dy: '-6.256526037605882px', dur: '1.797246836738998s' },
    { left: '42.230%', bottom: '16.183%', width: '2.15898px', height: '2.15898px', delay: '1.03965s', dx: '1.386141329589334px', dy: '5.8782074872611005px', dur: '1.964935769606515s' },
    { left: '77.731%', bottom: '43.105%', width: '2.83152px', height: '2.83152px', delay: '0.561425s', dx: '-6.401747480315603px', dy: '-1.6989289440757158px', dur: '1.8108700606005192s' },
    { left: '53.672%', bottom: '6.149%', width: '3.282px', height: '3.282px', delay: '0.747962s', dx: '-0.9834924297768857px', dy: '3.8341002236702444px', dur: '1.8406268786096724s' },
    { left: '40.360%', bottom: '26.836%', width: '2.30464px', height: '2.30464px', delay: '0.5306s', dx: '-1.05170215349456px', dy: '-9.545259211061206px', dur: '2.3351166406377972s' },
    { left: '54.077%', bottom: '93.277%', width: '2.12625px', height: '2.12625px', delay: '1.71103s', dx: '3.805128257074777px', dy: '0.7923020777918062px', dur: '2.322280158115328s' },
    { left: '8.287%', bottom: '74.023%', width: '3.08611px', height: '3.08611px', delay: '0.588791s', dx: '-6.6174329272575605px', dy: '-7.963559036964675px', dur: '2.0726108008700765s' },
    { left: '23.229%', bottom: '18.032%', width: '2.44945px', height: '2.44945px', delay: '1.26055s', dx: '-1.7702253155138366px', dy: '0.9650929457094204px', dur: '2.1927166879211843s' },
    { left: '51.777%', bottom: '84.139%', width: '1.50286px', height: '1.50286px', delay: '0.824498s', dx: '-0.9969911957303177px', dy: '-10.339409399010224px', dur: '1.7157001047144143s' },
    { left: '79.133%', bottom: '21.299%', width: '3.33327px', height: '3.33327px', delay: '0.907053s', dx: '-1.6397338029339132px', dy: '0.9362333792192796px', dur: '1.9731691991321765s' },
    { left: '76.115%', bottom: '72.496%', width: '2.94773px', height: '2.94773px', delay: '1.18866s', dx: '1.9337058972330583px', dy: '-10.208509354450912px', dur: '1.969552063232509s' },
    { left: '32.867%', bottom: '8.937%', width: '3.28123px', height: '3.28123px', delay: '0.827014s', dx: '-6.09200588522447px', dy: '-6.212815708774111px', dur: '2.0019379916693705s' },
    { left: '20.315%', bottom: '10.024%', width: '1.55546px', height: '1.55546px', delay: '0.289842s', dx: '-1.023665081593255px', dy: '-0.6524529224794868px', dur: '2.1725890349246346s' },
    { left: '83.333%', bottom: '19.748%', width: '3.47677px', height: '3.47677px', delay: '1.52019s', dx: '-3.1413580991500165px', dy: '-1.710478397446396px', dur: '1.750348696379623s' },
    { left: '23.193%', bottom: '73.209%', width: '3.02355px', height: '3.02355px', delay: '0.288341s', dx: '-6.843523533832396px', dy: '-0.6559240270789424px', dur: '2.235724298160098s' },
    { left: '65.501%', bottom: '33.518%', width: '2.69469px', height: '2.69469px', delay: '0.0639482s', dx: '4.48498120380986px', dy: '-11.288142005419157px', dur: '2.375337089224828s' },
  ]

  return (
    <span className="gift-price-sparks" aria-hidden="true">
      {sparks.map((s, i) => (
        <span
          key={i}
          className="vg-spark"
          style={{
            left: s.left,
            bottom: s.bottom,
            width: s.width,
            height: s.height,
            animationDelay: s.delay,
            '--dx': s.dx,
            '--dy': s.dy,
            '--dur': s.dur,
          } as React.CSSProperties}
        />
      ))}
    </span>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({
  page,
  onGifts,
  onProfile,
  avatarSrc,
}: {
  page: Page
  onGifts: () => void
  onProfile: () => void
  avatarSrc: string
}) {
  return (
    <div className="bottom-nav">
      <div className="bnav-spacer" />
      <button
        className={`bnav-item${page === 'gifts' ? ' active' : ''}`}
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(10)
          onGifts()
        }}
        onMouseEnter={e => {
          if (page !== 'gifts') (e.currentTarget as HTMLElement).style.color = '#f5f5f5'
        }}
        onMouseLeave={e => {
          if (page !== 'gifts') (e.currentTarget as HTMLElement).style.color = ''
        }}
      >
        <IconGift />
        <span>Подарки</span>
      </button>
      <button
        className="bnav-avatar-btn"
        onClick={onProfile}
        aria-label="Профиль"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f6a8ee, #d854a8 70%)' }}
      >
        <img src={avatarSrc} alt="Avatar" />
      </button>
    </div>
  )
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div 
      className={`modal-overlay${isOpen ? ' open' : ''}`} 
      onClick={onClose}
    >
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><IconClose /></button>
          <span className="modal-title">Рейтинг</span>
        </div>

        <div className="rating-progress-wrap">
          <div className="rating-bubble">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" fill="none">
              <g transform="translate(0,30) scale(1,-1)">
                <path
                  d="M 13.9775 21.9551 C 15.3398 21.9551 16.4443 20.8506 16.4443 19.4883 C 16.4443 19.0698 16.3392 18.6766 16.1547 18.3320 C 15.9962 18.0358 15.9405 17.6792 16.0941 17.3805 L 18.6416 12.4248 C 19.0321 11.6662 20.0663 11.5427 20.6240 12.1885 L 22.8915 14.8162 C 23.0986 15.0562 23.1370 15.3919 23.0730 15.7023 C 23.0400 15.8628 23.0225 16.0289 23.0225 16.1992 C 23.0225 17.5615 24.1270 18.6660 25.4893 18.6660 C 26.8514 18.6658 27.9551 17.5614 27.9551 16.1992 C 27.9549 15.1728 27.3277 14.2952 26.4357 13.9247 C 26.1268 13.7963 25.8580 13.5579 25.7858 13.2313 L 23.1729 1.4160 C 22.9897 0.5891 22.2571 0.0001 21.4102 0.0000 L 6.5469 0.0000 C 5.6998 0.0000 4.9674 0.5890 4.7842 1.4160 L 2.1713 13.2310 C 2.0990 13.5578 1.8300 13.7962 1.5209 13.9245 C 0.6283 14.2948 0.0001 15.1724 0.0000 16.1992 C 0.0000 17.5615 1.1045 18.6660 2.4668 18.6660 C 3.8291 18.6660 4.9336 17.5615 4.9336 16.1992 C 4.9336 16.0292 4.9159 15.8633 4.8826 15.7031 C 4.8180 15.3928 4.8565 15.0572 5.0636 14.8173 L 7.3330 12.1885 C 7.8907 11.5428 8.9250 11.6662 9.3154 12.4248 L 11.8610 17.3783 C 12.0146 17.6772 11.9588 18.0339 11.8004 18.3302 C 11.6158 18.6754 11.5108 19.0695 11.5107 19.4883 C 11.5107 20.8505 12.6154 21.9549 13.9775 21.9551 Z"
                  transform="matrix(1 0 0 1 1.028809 4.934570)"
                  fill="white"
                  fillRule="nonzero"
                />
              </g>
            </svg>
            <span className="rating-bubble-score"><span>0</span><span className="rating-bubble-max"> / 2500</span></span>
            <div className="rating-bubble-tail" />
          </div>
          <div className="rating-bar">
            <div className="rating-bar-fill" style={{ width: '0%' }} />
            <span className="rating-bar-left">Уровень 1</span>
            <span className="rating-bar-right">Уровень 2</span>
          </div>
        </div>

        <p className="rating-desc">
          Рейтинг отражает вашу активность в Virus Game. На него влияют:
        </p>

        <div className="rating-factors">
          <div className="rating-factor">
            <span className="rating-factor-label plus">ПЛЮС</span>
            <div>
              <div className="rating-factor-title">Подарки и профиль</div>
              <div className="rating-factor-sub">100% звёзд, потраченных на покупку и улучшение подарков, номера +888 и фоны профиля.</div>
            </div>
          </div>
          <div className="rating-factor">
            <span className="rating-factor-label plus">ПЛЮС</span>
            <div>
              <div className="rating-factor-title">Маркет</div>
              <div className="rating-factor-sub">100% звёзд, потраченных на покупку подарков у других игроков.</div>
            </div>
          </div>
          <div className="rating-factor">
            <span className="rating-factor-label plus">ПЛЮС</span>
            <div>
              <div className="rating-factor-title">Пополнение баланса</div>
              <div className="rating-factor-sub">100% звёзд, зачисленных при пополнении баланса реальными деньгами.</div>
            </div>
          </div>
        </div>

        <button className="rating-ok-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
const AVATAR = 'https://t.me/i/userpic/320/PJ_NMq7CXZkdOn96PPFv2KarbnQ0eS9Sz4og1T1zV6Q.svg'

function ProfilePage({
  onGifts,
  onShowRating,
  onShowUpgrade,
}: {
  onGifts: () => void
  onShowRating: () => void
  onShowUpgrade: () => void
}) {
  return (
    <div className="profile-root">
      <div className="profile-scroll no-scrollbar">
        <div style={{ height: 'calc(var(--page-pt, 0px) + 5px)' }} aria-hidden="true" />

        <div style={{ minHeight: '100dvh' }}>
          <div className="profile-info-card">
            <div className="profile-info-inner">
              <button
                className="profile-row"
                onClick={() => navigator.clipboard?.writeText('@treeze8')}
              >
                <div className="profile-row-content">
                  <div className="profile-row-label">имя пользователя</div>
                  <div className="profile-row-value link">@treeze8</div>
                </div>
                <IconCopy />
              </button>
              <div className="profile-row-static">
                <div className="profile-row-label">био</div>
                <button className="profile-row-value muted">Добавьте описание</button>
              </div>
            </div>
          </div>

          <div className="profile-gifts-area">
            <div className="profile-gifts-grid">
              {/* Plush Pepe gift card */}
              <div
                className="profile-gift-cell"
                onClick={onShowUpgrade}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onShowUpgrade()}
              >
                {/* Backdrop */}
                <div
                  className="profile-gift-backdrop"
                  style={{
                    background: 'radial-gradient(50% 65% at 50% 35%, #7dd481 0%, #3a8c49 100%)',
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 416 416" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <filter id="pg-flt" filterUnits="userSpaceOnUse" x="0" y="0" width="416" height="416">
                        <feFlood floodColor="#1a5e2a" />
                        <feComposite in2="SourceGraphic" operator="in" />
                      </filter>
                      <image id="pg-pat" x="-50" y="-50" width="100" height="100"
                        href="https://cdn.changes.tg/gifts/models/Plush%20Pepe/png/Original.png"
                        crossOrigin="anonymous"
                      />
                      <g id="pg-grp">
                        {PEPE_PATTERN_TRANSFORMS.map((t, i) => (
                          <g key={i} opacity={t.opacity} transform={`translate(${t.tx}, ${t.ty}) scale(${t.scale})`}>
                            <use href="#pg-pat" />
                          </g>
                        ))}
                      </g>
                    </defs>
                    <use href="#pg-grp" filter="url(#pg-flt)" />
                  </svg>
                </div>
                {/* Gift image */}
                <div className="profile-gift-img">
                  <img
                    src="/gifts/Pepe.svg"
                    alt="Plush Pepe"
                    className="profile-gift-icon"
                    draggable={false}
                  />
                </div>
                {/* Ribbon */}
                <div className="profile-gift-ribbon">
                  <span>#1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-header-card">
        <div className="profile-header-bg" />

        <div className="profile-topbar">
          <span />
          <div className="profile-topbar-right">
            <button className="profile-settings-btn" aria-label="Настройки">
              <IconSettings />
            </button>
          </div>
        </div>

        <div className="profile-avatar-wrap">
          <button className="profile-avatar-btn" aria-label="Сменить аватар">
            <div className="profile-avatar-glow" />
            <img src={AVATAR} alt="Avatar" className="profile-avatar-img" />
          </button>
        </div>

        <div className="profile-name-wrap">
          <button className="profile-name-btn">print('vrhud')</button>
        </div>

        <div className="profile-status-wrap">
          <button className="profile-level-btn" aria-label="Рейтинг" onClick={onShowRating}>
            <LevelBadge />
          </button>
          <span className="profile-online">в сети</span>
        </div>
      </div>

      <BottomNav page="profile" onGifts={onGifts} onProfile={() => {}} avatarSrc={AVATAR} />
    </div>
  )
}

// ─── Gift Card ────────────────────────────────────────────────────────────────
function GiftCard({ gift, onClick }: { gift: Gift; onClick: () => void }) {
  const iconSrc = GIFT_ICONS[gift.id]
  
  return (
    <button className="gift-card" onClick={onClick} style={{ animationDelay: `${gift.id * 0.035}s` }}>
      <div className="gift-card-img">
        {iconSrc ? (
          <img src={iconSrc} alt={gift.name} className="gift-icon" />
        ) : (
          <div className="gift-card-placeholder" />
        )}
      </div>
      <div className="mt-auto flex w-full justify-center">
        <span className="gift-price-wrap">
          <PriceSparks />
          <span className="gift-price-content">
            <span className="gift-price-star"><IconStar size={13} /></span>
            <span className="gift-price-value">{gift.stars.toLocaleString('ru')}</span>
          </span>
        </span>
      </div>
    </button>
  )
}

// ─── Gifts Page ───────────────────────────────────────────────────────────────
function GiftsPage({
  onBack,
  onBuy,
}: {
  onBack: () => void
  onBuy: (gift: Gift) => void
}) {
  return (
    <div className="gifts-root">
      <div className="gifts-glow-bg" aria-hidden="true" />

      <div className="gifts-topbar">
        <div className="gifts-topbar-inner">
          <button className="gifts-back-btn" aria-label="Выйти в меню" onClick={onBack}>
            <IconChevronLeft />
          </button>
        </div>
      </div>

      <div className="gifts-scroll no-scrollbar">
        <div className="gifts-user-header">
          <div className="gifts-avatar-wrap">
            <img src={AVATAR} alt="Avatar" className="gifts-avatar" />
          </div>
          <h1 className="gifts-title">Купить подарок</h1>
          <p className="gifts-desc">
            Купите подарок себе, чтобы разместить его в профиле или сохранить на будущее.
            Лимитированные подарки, улучшенные до коллекционных, можно будет подарить другим.
          </p>
        </div>

        <div className="gifts-grid">
          {GIFTS.map(g => (
            <GiftCard key={g.id} gift={g} onClick={() => onBuy(g)} />
          ))}
        </div>
      </div>

      <BottomNav page="gifts" onGifts={() => {}} onProfile={onBack} avatarSrc={AVATAR} />
    </div>
  )
}

// ─── Buy Page ─────────────────────────────────────────────────────────────────
function BuyPage({ gift, onBack }: { gift: Gift; onBack: () => void }) {
  const [qty, setQty] = useState(1)
  const [hideAnon, setHideAnon] = useState(false)
  const [msg, setMsg] = useState('')

  const total = gift.stars * qty
  const iconSrc = GIFT_ICONS[gift.id]

  return (
    <div className="buy-root">
      <div className="buy-pattern-bg" aria-hidden="true">
        <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="buy-pattern-svg">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <g key={`${row}-${col}`} transform={`translate(${col * 50 + (row % 2) * 25}, ${row * 50})`}>
                <path d="M12 4 a8 8 0 1 0 0 16 a8 8 0 0 0 0 -16 M4 12 H20" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" fill="none"/>
              </g>
            ))
          )}
        </svg>
      </div>

      <div className="buy-topbar">
        <button className="buy-back-btn" onClick={onBack}><IconChevronLeft /></button>
      </div>

      <div className="buy-scroll no-scrollbar">
        <div className="buy-card-wrap">
          <div className="buy-card">
            <div className="buy-card-inner">
              <div className="buy-card-gift-img">
                {iconSrc ? (
                  <img src={iconSrc} alt={gift.name} className="gift-icon-large" />
                ) : (
                  <div className="buy-card-placeholder" />
                )}
              </div>
              <div className="buy-card-gift-name">{gift.name}</div>
              <div className="buy-card-gift-desc">
                Уникальный подарок. Можно отправить другу или сохранить в профиле.
              </div>
              <div className="buy-card-view-btn">Посмотреть</div>
            </div>
            <div className="buy-card-ribbon">
              <div className="buy-card-ribbon-inner">101 из 3&nbsp;000</div>
            </div>
          </div>
          <div className="buy-msg-wrap">
            <input
              className="buy-msg-input"
              placeholder="Введите сообщение (необязательно)"
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
          </div>
        </div>

        <div className="buy-toggle-card">
          <div
            className="buy-toggle-row"
            role="button"
            tabIndex={0}
            onClick={() => setHideAnon(v => !v)}
            onKeyDown={e => e.key === 'Enter' && setHideAnon(v => !v)}
          >
            <span className="buy-toggle-label">Скрыть имя</span>
            <button
              role="switch"
              aria-checked={hideAnon}
              aria-label="Скрыть имя"
              className={`toggle-switch${hideAnon ? ' on' : ''}`}
              onClick={e => { e.stopPropagation(); setHideAnon(v => !v) }}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>
        <p className="buy-toggle-hint">Скрыть моё имя и сообщение от посетителей профиля.</p>

        <div className="buy-avail-bar-wrap">
          <div className="buy-avail-bar">
            <div className="buy-avail-fill" style={{ width: '96.7%' }} />
            <span className="buy-avail-left">2&nbsp;900 осталось</span>
            <span className="buy-avail-right">100 продано</span>
          </div>
        </div>
        <p className="buy-avail-hint">Когда все подарки будут проданы, вы больше не сможете их купить.</p>

        <div style={{ height: 160 }} />
      </div>

      <div className="buy-action-bar">
        <div className="buy-qty-control">
          <button className="buy-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
          <span className="buy-qty-val">{qty}</span>
          <button className="buy-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
        </div>
        <button className="buy-confirm-btn">
          Купить за&nbsp;<IconStar size={19} /><span>&nbsp;{total.toLocaleString('ru')}</span>
        </button>
      </div>

      <BottomNav page="gifts" onGifts={onBack} onProfile={onBack} avatarSrc={AVATAR} />
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('profile')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  function goGifts() { setPage('gifts') }
  function goProfile() { setPage('profile') }
  function goBuy(g: Gift) { setSelectedGift(g); setPage('buy') }

  return (
    <div className="app-root">
      {page === 'profile' && (
        <ProfilePage
          onGifts={goGifts}
          onShowRating={() => setShowRating(true)}
          onShowUpgrade={() => setShowUpgrade(true)}
        />
      )}
      {page === 'gifts' && (
        <GiftsPage onBack={goProfile} onBuy={goBuy} />
      )}
      {page === 'buy' && selectedGift && (
        <BuyPage gift={selectedGift} onBack={goGifts} />
      )}
      <RatingModal isOpen={showRating} onClose={() => setShowRating(false)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
