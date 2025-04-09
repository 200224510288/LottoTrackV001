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
  AlertCircle
} from "lucide-react";

const ORDER_STATUSES = ['Pending', 'Accepted', 'Billed', 'Ready', 'Dispatched'];

type OrderLotteriesModalProps = {
  order: {
    OrderID: number;
    TotalAmount: number;
    Status: string;
    StaffID: string | null; // Changed from string to string | null
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
    totalQuantity: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedOrder: any) => void;
};

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
  
  // Status management state
  const [status, setStatus] = useState(order.Status);
  const [dispatchDetails, setDispatchDetails] = useState({
    busType: order.Delivery?.BusType || '',
    numberPlate: order.Delivery?.NumberPlate || '',
    dispatchTime: order.Delivery?.DispatchTime ? new Date(order.Delivery.DispatchTime).toISOString().slice(0, 16) : '',
    arrivalTime: order.Delivery?.ArrivalTime ? new Date(order.Delivery.ArrivalTime).toISOString().slice(0, 16) : ''
  });

  useEffect(() => {
    // Initialize quantities and status from order when modal opens
    if (isOpen) {
      setQuantities(order.ContainedLotteries.map(item => item.Quantity));
      calculateTotals(order.ContainedLotteries.map(item => item.Quantity));
      setStatus(order.Status);
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
        // We're not updating quantities, but still need to pass TotalAmount
        updatedOrderData.TotalAmount = order.TotalAmount;
      }
      
      // Add status information if in status edit mode
      if (statusEditMode) {
        updatedOrderData.Status = status;
        updatedOrderData.StaffID = staffID;
        
        // Include delivery details if status is Dispatched
        if (status === 'Dispatched') {
          updatedOrderData.Delivery = {
            BusType: dispatchDetails.busType,
            NumberPlate: dispatchDetails.numberPlate,
            StaffID: staffID,
            DispatchTime: dispatchDetails.dispatchTime ? new Date(dispatchDetails.dispatchTime) : null,
            ArrivalTime: dispatchDetails.arrivalTime ? new Date(dispatchDetails.arrivalTime) : null
          };
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
    'Dispatched': <Truck className="w-5 h-5" />
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clipboard className="w-6 h-6" />
            <h2 className="text-xl font-bold">Order #{order.OrderID}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Order Progress</h3>
            {!statusEditMode && !editMode && (
              <button
                onClick={() => setStatusEditMode(true)}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Update Status
              </button>
            )}
          </div>
          
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
          
          {/* Dispatch details section */}
          {statusEditMode && status === 'Dispatched' && (
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
        </div>
        
        {/* Lotteries Section */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-24rem)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800 flex items-center">
              <Package className="w-5 h-5 mr-2 text-indigo-600" />
              Order Items
            </h3>
            {!editMode && !statusEditMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors text-sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Quantities
              </button>
            )}
          </div>
          
          {order.ContainedLotteries.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lottery Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Rs {item.Lottery.UnitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        {totalQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900">
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
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Close
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => setStatusEditMode(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Status
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Quantities
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderLotteriesModal;