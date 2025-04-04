import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  try {
    // Parse the date or use today's date if not provided
    const searchDate = dateParam ? new Date(dateParam) : new Date();
    
    // Set time to beginning of the day for accurate comparison
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set time to end of the day
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const lotteries = await prisma.lottery.findMany({
      include: {
        Stock: true,
      },
      where: {
        DrawDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        // Only show lotteries with available stock
        Stock: {
          Availability: {
            gt: '0' // Compare with a string instead of a number
          }
        }
      },
      orderBy: {
        LotteryType: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: lotteries,
    });
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch lottery data',
    }, { status: 500 });
  }
}