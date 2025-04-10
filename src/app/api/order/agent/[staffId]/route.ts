// app/api/orders/agent/[staffId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    // Get the clerk user ID from the URL parameter
    const { staffId } = params;
    
    // Verify that the authenticated user is requesting their own orders
    const { userId } = getAuth(request);
    if (!userId || userId !== staffId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Query the database for orders assigned to this staff
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { StaffID: staffId },
          {
            Delivery: {
              StaffID: staffId
            }
          }
        ]
      },
      include: {
        Agent: true,
        Delivery: true,
        ContainedLotteries: {
          include: {
            Lottery: true
          }
        }
      },
      orderBy: {
        OrderDate: 'desc'
      }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching agent orders:', error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}