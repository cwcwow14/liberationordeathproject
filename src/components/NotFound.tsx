import { Link } from '@tanstack/react-router'

/**
 * Rendered by the router for any URL that matches no route — including stale
 * bookmarks of pages that have since been removed. Without it the router
 * renders nothing at all, which looks identical to a broken site.
 */
export function NotFound() {
  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">404</div>
        <div className="auth-sub">Page Not Found</div>
        <p className="notfound-text">
          This page has moved or no longer exists. The movement carries on without it.
        </p>
        <div className="notfound-actions">
          <Link to="/"><button className="btn-primary">Back to Home</button></Link>
        </div>
      </div>
    </div>
  )
}
