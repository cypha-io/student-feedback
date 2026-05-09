import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'role-permissions.json')

function isValidRolePermissions(value: unknown): value is Record<string, string[]> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const rolePermissions = JSON.parse(raw)
    return res.status(200).json({ rolePermissions })
  }

  if (req.method === 'PUT') {
    const { rolePermissions } = req.body || {}
    if (!isValidRolePermissions(rolePermissions)) {
      return res.status(400).json({ error: 'Invalid role permissions payload' })
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(rolePermissions, null, 2))
    return res.status(200).json({ success: true, rolePermissions })
  }

  res.setHeader('Allow', 'GET, PUT')
  res.status(405).end('Method Not Allowed')
}