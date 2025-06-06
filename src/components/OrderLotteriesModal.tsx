'use client';

import { useState, useEffect } from "react";
import { updateOrder } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { 
  Clipboard, 
  CheckCircle, 
  FileText, 
  Package, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Save, 
  Edit, 
  RefreshCw, 
  Minus, 
  Plus, 
  AlertCircle,
  UserCheck,
  MapPin,
  Tag,
  Clock,
  Timer
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { boolean } from "zod";

// Modified to include 'Completed' instead of 'Dispatched' for self-pickup orders
const DELIVERY_STATUSES = ['Pending', 'Accepted', 'Billed', 'Ready', 'Dispatched'];
const PICKUP_STATUSES = ['Pending', 'Accepted', 'Billed', 'Ready', 'Completed'];

export interface OrderWithRelations {
  OrderID: number;
  TotalAmount: number;
  Status: string;
  OrderTime: string | Date;
  OrderDate?: Date;
  StaffID: string | null;
  AgentID?: string;
  TotalCommission?: number;
  totalQuantity: number;
  Agent?: {
    AgentID: string;
    FirstName: string;
    LastName: string;
    City: string;
  } | null;
  Staff?: {
    FirstName: string;
    LastName: string;
    StaffID?: string;
  } | null;
  Delivery?: {
    BusType: string;
    StaffID: string;
    NumberPlate: string;
    ArrivalTime: Date;
    DispatchTime: Date;
  } | null;
  ContainedLotteries: Array<any>;
  Customer: any;
  CreatedAt: string;
  UpdatedAt: string;
}

interface OrderLotteriesModalProps {
  order: OrderWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedOrder: any) => void;
}

