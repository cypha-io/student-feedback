import { db } from '@/lib/db';
import { teachers } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTeachers = await db.select().from(teachers).orderBy(teachers.name);
    return NextResponse.json(allTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, employeeId, department, class: teacherClass, subjects, email, phone } = body;

    // Validate required fields
    if (!name || !employeeId || !department || !teacherClass || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTeacher = await db.insert(teachers).values({
      name,
      employeeId,
      department,
      class: teacherClass,
      subjects: subjects || [],
      email,
      phone: phone || null,
    }).returning();

    return NextResponse.json(newTeacher[0], { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    
    // Handle specific database constraints
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505' && 'constraint' in error) {
        if (error.constraint === 'teachers_employee_id_unique') {
          return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 });
        }
      }
    }
    
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, employeeId, department, class: teacherClass, subjects, email, phone } = body;

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const updatedTeacher = await db.update(teachers)
      .set({
        name,
        employeeId,
        department,
        class: teacherClass,
        subjects: subjects || [],
        email,
        phone: phone || null,
        updatedAt: new Date(),
      })
      .where(eq(teachers.id, id))
      .returning();

    if (updatedTeacher.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTeacher[0]);
  } catch (error) {
    console.error('Error updating teacher:', error);
    
    // Handle specific database constraints
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505' && 'constraint' in error) {
        if (error.constraint === 'teachers_employee_id_unique') {
          return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 });
        }
      }
    }
    
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const deletedTeacher = await db.delete(teachers)
      .where(eq(teachers.id, id))
      .returning();

    if (deletedTeacher.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}
