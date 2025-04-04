import React from "react";
import Image from "next/image"; // Import the Image component from Next.js
import { currentUser } from "@clerk/nextjs/server";




export const getUserData = async () => {
  const user = await currentUser();
  return user;
};


const AdminPage = async () => {
  // Dummy data
  const dummyData = {
    stats: {
      totalDispatch: 28,
      todayDispatch: 7,
      totalOrders: 14,
      todayOrders: 9,
      totalAgents: 20,
      todayAgents: 7,
    },
    ongoingOrders: [
      {
        id: "0001",
        customerName: "Sunil Wijesingha",
        location: "Katugastota",
      },
      {
        id: "0002",
        customerName: "Chandrasiri Perera",
        location: "Nuwara",
      },
      {
        id: "0003",
        customerName: "Anura Senanayaka",
        location: "Matale",
      },
      {
        id: "0004",
        customerName: "Nimal Gunaratne",
        location: "Gampaha",
      },
      {
        id: "0005",
        customerName: "Danushka Jayasingha",
        location: "Colombo",
      },
    ],
    completedOrders: [
      {
        id: "0008",
        customerName: "Saman Fernando",
        location: "Dehiwala",
      },
      {
        id: "0009",
        customerName: "Mahesh Peiris",
        location: "Kadugamuwa",
      },
      {
        id: "0010",
        customerName: "Kasun Wickramasingha",
        location: "Ambalangoda",
      },
      {
        id: "0011",
        customerName: "Lasantha Gamage",
        location: "Bandarawela",
      },
      {
        id: "0012",
        customerName: "Sanjaya Mendis",
        location: "Panadura",
      },
    ],
  };
  

    const user = await getUserData();
  

  return (
    
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8">
        Welcome Back <span className="text-blue-600">{user?.username}</span>!
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Dispatch */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-36 mb-4">
            {/* Custom Delivery Image */}

            <h2 className="text-lg font-semibold text-gray-700">
              Total Dispatch
            </h2>
            <Image
              src="/delivery.png" 
              alt="Delivery"
              width={60} 
              height={60} 
              
            />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {dummyData.stats.totalDispatch}
          </p>
          <p className="text-sm text-gray-500">
            Today 13:35 {dummyData.stats.todayDispatch}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-36 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
          <Image
              src="/order2.png" 
              alt="Delivery"
              width={60} 
              height={60} 
            />
            </div>
          <p className="text-3xl font-bold text-gray-900">
            {dummyData.stats.totalOrders}
          </p>
          <p className="text-sm text-gray-500">
            Today 13:35 {dummyData.stats.todayOrders}
          </p>
        </div>

        {/* Total Agents */}
        <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-36 mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Total Agents</h2>
          <Image
              src="/agent2.png" 
              alt="Delivery"
              width={60} 
              height={60}              
            />
            </div>
          <p className="text-3xl font-bold text-gray-900">
            {dummyData.stats.totalAgents}
          </p>
          <p className="text-sm text-gray-500">
            13:35 {dummyData.stats.todayAgents}
          </p>
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Orders</h2>

        {/* Flex container for Ongoing and Completed Orders */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Ongoing Orders Section */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Ongoing Orders
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner overflow-y-auto max-h-96">
              {dummyData.ongoingOrders.map((order) => (
                <div
                  key={order.id}
                  className="border-l-4 border-blue-500 p-4 bg-white rounded-lg mb-4"
                >
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.id} / {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500">- {order.location}</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Orders Section */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Completed Orders
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner overflow-y-auto max-h-96">
              {dummyData.completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="border-l-4 border-green-500 p-4 bg-white rounded-lg mb-4"
                >
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.id} / {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500">- {order.location}</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
