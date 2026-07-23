import './App.css'

const COINS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    fiat: '$85 893.09',
    amount: '1.29 BTC',
    icon: (
      <svg viewBox="0 0 40 40" width="44" height="44">
        <circle cx="20" cy="20" r="20" fill="#f7931a" />
        <path
          d="M26.5 17.4c.4-2.5-1.5-3.8-4.1-4.7l.8-3.3-2-.5-.8 3.2-1.6-.4.8-3.2-2-.5-.8 3.3-3.3-.8-.5 2.1s1.5.4 1.4.4c.8.2.9.7.9 1.1l-2.1 8.5c-.1.3-.4.7-1 .5 0 0-1.4-.4-1.4-.4l-1 2.4 3.1.8 1.7.4-.9 3.4 2 .5.9-3.4 1.6.4-.9 3.4 2 .5.9-3.4c3.4.6 5.9.4 7-2.6.9-2.5 0-3.9-1.9-4.8 1.3-.3 2.3-1.2 2.7-3zm-4.7 6.6c-.6 2.5-4.9 1.1-6.3.8l1.1-4.4c1.4.4 5.8 1.1 5.2 3.6zm.7-6.7c-.6 2.3-4.2 1.1-5.4.8l1-4c1.2.3 4.9.8 4.4 3.2z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    symbol: 'TON',
    name: 'Toncoin',
    fiat: '$50 904.24',
    amount: '14 270.81 TON',
    icon: (
      <svg viewBox="0 0 40 40" width="44" height="44">
        <circle cx="20" cy="20" r="20" fill="#0098ea" />
        <path
          d="M27 13H13a.75.75 0 0 0-.6 1.2l6.9 9.38a.75.75 0 0 0 .6.3h.6a.75.75 0 0 0 .6-.3l6.9-9.38A.75.75 0 0 0 27 13Z"
          fill="#fff"
        />
        <path
          d="M19.4 23.58 14 16.5c-.3-.4.03-.9.5-.9H20v11.25a.75.75 0 0 1-.6-.67Z"
          fill="#fff"
          fillOpacity=".6"
        />
        <path
          d="M20.6 23.58 26 16.5c.3-.4-.03-.9-.5-.9H20v11.25a.75.75 0 0 0 .6-.67Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    fiat: '$31 368.71',
    amount: '8.81 ETH',
    icon: (
      <svg viewBox="0 0 40 40" width="44" height="44">
        <circle cx="20" cy="20" r="20" fill="#eceff1" />
        <g transform="translate(12, 7)">
          <path d="M8 0 0 13.5l8 4.7 8-4.7L8 0Z" fill="#8c93a8" />
          <path d="M0 13.5 8 18.2V9.6L0 13.5Z" fill="#454a75" />
          <path d="M8 9.6v8.6l8-4.7L8 9.6Z" fill="#8c93a8" />
          <path d="M0 15.2 8 26l8-10.8-8 4.7-8-4.7Z" fill="#454a75" />
          <path d="M8 26 16 15.2l-8 4.7V26Z" fill="#8c93a8" />
        </g>
      </svg>
    ),
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    fiat: '$17 623.39',
    amount: '17 623.39 USDT',
    icon: (
      <svg viewBox="0 0 40 40" width="44" height="44">
        <circle cx="20" cy="20" r="20" fill="#26a17b" />
        <path
          d="M21.5 21.4v-.01c-.09.01-.53.03-1.5.03-.78 0-1.33-.01-1.52-.03v.01c-2.97-.13-5.2-.65-5.2-1.28s2.23-1.14 5.2-1.28v2.04c.19.01.75.05 1.53.05.93 0 1.4-.04 1.49-.05V18.84c2.96.13 5.18.65 5.18 1.28s-2.22 1.15-5.18 1.28Zm0-2.75v-1.82h4.15V14H14.35v2.83h4.14v1.82c-3.36.15-5.9.81-5.9 1.6s2.54 1.44 5.9 1.6v5.72h3.01v-5.72c3.35-.16 5.89-.81 5.89-1.6s-2.54-1.45-5.89-1.6Z"
          fill="#fff"
        />
      </svg>
    ),
  },
]

export default function App() {
  return (
    <div className="shell">
      <div className="screen">
        <div className="content">

          {/* Balance */}
          <div className="balance">
            <div className="balance__row">
              <div>
                <p className="balance__label">Your balance</p>
                <h1 className="balance__amount">$175 548.36</h1>
                <p className="balance__sub">≈ 2.63981 BTC</p>
              </div>
              <div className="balance__badge">
                <div className="balance__notif">9+</div>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path d="M4 6h16M4 11h16M4 16h10" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="btn-row">
            <button className="btn btn--primary" type="button">
              <svg viewBox="0 0 22 22" width="18" height="18" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#fff" strokeWidth="1.7"/>
                <path d="M11 7v8M7 11h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Deposit
            </button>
            <button className="btn btn--secondary" type="button">
              <svg viewBox="0 0 22 22" width="18" height="18" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#3b82f6" strokeWidth="1.7"/>
                <path d="M11 7v8M7 14l4 4 4-4" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Withdraw
            </button>
          </div>

          {/* Coin list */}
          <div className="coin-list">
            {COINS.map((coin) => (
              <div className="coin-card" key={coin.symbol}>
                <div className="coin-card__icon">{coin.icon}</div>
                <div className="coin-card__info">
                  <span className="coin-card__symbol">{coin.symbol}</span>
                  <span className="coin-card__name">{coin.name}</span>
                </div>
                <div className="coin-card__values">
                  <span className="coin-card__fiat">{coin.fiat}</span>
                  <span className="coin-card__amount">{coin.amount}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
