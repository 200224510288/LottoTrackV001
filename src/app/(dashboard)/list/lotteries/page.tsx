import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Lottery, Stock, Staff } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth, currentUser } from "@clerk/nextjs/server";
import FormModal from "@/components/FormModal";
import Image from "next/image";

type LotteryList = Lottery & { Stock: Stock; Staff: Staff }; 

const LotteryListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  //get the authentication verification.
  const user = await currentUser();
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.LotteryWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { LotteryName: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  let data: any[] = [];
  let count = 0;

  try {
    // Use for splitting items into pages
    [data, count] = await prisma.$transaction([
      prisma.lottery.findMany({
        where: query,
        include: {
          Stock: true, 
          Staff: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.lottery.count({ where: query }),
    ]);
  } catch (error) {
    console.error("Error fetching lottery data: ", error);
  }
// define the table names with accessor
  const columns = [
    { header: "Lottery Image", accessor: "LotteryImage" },
    { header: "Lottery Name", accessor: "LotteryName" },
    { header: "Draw Date", accessor: "DrawDate", className: "hidden md:table-cell" },
    { header: "Unit Price", accessor: "UnitPrice", className: "hidden md:table-cell" },
    { header: "Unit Commission", accessor: "UnitCommission", className: "hidden md:table-cell" },
    { header: "Lottery Type", accessor: "Lotterytype", className: "hidden md:table-cell" },
    { header: "Image URL", accessor: "ImageUrl", className: "hidden md:table-cell" },
    { header: "Availability", accessor: "Stock.Availability", className: "hidden md:table-cell" },
    { header: "Last Update", accessor: "LastUpdateDate", className: "hidden md:table-cell" },
    { header: "Staff Name", accessor: "Staff.StaffID", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "district_agent" || role === "office_staff"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];
//fetch the data to the tables
  const renderRow = (item: LotteryList) => (
    <tr key={item.LotteryID} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight">
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.ImageUrl || "/default-image.png"}
          alt={item.LotteryName}
          width={40}
          height={40}
          className="xl:block w-10 h-10 rounded-full object-cover"
        />
      </td>
      <td className="p-4 font-semibold">{item.LotteryName || "N/A"}</td>
      <td className="hidden md:table-cell">{item.DrawDate ? new Date(item.DrawDate).toLocaleDateString() : "N/A"}</td>
      <td className="hidden md:table-cell">{item.UnitPrice ? `Rs ${item.UnitPrice.toFixed(2)}` : "N/A"}</td>
      <td className="hidden md:table-cell">{item.UnitCommission ? `Rs ${item.UnitCommission.toFixed(2)}` : "N/A"}</td>
      <td className="hidden md:table-cell">
        {item.LotteryType || "N/A"}
      </td>
      <td className="hidden md:table-cell max-w-[140px] truncate overflow-hidden pr-8">
        {item.ImageUrl ? (
          <a href={item.ImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
            {item.ImageUrl}
          </a>
        ) : (
          "N/A"
        )}
      </td>
      <td className="hidden md:table-cell">
        {item.Stock?.Availability || "N/A"}
      </td>
      <td className="hidden md:table-cell">{item.LastUpdateDate ? new Date(item.LastUpdateDate).toLocaleDateString() : "N/A"}</td>
      <td className="hidden md:table-cell">{item.Staff?.FirstName || "N/A"}</td>
      {role && (
        <td>
  
          <div className="flex items-center gap-2">
            <FormModal table="lottery" type="update" id={item.LotteryID} data={item} />
            {(role === "admin" || role === "district_agent" || role === "office_staff") && 
              <FormModal table="lottery" type="delete" id={item.LotteryID} />}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lotteries</h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          <FormModal table="lottery" type="create" />
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LotteryListPage;
