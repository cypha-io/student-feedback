import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allDepartments = await db.select().from(departments);
    return NextResponse.json(allDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, head } = body;

    if (!name || !head) {
      return NextResponse.json({ error: 'Name and head are required' }, { status: 400 });
    }

    const [newDepartment] = await db.insert(departments).values({
      name,
      head,
    }).returning();

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
