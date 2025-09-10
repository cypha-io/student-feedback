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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, department } = body;

    if (!name || !department) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    const [newSubject] = await db.insert(subjects).values({
      name,
      department,
    }).returning();

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
