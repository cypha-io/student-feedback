import type { NextApiRequest, NextApiResponse } from 'next'

function serializeCookie(name: string, val: string, options: Record<string, string | number | boolean | undefined> = {}) {
  const opt = { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0, secure: process.env.NODE_ENV === 'production', ...options }
  let cookie = `${name}=${encodeURIComponent(val)}`
  if (opt.maxAge !== undefined) cookie += `; Max-Age=${opt.maxAge}`
  if (opt.domain) cookie += `; Domain=${opt.domain}`
  if (opt.path) cookie += `; Path=${opt.path}`
  if (opt.httpOnly) cookie += `; HttpOnly`
  if (opt.secure) cookie += `; Secure`
  if (opt.sameSite) cookie += `; SameSite=${opt.sameSite}`
  return cookie
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cookie = serializeCookie('admin_auth', '', { maxAge: 0 })
  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ success: true })
}
