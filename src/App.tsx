import { useState } from 'react'
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

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconSettings() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.4"/>
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
        {/* outer shield — transparent background layer */}
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
        {/* inner shield — coloured fill */}
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
      {/* number */}
      <span className="badge-num">1</span>
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
      {/* spacer for the avatar bump */}
      <div className="bnav-spacer" />
      <button
        className={`bnav-item${page === 'gifts' ? ' active' : ''}`}
        onClick={onGifts}
      >
        <IconGift />
        <span>Подарки</span>
      </button>
      {/* centre avatar button */}
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
function RatingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}><IconClose /></button>
          <span className="modal-title">Рейтинг</span>
        </div>

        {/* progress bar section */}
        <div className="rating-progress-wrap">
          <div className="rating-bubble">
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
              <path d="M13.98 22 C15.34 22 16.44 20.85 16.44 19.49 C16.44 19.07 16.34 18.68 16.15 18.33 L18.64 12.42 C19.03 11.67 20.07 11.54 20.62 12.19 L22.89 14.82 C23.1 15.06 23.14 15.39 23.07 15.7 C23.04 15.86 23.02 16.03 23.02 16.2 C23.02 17.56 24.13 18.67 25.49 18.67 C26.85 18.67 27.96 17.56 27.96 16.2 C27.96 15.17 27.33 14.3 26.44 13.92 C26.13 13.8 25.86 13.56 25.79 13.23 L23.17 1.42 C22.99 0.59 22.26 0 21.41 0 L6.55 0 C5.7 0 4.97 0.59 4.78 1.42 L2.17 13.23 C2.1 13.56 1.83 13.8 1.52 13.92 C0.63 14.29 0 15.17 0 16.2 C0 17.56 1.1 18.67 2.47 18.67 C3.83 18.67 4.93 17.56 4.93 16.2 C4.93 16.03 4.92 15.86 4.88 15.7 C4.82 15.39 4.86 15.06 5.06 14.82 L7.33 12.19 C7.89 11.54 8.92 11.67 9.32 12.42 L11.86 18.33 C11.62 18.68 11.51 19.07 11.51 19.49 C11.51 20.85 12.62 22 13.98 22 Z" fill="white"/>
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

        {/* factors */}
        <div className="rating-factors">
          <div className="rating-factor">
            <span className="rating-factor-label plus">плюс</span>
            <div>
              <div className="rating-factor-title">Подарки и профиль</div>
              <div className="rating-factor-sub">100% звёзд, потраченных на покупку и улучшение подарков, номера +888 и фоны профиля.</div>
            </div>
          </div>
          <div className="rating-factor">
            <span className="rating-factor-label plus">плюс</span>
            <div>
              <div className="rating-factor-title">Маркет</div>
              <div className="rating-factor-sub">100% звёзд, потраченных на покупку подарков у других игроков.</div>
            </div>
          </div>
          <div className="rating-factor">
            <span className="rating-factor-label plus">плюс</span>
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
}: {
  onGifts: () => void
  onShowRating: () => void
}) {
  return (
    <div className="profile-root">
      {/* scrollable area */}
      <div className="profile-scroll no-scrollbar">
        {/* spacer for the fixed header card */}
        <div style={{ height: 'calc(var(--page-pt, 0px) + 259px)' }} aria-hidden="true" />

        {/* content below header */}
        <div style={{ minHeight: '100dvh' }}>
          {/* user info block */}
          <div className="profile-info-card">
            <div className="profile-info-inner">
              {/* username row */}
              <button className="profile-row">
                <div className="profile-row-content">
                  <div className="profile-row-label">имя пользователя</div>
                  <div className="profile-row-value link">@treeze8</div>
                </div>
                <IconCopy />
              </button>
              {/* bio row */}
              <div className="profile-row-static">
                <div className="profile-row-label">био</div>
                <button className="profile-row-value muted">Добавьте описание</button>
              </div>
            </div>
          </div>

          {/* gifts grid (empty) */}
          <div className="profile-gifts-area">
            <div className="profile-gifts-grid" />
          </div>
        </div>
      </div>

      {/* Fixed header card */}
      <div className="profile-header-card">
        <div className="profile-header-bg" />

        {/* top bar (settings button) */}
        <div className="profile-topbar">
          <span />
          <div className="profile-topbar-right">
            <button className="profile-settings-btn" aria-label="Настройки">
              <IconSettings />
            </button>
          </div>
        </div>

        {/* avatar */}
        <div className="profile-avatar-wrap">
          <button className="profile-avatar-btn" aria-label="Сменить аватар">
            <div className="profile-avatar-glow" />
            <img src={AVATAR} alt="Avatar" className="profile-avatar-img" />
          </button>
        </div>

        {/* display name */}
        <div className="profile-name-wrap">
          <button className="profile-name-btn">print('vrhud')</button>
        </div>

        {/* level badge + online status */}
        <div className="profile-status-wrap">
          <button className="profile-level-btn" aria-label="Рейтинг" onClick={onShowRating}>
            <LevelBadge />
          </button>
          <span className="profile-online">в сети</span>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav page="profile" onGifts={onGifts} onProfile={() => {}} avatarSrc={AVATAR} />
    </div>
  )
}

