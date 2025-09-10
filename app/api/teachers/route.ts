import { db } from '@/lib/db';
import { teachers } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTeachers = await db.select().from(teachers).orderBy(teachers.name);
    return NextResponse.json(allTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}
