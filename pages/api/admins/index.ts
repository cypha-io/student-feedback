import type { NextApiRequest, NextApiResponse } from 'next'
import { db, TABLES, eq } from '@/lib/db'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const list = await db.select().from(TABLES.ADMINS);
      return res.status(200).json(list)
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      return res.status(500).json({ error: 'Failed to fetch admins' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { fullName, email, password, role } = req.body || {}
      if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing fields' })
      
      const [existing] = await db.select().from(TABLES.ADMINS).where(eq(TABLES.ADMINS.email, email)).limit(1);
      if (existing) return res.status(409).json({ error: 'Already exists' })
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.insert(TABLES.ADMINS).values({ 
        fullName, 
        email, 
        password: hashedPassword, 
        role: role || 'manager' 
      });
      
      return res.status(201).json({ success: true })
    } catch (error) {
      console.error('Failed to create admin:', error);
      return res.status(500).json({ error: 'Failed to create admin' });
    }
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).end('Method Not Allowed')
}
