import { db } from '@/lib/db';
import { responses } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, answer } = body;

    if (!id || answer === undefined) {
      return NextResponse.json({ error: 'ID and answer are required' }, { status: 400 });
    }

    const updatedResponse = await db.update(responses)
      .set({
        answer: String(answer),
        updatedAt: new Date(),
      })
      .where(eq(responses.id, id))
      .returning();

    if (updatedResponse.length === 0) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json(updatedResponse[0]);
  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}
