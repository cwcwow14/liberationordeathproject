import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { LOD_MARK_PATH } from '../components/LodMark'
import { QUOTES, type Quote } from '../lib/slogans'
import { trackEvent } from '../lib/track'

export const Route = createFileRoute('/quotes')({
  head: () => ({
    meta: [
      { title: 'Quote Cards — LOD' },
      { name: 'description', content: 'Make a LOD quote card for your Instagram or TikTok story. Pick a line from the manifesto, choose a style, and share it.' },
    ],
    links: [{ rel: 'canonical', href: 'https://liberationordeath.net/quotes' }],
  }),
  component: QuotesPage,
})

type Format = 'story' | 'square'
type Theme = 'night' | 'poster' | 'paper'

const SIZES: Record<Format, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
}

const THEMES: Record<Theme, { label: string; bg: string; text: string; accent: string; mark: string; brand: string; glow?: string; grain: number }> = {
  night: { label: 'Night', bg: '#0a0a0a', text: '#ffffff', accent: '#ff3b30', mark: '#ffffff', brand: '#4caf50', glow: 'rgba(76,175,80,0.22)', grain: 0.09 },
  poster: { label: 'Poster', bg: '#ff3b30', text: '#0a0a0a', accent: '#ffffff', mark: '#0a0a0a', brand: '#0a0a0a', grain: 0.12 },
  paper: { label: 'Paper', bg: '#ece6d8', text: '#111111', accent: '#d92b21', mark: '#111111', brand: '#2e7d32', grain: 0.14 },
}

// A small tile of random noise, repeated over the card for a printed texture.
function grainPattern(ctx: CanvasRenderingContext2D, alpha: number): CanvasPattern | null {
  const tile = document.createElement('canvas')
  tile.width = tile.height = 160
  const t = tile.getContext('2d')
  if (!t) return null
  const img = t.createImageData(160, 160)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() < 0.5 ? 0 : 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = Math.random() * 255 * alpha
  }
  t.putImageData(img, 0, 0)
  return ctx.createPattern(tile, 'repeat')
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawCard(canvas: HTMLCanvasElement, quote: Quote, format: Format, themeId: Theme) {
  const { w, h } = SIZES[format]
  const th = THEMES[themeId]
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Background (+ a soft glow on the dark theme).
  ctx.fillStyle = th.bg
  ctx.fillRect(0, 0, w, h)
  if (th.glow) {
    const g = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, h * 0.6)
    g.addColorStop(0, th.glow)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  const pad = 96
  const story = format === 'story'

  // Logo + name at the top.
  const markSize = story ? 150 : 110
  const markY = story ? 150 : 80
  ctx.save()
  ctx.translate(pad, markY)
  const scale = markSize / 141.42
  ctx.scale(scale, scale)
  ctx.translate(20.71, 20.71)
  ctx.translate(50, 50)
  ctx.rotate(Math.PI / 4)
  ctx.translate(-50, -50)
  ctx.fillStyle = th.mark
  ctx.fill(new Path2D(LOD_MARK_PATH), 'evenodd')
  ctx.restore()

  ctx.fillStyle = th.brand
  ctx.font = `700 ${story ? 40 : 34}px Oswald`
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '8px'
  ctx.fillText('LIBERATION OR DEATH', pad + markSize + 28, markY + markSize / 2)

  // The quote: largest size that fits the box.
  const boxTop = story ? 470 : 280
  const boxBottom = story ? h - 420 : h - 250
  const maxW = w - pad * 2
  let size = story ? 132 : 104
  let lines: string[] = []
  ctx.letterSpacing = '2px'
  for (; size >= 48; size -= 4) {
    ctx.font = `${size}px Anton`
    lines = wrapLines(ctx, quote.text.toUpperCase(), maxW)
    if (lines.length * size * 1.08 <= boxBottom - boxTop - size) break
  }
  const lineH = size * 1.08
  const blockH = lines.length * lineH
  let y = boxTop + (boxBottom - boxTop - blockH) / 2

  // Big opening quote mark in the accent colour.
  ctx.fillStyle = th.accent
  ctx.font = `${Math.round(size * 1.6)}px Anton`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('“', pad - 6, y + size * 0.55)

  ctx.fillStyle = th.text
  ctx.font = `${size}px Anton`
  ctx.textBaseline = 'top'
  for (const line of lines) {
    ctx.fillText(line, pad, y)
    y += lineH
  }

  // Source line.
  ctx.fillStyle = th.accent
  ctx.font = `700 ${story ? 38 : 32}px Oswald`
  ctx.letterSpacing = '6px'
  ctx.fillText(`— ${quote.source.toUpperCase()}`, pad, y + 30)

  // Footer: rule, site, handle.
  const footY = h - (story ? 200 : 120)
  ctx.fillStyle = th.brand
  ctx.fillRect(pad, footY, 120, 8)
  ctx.font = `700 ${story ? 40 : 32}px Oswald`
  ctx.letterSpacing = '5px'
  ctx.fillStyle = th.text
  ctx.textBaseline = 'top'
  ctx.fillText('LIBERATIONORDEATH.NET', pad, footY + 32)
  ctx.fillStyle = th.brand
  ctx.font = `400 ${story ? 32 : 26}px Oswald`
  ctx.fillText('@LIBERATIONORD3ATH', pad, footY + (story ? 86 : 74))
  ctx.letterSpacing = '0px'

  // Printed grain over everything.
  const pattern = grainPattern(ctx, th.grain)
  if (pattern) {
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, w, h)
  }
}

function QuotesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [quote, setQuote] = useState<Quote>(QUOTES[0])
  const [format, setFormat] = useState<Format>('story')
  const [theme, setTheme] = useState<Theme>('night')
  const [fontsReady, setFontsReady] = useState(false)
  const [canShareFiles, setCanShareFiles] = useState(false)

  useEffect(() => {
    // Canvas text only uses a web font once it has loaded — wait for them.
    Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('700 40px Oswald'),
      document.fonts.load('400 40px Oswald'),
    ]).finally(() => setFontsReady(true))
    try {
      const probe = new File([new Blob()], 'x.png', { type: 'image/png' })
      setCanShareFiles(typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }))
    } catch {
      setCanShareFiles(false)
    }
  }, [])

  useEffect(() => {
    if (fontsReady && canvasRef.current) drawCard(canvasRef.current, quote, format, theme)
  }, [fontsReady, quote, format, theme])

  function toFile(): Promise<File | null> {
    return new Promise(resolve => {
      canvasRef.current?.toBlob(b => resolve(b ? new File([b], `lod-${quote.id}-${format}.png`, { type: 'image/png' }) : null), 'image/png')
    })
  }

  async function download() {
    const file = await toFile()
    if (!file) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    trackEvent('share', `quote-download:${quote.id}`)
  }

  async function share() {
    const file = await toFile()
    if (!file) return
    try {
      await navigator.share({ files: [file], text: 'liberationordeath.net' })
      trackEvent('share', `quote-share:${quote.id}`)
    } catch {
      // closed the share sheet
    }
  }

  return (
    <>
      <SiteNav />

      <div className="photos-hero">
        <div className="section-label">— Spread the Word</div>
        <h1 className="section-title">Quote Cards</h1>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p className="reach-lede">
          Pick a line, pick a style, post it to your story. Every card carries the movement further.
        </p>
      </div>

      <section className="quotes-wrap">
        <div>
          <div className="quote-controls">
            <div className="stats-range" role="tablist" aria-label="Format">
              {(['story', 'square'] as Format[]).map(f => (
                <button key={f} role="tab" aria-selected={format === f} className={`auth-tab${format === f ? ' active' : ''}`} onClick={() => setFormat(f)}>
                  {f === 'story' ? 'Story 9:16' : 'Square 1:1'}
                </button>
              ))}
            </div>
            <div className="stats-range" role="tablist" aria-label="Style">
              {(Object.keys(THEMES) as Theme[]).map(t => (
                <button key={t} role="tab" aria-selected={theme === t} className={`auth-tab${theme === t ? ' active' : ''}`} onClick={() => setTheme(t)}>
                  {THEMES[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="quote-list" role="radiogroup" aria-label="Quote">
            {QUOTES.map(q => (
              <button key={q.id} role="radio" aria-checked={quote.id === q.id} className={`quote-option${quote.id === q.id ? ' active' : ''}`} onClick={() => setQuote(q)}>
                “{q.text}”
              </button>
            ))}
          </div>
        </div>

        <div className="quote-preview">
          <canvas ref={canvasRef} className="quote-canvas" width={1080} height={1920} aria-label={`Quote card: ${quote.text}`} />
          <div className="quote-actions">
            {canShareFiles && <button className="btn-primary" onClick={share}>Share to Story</button>}
            <button className={canShareFiles ? 'btn-outline' : 'btn-primary'} onClick={download}>Download Image</button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
