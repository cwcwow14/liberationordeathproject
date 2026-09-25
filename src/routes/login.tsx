import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { login, signup } from '@netlify/identity'
import { useIdentity } from '../lib/identity-context'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function NavLodLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,8 192,100 100,192 8,100" fill="none" stroke="#4caf50" strokeWidth="9" />
      <polygon points="100,34 166,100 100,166 34,100" fill="none" stroke="#4caf50" strokeWidth="4" />
      <text x="100" y="118" textAnchor="middle" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="52" fill="#4caf50">LOD</text>
    </svg>
  )
}

function LoginPage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (ready && user) navigate({ to: '/' })
  }, [ready, user])

  const handleLogin = async () => {
    setErr('')
    setLoading(true)
    try {
      await login(email, password)
      navigate({ to: '/' })
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
      <nav>
        <Link to="/" className="nav-logo">
          <NavLodLogo />
          <span className="logo-text">LOD MEMBERS</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">← Home</Link></li>
        </ul>
      </nav>

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
              ✉️ Confirmation email sent to <strong>{email}</strong>.<br />Click the link to finish joining LOD.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
