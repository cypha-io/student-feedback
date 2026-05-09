import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { db, TABLES, eq } from '@/lib/db'

function parseCookies(cookieHeader?: string) {
  const obj: Record<string, string> = {}
  if (!cookieHeader) return obj
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [k, ...v] = part.split('=')
    obj[k?.trim() || ''] = decodeURIComponent((v || []).join('=').trim())
  }
  return obj
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookies(req.headers.cookie)
  const email = cookies['admin_auth']
  if (!email) return res.status(200).json({ authenticated: false })

  // 1. Check Neon Database
  try {
    const [dbAdmin] = await db.select().from(TABLES.ADMINS).where(eq(TABLES.ADMINS.email, email)).limit(1);
    if (dbAdmin) {
      return res.status(200).json({ 
        authenticated: true, 
        email: dbAdmin.email, 
        fullName: dbAdmin.fullName, 
        role: dbAdmin.role,
        staffId: dbAdmin.staffId
      })
    }
  } catch (err) {
    console.error('Database session error:', err)
  }

  // 2. Check data file
  const DATA_PATH = path.join(process.cwd(), 'data', 'admins.json')
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const list = JSON.parse(raw)
    const match = list.find((a: { email: string; fullName?: string; role?: string }) => a.email === email)
    if (match) return res.status(200).json({ authenticated: true, email, fullName: match.fullName || match.email, role: match.role || 'manager' })
  } catch {}

  // 3. fallback: if matches env admin
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (email === ADMIN_EMAIL) {
    const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || process.env.NEXT_PUBLIC_ADMIN_FULL_NAME || 'Super Administrator'
    return res.status(200).json({ authenticated: true, email, fullName: ADMIN_FULL_NAME, role: 'superadmin' })
  }

  return res.status(200).json({ authenticated: false })
}
