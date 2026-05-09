import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { db, TABLES, eq } from '@/lib/db'

function serializeCookie(name: string, val: string, options: Record<string, string | number | boolean | undefined> = {}) {
  const opt = { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60, secure: process.env.NODE_ENV === 'production', ...options }
  let cookie = `${name}=${encodeURIComponent(val)}`
  if (opt.maxAge || opt.maxAge === 0) cookie += `; Max-Age=${opt.maxAge}`
  if (opt.domain) cookie += `; Domain=${opt.domain}`
  if (opt.path) cookie += `; Path=${opt.path}`
  if (opt.httpOnly) cookie += `; HttpOnly`
  if (opt.secure) cookie += `; Secure`
  if (opt.sameSite) cookie += `; SameSite=${opt.sameSite}`
  return cookie
}

const DATA_PATH = path.join(process.cwd(), 'data', 'admins.json')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  // 1. First priority: Check Neon Database
  try {
    const [dbAdmin] = await db.select().from(TABLES.ADMINS).where(eq(TABLES.ADMINS.email, email)).limit(1);
    if (dbAdmin && dbAdmin.password === password) {
      const cookie = serializeCookie('admin_auth', email)
      res.setHeader('Set-Cookie', cookie)
      return res.status(200).json({ 
        success: true, 
        email: dbAdmin.email, 
        fullName: dbAdmin.fullName, 
        role: dbAdmin.role 
      })
    }
  } catch (err) {
    console.error('Database authentication error:', err)
  }

  // 2. Second priority: Check data file
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const list = JSON.parse(raw)
    const match = list.find((a: { email: string; password?: string; fullName?: string; role?: string }) => a.email === email && a.password === password)
    if (match) {
      const cookie = serializeCookie('admin_auth', email)
      res.setHeader('Set-Cookie', cookie)
      return res.status(200).json({ success: true, email: match.email, fullName: match.fullName || match.email, role: match.role || 'manager' })
    }
  } catch {
    // ignore read errors
  }

  // 3. Final fallback: Check env credentials (for system recovery)
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || process.env.NEXT_PUBLIC_ADMIN_FULL_NAME || 'Super Administrator'
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookie = serializeCookie('admin_auth', email)
    res.setHeader('Set-Cookie', cookie)
    return res.status(200).json({ success: true, email, fullName: ADMIN_FULL_NAME, role: 'superadmin' })
  }

  return res.status(401).json({ success: false, error: 'Invalid credentials' })
}
