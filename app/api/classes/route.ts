import { db } from '@/lib/db';
import { classes } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allClasses = await db.select().from(classes).orderBy(classes.name, classes.year);
    return NextResponse.json(allClasses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
