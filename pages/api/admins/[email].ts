import type { NextApiRequest, NextApiResponse } from 'next'
import { db, TABLES, eq } from '@/lib/db'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email: queryEmail } = req.query
  if (!queryEmail || Array.isArray(queryEmail)) return res.status(400).json({ error: 'Invalid email' })

  if (req.method === 'DELETE') {
    try {
      await db.delete(TABLES.ADMINS).where(eq(TABLES.ADMINS.email, queryEmail));
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to delete admin:', error);
      return res.status(500).json({ error: 'Failed to delete admin' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { fullName, email: newEmail, password, role } = req.body || {}
      if (!fullName && !newEmail && !password && !role) return res.status(400).json({ error: 'Missing fields' })

      if (newEmail && newEmail !== queryEmail) {
        const [existing] = await db.select().from(TABLES.ADMINS).where(eq(TABLES.ADMINS.email, newEmail)).limit(1);
        if (existing) return res.status(409).json({ error: 'Already exists' })
      }

      let hashedPassword = undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      await db.update(TABLES.ADMINS)
        .set({
          ...(fullName && { fullName }),
          ...(newEmail && { email: newEmail }),
          ...(password && { password: hashedPassword }),
          ...(role && { role }),
          updatedAt: new Date()
        })
        .where(eq(TABLES.ADMINS.email, queryEmail));

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to update admin:', error);
      return res.status(500).json({ error: 'Failed to update admin' });
    }
  }

  res.setHeader('Allow', 'DELETE, PUT')
  res.status(405).end('Method Not Allowed')
}
