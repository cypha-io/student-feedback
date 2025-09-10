import { db } from '@/lib/db';
import { feedbacks, responses } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { feedbackData, responsesData } = await req.json();

    // Create the feedback record
    const [newFeedback] = await db
      .insert(feedbacks)
      .values({
        ...feedbackData,
        submittedAt: new Date(feedbackData.submittedAt),
      })
      .returning();

    if (!newFeedback) {
      return NextResponse.json({ error: 'Failed to create feedback record' }, { status: 500 });
    }

    // Create the response records
    const responseInsertPromises = responsesData.map((res: { questionId: string; answer: string; type: string }) => {
        return db.insert(responses).values({
            ...res,
            feedbackId: newFeedback.id,
        });
    });

    await Promise.all(responseInsertPromises);

    return NextResponse.json(newFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}
