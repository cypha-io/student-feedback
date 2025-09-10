import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { name, head } = body;

    if (!name || !head) {
      return NextResponse.json({ error: 'Name and head are required' }, { status: 400 });
    }

    const [updatedDepartment] = await db
      .update(departments)
      .set({ 
        name, 
        head,
        updatedAt: new Date()
      })
      .where(eq(departments.id, params.id))
      .returning();

    if (!updatedDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const [deletedDepartment] = await db
      .delete(departments)
      .where(eq(departments.id, params.id))
      .returning();

    if (!deletedDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