const OrderLotteriesModal = ({ order, isOpen, onClose, onUpdate }: OrderLotteriesModalProps) => {
  const { user } = useUser(); 
  const staffID = user?.id || '';
  
  const [editMode, setEditMode] = useState(false);
  const [statusEditMode, setStatusEditMode] = useState(false);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [totalAmount, setTotalAmount] = useState(order.TotalAmount);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'delivery'>('items');

  // Status management state
  const [status, setStatus] = useState(order.Status);
  const [dispatchDetails, setDispatchDetails] = useState({
    busType: order.Delivery?.BusType || '',
    numberPlate: order.Delivery?.NumberPlate || '',
    dispatchTime: order.Delivery?.DispatchTime ? new Date(order.Delivery.DispatchTime).toISOString().slice(0, 16) : '',
    arrivalTime: order.Delivery?.ArrivalTime ? new Date(order.Delivery.ArrivalTime).toISOString().slice(0, 16) : ''
  });
  
  // Determine if this is a self-pickup order
  const [isSelfPickup, setIsSelfPickup] = useState(!order.Delivery?.BusType);

  // Get the appropriate status list based on delivery type
  const ORDER_STATUSES = isSelfPickup ? PICKUP_STATUSES : DELIVERY_STATUSES;

  useEffect(() => {
    // Initialize quantities and status from order when modal opens
    if (isOpen) {
      setQuantities(order.ContainedLotteries.map(item => item.Quantity));
      calculateTotals(order.ContainedLotteries.map(item => item.Quantity));
      setStatus(order.Status);
      
      // Determine if self-pickup based on Delivery data
      const selfPickup = !order.Delivery?.BusType;
      setIsSelfPickup(selfPickup);
      
      // If status is "Dispatched" and this is now recognized as self-pickup, change to "Completed"
      let updatedStatus = order.Status;
      if (selfPickup && updatedStatus === 'Dispatched') {
        updatedStatus = 'Completed';
        setStatus('Completed');
      }
      
      setDispatchDetails({
        busType: order.Delivery?.BusType || '',
        numberPlate: order.Delivery?.NumberPlate || '',
        dispatchTime: order.Delivery?.DispatchTime ? new Date(order.Delivery.DispatchTime).toISOString().slice(0, 16) : '',
        arrivalTime: order.Delivery?.ArrivalTime ? new Date(order.Delivery.ArrivalTime).toISOString().slice(0, 16) : ''
      });
      setUpdateMessage(null);
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


  const handleQuantityChange = (index: number, value: number) => {
    const newValue = Math.max(0, value); // Prevent negative quantities
    const newQuantities = [...quantities];
    newQuantities[index] = newValue;
    setQuantities(newQuantities);
    calculateTotals(newQuantities);
  };

  const calculateTotals = (newQuantities: number[]) => {
    // Calculate new total amount
    let newTotalAmount = 0;
    let newTotalQuantity = 0;
    
    order.ContainedLotteries.forEach((item, index) => {
      newTotalAmount += item.Lottery.UnitPrice * newQuantities[index];
      newTotalQuantity += newQuantities[index];
    });
    
    setTotalAmount(newTotalAmount);
    setTotalQuantity(newTotalQuantity);
  };

  const toggleSelfPickup = () => {
    const newIsSelfPickup = !isSelfPickup;
    setIsSelfPickup(newIsSelfPickup);
    
    // Update status if needed
    if (newIsSelfPickup && status === 'Dispatched') {
      setStatus('Completed');
    } else if (!newIsSelfPickup && status === 'Completed') {
      setStatus('Dispatched');
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      
      // Create updated order object based on what's being edited
      const updatedOrderData: any = {
        OrderID: order.OrderID
      };
      
      // Add quantities data if in edit mode
      if (editMode) {
        updatedOrderData.TotalAmount = totalAmount;
        updatedOrderData.ContainedLotteries = order.ContainedLotteries.map((item, index) => ({
          ...item,
          Quantity: quantities[index]
        }));
      } else {
        // pass TotalAmount
        updatedOrderData.TotalAmount = order.TotalAmount;
      }
      
      // Add status information if in status edit mode
      if (statusEditMode) {
        updatedOrderData.Status = status;
        updatedOrderData.StaffID = staffID;
        
        // Include delivery details if status is Dispatched and not self-pickup
        if (status === 'Dispatched' && !isSelfPickup) {
          updatedOrderData.Delivery = {
            BusType: dispatchDetails.busType,
            NumberPlate: dispatchDetails.numberPlate,
            StaffID: staffID,
            DispatchTime: dispatchDetails.dispatchTime ? new Date(dispatchDetails.dispatchTime) : null,
            ArrivalTime: dispatchDetails.arrivalTime ? new Date(dispatchDetails.arrivalTime) : null
          };
        } else if (status === 'Completed' && isSelfPickup) {
          // Set delivery to null for self-pickup orders marked as completed
          updatedOrderData.Delivery = null;
        }
      }
      
      // Call the server action
      const result = await updateOrder(updatedOrderData);
      
      if (result.success) {
        setUpdateMessage({
          type: 'success',
          text: result.message || 'Order updated successfully'
        });
        setEditMode(false);
        setStatusEditMode(false);
        
        // Call the onUpdate callback if provided and we have data
        if (onUpdate && result.data) {
          onUpdate(result.data);
        }
      } else {
        setUpdateMessage({
          type: 'error',
          text: result.message || 'Failed to update order'
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setUpdateMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    // Reset to original values
    setQuantities(order.ContainedLotteries.map(item => item.Quantity));
    setTotalAmount(order.TotalAmount);
    setStatus(order.Status);
    setIsSelfPickup(!order.Delivery?.BusType);
    setDispatchDetails({
      busType: order.Delivery?.BusType || '',
      numberPlate: order.Delivery?.NumberPlate || '',
      dispatchTime: order.Delivery?.DispatchTime ? new Date(order.Delivery.DispatchTime).toISOString().slice(0, 16) : '',
      arrivalTime: order.Delivery?.ArrivalTime ? new Date(order.Delivery.ArrivalTime).toISOString().slice(0, 16) : ''
    });
    setEditMode(false);
    setStatusEditMode(false);
    setUpdateMessage(null);
  };

  // Get current status index for progress bar
  const currentStatusIndex = ORDER_STATUSES.indexOf(status);

  // Status icon mapping
  const statusIcons = {
    'Pending': <Clipboard className="w-5 h-5" />,
    'Accepted': <CheckCircle className="w-5 h-5" />,
    'Billed': <FileText className="w-5 h-5" />,
    'Ready': <Package className="w-5 h-5" />,
    'Dispatched': <Truck className="w-5 h-5" />,
    'Completed': <UserCheck className="w-5 h-5" />
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm ">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh]  flex flex-col ">
        {/* Header */}
        <div className="bg-NavBlue text-white p-5 flex justify-between items-center ">
          <div className="flex items-center space-x-2">
            <Clipboard className="w-6 h-6" />
            <h2 className="text-xl font-bold ">Order #{order.OrderID}</h2>
            {isSelfPickup && 
              <span className="bg-white text-NavBlue text-xs font-bold px-1 py-1 rounded ">
                SELF PICKUP
              </span>
            }
          </div>
          <button
            onClick={onClose}
            className=" rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Notification message */}
        {updateMessage && (
          <div className={`mx-4 mt-4 p-3 rounded-lg flex items-center ${
            updateMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {updateMessage.type === 'success' ? 
              <CheckCircle className="w-5 h-5 mr-2" /> : 
              <AlertCircle className="w-5 h-5 mr-2" />
            }
            {updateMessage.text}
          </div>
        )}
        
        {/* Order Status Progress Section */}
        <div className="pt-5 px-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Order Progress</h3>
            {!statusEditMode && !editMode && (
              <button
                onClick={() => setStatusEditMode(true)}
                className="flex items-center bg-NavBlue hover:bg-indigo-700 text-white py-1.5 px-3 rounded-md transition-colors text-sm"
              >
                <RefreshCw className="w-3 h-3 mr-2 " />
                Update Status
              </button>
            )}
          </div>
          
          {/* Self-pickup toggle when in status edit mode */}
          {statusEditMode && (
            <div className="mb-4 flex items-center">
              <label className="inline-flex items-center mr-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isSelfPickup} 
                  onChange={toggleSelfPickup}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Self Pickup</span>
              </label>
              <span className="text-xs text-gray-500">
                {isSelfPickup 
                  ? "Customer will collect the order themselves" 
                  : "Order will be dispatched via delivery"}
              </span>
            </div>
          )}
          
          {/* Progress bar with status indicators */}
          <div className="relative mb-6">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {ORDER_STATUSES.map((statusOption, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrentStatus = status === statusOption;
                
                return (
                  <div key={statusOption} className={`flex flex-col items-center ${statusEditMode ? 'cursor-pointer' : ''}`} onClick={() => statusEditMode && setStatus(statusOption)}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-colors ${
                      isCurrentStatus 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
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
                    {statusEditMode && (
                      <input 
                        type="radio" 
                        name="status" 
                        checked={status === statusOption}
                        onChange={() => setStatus(statusOption)}
                        className="mt-1"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Dispatch details section - only show for delivery orders */}
          {statusEditMode && status === 'Dispatched' && !isSelfPickup && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-4 animate-fadeIn">
              <h4 className="font-medium text-indigo-800 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Dispatch Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Type
                  </label>
                  <input
                    type="text"
                    value={dispatchDetails.busType}
                    onChange={(e) => setDispatchDetails({...dispatchDetails, busType: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter bus type"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number Plate
                  </label>
                  <input
                    type="text"
                    value={dispatchDetails.numberPlate}
                    onChange={(e) => setDispatchDetails({...dispatchDetails, numberPlate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter number plate"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dispatch Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dispatchDetails.dispatchTime}
                    onChange={(e) => setDispatchDetails({...dispatchDetails, dispatchTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dispatchDetails.arrivalTime}
                    onChange={(e) => setDispatchDetails({...dispatchDetails, arrivalTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Self-pickup completion note */}
          {statusEditMode && status === 'Completed' && isSelfPickup && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 mt-4 animate-fadeIn">
              <h4 className="font-medium text-green-800 mb-3 flex items-center">
                <UserCheck className="w-4 h-4 mr-2" />
                Self-Pickup Completion
              </h4>
              <p className="text-sm text-green-700">
                This order will be marked as completed. The agent will pick up their order directly through distibutor office.
              </p>
            </div>
          )}
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
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-NavBlue" />
                  Order Items
                </h3>
                {!editMode && !statusEditMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center bg-NavBlue hover:bg-blue-700 text-white py-1.5 px-3 rounded-md transition-colors text-sm"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Quantities
                  </button>
                )}
              </div>
              
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
                        const currentQuantity = quantities[index] || 0;
                        const subtotal = currentQuantity * item.Lottery.UnitPrice;
                        
                        return (
                          <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.Lottery.LotteryName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.Lottery.DrawDate ? formatDrawDate(item.Lottery.DrawDate) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              Rs {item.Lottery.UnitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {editMode ? (
                                <div className="flex items-center bg-gray-100 rounded-md overflow-hidden w-32">
                                  <button 
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 transition-colors"
                                    onClick={() => handleQuantityChange(index, currentQuantity - 1)}
                                    disabled={isSubmitting}
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="number"
                                    className="w-16 text-center border-0 bg-transparent focus:ring-0"
                                    value={currentQuantity}
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                    min="0"
                                    disabled={isSubmitting}
                                  />
                                  <button 
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 transition-colors"
                                    onClick={() => handleQuantityChange(index, currentQuantity + 1)}
                                    disabled={isSubmitting}
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                  {currentQuantity}
                                </span>
                              )}
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
                            {totalQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-NavBlue">
                          Rs {totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>No lotteries found for this order.</p>
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
                    <p className="text-sm text-green-700 mb-1">Order Status: <span className="font-semibold">{status}</span></p>
                     {/* {<p className="text-sm text-green-700">Last Updated: {formatDate(order.UpdatedAt)}</p>} */}
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
                            {formatDate(order.Delivery.DispatchTime)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-gray-800 font-medium">Expected Arrival:</span>
                            <span className="ml-2">
                              {formatDate(order.Delivery.ArrivalTime)}
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
                            status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                        {/* <span className="text-xs text-gray-500">
                          Last updated: {formatTime(order.UpdatedAt)}
                        </span> */}
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
                    <p className="text-sm text-yellow-700 mb-1">Current Status: <span className="font-semibold">{status}</span></p>
                    <p className="text-sm text-yellow-700">Please check back later for delivery updates.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {editMode ? 'Editing quantities' : statusEditMode ? 'Updating status' : 'View mode'}
          </div>
          
          <div className="flex space-x-3">
            {(editMode || statusEditMode) ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm py-2 px-4 rounded-md transition-colors flex items-center shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3 h-4 mr-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="bg-NavBlue hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderLotteriesModal;