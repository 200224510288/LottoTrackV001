import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import {Prisma, Agent, Agent_Contact_Number, User } from "@prisma/client";
import Image from "next/image";
import { ITEM_PER_PAGE } from "@/lib/settings";
import FormModal from "@/components/FormModal";
import { auth } from "@clerk/nextjs/server";

type AgentList = Agent & { User: User; Agent_Contact_Number: Agent_Contact_Number[] };

const AgentListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AgentWhereInput = {};
 
  if (queryParams.search) {
    query.OR = [
      { FirstName: { contains: queryParams.search, mode: "insensitive" } },
      { LastName: { contains: queryParams.search, mode: "insensitive" } },
      { User: { UserName: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  // use for split items into pages
  const [data, count] = await prisma.$transaction([
    prisma.agent.findMany({
      where: query,
      include: {
        User: true,
        Agent_Contact_Number: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.agent.count({ where: query }),
  ]);

  const columns = [
    { header: "Agent Name", accessor: "agent" },
    { header: "Email", accessor: "User.Email", className: "hidden md:table-cell" },
    { header: "User Name", accessor: "User.UserName", className: "hidden md:table-cell" },
    { header: "Contact Numbers", accessor: "contactNumbers", className: "hidden md:table-cell" },
    { header: "Office Address", accessor: "OfficeAddress", className: "hidden md:table-cell" },
    { header: "Home Address", accessor: "HomeAddress", className: "hidden md:table-cell" },
    { header: "City", accessor: "City", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "district_agent" || role === "office_staff"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (item: AgentList) => (
    <tr key={item.AgentID} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight">
      <td className="p-4 font-semibold">{item.FirstName || "N/A"} {item.LastName || "N/A"}</td>
      <td className="hidden md:table-cell">{item.User?.Email || "N/A"}</td>
      <td className="hidden md:table-cell">{item.User?.UserName || "N/A"}</td>
      <td className="hidden md:table-cell">
        {item.Agent_Contact_Number?.length
          ? item.Agent_Contact_Number.map((cn) => cn.ContactNumber).join(", ")
          : "N/A"}
      </td>
      <td className="hidden md:table-cell">{item.OfficeAddress || "N/A"}</td>
      <td className="hidden md:table-cell">{item.HomeAddress || "N/A"}</td>
      <td className="hidden md:table-cell">{item.City || "N/A"}</td>
      {role && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="agent" type="update" id={item.AgentID} data={item} />
            {(role === "admin" || role === "district_agent") && <FormModal table="agent" type="delete" id={item.AgentID} />}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Agents</h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          <FormModal table="agent" type="create" />
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AgentListPage;

