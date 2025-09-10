import { db } from '@/lib/db';
import { houses } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedHouse = await db.update(houses).set(body).where(eq(houses.id, id)).returning();
    return NextResponse.json(updatedHouse[0]);
  } catch (error) {
    console.error('Error updating house:', error);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(houses).where(eq(houses.id, id));
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting house:', error);
        return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
    }
}
