import type { User } from '@netlify/identity'

// Admins: Netlify Identity role "admin", or a confirmed email listed in the
// ADMIN_EMAILS env var (comma-separated).
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  if (user.roles?.includes('admin') || user.role === 'admin') return true
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  // Only a confirmed address counts — otherwise anyone could sign up as the admin email.
  return !!user.email && !!user.confirmedAt && admins.includes(user.email.toLowerCase())
}
