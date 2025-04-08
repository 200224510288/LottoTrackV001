'use client';

import { useState } from "react";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import OrderLotteriesModal from "@/components/OrderLotteriesModal";
import Image from 'next/image';  // Import Image from next/image



type OrderWithRelations = {
  OrderID: number;
  TotalAmount: number;
  OrderTime: Date;
  Agent: {
    FirstName: string;
    LastName: string;
    City: string;
  } | null;
  Staff: {
    FirstName: string;
    LastName: string;
  } | null;
  Delivery: {
    BusType: string;
  } | null;
  ContainedLotteries: {
    Quantity: number;
    Lottery: {
      LotteryName: string;
      UnitPrice: number;
    };
  }[];
  totalQuantity: number;
};

interface ClientOrderTableProps {
  orders: OrderWithRelations[];
  columns: any[];
  role: string;
}

const ClientOrderTable = ({ orders, columns, role }: ClientOrderTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [isLotteriesModalOpen, setIsLotteriesModalOpen] = useState(false);

  const handleViewLotteries = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsLotteriesModalOpen(true);
  };

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
      <td className="hidden md:table-cell">{item.Agent?.City || "N/A"}</td>
      <td className="hidden md:table-cell">{item.Staff?.FirstName} {item.Staff?.LastName || "N/A"}</td>

      {(role === "admin" || role === "district_agent" || role === "office_staff" || role === "agent") && (
        <td>
          <div className="flex items-center gap-2">
            <button
                      className={`w-7 h-7 flex items-center justify-center rounded-full bg-DashboardBlue hover:bg-blue-600`}
                      onClick={() => handleViewLotteries(item)}
                    >
                      <Image src={`/eye.png`} alt="" width={20} height={20} />
                                       
                    </button>
            
            {(role === "admin" || role === "district_agent" || role === "office_staff") && 
              <FormModal table="order" type="delete" id={item.OrderID} />}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <>
      <Table columns={columns} renderRow={renderRow} data={orders} />
      
      {selectedOrder && (
        <OrderLotteriesModal
          order={selectedOrder}
          isOpen={isLotteriesModalOpen}
          onClose={() => {
            setIsLotteriesModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
};

export default ClientOrderTable;