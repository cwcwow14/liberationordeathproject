import { useEffect, useRef, useState } from 'react'

function format(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return Math.round(n).toLocaleString()
}

// Counts up from 0 to `value` the first time it scrolls into view. The server
// renders the final number, so it reads correctly without JavaScript and for
// people who prefer reduced motion.
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || value <= 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    setShown(0)
    let raf = 0
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      const start = performance.now()
      const duration = 1600
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setShown(value * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value])

  return <span ref={ref}>{format(shown)}<span className="accent">{suffix}</span></span>
}
