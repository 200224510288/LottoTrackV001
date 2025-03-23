import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Staff, User } from "@prisma/client";
import Image from "next/image";
import FormModal from "@/components/FormModal";
import { auth } from "@clerk/nextjs/server";
import { ITEM_PER_PAGE } from "@/lib/settings";

// Ensure this page runs as a server-side component
export const dynamic = "force-dynamic";

// Staff type with user relationship
type StaffList = Staff & { User: User };

// Fetch session and role
const getSessionRole = async () => {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as { role?: string })?.role;
};

const StaffListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const role = await getSessionRole();
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.StaffWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.FirstName = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Paginate staff list
  const [data, count] = await prisma.$transaction([
    prisma.staff.findMany({
      where: query,
      include: { User: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.staff.count(),
  ]);

  const columns = [
    { header: "Staff Name", accessor: "staff" },
    { header: "Email", accessor: "User.Email", className: "hidden md:table-cell" },
    { header: "User Name", accessor: "User.UserName", className: "hidden md:table-cell" },
    { header: "Password", accessor: "User.Password", className: "hidden md:table-cell" },
    { header: "Section", accessor: "section", className: "hidden md:table-cell" },
    { header: "SuperviserID", accessor: "superviserid", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "district_agent" || role === "office_staff"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (item: StaffList) => (
    <tr key={item.StaffID} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight">
      <td className="flex items-center gap-5 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.FirstName || "N/A"} {item.LastName || "N/A"}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.User.Email || "N/A"}</td>
      <td className="hidden md:table-cell">{item.User.UserName || "N/A"}</td>
      <td className="hidden md:table-cell">{item.User.Password || "N/A"}</td>
      <td className="hidden md:table-cell">{item.Section || "N/A"}</td>
      <td className="hidden md:table-cell">{item.SuperviserID || "N/A"}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal table="staff" type="update" id={item.StaffID} data={item} />
          {(role === "admin" || role === "district_agent") && (
            <FormModal table="staff" type="delete" id={item.StaffID} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Staff</h1>
          <div className="flex items-center gap-4">
          <TableSearch />
            <FormModal table="staff" type="create" />
          </div>
        </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default StaffListPage;
