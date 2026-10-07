import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { login, signup } from '@netlify/identity'
import { useIdentity } from '../lib/identity-context'
import { useState, useEffect } from 'react'
import { SiteNav } from '../components/SiteNav'

export const Route = createFileRoute('/login')({
  // Where to send the visitor after signing in. Same-site paths only, so the
  // param can't be used to bounce people to another domain.
  validateSearch: (search: Record<string, unknown>): { redirect?: string; mode?: 'signup' } => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/') && !search.redirect.startsWith('//')
        ? search.redirect
        : undefined,
    mode: search.mode === 'signup' ? 'signup' : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { user, ready } = useIdentity()
  const { redirect, mode } = Route.useSearch()
  const navigate = useNavigate()
  const destination = redirect ?? '/'
  const [tab, setTab] = useState<'login' | 'signup'>(mode ?? 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (ready && user) navigate({ href: destination })
  }, [ready, user])

  const handleLogin = async () => {
    setErr('')
    setLoading(true)
    try {
      await login(email, password)
      navigate({ href: destination })
    } catch (e: any) {
      setErr(e.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!name || !email || !password) { setErr('Please fill all fields.'); return }
    setErr('')
    setLoading(true)
    try {
      await signup(email, password, { full_name: name })
      setConfirmed(true)
    } catch (e: any) {
      setErr(e.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SiteNav label="LOD MEMBERS" />

      <div className="auth-wrap">
        <div className="auth-box">
          <div className="auth-logo">LOD</div>
          <div className="auth-sub">Members Area</div>
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setErr(''); setConfirmed(false) }}>Sign In</button>
            <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setErr(''); setConfirmed(false) }}>Join Us</button>
          </div>

          {tab === 'login' && (
            <div className="auth-form">
              <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              {err && <div className="auth-err">{err}</div>}
              <button className="btn-green" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in…' : 'Enter the Movement'}</button>
            </div>
          )}

          {tab === 'signup' && !confirmed && (
            <div className="auth-form">
              <input className="auth-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="auth-input" type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} />
              {err && <div className="auth-err">{err}</div>}
              <button className="btn-green" onClick={handleSignup} disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
            </div>
          )}

          {tab === 'signup' && confirmed && (
            <div className="auth-confirm">
              ✉️ Confirmation email sent to <strong>{email}</strong>.<br />Click the link to finish joining LOD, then sign in here.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
