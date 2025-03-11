"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import { Bus } from 'lucide-react';

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
 
  }, []);

  const renderOrders = (orders: Order[]) => {
    if (orders.length === 0) {
      return <p>No orders available.</p>;
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.OrderID} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
            {/* Order Logo on the Left Side */}
            <img
              src={order.logoUrl}
              alt="Order Logo"
              className="w-16 h-16 object-contain" 
            />
            {/* Order Details on the Right Side */}
            <div>
              <h3 className="font-semibold text-lg">{order.name}</h3>
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

      {/* Setting the background image */}
      <div className="min-h-screen bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('/bg.png')" }}>
        {/* Navbar */}
        <Navbar />
        {/*Cart*/}
        <Cart/>
        <h1 className="font-bold text-3xl mt-24 mb-10 ml-16">PREVIOUS ORDERS</h1>

        <div className="flex gap-5 mb-12 ml-16 mt-10">
          <label className="text-lg mt-2 font-bold text-gray-700">
            Search Date:
          </label>
          <input type="date" className="p-2 border border-gray-300 rounded" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Search
          </button>
        </div>
    
        {/* Flex container for the order boxes */}
        <div className="flex gap-8 mx-16  flex-wrap">
          <div className="bg-gray-200 p-8 rounded-lg shadow-lg overflow-y-auto max-h-96 w-3/4">
            {ongoingOrders === null ? (
              <p>Loading...</p>
            ) : (
              renderOrders(ongoingOrders)
            )}
          </div>
        </div>
      </div>
    </>
  );
}
