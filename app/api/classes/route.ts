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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, year, capacity } = body;

    if (!name || !year || !capacity) {
      return NextResponse.json({ error: 'Name, year, and capacity are required' }, { status: 400 });
    }

    const [newClass] = await db.insert(classes).values({
      name,
      year: parseInt(year),
      capacity: parseInt(capacity),
    }).returning();

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
