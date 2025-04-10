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
  Timer
} from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import OrderLotteriesModal from "@/components/OrderLotteriesModal";
import { fetchAgentOrders } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

// Define the Order type to match  backend data structure
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

export default function MyOrder() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch orders using  new server action
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the fetchAgentOrders server action
      const result = await fetchAgentOrders();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }
      
      // Process and categorize orders
      const active: Order[] = [];
      const completed: Order[] = [];
      
      result.orders.forEach((order: Order) => {
        // Categorize orders based on status
        if (order.Status === 'Completed' || order.Status === 'Dispatched' || 
            (order.Status === 'Dispatched' && !order.Delivery?.BusType)) {
          completed.push(order);
        } else {
          active.push(order);
        }
      });
      
      setActiveOrders(active);
      setCompletedOrders(completed);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search query
  const filterOrders = (orders: Order[]) => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(order => 
      order.OrderID.toString().includes(query) ||
      order.Customer.FullName.toLowerCase().includes(query) ||
      order.Status.toLowerCase().includes(query) ||
      (order.Delivery?.BusType && order.Delivery.BusType.toLowerCase().includes(query))
    );
  };

  // Handle order selection and modal opening
  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle order update from the modal
  const handleOrderUpdate = (updatedOrder: Order) => {
    // Update the order in the appropriate list
    if (updatedOrder.Status === 'Completed' || 
        (updatedOrder.Status === 'Dispatched' && !updatedOrder.Delivery?.BusType)) {
      // Order is now completed, move it to completed list
      setActiveOrders(prev => prev.filter(o => o.OrderID !== updatedOrder.OrderID));
      setCompletedOrders(prev => [updatedOrder, ...prev.filter(o => o.OrderID !== updatedOrder.OrderID)]);
    } else {
      // Order is active
      setActiveOrders(prev => {
        const newOrders = prev.filter(o => o.OrderID !== updatedOrder.OrderID);
        return [updatedOrder, ...newOrders];
      });
      setCompletedOrders(prev => prev.filter(o => o.OrderID !== updatedOrder.OrderID));
    }
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
    document.title = "My Orders | Agent Dashboard";
  }, []);

  // Render order cards
  const renderOrderCard = (order: Order) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      key={order.OrderID} 
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-all border border-gray-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => handleOrderClick(order)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <Package className="w-5 h-5 text-NavBlue" />
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
      
      <div className="pl-11 ">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center text-gray-500">
            <Tag className="w-3 h-3 mr-1" />
            <span>{order.totalQuantity} items</span>
          </div>
          
          <div className="flex items-center justify-end text-NavBlue font-medium">
            {formatCurrency(order.TotalAmount)}
          </div>
        </div>

        {/* <div className="flex items-center text-sm text-gray-600">
          <div className="w-6 h-6 bg-gray-100 rounded-full mr-2 flex items-center justify-center overflow-hidden">
            {order.Customer.FullName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{order.Customer.FullName}</span>
        </div> */}

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
  const filteredActiveOrders = filterOrders(activeOrders);
  const filteredCompletedOrders = filterOrders(completedOrders);

  return (
    <>
      {/* Main content area with adjusted padding and positioning for Navbar and Cart */}
      <div className="bg-gray-50 min-h-screen"
       style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="container mx-auto px-4 pt-20 pb-8 ml-0 md:ml-0 lg:ml-0 lg:w-3/4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
            <h1 className="font-bold text-3xl text-gray-800 mb-4 ml-10 mt-4 md:mb-0">My Orders</h1>
            
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-NavBlue focus:border-NavBlue text-sm"
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

          {/* Tab Navigation - Mobile Optimized */}
          <div className="md:hidden flex rounded-lg bg-gray-100 p-1 mb-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md ${
                activeTab === 'active' 
                  ? 'bg-white text-NavBlue shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              <Clock className="w-4 h-4 mr-1" />
              Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md ${
                activeTab === 'completed' 
                  ? 'bg-white text-NavBlue shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Completed ({completedOrders.length})
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-NavBlue animate-spin mr-3" />
              <p>Loading your orders...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center mb-6">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Mobile View - Show active tab content only */}
          <div className="md:hidden">
            {!isLoading && !error && activeTab === 'active' && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-NavBlue" />
                  Active Orders
                  <span className="ml-2 bg-indigo-100 text-NavBlue text-xs px-2 py-0.5 rounded-full">
                    {filteredActiveOrders.length}
                  </span>
                </h2>
                <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  <AnimatePresence>
                    {filteredActiveOrders.length > 0 ? 
                      filteredActiveOrders.map(order => renderOrderCard(order)) :
                      renderEmptyState("No active orders found.")
                    }
                  </AnimatePresence>
                </div>
              </div>
            )}

            {!isLoading && !error && activeTab === 'completed' && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Completed Orders
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {filteredCompletedOrders.length}
                  </span>
                </h2>
                <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  <AnimatePresence>
                    {filteredCompletedOrders.length > 0 ? 
                      filteredCompletedOrders.map(order => renderOrderCard(order)) :
                      renderEmptyState("No completed orders found.")
                    }
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Desktop View - Show both tabs side by side */}
          <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-8 mx-5">
            {!isLoading && !error && (
              <>
                {/* Active Orders */}
                <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                  <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-NavBlue" />
                    Active Orders 
                    <span className="ml-2 bg-indigo-100 text-NavBlue text-xs px-2 py-0.5 rounded-full">
                      {filteredActiveOrders.length}
                    </span>
                  </h2>
                  <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto">
                    <AnimatePresence>
                      {filteredActiveOrders.length > 0 ? 
                        filteredActiveOrders.map(order => renderOrderCard(order)) :
                        renderEmptyState("No active orders found.")
                      }
                    </AnimatePresence>
                  </div>
                </div>

                {/* Completed Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-800" />
                    Completed Orders
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      {filteredCompletedOrders.length}
                    </span>
                  </h2>
                  <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto">
                    <AnimatePresence>
                      {filteredCompletedOrders.length > 0 ? 
                        filteredCompletedOrders.map(order => renderOrderCard(order)) :
                        renderEmptyState("No completed orders found.")
                      }
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderLotteriesModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleOrderUpdate}
        />
      )}
    </>
  );
}