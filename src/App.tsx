import { useState, useEffect, useRef, useCallback, memo, createContext, useContext } from 'react'
import LottiePlayer from 'react-lottie-player/dist/LottiePlayerLight'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import './App.css'

// ─── Sparkles context ─────────────────────────────────────────────────────────
const SparklesCtx = createContext<boolean>(true)
function useSparks() { return useContext(SparklesCtx) }

// ─── Haptic utility ───────────────────────────────────────────────────────────
function haptic(duration = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration)
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'profile' | 'gifts' | 'buy'

// Worn gift state — used for profile bg + nickname badge
interface WornGift {
  uid: string
  giftCdnName: string
  modelName: string
  backdrop: CdnBackdrop
  pattern: { name: string; rarityPermille: number }
}

interface Gift {
  id: number
  name: string
  stars: number
}

// Подарок в инвентаре — может быть неулучшенным или улучшенным
interface OwnedGift {
  uid: string          // уникальный id экземпляра
  giftId: number
  upgraded: false
}

interface UpgradedOwnedGift {
  uid: string
  giftId: number
  upgraded: true
  model: CdnModel
  backdrop: CdnBackdrop
  pattern: { name: string; rarityPermille: number }
  serialNumber: number
  giftCdnName: string
}

type AnyOwnedGift = OwnedGift | UpgradedOwnedGift

// ─── Data ─────────────────────────────────────────────────────────────────────
const GIFTS: Gift[] = [
  { id: 1,  name: 'Plush Pepe',       stars: 1000 },
  { id: 2,  name: 'Desk Calendar',   stars: 320  },
  { id: 3,  name: 'Chill Flame',      stars: 320  },
  { id: 4,  name: 'Heart Locket',     stars: 280  },
  { id: 5,  name: 'Moon Pendant',     stars: 240  },
  { id: 6,  name: 'Crystal Ball',     stars: 200  },
  { id: 7,  name: 'Voodoo Doll',      stars: 110  },
  { id: 8,  name: 'Vice Cream',       stars: 90   },
  { id: 9,  name: 'Durov Cap',      stars: 90   },
  { id: 10, name: 'Neko Helmet',        stars: 80   },
  { id: 11, name: 'Lunar Snake',      stars: 50   },
  { id: 12, name: 'Loot Bag',         stars: 40   },
  { id: 13, name: 'Pet Snake',        stars: 25   },
  { id: 14, name: 'Signet Ring',    stars: 25   },
]

// ─── CDN ──────────────────────────────────────────────────────────────────────
const CDN = 'https://cdn.changes.tg/gifts'

// Маппинг id гифта → точное имя папки на CDN (для models/lottie/patterns)
const GIFT_CDN_NAME: Record<number, string> = {
  1:  'Plush Pepe',
  2:  'Desk Calendar',
  3:  'Genie Lamp',
  4:  'Heart Locket',
  5:  'Lol Pop',
  6:  'Astral Shard',
  7:  'Voodoo Doll',
  8:  'Vice Cream',
  9:  "Durov's Cap",
  10: 'Neko Helmet',
  11: 'Lunar Snake',
  12: 'Loot Bag',
  13: 'Pet Snake',
  14: 'Signet Ring',
}

// Маппинг имени подарка (CDN) → числовой ID папки в originals/
// Из https://cdn.changes.tg/gifts/id-to-name.json
const GIFT_CDN_ORIG_ID: Record<string, string> = {
  'Plush Pepe':    '5936013938331222567',
  'Desk Calendar': '5782988952268964995',
  'Genie Lamp':    '5933531623327795414',
  'Heart Locket':  '5868455043362980631',
  'Lol Pop':       '5170594532177215681',
  'Astral Shard':  '5933629604416717361',
  'Voodoo Doll':   '5836780359634649414',
  'Vice Cream':    '5898012527257715797',
  "Durov's Cap":   '5915521180483191380',
  'Neko Helmet':   '5933793770951673155',
  'Lunar Snake':   '6028426950047957932',
  'Loot Bag':      '5868659926187901653',
  'Pet Snake':     '6023917088358269866',
  'Signet Ring':   '5936085638515261992',
}

// Возвращает URL оригинального PNG для подарка по CDN-имени
function getOriginalPng(cdnName: string): string {
  const origId = GIFT_CDN_ORIG_ID[cdnName]
  if (origId) return `${CDN}/originals/${origId}/Original.png`
  // fallback: models/png/Original.png
  return `${CDN}/models/${encodeURIComponent(cdnName)}/png/Original.png`
}

// Маппинг giftId → PNG из CDN originals (для магазина и неулучшенных карточек)
const GIFT_ICONS: Record<number, string> = Object.fromEntries(
  Object.entries(GIFT_CDN_NAME).map(([id, name]) => [Number(id), getOriginalPng(name)])
)

// ─── CDN types ────────────────────────────────────────────────────────────────
interface CdnBackdrop {
  name: string
  hex: { centerColor: string; edgeColor: string; patternColor: string }
}

interface CdnModel {
  name: string
  rarityPermille: number
  crafted?: boolean
}

// ─── CDN cache ────────────────────────────────────────────────────────────────
let _backdropsCache: CdnBackdrop[] | null = null
const _modelsCache: Record<string, CdnModel[]> = {}
let _patternsRaw: Record<string, string> | null = null

async function fetchBackdrops(): Promise<CdnBackdrop[]> {
  if (_backdropsCache) return _backdropsCache
  const r = await fetch(`${CDN}/backdrops.json`)
  const data = await r.json()
  _backdropsCache = data
  return data
}

