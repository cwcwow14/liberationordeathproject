import type { Context } from '@netlify/edge-functions'

/**
 * Markdown-for-agents edge function.
 *
 * AI agents and LLM crawlers only want the words on the page. Serving them the full
 * React-rendered HTML (inline styles, hydration payload, nav, footer, SVG logos) burns
 * roughly 5x the tokens of the equivalent Markdown. This function watches for
 * `Accept: text/markdown` and, only then, converts the origin's HTML into Markdown.
 * Normal browser traffic is untouched — no `Accept: text/markdown`, no work done.
 *
 * ---------------------------------------------------------------------------
 * NO RUNTIME DEPENDENCIES — DELIBERATELY
 * ---------------------------------------------------------------------------
 * This file must not import anything at runtime. It used to do
 * `import TurndownService from 'turndown'` at the top level, and that took the site down:
 * Turndown's published entry point is a CommonJS Node build which pulls in
 * `@mixmark-io/domino` for its DOM, and that cannot load on the Deno runtime edge
 * functions run on. The failure happened while the module was still being loaded — before
 * the handler is ever called — so the `Accept: text/markdown` guard below never got the
 * chance to wave ordinary requests through. Every visitor to a registered path got an
 * empty HTTP 500 instead of a page.
 *
 * The conversion below is therefore self-contained: string transforms only, no DOM and no
 * packages. It aims at the markup this site actually emits rather than at every HTML
 * document in existence, which is all it needs to do. Keep it dependency-free — an opt-in
 * convenience for agents must never be able to blank out the pages real people visit.
 *
 * ---------------------------------------------------------------------------
 * TESTING IT
 * ---------------------------------------------------------------------------
 * Markdown response (what an agent sees):
 *
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/path
 *
 * Concretely, for this site:
 *
 *   curl -H "Accept: text/markdown" https://liberationordeathproject.netlify.app/
 *   curl -H "Accept: text/markdown" https://liberationordeathproject.netlify.app/photos
 *
 * The normal HTML response is unchanged — omit the header to confirm:
 *
 *   curl https://liberationordeathproject.netlify.app/
 *
 * Inspect the token estimate without dumping the body (`-I` would send a HEAD request,
 * which is not converted, so ask for headers on a real GET instead):
 *
 *   curl -s -o /dev/null -D - -H "Accept: text/markdown" https://liberationordeathproject.netlify.app/
 *
 * ---------------------------------------------------------------------------
 * TESTING LOCALLY
 * ---------------------------------------------------------------------------
 * Edge functions run locally under `netlify dev` (Deno is downloaded on first run):
 *
 *   netlify dev --port 8889
 *   curl -H "Accept: text/markdown" http://localhost:8889/
 *
 * ---------------------------------------------------------------------------
 * WHICH PATHS ARE CONVERTED
 * ---------------------------------------------------------------------------
 * Registration lives in `netlify.toml`, not here:
 *
 *   [[edge_functions]]
 *     function = "markdown"
 *     path = "/about"
 *
 * To add a path, append a block with the new `path`. To remove one, delete its block.
 * Wildcards work too (`path = "/blog/*"`), and `excludedPath` carves exceptions out of
 * a wildcard (e.g. `excludedPath = ["/blog/drafts/*"]`). Only add content pages —
 * utility routes (`/login`), API endpoints and static assets have no prose worth
 * converting, so they are deliberately not registered.
 */

/**
 * Elements that carry no page content. Removed wholesale before conversion, so the
 * converter never sees them: chrome (nav/header/footer/aside), non-prose payloads
 * (script/style/svg/iframe), and interactive controls that flatten into meaningless
 * Markdown.
 *
 * `button` is deliberately absent — this site wraps call-to-action links around buttons
 * (`<a href="/photos"><button>View Photos</button></a>`), so removing buttons would strip
 * the link text and leave empty `[](/photos)` links. Form controls are already covered by
 * removing `form` itself.
 */
const NON_CONTENT_TAGS = [
  'script',
  'style',
  'noscript',
  'template',
  'svg',
  'iframe',
  'nav',
  'header',
  'footer',
  'aside',
  'form',
]

