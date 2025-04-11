import React from "react";
import Image from "next/image";
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
        status: "In Transit",
        time: "13:24",
      },
      {
        id: "0002",
        customerName: "Chandrasiri Perera",
        location: "Nuwara",
        status: "Pickup",
        time: "12:50",
      },
      {
        id: "0003",
        customerName: "Anura Senanayaka",
        location: "Matale",
        status: "Assigned",
        time: "11:15",
      },
      {
        id: "0004",
        customerName: "Nimal Gunaratne",
        location: "Gampaha", 
        status: "In Transit",
        time: "10:45",
      },
      {
        id: "0005",
        customerName: "Danushka Jayasingha",
        location: "Colombo",
        status: "Pickup",
        time: "09:30",
      },
    ],
    completedOrders: [
      {
        id: "0008",
        customerName: "Saman Fernando",
        location: "Dehiwala",
        completedAt: "Today, 12:35",
      },
      {
        id: "0009",
        customerName: "Mahesh Peiris",
        location: "Kadugamuwa",
        completedAt: "Today, 11:20", 
      },
      {
        id: "0010",
        customerName: "Kasun Wickramasingha",
        location: "Ambalangoda",
        completedAt: "Today, 10:15",
      },
      {
        id: "0011",
        customerName: "Lasantha Gamage",
        location: "Bandarawela",
        completedAt: "Yesterday, 16:45",
      },
      {
        id: "0012",
        customerName: "Sanjaya Mendis",
        location: "Panadura",
        completedAt: "Yesterday, 15:30",
      },
    ],
  };

  const user = await getUserData();
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar placeholder*/}
      
      {/* Main content */}
      <div className="p-8">
        {/* Header with greeting and date/time */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome Back, <span className="text-blue-600">{user?.username || "Admin"}</span>
            </h1>
            <p className="text-gray-500 mt-1">{currentDate} | {currentTime}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white p-2 rounded-full shadow hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </div>

        {/* Stats Section*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Dispatch */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Dispatch</h2>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Image
                  src="/delivery.png"
                  alt="Delivery"
                  width={40}
                  height={40}
                  className="text-white"
                />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{dummyData.stats.totalDispatch}</p>
            <div className="mt-2 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                +{dummyData.stats.todayDispatch} today
              </span>
              <span className="text-sm text-gray-500 ml-2">Last update: 13:35</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
              <div className="bg-green-500 p-3 rounded-lg">
                <Image
                  src="/order2.png"
                  alt="Orders"
                  width={40}
                  height={40}
                  className="text-white"
                />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{dummyData.stats.totalOrders}</p>
            <div className="mt-2 flex items-center">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                +{dummyData.stats.todayOrders} today
              </span>
              <span className="text-sm text-gray-500 ml-2">Last update: 13:35</span>
            </div>
          </div>

          {/* Total Agents */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Agents</h2>
              <div className="bg-purple-500 p-3 rounded-lg">
                <Image
                  src="/agent2.png"
                  alt="Agents"
                  width={40}
                  height={40}
                  className="text-white"
                />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{dummyData.stats.totalAgents}</p>
            <div className="mt-2 flex items-center">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                +{dummyData.stats.todayAgents} today
              </span>
              <span className="text-sm text-gray-500 ml-2">Last update: 13:35</span>
            </div>
          </div>
        </div>

        {/* Orders Container  */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Orders Overview</h2>
            
          </div>

          {/* Tabs for switching between ongoing and completed */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button className="border-b-2 border-blue-500 text-blue-600 pb-4 px-1 font-medium">
                Ongoing Orders ({dummyData.ongoingOrders.length})
              </button>
              <button className="text-gray-500 hover:text-gray-700 pb-4 px-1 font-medium">
                Completed Orders ({dummyData.completedOrders.length})
              </button>
            </div>
          </div>

          {/* Flex container for Ongoing and Completed Orders */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Ongoing Orders Section */}
            <div className="flex-1">
              <div className="bg-gray-50 p-4 rounded-xl overflow-y-auto max-h-96">
                {dummyData.ongoingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium 
                            ${order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'Pickup' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-base font-medium text-gray-800 mt-1">{order.customerName}</p>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {order.location}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {order.time}
                        </div>
                      </div>
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Orders Section */}
            <div className="flex-1">
              <div className="bg-gray-50 p-4 rounded-xl overflow-y-auto max-h-96">
                {dummyData.completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <span className="ml-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            Completed
                          </span>
                        </div>
                        <p className="text-base font-medium text-gray-800 mt-1">{order.customerName}</p>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {order.location}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {order.completedAt}
                        </div>
                      </div>
                      <button className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;