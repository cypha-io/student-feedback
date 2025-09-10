import { db } from '@/lib/db';
import { subjects } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { name, department } = body;

    if (!name || !department) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 });
    }

    const [updatedSubject] = await db
      .update(subjects)
      .set({ 
        name, 
        department,
        updatedAt: new Date()
      })
      .where(eq(subjects.id, params.id))
      .returning();

    if (!updatedSubject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const [deletedSubject] = await db
      .delete(subjects)
      .where(eq(subjects.id, params.id))
      .returning();

    if (!deletedSubject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
