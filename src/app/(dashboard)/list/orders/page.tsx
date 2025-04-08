import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Order, Delivery, Staff, Agent } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth, currentUser } from "@clerk/nextjs/server";
import FormModal from "@/components/FormModal";
import ClientOrderTable from "@/components/ClientOrderTable";

// This remains a server component

type OrderWithRelations = Order & { 
  Delivery: { BusType: string } | null; 
  Staff: Staff | null; 
  Agent: Agent | null;
  ContainedLotteries: {
    Quantity: number;
    Lottery: {
      LotteryName: string;
      UnitPrice: number;
    };
  }[];
  totalQuantity: number;
};

const OrderListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const user = await currentUser();
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.OrderWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { AgentID: { contains: queryParams.search, mode: "insensitive" } },
      { OrderID: queryParams.search ? { equals: parseInt(queryParams.search) } : undefined },
    ];
  }

  let rawData: any[] = [];
  let count = 0;

  try {
    [rawData, count] = await prisma.$transaction([
      prisma.order.findMany({
        where: query,
        include: {
          Agent: true,
          Staff: true,
          Delivery: true,
          ContainedLotteries: {
            include: {
              Lottery: true
            }
          }
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: {
          OrderTime: 'desc',
        },
      }),
      prisma.order.count({ where: query }),
    ]);
  } catch (error) {
    console.error("Error fetching Order data: ", error);
  }
  
  // Calculate total quantity for each order
  const data: OrderWithRelations[] = rawData.map(order => {
    const totalQuantity = order.ContainedLotteries.reduce((sum: any, item: { Quantity: any; }) => sum + item.Quantity, 0);
    return { ...order, totalQuantity };
  });

  const columns = [
    { header: "Order ID", accessor: "OrderID" },
    { header: "Agent Name", accessor: "AgentName"},
    { header: "Total Quantity", accessor: "TotalQuantity",className: "hidden md:table-cell"},
    { header: "Total Amount", accessor: "TotalAmount", className: "hidden md:table-cell" },
    { header: "Ordered Time", accessor: "OrderTime", className: "hidden md:table-cell" },
    { header: "Type", accessor: "DeliveryType", className: "hidden md:table-cell" },
    { header: "City", accessor: "City", className: "hidden md:table-cell" },
    { header: "Staff Name", accessor: "StaffName", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "district_agent" || role === "office_staff" || role === "agent"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Orders</h1>
        <div className="flex items-center gap-4">
          <TableSearch />
        </div>
      </div>
      <ClientOrderTable orders={data} columns={columns} role={role || ""} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default OrderListPage;