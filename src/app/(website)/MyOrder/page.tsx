"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import { Bus } from 'lucide-react';
import Image from 'next/image';

interface Order {
  name: string;
  OrderID: number;
  price: string;
  logoUrl: string;
}

export default function MyOrder() {
  const [ongoingOrders, setOngoingOrders] = useState<Order[] | null>(null);
  const [dispatchedOrders, setDispatchedOrders] = useState<Order[] | null>(null);

  const orderLogoUrl = "/OrderLogo.png"; 

  useEffect(() => {
    document.title = "My Order";

    const orderData: Omit<Order, "logoUrl">[] = [
      {
        name: "MR. Remand Daramasena",
        OrderID: 600,
        price: "RS.38,400",
      },
      {
        name: "MR. Remand Daramasena",
        OrderID: 601,
        price: "RS.38,400",
      },
    ];

    const ongoingOrdersData = orderData.map(order => ({
      ...order,
      logoUrl: orderLogoUrl,
    }));

    setOngoingOrders(ongoingOrdersData);
    setDispatchedOrders([]); 
  }, []);

  const renderOrders = (orders: Order[] | null) => {
    if (orders === null) {
      return <p className="text-gray-600">Loading...</p>;
    }
    
    if (orders.length === 0) {
      return <p className="text-gray-600">No orders available.</p>;
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.OrderID} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
            <Image
              src={order.logoUrl}
              alt="Order Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-600">{order.name}</h3>
              <p>Status: Ongoing</p>
              <p>Price: {order.price}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>My Order</title>
      </Head>

      <div className="min-h-screen bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('/bg.png')" }}>
        <Navbar />
        <Cart />

        <h1 className="font-bold text-3xl mt-24 mb-10 ml-16 text-gray-600">MY ORDER</h1>

        {/* New Box on Top */}
        <div className="mx-16 mb-8 flex ">
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg w-1/4">
            <h2 className="text-lg mt-5 font-bold mb-4 flex items-center gap-2 text-gray-600">
              <Bus size={30} />Bus
            </h2>
          </div>
        </div>

        {/* Flex container for the order boxes */}
        <div className="flex gap-8 mx-16 mb-16 flex-wrap w-full sm:w-2/3">
          <div className="flex-1 bg-gray-200 p-8 rounded-lg shadow-lg overflow-y-auto max-h-80">
            <h2 className="text-xl font-semibold mb-5 text-gray-600">Ongoing Orders</h2>
            {renderOrders(ongoingOrders)}
          </div>

          <div className="flex-1 bg-gray-200 p-8 rounded-lg shadow-lg overflow-y-auto max-h-80">
            <h2 className="text-xl font-semibold mb-5 text-gray-600">Dispatched Orders</h2>
            {renderOrders(dispatchedOrders)}
          </div>
        </div>
      </div>
    </>
  );
}
