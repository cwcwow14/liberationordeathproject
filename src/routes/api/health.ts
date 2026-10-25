import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'
import { db } from '../../../db'

// Database health check: is the site connected, and do the tables the code needs
// exist? Open https://liberationordeath.net/api/health after a deploy to see.
// Reports table names and Postgres error codes only — never data or credentials.

const REQUIRED_TABLES = ['map_pins', 'analytics_events']

function pgError(e: unknown): { code?: string; message: string } {
  const err = e as { cause?: { code?: string; message?: string }; code?: string; message?: string }
  const cause = err?.cause ?? err
  return {
    code: cause?.code,
    // Postgres messages name the failing table/column; trim to keep it short.
    message: String(cause?.message ?? err?.message ?? 'unknown error').split('\n')[0].slice(0, 160),
  }
}

function rowsOf(res: unknown): Record<string, unknown>[] {
  const r = res as { rows?: Record<string, unknown>[] }
  return Array.isArray(res) ? (res as Record<string, unknown>[]) : (r?.rows ?? [])
}

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        const body: Record<string, unknown> = { connected: false }
        try {
          const res = await db.execute(sql`
            select table_name from information_schema.tables
            where table_schema = 'public' order by table_name`)
          const tables = rowsOf(res).map(r => String(r.table_name))
          body.connected = true
          body.tables = tables
          body.missing = REQUIRED_TABLES.filter(t => !tables.includes(t))
          body.ok = (body.missing as string[]).length === 0
        } catch (e) {
          body.ok = false
          body.error = pgError(e)
        }
        return new Response(JSON.stringify(body, null, 2), {
          status: body.ok ? 200 : 503,
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        })
      },
    },
  },
})
