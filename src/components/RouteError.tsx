import { Link } from '@tanstack/react-router'

/**
 * Rendered by the router when a route throws. The default behaviour is a blank
 * screen with the error only in the console, which is indistinguishable from a
 * dead site — this at least keeps the page navigable.
 */
export function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">LOD</div>
        <div className="auth-sub">Something Went Wrong</div>
        <p className="notfound-text">This page failed to load. Try again, or head back home.</p>
        <p className="notfound-detail">{message}</p>
        <div className="notfound-actions">
          <button className="btn-primary" onClick={reset}>Try Again</button>
        </div>
        <Link to="/" className="notfound-link">Back to Home</Link>
      </div>
    </div>
  )
}
