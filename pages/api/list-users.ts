import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, Users } from 'node-appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const users = new Users(client);

  try {
    const result = await users.list();
    res.status(200).json({ count: result.total, users: result.users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users from Appwrite Auth.' });
  }
}
