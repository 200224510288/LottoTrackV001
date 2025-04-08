'use client';

import { useState, useEffect } from "react";
import { updateOrder } from "@/lib/actions"; // Adjust path as needed

type OrderLotteriesModalProps = {
  order: {
    OrderID: number;
    TotalAmount: number;
    ContainedLotteries: {
      Quantity: number;
      Lottery: {
        LotteryID: number;
        LotteryName: string;
        UnitPrice: number;
      };
    }[];
  };
  isOpen: boolean;
  onClose: () => void;
};

const OrderLotteriesModal = ({ order, isOpen, onClose }: OrderLotteriesModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [totalAmount, setTotalAmount] = useState(order.TotalAmount);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Initialize quantities from order
    if (isOpen) {
      setQuantities(order.ContainedLotteries.map(item => item.Quantity));
      calculateTotals(order.ContainedLotteries.map(item => item.Quantity));
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
      
      // Create updated order object
      const updatedOrder = {
        OrderID: order.OrderID,
        TotalAmount: totalAmount,
        ContainedLotteries: order.ContainedLotteries.map((item, index) => ({
          ...item,
          Quantity: quantities[index]
        }))
      };
      
      // Call the server action
      const result = await updateOrder(updatedOrder);
      
      if (result.success) {
        setUpdateMessage({
          type: 'success',
          text: result.message || 'Order updated successfully'
        });
        setEditMode(false);
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
    setEditMode(false);
    setUpdateMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Order #{order.OrderID} - Lotteries</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {updateMessage && (
          <div className={`p-3 m-4 rounded ${updateMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {updateMessage.text}
          </div>
        )}
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {order.ContainedLotteries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.Lottery.LotteryName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Rs {item.Lottery.UnitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editMode ? (
                            <div className="flex items-center">
                              <button 
                                className="bg-gray-200 px-2 rounded-l"
                                onClick={() => handleQuantityChange(index, currentQuantity - 1)}
                                disabled={isSubmitting}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className="w-16 text-center border-t border-b"
                                value={currentQuantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                min="0"
                                disabled={isSubmitting}
                              />
                              <button 
                                className="bg-gray-200 px-2 rounded-r"
                                onClick={() => handleQuantityChange(index, currentQuantity + 1)}
                                disabled={isSubmitting}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            currentQuantity
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Rs {subtotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs {totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No lotteries found for this order.</p>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-2">
          {editMode ? (
            <>
              <button
                onClick={cancelEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Close
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Edit Quantities
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderLotteriesModal;