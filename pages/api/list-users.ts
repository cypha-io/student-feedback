import type { NextApiRequest, NextApiResponse } from 'next';
import { db, TABLES } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const students = await db.select().from(TABLES.STUDENTS);
    const users = students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student',
      createdAt: student.createdAt,
    }));

    res.status(200).json({ count: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users from Neon database.' });
  }
}
