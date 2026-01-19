/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cars/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Car from '@/models/Car';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ← Required: Promise type
) {
  try {
    // Unwrap the params Promise (this is the key fix)
    const { id } = await context.params;

    await connectDB();

    const body = await request.json();
    const { status } = body;

    if (!status || !['Available', 'Booked', 'Maintenance'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const car = await Car.findByIdAndUpdate(
      id, // ← Now using the unwrapped id
      { status },
      { new: true, runValidators: true }
    );

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, car });
  } catch (error: any) {
    console.error('Update car status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status', message: error.message },
      { status: 500 }
    );
  }
}