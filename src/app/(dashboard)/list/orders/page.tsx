import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Order, Delivery, Staff, Agent } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth, currentUser } from "@clerk/nextjs/server";
import FormModal from "@/components/FormModal";

type OrderWithRelations = Order & { 
  Delivery: Delivery | null; 
  Staff: Staff | null; 
  Agent: Agent | null;
  ContainedLotteries: {
    Quantity: number;
    Lottery: {
      LotteryName: string;
      UnitPrice: number;
    };
  }[];
  totalQuantity: number; // New field to store the total quantity
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
    { header: "Agent Name", accessor: "AgentName" },
    { header: "Total Quantity", accessor: "TotalQuantity" },
    { header: "Total Amount", accessor: "TotalAmount" },
    { header: "Ordered Time", accessor: "OrderTime", className: "hidden md:table-cell" },
    { header: "Type", accessor: "DeliveryType", className: "hidden md:table-cell" },
    { header: "City", accessor: "City", className: "hidden md:table-cell" },
    { header: "Staff Name", accessor: "StaffName", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "district_agent" || role === "office_staff"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (item: OrderWithRelations) => (
    <tr key={item.OrderID} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight">
      <td className="p-4 font-semibold">{item.OrderID || "N/A"}</td>
      <td>{item.Agent?.FirstName} {item.Agent?.LastName || "N/A"}</td>
      <td className="font-medium">{item.totalQuantity}</td>
      <td className="font-medium">Rs {item.TotalAmount.toFixed(2)}</td>
      <td className="hidden md:table-cell">
        {item.OrderTime ? new Date(item.OrderTime).toLocaleString() : "N/A"}
      </td>
      <td className="hidden md:table-cell">{item.Delivery?.BusType || "N/A"}</td>
      <td className="hidden md:table-cell"> {item.Agent?.City || "N/A"}</td>

      <td className="hidden md:table-cell">{item.Staff?.FirstName} {item.Staff?.LastName || "N/A"}</td>

      {role && (
        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "district_agent" || role === "office_staff") && 
              <FormModal table="agent" type="delete" id={item.OrderID} />}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Orders</h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          {(role === "admin" || role === "district_agent" || role === "office_staff") && 
            <FormModal table="agent" type="create" />}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default OrderListPage;