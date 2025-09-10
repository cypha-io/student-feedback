import { db } from '@/lib/db';
import { subjects } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allSubjects = await db.select().from(subjects).orderBy(subjects.name);
    return NextResponse.json(allSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
