"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import { Order, Delivery, Staff, Agent, Lottery, Order_Contain_Lottery } from "@prisma/client";
import { format } from "date-fns";

type OrderWithRelations = Order & { 
  Delivery: Delivery | null; 
  Staff: Staff | null; 
  Agent: Agent; 
  Order_Contain_Lottery: (Order_Contain_Lottery & {
    Lottery: Lottery
  })[];
};

interface OrderDetailsModalProps {
  order: OrderWithRelations;
}

const OrderDetailsModal = ({ order }: OrderDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // Calculate total quantities and amount
  const totalQuantity = order.Order_Contain_Lottery.reduce((sum, item) => sum + item.Quantity, 0);
  const totalCommission = order.Order_Contain_Lottery.reduce(
    (sum, item) => sum + (item.Lottery.UnitCommission || 0) * item.Quantity, 
    0
  );

  return (
    <>
      <button
        onClick={toggleModal}
        className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
        title="View Order Details"
      >
        <Eye size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <button
                onClick={toggleModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order.OrderID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">
                        {order.OrderTime 
                          ? format(new Date(order.OrderTime), "PPpp") 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">Rs {order.TotalAmount?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Commission:</span>
                      <span className="font-medium">Rs {totalCommission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Type:</span>
                      <span className="font-medium">{order.Delivery ? "Dispatch" : "Self Pick"}</span>
                    </div>
                    {order.Delivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bus Stop:</span>
                        <span className="font-medium">{order.Delivery.BusType}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Agent Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Agent ID:</span>
                      <span className="font-medium">{order.Agent.AgentID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {`${order.Agent.FirstName || ""} ${order.Agent.LastName || ""}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{order.Agent.City || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{order.Agent.City || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed By:</span>
                      <span className="font-medium">
                        {order.Staff 
                          ? `${order.Staff.FirstName || ""} ${order.Staff.LastName || ""}` 
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lottery Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Ordered Lotteries ({order.Order_Contain_Lottery.length} items)
                </h4>
                
                <div className="space-y-4">
                  {order.Order_Contain_Lottery.map((item) => (
                    <div 
                      key={`${order.OrderID}-${item.LotteryID}`}
                      className="flex items-center border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-16 h-16 mr-4 relative rounded-md overflow-hidden">
                        <Image 
                          src={item.Lottery.ImageUrl || "/default-lottery.png"} 
                          alt={item.Lottery.LotteryName}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {item.Lottery.LotteryName}
                        </h5>
                        <p className="text-xs text-gray-500">
                          Draw Date: {item.Lottery.DrawDate 
                            ? format(new Date(item.Lottery.DrawDate), "PP") 
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {item.Lottery.LotteryID}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Rs {((item.Lottery.UnitPrice || 0) * item.Quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.Quantity} x Rs {(item.Lottery.UnitPrice || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-green-600">
                          Commission: Rs {((item.Lottery.UnitCommission || 0) * item.Quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{order.Order_Contain_Lottery.length} (Qty: {totalQuantity})</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs {order.TotalAmount?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Commission:</span>
                  <span className="font-medium">Rs {totalCommission.toFixed(2)}</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between text-base">
                  <span className="font-semibold">Grand Total:</span>
                  <span className="font-bold">Rs {order.TotalAmount?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end border-t">
              <button
                onClick={toggleModal}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;