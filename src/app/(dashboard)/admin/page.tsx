'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import OrderLotteriesModal from '@/components/OrderLotteriesModal';
import { OrderWithRelations } from '@/components/Ordertypes';
import { fetchAllOrders } from '@/lib/actions';

const AdminPage = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [isLotteriesModalOpen, setIsLotteriesModalOpen] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { success, orders: fetchedOrders, error, message } = await fetchAllOrders();
        
        if (!success || error) {
          setError(message || 'Failed to load orders');
          return;
        }
        
        // Log data for debugging agent information
        console.log('Orders loaded:', fetchedOrders?.length);
        
        // Check agent structure in first few orders
        const sampleOrders = fetchedOrders?.slice(0, 3);
        console.log('Sample order Agent data:', sampleOrders?.map(order => order.AgentID));
        
        setOrders(fetchedOrders as OrderWithRelations[]);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('An unexpected error occurred');
      }
    };
    loadOrders();
  }, []);

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-red-600">Error</h1>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = {
    totalDispatch: orders.filter(
      (order) => order.Delivery && ['Dispatched', 'Completed'].includes(order.Status)
    ).length,
    todayDispatch: orders.filter((order) => {
      if (!order.Delivery || !order.Delivery.DispatchTime) return false;
      const dispatchDate = new Date(order.Delivery.DispatchTime);
      return (
        ['Dispatched', 'Completed'].includes(order.Status) &&
        !isNaN(dispatchDate.getTime()) &&
        dispatchDate >= today
      );
    }).length,
    totalOrders: orders.length,
    todayOrders: orders.filter((order) => {
      if (!order.CreatedAt) return false;
      const createdDate = new Date(order.CreatedAt);
      return !isNaN(createdDate.getTime()) && createdDate >= today;
    }).length,
    totalPending: orders.filter(
      (order) => order.Status === 'Pending'
    ).length,
    todayPending: orders.filter((order) => {
      if (!order.CreatedAt) return false;
      const createdDate = new Date(order.CreatedAt);
      return order.Status === 'Pending' && !isNaN(createdDate.getTime()) && createdDate >= today;
    }).length,
  };

  // Ongoing orders (only from today)
  const ongoingOrders = orders
    .filter(
      (order) =>
        ['Pending', 'Accepted', 'Billed', 'Ready'].includes(order.Status) &&
        new Date(order.CreatedAt) >= today
    )
    .map((order) => ({
      id: order.OrderID.toString().padStart(4, '0'),
      customerName: order.Customer?.FullName || 'N/A',
      location: order.Customer?.Phone || 'Unknown',
      status: order.Status,
      time: new Date(order.UpdatedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      order,
    }));

  // Completed orders (only from today)
  const completedOrders = orders
    .filter(
      (order) =>
        ['Dispatched', 'Completed'].includes(order.Status) &&
        new Date(order.CreatedAt) >= today
    )
    .map((order) => ({
      id: order.OrderID.toString().padStart(4, '0'),
      customerName: order.Customer?.FullName || 'N/A',
      location: order.Customer?.Phone || 'Unknown',
      completedAt: new Date(order.UpdatedAt).toLocaleString('en-US', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }),
      order,
    }));

  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handle card click to open modal
  const handleViewLotteries = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsLotteriesModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsLotteriesModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle order updates from modal
  const handleOrderUpdate = (updatedOrder: OrderWithRelations) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.OrderID === updatedOrder.OrderID ? updatedOrder : order
      )
    );
  };

  // Render card for ongoing or completed order
  const renderOrderCard = (
    item: typeof ongoingOrders[0] | typeof completedOrders[0],
    type: 'ongoing' | 'completed'
  ) => {
    const isOngoing = type === 'ongoing';
    const order = 'order' in item ? item.order : null;

    return (
      <div
        key={item.id}
        className={`bg-white p-4 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
          isOngoing ? 'border-blue-500' : 'border-green-500'
        }`}
        onClick={() => order && handleViewLotteries(order)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <p className="font-semibold text-gray-900">Order #{item.id}</p>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  isOngoing && 'status' in item
                    ? item.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.status === 'Accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : item.status === 'Billed'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {isOngoing && 'status' in item ? item.status : 'Completed'}
              </span>
            </div>
            <p className="text-base font-medium text-gray-800 mt-1">{item.customerName}</p>
            <div className="flex items-center text-gray-500 mt-1 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {item.location}
            </div>
            <div className="flex items-center text-gray-500 mt-1 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {'time' in item ? item.time : item.completedAt}
            </div>
          </div>
          <button className={`${isOngoing ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-green-50 hover:bg-green-100 text-green-600'} p-2 rounded-full`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome Back, <span className="text-blue-600">{user?.username || 'Admin'}</span>
            </h1>
            <p className="text-gray-500 mt-1">
              {currentDate} | {currentTime}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white p-2 rounded-full shadow hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Dispatch */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Dispatch</h2>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Image src="/delivery.png" alt="Delivery" width={40} height={40} className="text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.totalDispatch}</p>
            <div className="mt-2 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                +{stats.todayDispatch} today
              </span>
              <span className="text-sm text-gray-500 ml-2">Last update: {currentTime}</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
              <div className="bg-green-500 p-3 rounded-lg">
                <Image src="/order2.png" alt="Orders" width={40} height={40} className="text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
            <div className="mt-2 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                +{stats.todayOrders} today
              </span>
              <span className="text-sm text-gray-500 ml-2">Last update: {currentTime}</span>
            </div>
          </div>

          {/* Total Pending - Replacing Total Agents */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Pending</h2>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Image src="/pending.png" alt="Pending" width={25} height={25} className="text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.totalPending}</p>
            <div className="mt-2 flex items-center">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                +{stats.todayPending} today
              </span>
              <span className="text-sm text-gray-500 ml-2">Last update: {currentTime}</span>
            </div>
          </div>
        </div>

        {/* Orders Container */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Orders Overview (Today)</h2>
          </div>

          {/* Orders Sections */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Ongoing Orders Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Ongoing Orders ({ongoingOrders.length})
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl overflow-y-auto max-h-96">
                {ongoingOrders.length > 0 ? (
                  ongoingOrders.map((order) => renderOrderCard(order, 'ongoing'))
                ) : (
                  <p className="text-gray-500">No ongoing orders for today.</p>
                )}
              </div>
            </div>

            {/* Completed Orders Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Completed Orders ({completedOrders.length})
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl overflow-y-auto max-h-96">
                {completedOrders.length > 0 ? (
                  completedOrders.map((order) => renderOrderCard(order, 'completed'))
                ) : (
                  <p className="text-gray-500">No completed orders for today.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Lotteries Modal */}
      {selectedOrder && (
        <OrderLotteriesModal
          order={selectedOrder}
          isOpen={isLotteriesModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default AdminPage;