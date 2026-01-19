import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Car from '@/models/Car';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const cars = await Car.find({ status: 'Available' })
      .select('make modelName year dailyPrice')
      .sort({ make: 1 });
    return NextResponse.json({ success: true, cars });
  } catch (error) {
    console.error('Get available cars error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load vehicles' }, { status: 500 });
  }
}