'use client';

import { useState, useEffect } from "react";
import Table from "@/components/Table";
import FormModal from "@/components/FormModal";
import OrderLotteriesModal from "@/components/OrderLotteriesModal";
import Image from 'next/image';
import { useUser } from "@clerk/nextjs";
import { OrderWithRelations } from "@/components/Ordertypes"; // separate file for types



interface ClientOrderTableProps {
  orders: OrderWithRelations[];
  columns: any[];
  role: string;
}

const ClientOrderTable = ({ orders: initialOrders, columns, role }: ClientOrderTableProps) => {
  const { user } = useUser();
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [isLotteriesModalOpen, setIsLotteriesModalOpen] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleViewLotteries = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsLotteriesModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLotteriesModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle order updates in client-side cache
  const handleOrderUpdate = (updatedOrder: OrderWithRelations) => {
    // Update the client-side cache of orders
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.OrderID === updatedOrder.OrderID ? updatedOrder : order
      )
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Billed':
        return 'bg-purple-100 text-purple-800';
      case 'Ready':
        return 'bg-green-100 text-green-800';
      case 'Dispatched':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRow = (item: OrderWithRelations) => (
    <tr key={item.OrderID} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight">
      <td className="p-4 font-semibold">{item.OrderID || "N/A"}</td>
      <td>{item.Agent?.FirstName} {item.Agent?.LastName || "N/A"}</td>
      <td className="font-medium hidden md:table-cell">{item.totalQuantity}</td>
      <td className="font-medium hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.Status)}`}>
          {item.Status}
        </span>
      </td>
      <td className="font-medium hidden md:table-cell">Rs {item.TotalAmount.toFixed(2)}</td>
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
              className="w-7 h-7 flex items-center justify-center rounded-full bg-DashboardBlue hover:bg-blue-600"
              onClick={() => handleViewLotteries(item)}
            >
              <Image src="/eye.png" alt="View" width={20} height={20} />
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
          onClose={handleCloseModal}
          onUpdate={handleOrderUpdate}
        />
      )}
      
    </>
  );
};

export default ClientOrderTable;