async function fetchModels(giftName: string): Promise<CdnModel[]> {
  if (_modelsCache[giftName]) return _modelsCache[giftName]
  const r = await fetch(`${CDN}/models/${encodeURIComponent(giftName)}/models.json`)
  const data: CdnModel[] = await r.json()
  const normal = data.filter(m => !m.crafted)
  const shuffled = normal.sort(() => Math.random() - 0.5).slice(0, 12)
  _modelsCache[giftName] = shuffled
  return shuffled
}

async function fetchPatternsForGift(giftName: string): Promise<{ name: string; rarityPermille: number }[]> {
  if (!_patternsRaw) {
    const r = await fetch(`${CDN}/patterns.json`)
    _patternsRaw = await r.json()
  }
  const prefix = `${giftName}/`
  const result: { name: string; rarityPermille: number }[] = []
  for (const val of Object.values(_patternsRaw!)) {
    if (val.startsWith(prefix)) {
      const nameTgs = val.slice(prefix.length) // e.g. "Pirate Hat.tgs"
      const name = nameTgs.replace(/\.tgs$/, '')
      result.push({ name, rarityPermille: Math.floor(Math.random() * 50) + 1 })
    }
  }
  return result.sort(() => Math.random() - 0.5).slice(0, 20)
}

// Pattern transforms for backdrop SVG (универсальные)
const PATTERN_TRANSFORMS = [
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

// ─── Upgrade result type ──────────────────────────────────────────────────────
interface UpgradeResult {
  giftName: string
  model: CdnModel
  backdrop: CdnBackdrop
  pattern: { name: string; rarityPermille: number }
  serialNumber: number
}

// ─── GiftImage — статичный PNG (для рулетки) ─────────────────────────────────
function GiftImage({
  giftName,
  modelName,
  onReady,
  className,
}: {
  giftName: string
  modelName: string
  onReady?: () => void
  className?: string
}) {
  const url = `${CDN}/models/${encodeURIComponent(giftName)}/png/${encodeURIComponent(modelName)}.png`

  return (
    <img
      src={url}
      alt={modelName}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onLoad={onReady}
      draggable={false}
    />
  )
}

// ─── GiftLottie — анимированный TGS (для preview и result) ───────────────────
function GiftLottie({
  giftName,
  modelName,
  onReady,
  className,
}: {
  giftName: string
  modelName: string
  onReady?: () => void
  className?: string
}) {
  const url = `${CDN}/models/${encodeURIComponent(giftName)}/lottie/${encodeURIComponent(modelName)}.json`
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

function UpgradeModal({
  isOpen,
  giftId,
  onClose,
  onUpgraded,
}: {
  isOpen: boolean
  giftId: number | null
  onClose: () => void
  onUpgraded?: (result: UpgradeResult) => void
}) {
  const [idx, setIdx] = useState(0)
  const [rouletteIdx, setRouletteIdx] = useState(0)
  const [allReady, setAllReady] = useState(false)
  const [backdrops, setBackdrops] = useState<CdnBackdrop[]>([])
  const [models, setModels] = useState<CdnModel[]>([])
  const [phase, setPhase] = useState<'preview' | 'upgrading' | 'result'>('preview')
  const [result, setResult] = useState<UpgradeResult | null>(null)

  const giftName = giftId ? GIFT_CDN_NAME[giftId] ?? null : null
  const total = Math.min(backdrops.length, models.length)

  // Загружаем данные при открытии
  useEffect(() => {
    if (!isOpen || !giftName) return

    setIdx(0)
    setAllReady(false)
    setBackdrops([])
    setModels([])
    setPhase('preview')
    setResult(null)

    let cancelled = false

    Promise.all([fetchBackdrops(), fetchModels(giftName)]).then(([bds, mds]) => {
      if (cancelled) return
      const shuffledBds = [...bds].sort(() => Math.random() - 0.5).slice(0, 8)
      setBackdrops(shuffledBds)
      setModels(mds)
    })

    const fallback = setTimeout(() => { if (!cancelled) setAllReady(true) }, 5000)
    return () => { cancelled = true; clearTimeout(fallback) }
  }, [isOpen, giftName])

  // handleUpgrade — крутит рулетку 2.5с, выбирает победителя
  const handleUpgrade = useCallback(async () => {
    if (!giftName || backdrops.length === 0 || models.length === 0) return
    setPhase('upgrading')

    const patternsPromise = fetchPatternsForGift(giftName)
    await new Promise(r => setTimeout(r, 2500))

    const patterns = await patternsPromise
    const winBackdrop = backdrops[Math.floor(Math.random() * backdrops.length)]
    const winModel = models[Math.floor(Math.random() * models.length)]
    const winPattern = patterns.length > 0
      ? patterns[Math.floor(Math.random() * patterns.length)]
      : { name: 'Standard', rarityPermille: 10 }
    const serialNumber = Math.floor(Math.random() * 9000) + 100

    const res: UpgradeResult = { giftName, model: winModel, backdrop: winBackdrop, pattern: winPattern, serialNumber }
    setResult(res)
    setPhase('result')
    onUpgraded?.(res)

    // 🎉 Конфетти при выпадении подарка — два залпа с обеих сторон снизу
    confetti({ particleCount: 60, spread: 35, startVelocity: 60, origin: { x: 0, y: 0.8 }, angle: 55 })
    confetti({ particleCount: 60, spread: 35, startVelocity: 60, origin: { x: 1, y: 0.8 }, angle: 125 })
  }, [giftName, backdrops, models, onUpgraded])

  // Цикл смены слайда — только в preview
  useEffect(() => {
    if (!isOpen || phase !== 'preview' || total === 0) return
    const timer = setInterval(() => setIdx(i => (i + 1) % total), CYCLE_MS)
    return () => clearInterval(timer)
  }, [isOpen, phase, total])

  // Быстрый цикл фонов во время рулетки — меняет фон каждые 150мс
  useEffect(() => {
    if (!isOpen || phase !== 'upgrading' || backdrops.length === 0) return
    const timer = setInterval(() => {
      setRouletteIdx(i => (i + 1) % backdrops.length)
    }, 150)
    return () => clearInterval(timer)
  }, [isOpen, phase, backdrops.length])

  const handleTgsReady = useCallback(() => { setAllReady(true) }, [])

  // Текущие данные для отображения (в result берём выигравшие, в upgrading — быстро мигающие бэкдропы)
  const activeBackdrop = phase === 'result' && result
    ? result.backdrop
    : phase === 'upgrading' && backdrops.length > 0
      ? backdrops[rouletteIdx % backdrops.length]
      : backdrops[idx % Math.max(backdrops.length, 1)]
  const activeModel    = phase === 'result' && result ? result.model    : models[idx % Math.max(models.length, 1)]

  const centerColor  = activeBackdrop?.hex?.centerColor  ?? '#363738'
  const edgeColor    = activeBackdrop?.hex?.edgeColor    ?? '#0e0f0f'
  const patternColor = activeBackdrop?.hex?.patternColor ?? '#6c6868'

  const pngUrl = giftName && activeModel
    ? `${CDN}/models/${encodeURIComponent(giftName)}/png/${encodeURIComponent(activeModel.name)}.png`
    : `${CDN}/models/Plush%20Pepe/png/Original.png`

  // Для SVG паттерна фона используем символ узора если он уже выпал, иначе модель
  const backdropPatternUrl = (phase === 'result' && result && giftName)
    ? `${CDN}/patterns/${encodeURIComponent(giftName)}/png/${encodeURIComponent(result.pattern.name)}.png`
    : pngUrl

  // Список моделей для рулетки (28 штук, последний — победитель)
  const rouletteModels = phase === 'upgrading' && result === null && models.length > 0
    ? [...models, ...models, ...models].slice(0, 28)
    : []

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={phase !== 'upgrading' ? onClose : undefined}>
      <div className="modal-sheet upgrade-modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="upgrade-header">
          <button
            className="modal-close-btn"
            onClick={() => { haptic(); onClose() }}
            disabled={phase === 'upgrading'}
            style={{ zIndex: 5, position: 'absolute', left: 8, top: 8, opacity: phase === 'upgrading' ? 0.35 : 1 }}
          >
            <IconClose />
          </button>

          {/* Анимированный фон — меняет цвет плавно */}
          <motion.div
            className="upgrade-backdrop"
            animate={{
              background: `radial-gradient(50% 65% at 50% 35%, ${centerColor} 0%, ${edgeColor} 100%)`,
            }}
            transition={{
              duration: phase === 'upgrading' ? 0.12 : CYCLE_MS / 1000 * 0.35,
              ease: 'easeInOut'
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 416 416" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="upflt" filterUnits="userSpaceOnUse" x="0" y="0" width="416" height="416">
                  <feFlood floodColor={patternColor} />
                  <feComposite in2="SourceGraphic" operator="in" />
                </filter>
                <image id="uppat" x="-50" y="-50" width="100" height="100" href={backdropPatternUrl} crossOrigin="anonymous" />
                <g id="upgrp">
                  {PATTERN_TRANSFORMS.map((t, i) => (
                    <g key={i} opacity={t.opacity} transform={`translate(${t.tx}, ${t.ty}) scale(${t.scale})`}>
                      <use href="#uppat" />
                    </g>
                  ))}
                </g>
              </defs>
              <use href="#upgrp" filter="url(#upflt)" />
            </svg>
          </motion.div>

          {/* PREVIEW — TGS карусель (текущий + следующий) */}
          {phase === 'preview' && giftName && models.length > 0 && (
            <div className="upgrade-lottie-wrap" style={{ opacity: allReady ? 1 : 0, transition: 'opacity 0.5s ease' }}>
              {models.map((m, i) => {
                const nextIdx = (idx + 1) % models.length
                const isActive = i === idx
                const isNext   = i === nextIdx
                if (!isActive && !isNext) return null
                return (
                  <motion.div key={m.name} className="upgrade-lottie-slot" animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: 0.5 }}>
                    <GiftLottie giftName={giftName} modelName={m.name} onReady={isActive ? handleTgsReady : undefined} className="upgrade-lottie" />
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* UPGRADING — горизонтальная рулетка, PNG */}
          {phase === 'upgrading' && giftName && (
            <div className="upgrade-roulette-wrap">
              <motion.div
                className="upgrade-roulette-reel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 2.5, ease: 'linear' }}
              >
                {rouletteModels.map((m, i) => (
                  <div key={i} className="upgrade-roulette-item">
                    <GiftImage giftName={giftName} modelName={m.name} className="upgrade-lottie" />
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {/* RESULT — победивший TGS */}
          {phase === 'result' && giftName && result && (
            <div className="upgrade-lottie-wrap" style={{ opacity: 1 }}>
              <div className="upgrade-lottie-slot" style={{ opacity: 1 }}>
                <GiftLottie giftName={giftName} modelName={result.model.name} className="upgrade-lottie" />
              </div>
            </div>
          )}

          {/* Бейдж: в preview — имя модели, в result — название + номер */}
          {phase === 'preview' && activeModel && (
            <motion.div key={activeModel.name} className="upgrade-model-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {activeModel.name}
            </motion.div>
          )}
          {phase === 'result' && result && (
            <div className="upgrade-model-badge">
              {result.giftName} #{result.serialNumber}
            </div>
          )}
        </div>

        {/* ── RESULT экран ── */}
        {phase === 'result' && result ? (
          <>
            <div className="upgrade-result-table">
              <div className="upgrade-result-row">
                <span className="upgrade-result-key">Модель</span>
                <span className="upgrade-result-val">
                  {result.model.name}
                  <span className="upgrade-rarity-badge">{rarityLabel(result.model.rarityPermille)}</span>
                </span>
              </div>
              <div className="upgrade-result-row">
                <span className="upgrade-result-key">Узор</span>
                <span className="upgrade-result-val">
                  {result.pattern.name}
                  <span className="upgrade-rarity-badge">{rarityLabel(result.pattern.rarityPermille)}</span>
                </span>
              </div>
              <div className="upgrade-result-row">
                <span className="upgrade-result-key">Фон</span>
                <span className="upgrade-result-val">
                  {result.backdrop.name}
                  <span className="upgrade-rarity-badge">{rarityLabel(Math.floor(Math.random() * 30) + 5)}</span>
                </span>
              </div>
            </div>
            <div className="upgrade-cta-wrap">
              <button className="upgrade-btn" onClick={() => { haptic(); onClose() }}>OK</button>
            </div>
          </>
        ) : (
          <>
            {/* ── PREVIEW / UPGRADING экран ── */}
            <h2 className="upgrade-title">Улучшение подарка</h2>
            <p className="upgrade-desc">
              Подарок станет уникальным коллекционным. Его можно будет передать или продать.
            </p>

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

            <div className="upgrade-cta-wrap">
              <button
                className="upgrade-btn"
                onClick={() => { haptic(15); handleUpgrade() }}
                disabled={phase === 'upgrading' || models.length === 0}
              >
                {phase === 'upgrading' ? 'Улучшаем...' : (
                  <>
                    Улучшить
                    <span className="upgrade-btn-arrow">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M6 13 L12 7.5 L18 13" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 16.5 L12 11 L18 16.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function rarityLabel(permille: number): string {
  const pct = (permille / 10).toFixed(1).replace(/\.0$/, '')
  return `${pct}%`
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
  const sparksEnabled = useSparks()
  if (!sparksEnabled) return null

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
          haptic()
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
        onClick={() => { haptic(); onProfile() }}
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
          <button className="modal-close-btn" onClick={() => { haptic(); onClose() }}><IconClose /></button>
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
          Рейтинг отражает вашу активность в нашем мини-аппе. На него влияют:
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

        <button className="rating-ok-btn" onClick={() => { haptic(); onClose() }}>OK</button>
      </div>
    </div>
  )
}

// ─── Profile Gift Card ────────────────────────────────────────────────────────
// Карточка в сетке профиля: неулучшенная = иконка, улучшенная = backdrop + TGS
function ProfileGiftCard({ owned, onClick }: { owned: AnyOwnedGift; onClick: () => void }) {
  const gift = GIFTS.find(g => g.id === owned.giftId)
  if (!gift) return null

  if (!owned.upgraded) {
    // Неулучшенный — просто иконка без фона
    return (
      <div
        className="profile-gift-cell profile-gift-cell--plain"
        onClick={() => { haptic(); onClick() }}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && (haptic(), onClick())}
      >
        <div className="profile-gift-img">
          <img
            src={GIFT_ICONS[gift.id]}
            alt={gift.name}
            className="profile-gift-icon"
            draggable={false}
          />
        </div>
        <div className="profile-gift-name-tag">{gift.name}</div>
      </div>
    )
  }

  // Улучшенный — backdrop + паттерн + PNG (TGS только в модалке)
  const { backdrop, model, pattern, serialNumber, giftCdnName } = owned
  const centerColor  = backdrop.hex.centerColor
  const edgeColor    = backdrop.hex.edgeColor
  const patternColor = backdrop.hex.patternColor
  const pngUrl = `${CDN}/models/${encodeURIComponent(giftCdnName)}/png/${encodeURIComponent(model.name)}.png`
  // Символ узора для SVG-паттерна фона
  const patternSymbolUrl = `${CDN}/patterns/${encodeURIComponent(giftCdnName)}/png/${encodeURIComponent(pattern.name)}.png`

  return (
    <div
      className="profile-gift-cell"
      onClick={() => { haptic(); onClick() }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && (haptic(), onClick())}
    >
      {/* Backdrop */}
      <div
        className="profile-gift-backdrop"
        style={{ background: `radial-gradient(50% 65% at 50% 35%, ${centerColor} 0%, ${edgeColor} 100%)` }}
      >
        <svg width="100%" height="100%" viewBox="0 0 416 416" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id={`pgflt-${owned.uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="416" height="416">
              <feFlood floodColor={patternColor} />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <image id={`pgpat-${owned.uid}`} x="-50" y="-50" width="100" height="100" href={patternSymbolUrl} crossOrigin="anonymous" />
            <g id={`pggrp-${owned.uid}`}>
              {PATTERN_TRANSFORMS.map((t, i) => (
                <g key={i} opacity={t.opacity} transform={`translate(${t.tx}, ${t.ty}) scale(${t.scale})`}>
                  <use href={`#pgpat-${owned.uid}`} />
                </g>
              ))}
            </g>
          </defs>
          <use href={`#pggrp-${owned.uid}`} filter={`url(#pgflt-${owned.uid})`} />
        </svg>
      </div>

      {/* PNG статичное изображение в сетке */}
      <div className="profile-gift-img">
        <img
          src={pngUrl}
          alt={model.name}
          className="profile-gift-lottie"
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          draggable={false}
        />
      </div>

      {/* Ribbon с номером */}
      <div className="profile-gift-ribbon" style={{
        background: `linear-gradient(225deg, ${edgeColor} 0%, ${centerColor} 100%)`
      }}>
        <span>#{serialNumber}</span>
      </div>
    </div>
  )
}

// ─── Gift Detail Sheet — 555-style ───────────────────────────────────────────
function GiftDetailSheet({
  owned,
  isOpen,
  onClose,
  onUpgrade,
  onWear,
  onUnwear,
  wornUid,
}: {
  owned: AnyOwnedGift | null
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  onWear: (owned: UpgradedOwnedGift) => void
  onUnwear: () => void
  wornUid: string | null
}) {
  const gift = owned ? GIFTS.find(g => g.id === owned.giftId) : null
  const isWorn = owned ? owned.uid === wornUid : false

  if (!owned || !gift) {
    return (
      <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
        <div className="modal-sheet gift-detail-sheet" onClick={e => e.stopPropagation()} />
      </div>
    )
  }

  const upgraded = owned.upgraded ? (owned as UpgradedOwnedGift) : null
  const centerColor = upgraded ? upgraded.backdrop.hex.centerColor : '#363738'
  const edgeColor   = upgraded ? upgraded.backdrop.hex.edgeColor   : '#1a1a1c'
  const patternColor = upgraded ? upgraded.backdrop.hex.patternColor : '#555'
  const pngUrl = upgraded
    ? `${CDN}/models/${encodeURIComponent(upgraded.giftCdnName)}/png/${encodeURIComponent(upgraded.model.name)}.png`
    : null
  // Символ узора для SVG-паттерна фона (как в 555)
  const patternSymbolUrl = upgraded
    ? `${CDN}/patterns/${encodeURIComponent(upgraded.giftCdnName)}/png/${encodeURIComponent(upgraded.pattern.name)}.png`
    : null

  // action button bg
  const btnBg = upgraded
    ? `color-mix(in srgb, ${edgeColor} 80%, white)`
    : '#2a2a2e'

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div
        className="modal-sheet gift-detail-sheet-555"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gd-title"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header with backdrop ── */}
        <div className="gd-header">
          {/* Backdrop bg */}
          {upgraded ? (
            <div
              className="gd-backdrop"
              style={{ background: `radial-gradient(50% 65% at 50% 35%, ${centerColor} 0%, ${edgeColor} 100%)` }}
            >
              <svg width="100%" height="100%" viewBox="0 0 416 416" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <filter id={`gdflt555-${owned.uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="416" height="416">
                    <feFlood floodColor={patternColor} />
                    <feComposite in2="SourceGraphic" operator="in" />
                  </filter>
                  <image id={`gdpat555-${owned.uid}`} x="-50" y="-50" width="100" height="100" href={patternSymbolUrl!} crossOrigin="anonymous" />
                  <g id={`gdgrp555-${owned.uid}`}>
                    {PATTERN_TRANSFORMS.map((t, i) => (
                      <g key={i} opacity={t.opacity} transform={`translate(${t.tx}, ${t.ty}) scale(${t.scale})`}>
                        <use href={`#gdpat555-${owned.uid}`} />
                      </g>
                    ))}
                  </g>
                </defs>
                <use href={`#gdgrp555-${owned.uid}`} filter={`url(#gdflt555-${owned.uid})`} />
              </svg>
            </div>
          ) : (
            <div className="gd-backdrop" style={{ background: '#1a1a1c' }} />
          )}

          {/* Controls */}
          <div className="gd-controls">
            <button
              className="gd-ctrl-btn"
              aria-label="Закрыть"
              onClick={() => { haptic(); onClose() }}
            >
              <IconClose />
            </button>
            {/* dots menu placeholder */}
            <button className="gd-ctrl-btn" aria-label="Меню">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="3" cy="8" r="1.4" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.4" fill="currentColor"/>
                <circle cx="13" cy="8" r="1.4" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* TGS / icon */}
          <div className="gd-lottie-wrap">
            {upgraded ? (
              <GiftLottie
                giftName={upgraded.giftCdnName}
                modelName={upgraded.model.name}
                className="gd-lottie"
              />
            ) : (
              <img
                src={GIFT_ICONS[gift.id]}
                alt={gift.name}
                className="gd-plain-icon"
                draggable={false}
              />
            )}
          </div>

          {/* Title */}
          <h2 id="gd-title" className="gd-title">
            {gift.name}
            {upgraded && (
              <span className="gd-serial"> #{upgraded.serialNumber}</span>
            )}
          </h2>

          {/* Action buttons row — like 555 */}
          <div className="gd-actions-row">
            {/* Transfer */}
            <button
              className="gd-action-btn"
              style={{ background: btnBg }}
              onClick={() => haptic()}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 4 H12 L15 7 L9 14 L3 8 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(255,255,255,0.08)"/>
                <path d="M14 16 H21 M18 13 L21 16 L18 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Передать</span>
            </button>

            {/* Wear / Unwear */}
            {upgraded && (
              <button
                className="gd-action-btn"
                style={{ background: btnBg }}
                onClick={() => {
                  haptic()
                  if (isWorn) { onUnwear() } else { onWear(upgraded) }
                  onClose()
                }}
              >
                {isWorn ? (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9 L7 13 L12 6 L17 13 L21 9 L19 18 H5 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                      <path d="M3 3 L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <span>Снять</span>
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9 L7 13 L12 6 L17 13 L21 9 L19 18 H5 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                    </svg>
                    <span>Носить</span>
                  </>
                )}
              </button>
            )}

            {/* Sell */}
            {upgraded && (
              <button
                className="gd-action-btn"
                style={{ background: btnBg }}
                onClick={() => haptic()}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 13 L11 21 L21 11 V3 H13 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                  <circle cx="16.5" cy="7.5" r="1.4" fill="currentColor"/>
                </svg>
                <span>Продать</span>
              </button>
            )}

            {/* Upgrade (for non-upgraded) */}
            {!upgraded && (
              <button
                className="gd-action-btn"
                style={{ background: '#0C8AFF' }}
                onClick={() => { haptic(15); onClose(); setTimeout(onUpgrade, 300) }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 13 L12 7.5 L18 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 16.5 L12 11 L18 16.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Улучшить</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Attributes table — 555 style ── */}
        <div className="gd-attr-table">
          {/* Owner row */}
          <div className="gd-attr-row">
            <span className="gd-attr-key">Владелец</span>
            <span className="gd-attr-val gd-attr-val--owner">
              <img src={AVATAR} alt="Avatar" className="gd-owner-avatar" />
              <button className="gd-owner-name">username</button>
              {upgraded && (
                <span className="gd-worn-badge">
                  <GiftLottie
                    giftName={upgraded.giftCdnName}
                    modelName={upgraded.model.name}
                    className="gd-worn-tgs"
                  />
                </span>
              )}
            </span>
          </div>

          {upgraded && (
            <>
              <div className="gd-attr-row">
                <span className="gd-attr-key">Модель</span>
                <span className="gd-attr-val">
                  <span className="gd-attr-text">{upgraded.model.name}</span>
                  <span className="upgrade-rarity-badge">{rarityLabel(upgraded.model.rarityPermille)}</span>
                </span>
              </div>
              <div className="gd-attr-row">
                <span className="gd-attr-key">Узор</span>
                <span className="gd-attr-val">
                  <span className="gd-attr-text">{upgraded.pattern.name}</span>
                  <span className="upgrade-rarity-badge">{rarityLabel(upgraded.pattern.rarityPermille)}</span>
                </span>
              </div>
              <div className="gd-attr-row">
                <span className="gd-attr-key">Фон</span>
                <span className="gd-attr-val">
                  <span className="gd-attr-text">{upgraded.backdrop.name}</span>
                  <span className="upgrade-rarity-badge">{rarityLabel(10)}</span>
                </span>
              </div>
              <div className="gd-attr-row">
                <span className="gd-attr-key">Наличие</span>
                <span className="gd-attr-val">
                  <span className="gd-attr-text">{upgraded.serialNumber} из 33&nbsp;333</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Visibility hint */}
        <div className="gd-visibility-hint">
          Подарок виден в профиле.{' '}
          <button className="gd-hint-link" onClick={() => haptic()}>Скрыть</button>
        </div>

        {/* OK button */}
        <div className="gd-ok-wrap">
          <button className="gd-ok-btn" onClick={() => { haptic(); onClose() }}>OK</button>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({
  isOpen,
  onClose,
  sparksEnabled,
  onToggleSparks,
}: {
  isOpen: boolean
  onClose: () => void
  sparksEnabled: boolean
  onToggleSparks: () => void
}) {
  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={() => { haptic(); onClose() }}><IconClose /></button>
          <span className="modal-title">Настройки</span>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">ПОДАРКИ</div>
          <div className="buy-toggle-card" style={{ margin: 0 }}>
            <div
              className="buy-toggle-row"
              role="button"
              tabIndex={0}
              onClick={() => { haptic(); onToggleSparks() }}
              onKeyDown={e => e.key === 'Enter' && (haptic(), onToggleSparks())}
            >
              <span className="buy-toggle-label">Искры у цены</span>
              <button
                role="switch"
                aria-checked={sparksEnabled}
                aria-label="Искры у цены"
                className={`toggle-switch${sparksEnabled ? ' on' : ''}`}
                onClick={e => { e.stopPropagation(); haptic(); onToggleSparks() }}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
          <p className="buy-toggle-hint">Анимация искр рядом с ценой подарков.</p>
        </div>

        <button className="rating-ok-btn" style={{ marginTop: 24 }} onClick={() => { haptic(); onClose() }}>Готово</button>
      </div>
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
const AVATAR = 'https://t.me/i/userpic/320/PJ_NMq7CXZkdOn96PPFv2KarbnQ0eS9Sz4og1T1zV6Q.svg'

function _ProfilePage({
  onGifts: _onGifts,
  onShowRating,
  onShowSettings,
  ownedGifts,
  onSelectGift,
  wornGift,
}: {
  onGifts: () => void
  onShowRating: () => void
  onShowSettings: () => void
  ownedGifts: AnyOwnedGift[]
  onSelectGift: (owned: AnyOwnedGift) => void
  wornGift: WornGift | null
}) {
  // Profile bg: worn gift backdrop or default dark
  const bgColor = wornGift
    ? wornGift.backdrop.hex.edgeColor
    : '#1C1C1C'
  const bgImage = wornGift
    ? `radial-gradient(50% 55% at 50% 45%, ${wornGift.backdrop.hex.centerColor} 0%, ${wornGift.backdrop.hex.edgeColor} 100%)`
    : 'none'

  return (
    <div className="profile-root">
      <div className="profile-scroll no-scrollbar">
        <div style={{ height: 'calc(var(--page-pt, 0px) + 5px)' }} aria-hidden="true" />

        <div style={{ minHeight: '100dvh' }}>
          <div className="profile-info-card">
            <div className="profile-info-inner">
              <button
                className="profile-row"
                onClick={() => { haptic(); navigator.clipboard?.writeText('@test') }}
              >
                <div className="profile-row-content">
                  <div className="profile-row-label">имя пользователя</div>
                  <div className="profile-row-value link">@test</div>
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
            {ownedGifts.length === 0 ? (
              <div className="profile-gifts-empty">
                <p>У вас пока нет подарков</p>
                <p className="profile-gifts-empty-sub">Купите подарок в магазине</p>
              </div>
            ) : (
              <div className="profile-gifts-grid">
                {ownedGifts.map(owned => (
                  <ProfileGiftCard
                    key={owned.uid}
                    owned={owned}
                    onClick={() => onSelectGift(owned)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed profile header */}
      <div className="profile-header-card">
        <div
          className="profile-header-bg"
          style={{ backgroundColor: bgColor, backgroundImage: bgImage }}
        />

        {/* Pattern overlay — показываем только когда надет улучшенный подарок */}
        {wornGift && (() => {
          // patterns/{giftName}/png/{pattern.name}.png — именно узор, не модель
          const patternImgUrl = `${CDN}/patterns/${encodeURIComponent(wornGift.giftCdnName)}/png/${encodeURIComponent(wornGift.pattern.name)}.png`
          const patternColor = wornGift.backdrop.hex.patternColor
          const uid = wornGift.uid.replace(/[^a-z0-9]/gi, '')
          return (
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 416 416"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid slice"
              className="profile-header-pattern"
            >
              <defs>
                <filter id={`ph-flt-${uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="416" height="416">
                  <feFlood floodColor={patternColor} />
                  <feComposite in2="SourceGraphic" operator="in" />
                </filter>
                <image id={`ph-pat-${uid}`} x="-50" y="-50" width="100" height="100" href={patternImgUrl} crossOrigin="anonymous" />
                <g id={`ph-grp-${uid}`}>
                  {PATTERN_TRANSFORMS.map((t, i) => (
                    <g key={i} opacity={t.opacity} transform={`translate(${t.tx}, ${t.ty}) scale(${t.scale})`}>
                      <use href={`#ph-pat-${uid}`} />
                    </g>
                  ))}
                </g>
              </defs>
              <use href={`#ph-grp-${uid}`} filter={`url(#ph-flt-${uid})`} />
            </svg>
          )
        })()}

        {/* Settings button — at avatar level (top + 48px + avatar center offset) */}
        <div className="profile-settings-wrap">
          <button
            className="profile-settings-btn"
            aria-label="Настройки"
            onClick={() => { haptic(); onShowSettings() }}
          >
            <IconSettings />
          </button>
        </div>

        <div className="profile-avatar-wrap">
          <button className="profile-avatar-btn" aria-label="Сменить аватар">
            <div className="profile-avatar-glow" style={wornGift ? {
              background: `radial-gradient(circle, ${wornGift.backdrop.hex.centerColor}55 30%, transparent 72%)`
            } : undefined} />
            <img src={AVATAR} alt="Avatar" className="profile-avatar-img" />
          </button>
        </div>

        {/* Username + worn gift TGS badge */}
        <div className="profile-name-wrap">
          <div className="profile-name-row">
            <button className="profile-name-btn">username</button>
            {wornGift && (
              <button
                className="profile-worn-badge"
                aria-label={`Надет: ${wornGift.giftCdnName}`}
                onClick={() => {
                  // clicking worn badge = open detail of that gift
                  haptic()
                }}
              >
                <GiftLottie
                  giftName={wornGift.giftCdnName}
                  modelName={wornGift.modelName}
                  className="profile-worn-tgs"
                />
              </button>
            )}
          </div>
        </div>

        <div className="profile-status-wrap">
          <button className="profile-level-btn" aria-label="Рейтинг" onClick={() => { haptic(); onShowRating() }}>
            <LevelBadge />
          </button>
          <span className="profile-online">в сети</span>
        </div>

        {/* No topbar settings btn anymore — moved to avatar level */}
      </div>
    </div>
  )
}
const ProfilePage = memo(_ProfilePage)

// ─── Gift Card Skeleton ───────────────────────────────────────────────────────
function GiftCardSkeleton() {
  return (
    <div className="gift-card-skeleton">
      <div className="skeleton-img" />
      <div className="skeleton-price" />
    </div>
  )
}

// ─── Gift Card ────────────────────────────────────────────────────────────────
function GiftCard({ gift, onClick }: { gift: Gift; onClick: () => void }) {
  const iconSrc = GIFT_ICONS[gift.id]
  
  return (
    <button className="gift-card" onClick={() => { haptic(); onClick() }}>
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
function _GiftsPage({
  onBack,
  onBuy,
  isActive,
}: {
  onBack: () => void
  onBuy: (gift: Gift) => void
  isActive: boolean
}) {
  const [loading, setLoading] = useState(false)
  const prevActive = useRef(false)

  useEffect(() => {
    // Запускаем скелетон каждый раз при входе на вкладку
    if (isActive && !prevActive.current) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 1000)
      prevActive.current = true
      return () => clearTimeout(t)
    }
    if (!isActive) {
      prevActive.current = false
    }
  }, [isActive])

  return (
    <div className="gifts-root">
      <div className="gifts-glow-bg" aria-hidden="true" />

      <div className="gifts-topbar">
        <div className="gifts-topbar-inner">
          <button className="gifts-back-btn" aria-label="Выйти в меню" onClick={() => { haptic(); onBack() }}>
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
          {loading
            ? GIFTS.map(g => <GiftCardSkeleton key={g.id} />)
            : GIFTS.map(g => (
                <GiftCard key={g.id} gift={g} onClick={() => onBuy(g)} />
              ))
          }
        </div>
      </div>

    </div>
  )
}
const GiftsPage = memo(_GiftsPage)

// ─── Buy Page ─────────────────────────────────────────────────────────────────
function _BuyPage({ gift, onBack, onBought }: { gift: Gift; onBack: () => void; onBought: (gift: Gift) => void }) {
  const [hideAnon, setHideAnon] = useState(false)
  const [msg, setMsg] = useState('')
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
        <button className="buy-back-btn" onClick={() => { haptic(); onBack() }}><IconChevronLeft /></button>
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
                Уникальный подарок. Можно улучшить до коллекционного и сохранить в профиле.
              </div>
            </div>
            <div className="buy-card-ribbon">
              <div className="buy-card-ribbon-inner">3&nbsp;000 шт.</div>
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

        <div style={{ height: 160 }} />
      </div>

      <div className="buy-action-bar">
        <button
          className="buy-confirm-btn"
          style={{ flex: 1 }}
          onClick={() => { haptic(15); onBought(gift) }}
        >
          Получить бесплатно
        </button>
      </div>

    </div>
  )
}
const BuyPage = memo(_BuyPage)

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('profile')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sparksEnabled, setSparksEnabled] = useState(true)

  // Инвентарь
  const [ownedGifts, setOwnedGifts] = useState<AnyOwnedGift[]>([])

  // Выбранный подарок для detail sheet
  const [detailGift, setDetailGift] = useState<AnyOwnedGift | null>(null)

  // Upgrade modal
  const [upgradeUid, setUpgradeUid] = useState<string | null>(null)

  // Worn gift
  const [wornGift, setWornGift] = useState<WornGift | null>(null)

  const upgradeTarget = upgradeUid ? ownedGifts.find(o => o.uid === upgradeUid) ?? null : null
  const upgradeGiftId = upgradeTarget ? upgradeTarget.giftId : null

  const goGifts    = useCallback(() => setPage('gifts'),   [])
  const goProfile  = useCallback(() => setPage('profile'), [])
  const goBuy      = useCallback((g: Gift) => { setSelectedGift(g); setPage('buy') }, [])
  const openRating    = useCallback(() => setShowRating(true),  [])
  const closeRating   = useCallback(() => setShowRating(false), [])
  const openSettings  = useCallback(() => setShowSettings(true),  [])
  const closeSettings = useCallback(() => setShowSettings(false), [])
  const toggleSparks  = useCallback(() => setSparksEnabled(v => !v), [])
  const navOnGifts    = useCallback(() => setPage('gifts'),   [])
  const navOnProfile  = useCallback(() => setPage('profile'), [])

  const handleBought = useCallback((gift: Gift) => {
    const uid = `${gift.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setOwnedGifts(prev => [...prev, { uid, giftId: gift.id, upgraded: false }])
    setPage('profile')
  }, [])

  const handleSelectGift = useCallback((owned: AnyOwnedGift) => {
    setDetailGift(owned)
  }, [])

  const handleUpgradeFromDetail = useCallback(() => {
    if (!detailGift) return
    setUpgradeUid(detailGift.uid)
    setDetailGift(null)
  }, [detailGift])

  const handleUpgraded = useCallback((result: UpgradeResult) => {
    if (!upgradeUid) return
    setOwnedGifts(prev => prev.map(o => {
      if (o.uid !== upgradeUid) return o
      const upgraded: UpgradedOwnedGift = {
        uid: o.uid,
        giftId: o.giftId,
        upgraded: true,
        model: result.model,
        backdrop: result.backdrop,
        pattern: result.pattern,
        serialNumber: result.serialNumber,
        giftCdnName: result.giftName,
      }
      return upgraded
    }))
  }, [upgradeUid])

  // Wear gift
  const handleWear = useCallback((owned: UpgradedOwnedGift) => {
    setWornGift({
      uid: owned.uid,
      giftCdnName: owned.giftCdnName,
      modelName: owned.model.name,
      backdrop: owned.backdrop,
      pattern: owned.pattern,
    })
  }, [])

  const handleUnwear = useCallback(() => {
    setWornGift(null)
  }, [])

  const closeUpgrade = useCallback(() => setUpgradeUid(null), [])
  const closeDetail  = useCallback(() => setDetailGift(null), [])

  return (
    <SparklesCtx.Provider value={sparksEnabled}>
      <div className="app-root">
        <div className={`page-layer${page === 'profile' ? ' page-layer--active' : ''}`}>
          <ProfilePage
            onGifts={goGifts}
            onShowRating={openRating}
            onShowSettings={openSettings}
            ownedGifts={ownedGifts}
            onSelectGift={handleSelectGift}
            wornGift={wornGift}
          />
        </div>

        <div className={`page-layer${page === 'gifts' ? ' page-layer--active' : ''}`}>
          <GiftsPage onBack={goProfile} onBuy={goBuy} isActive={page === 'gifts'} />
        </div>

        <div className={`page-layer${page === 'buy' ? ' page-layer--active' : ''}`}>
          {selectedGift && (
            <BuyPage gift={selectedGift} onBack={goGifts} onBought={handleBought} />
          )}
        </div>

        {/* Таббар */}
        <BottomNav
          page={page === 'buy' ? 'gifts' : page}
          onGifts={navOnGifts}
          onProfile={navOnProfile}
          avatarSrc={AVATAR}
        />

        <RatingModal isOpen={showRating} onClose={closeRating} />

        <SettingsModal
          isOpen={showSettings}
          onClose={closeSettings}
          sparksEnabled={sparksEnabled}
          onToggleSparks={toggleSparks}
        />

        <GiftDetailSheet
          owned={detailGift}
          isOpen={detailGift !== null}
          onClose={closeDetail}
          onUpgrade={handleUpgradeFromDetail}
          onWear={handleWear}
          onUnwear={handleUnwear}
          wornUid={wornGift?.uid ?? null}
        />

        <UpgradeModal
          isOpen={upgradeUid !== null}
          giftId={upgradeGiftId}
          onClose={closeUpgrade}
          onUpgraded={handleUpgraded}
        />
      </div>
    </SparklesCtx.Provider>
  )
}
