import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { useIdentity } from '../lib/identity-context'
import { TIERS, tierName, type TierId } from '../lib/tiers'
import {
  createPost,
  deletePost,
  exportMembersCsv,
  getFeed,
  getMyMembership,
  getPortalUrl,
  type FeedPost,
  type MembershipInfo,
} from '../server/membership'

export const Route = createFileRoute('/members')({
  validateSearch: (search: Record<string, unknown>): { welcome?: boolean } => ({
    welcome: search.welcome === 1 || search.welcome === '1' || search.welcome === true ? true : undefined,
  }),
  head: () => ({ meta: [{ title: 'Members — LOD' }, { name: 'robots', content: 'noindex' }] }),
  component: MembersPage,
})

const KIND_LABEL: Record<string, string> = { newsletter: 'The Dispatch', post: 'Post', video: 'Video' }
type Filter = 'all' | 'newsletter' | 'post' | 'video'

function fmt(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function MembersPage() {
  const { user, ready } = useIdentity()
  const { welcome } = Route.useSearch()
  const [membership, setMembership] = useState<MembershipInfo | null>(null)
  const [admin, setAdmin] = useState(false)
  const [posts, setPosts] = useState<FeedPost[] | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      const [me, feed] = await Promise.all([getMyMembership(), getFeed()])
      setMembership(me.membership)
      setAdmin(me.admin)
      setPosts(feed)
    } catch (e) {
      console.error('members: could not load', e)
      setErr('Could not load the members area right now. Please refresh in a moment.')
      setPosts([])
    }
  }, [])

  useEffect(() => {
    if (ready) load()
  }, [ready, user, load])

  // Right after checkout the webhook may not have landed yet — poll briefly.
  useEffect(() => {
    if (!welcome || !user || membership?.active) return
    const t = setInterval(load, 4000)
    const stop = setTimeout(() => clearInterval(t), 60_000)
    return () => { clearInterval(t); clearTimeout(stop) }
  }, [welcome, user, membership?.active, load])

  async function manage() {
    try {
      const { url } = await getPortalUrl()
      window.location.href = url
    } catch (e: any) {
      setErr(e?.message || 'Could not open the billing portal.')
    }
  }

  const shown = (posts ?? []).filter(p => filter === 'all' || p.kind === filter)
  const active = !!membership?.active

  return (
    <>
      <SiteNav label="LOD MEMBERS" />

      <div className="photos-hero" style={{ paddingBottom: '2rem' }}>
        <div className="section-label">— Members Area</div>
        <div className="section-title">The Inside Line</div>
        {ready && !user && (
          <>
            <p className="reach-lede" style={{ marginBottom: '1.5rem' }}>
              The Dispatch newsletter, exclusive posts and videos, and early access — for members only.
            </p>
            <div className="hero-cta">
              <Link to="/join"><button className="btn-primary">See Memberships</button></Link>
              <Link to="/login" search={{ redirect: '/members' }}><button className="btn-outline">Sign In</button></Link>
            </div>
          </>
        )}
        {user && active && (
          <p className="reach-lede">
            <strong style={{ color: '#4caf50' }}>{membership!.tierName}</strong> member
            {membership!.status === 'cancelled' && membership!.endsAt
              ? ` — cancelled, access until ${fmt(membership!.endsAt)}.`
              : membership!.renewsAt ? ` — renews ${fmt(membership!.renewsAt)}.` : '.'}{' '}
            <button className="link-btn" onClick={manage}>Manage membership</button>
          </p>
        )}
        {user && !active && (
          <div style={{ maxWidth: 560 }}>
            {welcome ? (
              <div className="contact-success">Payment received — activating your membership. This page updates on its own in a few seconds.</div>
            ) : (
              <>
                <p className="reach-lede" style={{ marginBottom: '1.5rem' }}>
                  {membership ? 'Your membership has ended.' : 'You are signed in, but not a member yet.'} Pick a tier to unlock everything below.
                </p>
                <Link to="/join"><button className="btn-primary">Become a Member</button></Link>
              </>
            )}
          </div>
        )}
      </div>

      <section className="feed-wrap">
        {err && <div className="contact-error" style={{ marginBottom: '1.5rem' }}>{err}</div>}
        {admin && <AdminPanel onPublished={load} />}

        <div className="feed-filters" role="tablist">
          {(['all', 'newsletter', 'post', 'video'] as Filter[]).map(f => (
            <button key={f} role="tab" aria-selected={filter === f} className={`auth-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Everything' : KIND_LABEL[f]}
            </button>
          ))}
        </div>

        {posts === null && <p className="reach-note">Loading…</p>}
        {posts !== null && shown.length === 0 && <p className="reach-note">Nothing here yet — the first drop is coming soon.</p>}
        {shown.map(p => (
          <PostCard key={p.id} post={p} admin={admin} onDeleted={load} />
        ))}
      </section>

      <SiteFooter />
    </>
  )
}

function VideoBlock({ url }: { url: string }) {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return <video className="post-video" src={url} controls preload="metadata" playsInline />
  }
  return (
    <a href={url} target="_blank" rel="noreferrer"><button className="btn-primary">Watch the video ↗</button></a>
  )
}

function PostCard({ post, admin, onDeleted }: { post: FeedPost; admin: boolean; onDeleted: () => void }) {
  const lockText =
    post.locked === 'join' ? `For ${tierName(post.minTier)} members and up.`
    : post.locked === 'upgrade' ? `Upgrade to ${tierName(post.minTier)} to unlock.`
    : post.locked === 'early' ? `Inner Circle early access — opens to you on ${fmt(post.earlyUntil)}.`
    : ''

  async function remove() {
    if (!confirm(`Delete "${post.title}"?`)) return
    await deletePost({ data: { id: post.id } })
    onDeleted()
  }

  const isEarly = !!post.earlyUntil && new Date(post.earlyUntil).getTime() > Date.now()

  return (
    <article className={`post-card${post.locked ? ' locked' : ''}`}>
      <div className="post-meta">
        <span className="photo-tag">{KIND_LABEL[post.kind] ?? post.kind}</span>
        {isEarly && <span className="photo-tag early-tag">Early access</span>}
        <span className="post-date">{fmt(post.createdAt)}</span>
        {admin && <button className="link-btn post-delete" onClick={remove}>Delete</button>}
      </div>
      <h2 className="post-title">{post.title}</h2>
      {post.locked ? (
        <div className="post-lock">
          <span>🔒 {lockText}</span>
          {post.locked !== 'early' && <Link to="/join"><button className="btn-outline btn-small">See tiers</button></Link>}
        </div>
      ) : (
        <>
          {post.body!.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="post-body">{para}</p>
          ))}
          {post.videoUrl && <VideoBlock url={post.videoUrl} />}
        </>
      )}
    </article>
  )
}

const DEFAULT_TIER: Record<string, TierId> = { newsletter: 'supporter', post: 'activist', video: 'activist' }

function AdminPanel({ onPublished }: { onPublished: () => void }) {
  const [kind, setKind] = useState('newsletter')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [minTier, setMinTier] = useState<TierId>('supporter')
  const [earlyDays, setEarlyDays] = useState(0)
  const [status, setStatus] = useState('')

  function pickKind(k: string) {
    setKind(k)
    setMinTier(DEFAULT_TIER[k])
  }

  async function publish() {
    setStatus('Publishing…')
    try {
      await createPost({ data: { kind, title, body, videoUrl, minTier, earlyDays } })
      setTitle(''); setBody(''); setVideoUrl(''); setEarlyDays(0)
      setStatus('Published.')
      onPublished()
    } catch (e: any) {
      setStatus(e?.message || 'Could not publish.')
    }
  }

  async function downloadCsv() {
    try {
      const { csv } = await exportMembersCsv()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      a.download = `lod-members-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e: any) {
      setStatus(e?.message || 'Export failed.')
    }
  }

  return (
    <details className="admin-panel">
      <summary>Admin — publish to members</summary>
      <div className="auth-form" style={{ marginTop: '1rem' }}>
        <div className="contact-row">
          <label className="contact-field">
            <span className="contact-label">Type</span>
            <select className="contact-input" value={kind} onChange={e => pickKind(e.target.value)}>
              <option value="newsletter">The Dispatch (newsletter issue)</option>
              <option value="post">Exclusive post</option>
              <option value="video">Exclusive video</option>
            </select>
          </label>
          <label className="contact-field">
            <span className="contact-label">Who can see it</span>
            <select className="contact-input" value={minTier} onChange={e => setMinTier(e.target.value as TierId)}>
              {TIERS.map(t => <option key={t.id} value={t.id}>{t.name} and up</option>)}
            </select>
          </label>
        </div>
        <input className="contact-input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="contact-textarea" style={{ minHeight: 220 }} placeholder={kind === 'newsletter' ? 'The good news… the bad news… what\'s coming next. Leave a blank line between paragraphs.' : 'Write the post. Leave a blank line between paragraphs.'} value={body} onChange={e => setBody(e.target.value)} />
        <input className="contact-input" placeholder="Video link (optional) — direct .mp4 plays inline; anything else shows a Watch button" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
        <label className="contact-field">
          <span className="contact-label">Inner Circle early access (days before everyone else)</span>
          <input className="contact-input" type="number" min={0} max={30} value={earlyDays} onChange={e => setEarlyDays(Number(e.target.value))} />
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-primary" onClick={publish} disabled={!title.trim() || !body.trim()}>Publish</button>
          <button className="btn-outline" onClick={downloadCsv}>Download member emails (CSV)</button>
          {status && <span className="reach-note" style={{ margin: 0 }}>{status}</span>}
        </div>
      </div>
    </details>
  )
}