// ─── Gift Card ────────────────────────────────────────────────────────────────
function GiftCard({ gift, onClick }: { gift: Gift; onClick: () => void }) {
  return (
    <button className="gift-card" onClick={onClick} style={{ animationDelay: `${gift.id * 0.035}s` }}>
      <div className="gift-card-img">
        {/* placeholder coloured square since we have no real lottie */}
        <div className="gift-card-placeholder" />
      </div>
      <div className="gift-card-price">
        <span className="gift-price-star"><IconStar size={13} /></span>
        <span>{gift.stars.toLocaleString('ru')}</span>
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
      {/* glow bg */}
      <div className="gifts-glow-bg" aria-hidden="true" />

      {/* top bar */}
      <div className="gifts-topbar">
        <div className="gifts-topbar-inner">
          <button className="gifts-back-btn" aria-label="Выйти в меню" onClick={onBack}>
            <IconChevronLeft />
          </button>
        </div>
      </div>

      {/* scrollable content */}
      <div className="gifts-scroll no-scrollbar">
        {/* user header */}
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

        {/* grid */}
        <div className="gifts-grid">
          {GIFTS.map(g => (
            <GiftCard key={g.id} gift={g} onClick={() => onBuy(g)} />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
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

  return (
    <div className="buy-root">
      {/* pattern bg */}
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

      {/* back pill */}
      <div className="buy-topbar">
        <button className="buy-back-btn" onClick={onBack}><IconChevronLeft /></button>
      </div>

      {/* scrollable */}
      <div className="buy-scroll no-scrollbar">
        {/* card */}
        <div className="buy-card-wrap">
          <div className="buy-card">
            <div className="buy-card-inner">
              <div className="buy-card-gift-img">
                <div className="buy-card-placeholder" />
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
          {/* message input */}
          <div className="buy-msg-wrap">
            <input
              className="buy-msg-input"
              placeholder="Введите сообщение (необязательно)"
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
          </div>
        </div>

        {/* hide name toggle */}
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

        {/* availability bar */}
        <div className="buy-avail-bar-wrap">
          <div className="buy-avail-bar">
            <div className="buy-avail-fill" style={{ width: '96.7%' }} />
            <span className="buy-avail-left">2&nbsp;900 осталось</span>
            <span className="buy-avail-right">100 продано</span>
          </div>
        </div>
        <p className="buy-avail-hint">Когда все подарки будут проданы, вы больше не сможете их купить.</p>

        {/* bottom spacer */}
        <div style={{ height: 160 }} />
      </div>

      {/* fixed buy bar */}
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

      {/* bottom nav */}
      <BottomNav page="gifts" onGifts={onBack} onProfile={onBack} avatarSrc={AVATAR} />
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('profile')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [showRating, setShowRating] = useState(false)

  function goGifts() { setPage('gifts') }
  function goProfile() { setPage('profile') }
  function goBuy(g: Gift) { setSelectedGift(g); setPage('buy') }

  return (
    <div className="app-root">
      {page === 'profile' && (
        <ProfilePage onGifts={goGifts} onShowRating={() => setShowRating(true)} />
      )}
      {page === 'gifts' && (
        <GiftsPage onBack={goProfile} onBuy={goBuy} />
      )}
      {page === 'buy' && selectedGift && (
        <BuyPage gift={selectedGift} onBack={goGifts} />
      )}
      {showRating && <RatingModal onClose={() => setShowRating(false)} />}
    </div>
  )
}
