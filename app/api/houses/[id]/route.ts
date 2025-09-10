import { db } from '@/lib/db';
import { houses } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updatedHouse = await db.update(houses).set(body).where(eq(houses.id, params.id)).returning();
    return NextResponse.json(updatedHouse[0]);
  } catch (error) {
    console.error('Error updating house:', error);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await db.delete(houses).where(eq(houses.id, params.id));
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting house:', error);
        return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
    }
}