/** Tags that start and end a block of prose, so their edges become blank lines. */
const BLOCK_TAGS = [
  'p',
  'div',
  'section',
  'article',
  'main',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'figure',
  'figcaption',
  'address',
  'details',
  'summary',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]

/**
 * This site styles its headings as `<div class="hero-title">` / `"section-title"` /
 * `"pillar-title"` rather than using <h1>–<h6>, so a naive conversion flattens the whole
 * page into undifferentiated paragraphs. Promoting those divs to real headings is what
 * gives the Markdown its outline — the single most useful thing for an agent skimming the
 * page. Any element whose class ends in `-title` is picked up, so new sections following
 * the same convention are handled without touching this file.
 */
const TITLE_CLASS = /(?:^|\s)[\w-]*title(?:\s|$)/

/** The handful of named entities worth knowing about; everything else stays literal. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ensp: ' ',
  emsp: ' ',
  thinsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  deg: '°',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  times: '×',
  minus: '−',
}

/**
 * Decodes character references in a single pass, so text that legitimately contains an
 * escaped ampersand (`&amp;lt;` → `&lt;`) is not decoded twice down to `<`.
 */
function decodeEntities(text: string): string {
  return text.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body: string) => {
    if (body.charAt(0) === '#') {
      const hex = body.charAt(1) === 'x' || body.charAt(1) === 'X'
      const code = parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match
      return String.fromCodePoint(code)
    }

    return NAMED_ENTITIES[body.toLowerCase()] ?? match
  })
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/** Squeezes runs of spaces and tabs while leaving line breaks alone. */
function collapseSpaces(text: string): string {
  return text.replace(/[ \t]+/g, ' ')
}

/** Reads one attribute off a single tag, without decoding — that happens once, at the end. */
function readAttribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag)
  if (!match) return null
  return match[2] ?? match[3] ?? match[4] ?? null
}

/**
 * Removes every occurrence of the given tags, including their contents.
 *
 * Regex alone can't handle nesting (a `<nav>` inside a `<nav>` would end the match at the
 * first `</nav>`), so this scans forward from each opening tag and tracks depth to find
 * the true closing tag.
 */
function removeElements(html: string, tags: string[]): string {
  let out = html

  for (const tag of tags) {
    const opening = new RegExp(`<${tag}\\b[^>]*>`, 'i')

    while (true) {
      const match = opening.exec(out)
      if (!match) break

      const start = match.index
      const afterOpen = start + match[0].length

      // Self-closing form has no contents to skip.
      if (match[0].endsWith('/>')) {
        out = out.slice(0, start) + out.slice(afterOpen)
        continue
      }

      const boundaries = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'gi')
      boundaries.lastIndex = afterOpen

      let depth = 1
      let end = -1
      let boundary: RegExpExecArray | null

      while ((boundary = boundaries.exec(out)) !== null) {
        if (boundary[0][1] === '/') {
          depth -= 1
          if (depth === 0) {
            end = boundary.index + boundary[0].length
            break
          }
        } else {
          depth += 1
        }
      }

      // Unclosed tag — nothing after it can be trusted as content.
      if (end === -1) {
        out = out.slice(0, start)
        break
      }

      out = out.slice(0, start) + out.slice(end)
    }
  }

  return out
}

/** Narrows a full HTML document down to the region that actually holds the content. */
function extractContent(html: string): string {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)
  if (main) return main[1]

  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html)
  if (article) return article[1]

  const body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html)
  if (body) return body[1]

  return html
}

function extractTitle(html: string): string | null {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  if (!match) return null

  const title = decodeEntities(stripTags(match[1])).trim()
  return title || null
}

/** Heading text has to stay on one line, whatever the source markup did. */
function oneLine(html: string): string {
  return html.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim()
}

function headingLevel(className: string): number {
  if (/hero-title/.test(className)) return 1
  if (/section-title/.test(className)) return 2
  return 3
}

/**
 * Turns block-level structure into Markdown, leaving inline markup in place for
 * {@link renderInline} to finish. Inline tags are deliberately left alone here so the
 * whole document is decoded exactly once, at the very end.
 */
