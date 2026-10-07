import { TICKER_SLOGANS } from '../lib/slogans'

// A red band of slogans scrolling sideways. The list is rendered twice so the
// loop is seamless (the animation moves exactly one copy's width).
export function SloganTicker() {
  const items = [...TICKER_SLOGANS, ...TICKER_SLOGANS]
  return (
    <div className="ticker-wrap">
    <div className="ticker" aria-label={TICKER_SLOGANS.join('. ')}>
      <div className="ticker-track" aria-hidden="true">
        {items.map((s, i) => (
          <span key={i} className="ticker-item">
            {s}
            <span className="ticker-sep">✕</span>
          </span>
        ))}
      </div>
    </div>
    </div>
  )
}
