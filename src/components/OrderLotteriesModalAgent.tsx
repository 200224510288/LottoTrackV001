'use client';

import { useState, useEffect } from "react";
import { 
  Clipboard, 
  CheckCircle, 
  Package, 
  Truck, 
  X, 
  Clock, 
  Calendar,
  Tag,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  AlertCircle,
  Timer,
  UserCheck
} from "lucide-react";

// Status icon mapping
const statusIcons = {
  'Pending': <Clipboard className="w-5 h-5" />,
  'Accepted': <CheckCircle className="w-5 h-5" />,
  'Billed': <FileText className="w-5 h-5" />,
  'Ready': <Package className="w-5 h-5" />,
  'Dispatched': <Truck className="w-5 h-5" />,
  'Completed': <UserCheck className="w-5 h-5" />
};

// Define progress steps
const ORDER_STATUSES = ['Pending', 'Accepted', 'Billed', 'Ready', 'Dispatched', 'Completed'];

type AgentOrderDetailsModalProps = {
  order: {
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
  };
  isOpen: boolean;
  onClose: () => void;
};

const AgentOrderDetailsModal = ({ order, isOpen, onClose }: AgentOrderDetailsModalProps) => {
  const [isSelfPickup, setIsSelfPickup] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'delivery'>('items');
  
  useEffect(() => {
    // Determine if this is a self-pickup order
    if (isOpen) {
      setIsSelfPickup(!order.Delivery?.BusType);
    }
  }, [isOpen, order]);
  
  if (!isOpen) return null;

  // Format date for display
const formatDate = (dateString: string | Date) => {
  if (!dateString) return 'N/A'; // Handle null or undefined values
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDrawDate = (dateString: string | Date) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
  
  // Format time for display
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate current status index for progress bar
  const currentStatusIndex = ORDER_STATUSES.indexOf(order.Status);
  
  // Calculate total items
  const totalItems = order.ContainedLotteries.reduce((sum, item) => sum + item.Quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-NavBlue text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clipboard className="w-6 h-6" />
            <h2 className="text-xl font-bold">Order #{order.OrderID}</h2>
            {isSelfPickup && 
              <span className="bg-white text-NavBlue text-xs font-bold px-2 py-1 rounded">
                SELF PICKUP
              </span>
            }
          </div>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-white hover:bg-opacity-20 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex flex-wrap justify-between">
            <div className="flex items-center mb-2 mr-4">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">Ordered: {formatDate(order.CreatedAt)}</span>
            </div>
            <div className="flex items-center mb-2">
              <Tag className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium">Total: <span className="text-NavBlue">{totalItems} items</span></span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                order.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                order.Status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {statusIcons[order.Status as keyof typeof statusIcons]}
                <span className="ml-1">{order.Status}</span>
              </div>
            </div>
            <div className="text-lg font-bold text-NavBlue">
              Rs {order.TotalAmount.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Progress Tracker */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Order Progress</h3>
          <div className="relative mb-6">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {ORDER_STATUSES.map((statusOption, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrentStatus = order.Status === statusOption;
                
                return (
                  <div key={statusOption} className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full mb-1 transition-colors ${
                      isCurrentStatus 
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-100' 
                        : isActive 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {statusIcons[statusOption as keyof typeof statusIcons]}
                    </div>
                    <span className={`text-xs font-medium text-center ${
                      isCurrentStatus ? 'text-indigo-700' : isActive ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {statusOption}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Tabs for Items and Delivery */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === 'items' 
                  ? 'border-NavBlue text-NavBlue' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                Order Items
              </div>
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === 'delivery' 
                  ? 'border-NavBlue text-NavBlue' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Truck className="w-4 h-4 mr-2" />
                Delivery Details
              </div>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-24rem)]">
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="p-4">
              {order.ContainedLotteries.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Lottery Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Draw Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.ContainedLotteries.map((item, index) => {
                        const subtotal = item.Quantity * item.Lottery.UnitPrice;
                        console.log('DrawDate value:', item.Lottery.DrawDate);

                        return (
                          <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.Lottery.LotteryName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDrawDate(item.Lottery.DrawDate)}

                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              Rs {item.Lottery.UnitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                {item.Quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Rs {subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50">
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-NavBlue">
                          Total
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-NavBlue">
                          <span className="px-3 py-1 bg-indigo-100 text-NavBlue rounded-full">
                            {totalItems}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-NavBlue">
                          Rs {order.TotalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>No items found in this order.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Delivery Tab */}
          {activeTab === 'delivery' && (
            <div className="p-4">
              {isSelfPickup ? (
                <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                  <UserCheck className="w-12 h-12 mx-auto text-green-600 mb-3" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">Self Pickup</h3>
                  <p className="text-green-700">
                    This order will be picked up directly from the distribution office.
                  </p>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm text-green-700 mb-1">Order Status: <span className="font-semibold">{order.Status}</span></p>
                    <p className="text-sm text-green-700">Last Updated: {formatDate(order.UpdatedAt)}</p>
                  </div>
                </div>
              ) : order.Delivery ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                    <h3 className="text-lg font-medium text-indigo-800 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Delivery Information
                    </h3>
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Vehicle Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center mb-3">
                            <MapPin className="w-4 h-4 text-indigo-600 mr-2" />
                            <span className="text-gray-800 font-medium">Bus Type:</span>
                            <span className="ml-2">{order.Delivery.BusType}</span>
                          </div>
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 text-indigo-600 mr-2" />
                            <span className="text-gray-800 font-medium">Number Plate:</span>
                            <span className="ml-2">{order.Delivery.NumberPlate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Schedule</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center mb-3">
                            <Clock className="w-4 h-4 text-indigo-600 mr-2" />
                            <span className="text-gray-800 font-medium">Dispatch Time:</span>
                            <span className="ml-2">
                              {formatTime(order.Delivery.DispatchTime)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-gray-800 font-medium">Expected Arrival:</span>
                            <span className="ml-2">
                              {formatTime(order.Delivery.ArrivalTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status information */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
                          <span className="text-sm text-gray-600">Current Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            order.Status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            order.Status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.Status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Last updated: {formatDate(order.UpdatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Delivery Not Scheduled</h3>
                  <p className="text-yellow-700">
                    Delivery details have not been assigned to this order yet.
                  </p>
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Current Status: <span className="font-semibold">{order.Status}</span></p>
                    <p className="text-sm text-yellow-700">Please check back later for delivery updates.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Order placed on {formatDate(order.CreatedAt)}
          </p>
          <button
            onClick={onClose}
            className="bg-NavBlue hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentOrderDetailsModal;