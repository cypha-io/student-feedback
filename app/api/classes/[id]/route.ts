import { db } from '@/lib/db';
import { classes } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { name, year, capacity } = body;

    if (!name || !year || !capacity) {
      return NextResponse.json({ error: 'Name, year, and capacity are required' }, { status: 400 });
    }

    const [updatedClass] = await db
      .update(classes)
      .set({ 
        name, 
        year: parseInt(year),
        capacity: parseInt(capacity),
        updatedAt: new Date()
      })
      .where(eq(classes.id, params.id))
      .returning();

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, params.id))
      .returning();

    if (!deletedClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