function convertBlocks(html: string): string {
  let out = html

  out = out.replace(/<hr\b[^>]*>/gi, '\n\n---\n\n')

  // This site writes its calls to action as `<a href="..."><button>Label</button></a>`.
  // Converting the pair here, as a block, keeps a row of buttons from collapsing into one
  // run-on line of text later.
  out = out.replace(
    /<a\b([^>]*)>\s*<button\b[^>]*>([\s\S]*?)<\/button\s*>\s*<\/a\s*>/gi,
    (_match, attrs: string, inner: string) => {
      const label = oneLine(inner)
      if (!label) return '\n\n'

      const href = readAttribute(`<a${attrs}>`, 'href')
      if (!href || href.startsWith('#') || /^javascript:/i.test(href)) return `\n\n${label}\n\n`

      return `\n\n[${label}](${href})\n\n`
    },
  )

  // Buttons that aren't links are still their own line — they are labels, not prose.
  out = out.replace(/<button\b[^>]*>([\s\S]*?)<\/button\s*>/gi, (_match, inner: string) => {
    const label = oneLine(inner)
    return label ? `\n\n${label}\n\n` : '\n\n'
  })

  // Real headings first, so an <h2 class="section-title"> keeps its own level.
  out = out.replace(
    /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi,
    (_match, level: string, inner: string) => {
      const text = oneLine(inner)
      return text ? `\n\n${'#'.repeat(Number(level))} ${text}\n\n` : '\n\n'
    },
  )

  // Then this site's headings-as-divs. Requiring "title" inside the class attribute keeps
  // the match tight: a plain wrapper <div> can't swallow the heading nested inside it.
  out = out.replace(
    /<(div|span|p)\b([^>]*\bclass\s*=\s*"[^"]*title[^"]*"[^>]*)>([\s\S]*?)<\/\1\s*>/gi,
    (match, _tag: string, attrs: string, inner: string) => {
      const className = readAttribute(`<x ${attrs}>`, 'class') ?? ''
      // `hero-subtitle` also ends in "title" but is body copy, not a heading.
      if (!TITLE_CLASS.test(className) || /subtitle/.test(className)) return match

      const text = oneLine(inner)
      return text ? `\n\n${'#'.repeat(headingLevel(className))} ${text}\n\n` : '\n\n'
    },
  )

  out = out.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_match, inner: string) => {
    const code = stripTags(inner).replace(/^\n+|\n+$/g, '')
    return code ? `\n\n\`\`\`\n${code}\n\`\`\`\n\n` : '\n\n'
  })

  out = out.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, inner: string) => {
    const text = oneLine(inner.replace(/<\/p\s*>/gi, ' '))
    return text ? `\n\n> ${text}\n\n` : '\n\n'
  })

  // Numbered lists keep their numbering; every other list item becomes a bullet.
  out = out.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_match, inner: string) => {
    let index = 0
    const items = inner.replace(/<li\b[^>]*>([\s\S]*?)<\/li\s*>/gi, (_liMatch, li: string) => {
      const text = oneLine(li)
      if (!text) return ''
      index += 1
      return `\n${index}. ${text}`
    })
    return `\n\n${items}\n\n`
  })

  out = out.replace(/<li\b[^>]*>([\s\S]*?)<\/li\s*>/gi, (_match, inner: string) => {
    const text = oneLine(inner)
    return text ? `\n- ${text}\n` : ''
  })

  // Whatever block scaffolding is left just becomes paragraph breaks.
  for (const tag of BLOCK_TAGS) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'gi'), '\n\n')
  }

  return out
}

/**
 * Converts inline markup, drops any tag still standing, and decodes entities — in that
 * order, so `&lt;div&gt;` in the prose survives as text instead of being mistaken for a
 * tag and deleted.
 */
