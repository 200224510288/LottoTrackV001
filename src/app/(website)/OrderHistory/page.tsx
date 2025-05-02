"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { 
  Package, 
  Truck, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Tag,
  MapPin,
  Search,
  Timer,
  Filter
} from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AgentOrderDetailsModal from "@/components/OrderLotteriesModalAgent";
import { fetchAgentOrders } from "@/lib/actions";

// Define the Order type to match backend data structure
interface Order {
  OrderID: number;
  TotalAmount: number;
  Status: string;
  StaffID: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  Delivery: {
    BusType: string;
    StaffID: string;
    NumberPlate: string;
    ArrivalTime: Date;
    DispatchTime: Date;
  } | null;
  ContainedLotteries: {
    Quantity: number;
    Lottery: {
      LotteryID: number;
      LotteryName: string;
      UnitPrice: number;
      DrawDate: Date;
    };
  }[];
  Customer: {
    CustomerID: number;
    FullName: string;
    Email: string;
    Phone: string;
  };
  totalQuantity: number;
}

export default function OrderHistory() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Function to fetch orders using the server action   
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the fetchAgentOrders server action   
      const result = await fetchAgentOrders();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }
      
      setOrders(result.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search query, date, and status
  const filterOrders = (orders: Order[]) => {
    let filteredOrders = orders;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredOrders = filteredOrders.filter(order => 
        order.OrderID.toString().includes(query) ||
        order.Customer.FullName.toLowerCase().includes(query) ||
        order.Status.toLowerCase().includes(query) ||
        (order.Delivery?.BusType && order.Delivery.BusType.toLowerCase().includes(query))
      );
    }
    
    // Filter by date
    if (searchDate) {
      const selectedDate = new Date(searchDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.CreatedAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === selectedDate.getTime();
      });
    }
    
    // Filter by status
    if (filterStatus !== "all") {
      filteredOrders = filteredOrders.filter(order => 
        order.Status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    return filteredOrders;
  };

  // Handle order selection and modal opening 
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Function to get status class for styling
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Billed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Ready':
        return 'bg-purple-100 text-purple-800';
      case 'Dispatched':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Ready':
        return <Package className="w-4 h-4" />;
      case 'Dispatched':
        return <Truck className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to format time 
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Refresh orders with animation feedback
  const refreshOrders = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    
    // Reset refresh animation after 1 second
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Effect to fetch orders when component mounts or user changes
  useEffect(() => {
    if (isLoaded) {
      fetchOrders();
    }
  }, [isLoaded, refreshTrigger]);

  // Set document title
  useEffect(() => {
    document.title = "Order History";
  }, []);

  // Render order cards
  const renderOrderCard = (order: Order) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      key={order.OrderID} 
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => handleOrderClick(order)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Order #{order.OrderID}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(order.CreatedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getStatusClass(order.Status)}`}>
            {getStatusIcon(order.Status)}
            <span className="ml-1">{order.Status}</span>
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
        </div>
      </div>
      
      <div className="pl-11">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center text-gray-500">
            <Tag className="w-3 h-3 mr-1" />
            <span>{order.totalQuantity} items</span>
          </div>
          
          <div className="flex items-center justify-end text-blue-600 font-medium">
            {formatCurrency(order.TotalAmount)}
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <div className="w-6 h-6 bg-gray-100 rounded-full mr-2 flex items-center justify-center overflow-hidden">
            {order.Customer.FullName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{order.Customer.FullName}</span>
        </div>

        {/* Show delivery info if available */}
        {order.Delivery && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">
                {order.Delivery.BusType} • {order.Delivery.NumberPlate}
              </span>
            </div>
            {/* Display Dispatch and Arrival Times */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center text-gray-500">
                <Clock className="w-3 h-3 mr-1 text-indigo-500" />
                <span>Dispatch: {formatTime(order.Delivery.DispatchTime)}</span>
              </div>
              <div className="flex items-center text-gray-500 justify-end">
                <Timer className="w-3 h-3 mr-1 text-green-500" />
                <span>Arrival: {formatTime(order.Delivery.ArrivalTime)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render empty state
  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <Package className="w-12 h-12 text-gray-300 mb-2" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );

  // Filtered orders
  const filteredOrders = filterOrders(orders);

  return (
    <>
      <div className="bg-gray-50 min-h-screen"
       style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="container mx-auto px-4 pt-20 pb-8 ml-0 md:ml-0 lg:ml-0 lg:w-3/4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
            <h1 className="font-bold text-3xl text-gray-800 mb-4 ml-10 mt-4 md:mb-0">Previous Orders</h1>
            
            <div className="flex items-center w-full md:w-auto">
              {/* Search bar */}
              <div className="relative flex-grow md:flex-grow-0 md:w-64 mr-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm"
                />
              </div>
              
              {/* Refresh button */}
              <button 
                onClick={refreshOrders}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg p-2 transition-colors"
                aria-label="Refresh orders"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 ml-10 mr-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Search by Date:</label>
                <input 
                  type="date" 
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="ready">Ready</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <button 
                onClick={refreshOrders}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center mx-10">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-3" />
              <p>Loading your orders...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center mb-6 mx-10">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Orders List */}
          {!isLoading && !error && (
            <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mx-10">
              <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Order History
                <span className="ml-2 bg-indigo-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {filteredOrders.length}
                </span>
              </h2>
              
              {filteredOrders.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto">
                  <AnimatePresence>
                    {filteredOrders.map(order => renderOrderCard(order))}
                  </AnimatePresence>
                </div>
              ) : (
                renderEmptyState("No orders found matching your criteria.")
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <AgentOrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}