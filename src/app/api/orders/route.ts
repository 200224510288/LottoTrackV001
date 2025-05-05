import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs/server';

// Initialize Prisma client
const prisma = new PrismaClient();

// Constants
const ITEM_PER_PAGE = 10;

// Define types for sales data from raw query
interface SalesData {
  date: string;
  amount: string;
  count: string;
}

// Define type for Clerk session claims metadata
interface SessionClaims {
  metadata?: {
    role?: string;
  };
}

// GET handler for /api/orders
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const view = searchParams.get('view') || 'newest';
    const search = searchParams.get('search');

    // Validate page
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    // Validate dates
    let validatedStartDate: Date | undefined;
    let validatedEndDate: Date | undefined;
    if (startDate && endDate) {
      validatedStartDate = new Date(startDate);
      validatedEndDate = new Date(endDate);
      if (isNaN(validatedStartDate.getTime()) || isNaN(validatedEndDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
      }
    }

    // Get current user and role
    const user = await currentUser();
    const { sessionClaims } = await auth();
    const role = (sessionClaims as SessionClaims)?.metadata?.role || 'guest';

    // Build the Prisma query
    const query: Prisma.OrderWhereInput = {};

    // Apply date filtering if provided
    if (validatedStartDate && validatedEndDate) {
      query.OrderTime = {
        gte: validatedStartDate,
        lte: validatedEndDate,
      };
    }

    // Apply search if provided
    if (search) {
      query.OR = [
        { AgentID: { contains: search, mode: 'insensitive' } },
        ...(search && !isNaN(parseInt(search)) ? [{ OrderID: parseInt(search) }] : []),
      ];
    }

    // Fetch orders and count
    const [orders, count] = await prisma.$transaction([
      prisma.order.findMany({
        where: query,
        include: {
          Agent: { select: { FirstName: true, LastName: true, City: true, AgentID: true } },
          Staff: { select: { FirstName: true, LastName: true, StaffID: true } },
          Delivery: {
            select: { BusType: true, StaffID: true, NumberPlate: true, ArrivalTime: true, DispatchTime: true },
          },
          ContainedLotteries: {
            include: {
              Lottery: { select: { LotteryID: true, LotteryName: true, UnitPrice: true, DrawDate: true  } },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (page - 1),
        orderBy: view === 'oldest' ? { OrderTime: 'asc' } : { OrderTime: 'desc' },
      }),
      prisma.order.count({ where: query }),
    ]);

    // Calculate totals
    const totalSales = orders.reduce((sum, order) => sum + order.TotalAmount, 0);

    // Calculate total quantity for each order and overall
    let totalQuantity = 0;
    const processedOrders = orders.map((order) => {
      const orderTotalQuantity = order.ContainedLotteries.reduce(
        (sum, item) => sum + item.Quantity,
        0
      );
      totalQuantity += orderTotalQuantity;
      return { ...order, totalQuantity: orderTotalQuantity };
    });

    // Get sales data for analytics chart (grouped by day)
    let salesData: SalesData[] = [];
    if (validatedStartDate && validatedEndDate) {
      salesData = await prisma.$queryRaw`
        SELECT 
          DATE("OrderTime") as date,
          SUM("TotalAmount") as amount,
          COUNT("OrderID") as count
        FROM 
          "Order"
        WHERE 
          "OrderTime" >= ${validatedStartDate}
          AND "OrderTime" <= ${validatedEndDate}
        GROUP BY 
          DATE("OrderTime")
        ORDER BY 
          date ASC
      `;
      // Format salesData
      salesData = salesData.map((item: any) => ({
        date: item.date.toISOString().split('T')[0],
        amount: item.amount.toString(),
        count: item.count.toString(),
      }));
    }

    // Return the results
    return NextResponse.json(
      {
        orders: processedOrders,
        count,
        totalSales,
        totalQuantity,
        salesData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching Order history data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order data' },
      { status: 500 }
    );
  }
}