function renderInline(html: string): string {
  let out = html

  out = out.replace(/<br\s*\/?>/gi, '\n')

  out = out.replace(/<img\b[^>]*>/gi, (tag: string) => {
    const src = readAttribute(tag, 'src')
    if (!src) return ''
    return `![${readAttribute(tag, 'alt') ?? ''}](${src})`
  })

  out = out.replace(/<code\b[^>]*>([\s\S]*?)<\/code\s*>/gi, (_match, inner: string) => {
    const text = collapseSpaces(stripTags(inner)).trim()
    return text ? `\`${text}\`` : ''
  })

  // Emphasis before links, so `<a><strong>x</strong></a>` keeps its bold inside the link.
  out = wrapInline(out, ['strong', 'b'], '**')
  out = wrapInline(out, ['em', 'i'], '_')

  out = out.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi, (_match, attrs: string, inner: string) => {
    // Link text has to stay on one line even if the markup inside it spanned several.
    const text = stripTags(inner).replace(/\s+/g, ' ').trim()
    if (!text) return ''

    const href = readAttribute(`<a${attrs}>`, 'href')
    // In-page anchors and javascript handlers are navigation, not information.
    if (!href || href.startsWith('#') || /^javascript:/i.test(href)) return text

    return `[${text}](${href})`
  })

  return decodeEntities(collapseSpaces(stripTags(out)))
}

/** Wraps an inline element in a Markdown delimiter, keeping any spacing outside it. */
function wrapInline(html: string, tags: string[], delimiter: string): string {
  let out = html

  for (const tag of tags) {
    out = out.replace(
      new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}\\s*>`, 'gi'),
      (_match, inner: string) => {
        const text = inner.replace(/^\s+|\s+$/g, '')
        if (!text) return ' '

        const lead = /^\s/.test(inner) ? ' ' : ''
        const tail = /\s$/.test(inner) ? ' ' : ''
        return `${lead}${delimiter}${text}${delimiter}${tail}`
      },
    )
  }

  return out
}

/** Trailing spaces and runs of blank lines are what all the tag-stripping leaves behind. */
function tidy(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function htmlToMarkdown(html: string): string {
  const title = extractTitle(html)

  let content = extractContent(html)
  content = content.replace(/<!--[\s\S]*?-->/g, '')
  content = removeElements(content, NON_CONTENT_TAGS)

  const markdown = tidy(renderInline(convertBlocks(content)))

  // The <title> is the page's own summary of itself and lives outside <body>, so it is
  // reattached as the top-level heading unless the content already opens with one.
  if (title && !markdown.startsWith('# ')) {
    return `# ${title}\n\n${markdown}`
  }

  return markdown
}

export default async (request: Request, context: Context) => {
  // Everything below is opt-in: without the header the request never leaves the fast path.
  const accept = request.headers.get('accept') ?? ''
  if (!accept.toLowerCase().includes('text/markdown')) return

  // Only readable page loads have HTML worth converting.
  if (request.method !== 'GET') return

  let html: string | null = null
  let originResponse: Response | null = null

  try {
    // Ask the origin for HTML explicitly. Forwarding `Accept: text/markdown` upstream
    // makes the TanStack Start server reject the request outright ("Only HTML requests
    // are supported here"), so the header is rewritten before the request continues.
    const originHeaders = new Headers(request.headers)
    originHeaders.set('accept', 'text/html,application/xhtml+xml')

    originResponse = await context.next(
      new Request(request.url, { method: request.method, headers: originHeaders }),
    )

    // Redirects, errors and non-HTML payloads pass through as-is.
    const contentType = originResponse.headers.get('content-type') ?? ''
    if (!originResponse.ok || !contentType.includes('text/html')) {
      return originResponse
    }

    html = await originResponse.text()
    const markdown = htmlToMarkdown(html)

    // An empty conversion means the page was client-rendered or the strip was too
    // aggressive. Serving the HTML back is better than serving nothing.
    if (!markdown) {
      return new Response(html, {
        status: originResponse.status,
        headers: originResponse.headers,
      })
    }

    const headers = new Headers({
      'Content-Type': 'text/markdown; charset=utf-8',
      // ~4 characters per token is the standard rough estimate for English prose.
      'X-Markdown-Tokens': String(Math.ceil(markdown.length / 4)),
      // Declares how this content may be used: https://contentsignals.org
      'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
      // The response body depends on Accept, so caches must key on it.
      Vary: 'Accept',
    })

    return new Response(markdown, { status: originResponse.status, headers })
  } catch (error) {
    console.error('markdown edge function failed, serving original HTML:', error)

    // Fall back to whatever the origin gave us. If the body was already read, replay it;
    // otherwise let the request continue untouched.
    if (html !== null && originResponse) {
      return new Response(html, {
        status: originResponse.status,
        headers: originResponse.headers,
      })
    }

    return
  }
}
