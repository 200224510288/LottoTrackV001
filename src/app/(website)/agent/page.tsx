"use client";

import React, { useEffect} from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";

export default function Home() {
  useEffect(() => {
    document.title = "Home Page";
  }, []);
  const nlbtickets = [
    {
      name: "Ada Sampatha",
      status: "Out of Stock",
      quantity: 0,
      image: "nlbticket1.png",
    },
    {
      name: "Lucky 7",
      status: "Add to Cart",
      quantity: 10,
      image: "nlbticket2.png",
    },
    {
      name: "handahana",
      status: "Out of Stock",
      quantity: 0,
      image: "nlbticket3.png",
    },
    {
      name: "Dhana Nidanaya",
      status: "Add to Cart",
      quantity: 8,
      image: "nlbticket4.png",
    },
    {
      name: "mega power",
      status: "Add to Cart",
      quantity: 50,
      image: "nlbticket5.png",
    },
    {
      name: "Govi Setha",
      status: "Add to Cart",
      quantity: 10,
      image: "nlbticket6.png",
    },
  ];

  const dlbtickets = [
    {
      name: "Supiri Dhana Sampatha",
      status: "Out of Stock",
      quantity: 0,
      image: "DLBticket1.png",
    },
    {
      name: "Kapruka",
      status: "Add to Cart",
      quantity: 10,
      image: "DLBticket2.png",
    },
    {
      name: "Ada Kotipathi",
      status: "Out of Stock",
      quantity: 0,
      image: "DLBticket3.png",
    },
    {
      name: "Lagna Wasana",
      status: "Add to Cart",
      quantity: 8,
      image: "DLBticket4.png",
    },
    {
      name: "Super Ball",
      status: "Add to Cart",
      quantity: 50,
      image: "DLBticket5.png",
    },
    {
      name: "Shanida",
      status: "Add to Cart",
      quantity: 10,
      image: "DLBticket6.png",
    },
    {
      name: "Sirasa",
      status: "Add to Cart",
      quantity: 10,
      image: "DLBticket7.png",
    },
    {
      name: "Jayoda",
      status: "Add to Cart",
      quantity: 10,
      image: "DLBticket8.png",
    },
  ];

  return (
    <>
      <Head>
        <title>My Ticket Store</title>
        <meta name="description" content="Buy lottery tickets online" />
      </Head>

      {/*Navbar*/}
      <Navbar />

      {/* Cart Section */}
      <Cart />

      {/* Main Content */}
      <div
        className="fixed left-0 top-10 p-6 w-3/4 overflow-y-auto max-h-screen bg-cover bg-center "
        style={{
          backgroundImage: "url('/bg.png')",
        }}
      >
        <div className="flex gap-5  ml-10 mt-10">
          <label className="text-lg mt-2 font-bold text-gray-700">
            Search Date:
          </label>
          <input type="date" className="p-2 border border-gray-300 rounded" />
          <button className="bg-NavBlue text-white px-4 py-2 rounded">
            Search
          </button>
        </div>


        <h1 className="font-bold text-3xl mt-10 mb-10 ml-10 text-gray-600">NLB TICKETS</h1>
        

        <div className="overflow-x-auto mb-20 ml-10">
          <div className="grid grid-cols-3 gap-16">
            {nlbtickets.map((nlbticket) => (
              <div
                key={nlbticket.name}
                className="w-full h-50 bg-white rounded-lg shadow-md text-center relative overflow-hidden border border-black"
              >
                <img
                  src={nlbticket.image}
                  alt={nlbticket.name}
                  className="w-full h-45 object-cover"
                />
                <div className="flex items-center  gap-2 p-2 bg-white">
                  <p className="text-md text-gray-600 pr-18 pl-4">
                    {nlbticket.status}
                  </p>
                  <button className="px-2 bg-gray-300 rounded-full">-</button>
                  <span className="text-md font-bold">
                    {nlbticket.quantity}
                  </span>
                  <button className="px-2 bg-gray-300 rounded-full">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h1 className="font-bold text-3xl mt-10 mb-10 ml-10">DLB TICKETS</h1>

        <div className="overflow-x-auto mb-20 ml-10">
          <div className="grid grid-cols-3 gap-16">
            {dlbtickets.map((dlbticket) => (
              <div
                key={dlbticket.name}
                className="w-full h-70 bg-white rounded-lg shadow-md text-center relative overflow-hidden border border-black"
              >
                <img
                  src={dlbticket.image}
                  alt={dlbticket.name}
                  className="w-full h-50 object-cover"
                />
                <div className="flex items-center  gap-2 p-2 bg-white">
                  <p className="text-md text-gray-600 pr-18 pl-4">
                    {dlbticket.status}
                  </p>
                  <button className="px-2 bg-gray-300 rounded-full">-</button>
                  <span className="text-md font-bold">
                    {dlbticket.quantity}
                  </span>
                  <button className="px-2 bg-gray-300 rounded-full">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
