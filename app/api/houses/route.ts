import { db } from '@/lib/db';
import { houses } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allHouses = await db.select().from(houses);
    return NextResponse.json(allHouses);
  } catch (error) {
    console.error('Error fetching houses:', error);
    return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newHouse = await db.insert(houses).values(body).returning();
    return NextResponse.json(newHouse[0]);
  } catch (error) {
    console.error('Error creating house:', error);
    return NextResponse.json({ error: 'Failed to create house' }, { status: 500 });
  }
}
