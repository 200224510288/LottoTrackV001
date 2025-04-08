"use client";

import {
  ShoppingCart,
  Bus,
  X,
  Minus,
  Plus,
  AlertCircle,
  Check,
  ArrowLeft,
} from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { toast } from "react-toastify";

const Cart = () => {
  const [deliveryOption, setDeliveryOption] = useState<"selfPick" | "dispatch">(
    "selfPick"
  );
  const [busStop, setBusStop] = useState<string>("centralStation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const router = useRouter();
  const { session } = useSession();

  // Use  cart context
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotalCommission,
  } = useCart();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          deliveryInfo: {
            deliveryOption,
            busStop: deliveryOption === "dispatch" ? busStop : undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save order details to state instead of clearing cart immediately
        setOrderDetails(data.order);
        setShowConfirmation(true);
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An error occurred during checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmOrder = () => {
    // Clear the cart and reset confirmation state
    clearCart();
    setShowConfirmation(false);
    setOrderDetails(null);
    toast.success("Order completed successfully!");
  };

  const backToCart = () => {
    setShowConfirmation(false);
    setOrderDetails(null);
  };

  // Order confirmation form/view
  if (showConfirmation && orderDetails) {
    return (
      <div className="cart-container fixed right-0 top-10 h-full w-1/4 bg-white text-gray-700 shadow-xl flex flex-col items-center py-6 overflow-y-auto max-h-screen">
        <div className="w-full px-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={backToCart}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back</span>
            </button>
            <h2 className="text-lg font-bold">Order Confirmation</h2>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 flex items-center">
            <Check className="text-green-500 mr-2" size={20} />
            <div>
              <p className="font-medium text-green-700">Order Created!</p>
              <p className="text-sm text-green-600">
                Order ID: {orderDetails.OrderID}
              </p>
            </div>
          </div>

          <div className="border rounded-md p-4 mb-4">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>Rs {getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Commission:</span>
                <span>Rs {getTotalCommission().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span>
                  {deliveryOption === "selfPick" ? "Self Pick" : "Dispatch"}
                </span>
              </div>
              {deliveryOption === "dispatch" && (
                <div className="flex justify-between">
                  <span>Bus Stop:</span>
                  <span>
                    {busStop === "centralStation" ? "CTB" : "Private"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4 mb-6">
            <h3 className="font-medium mb-2">Items</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.ticket.LotteryID}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.ticket.LotteryName}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span>
                    Rs{" "}
                    {((item.ticket.UnitPrice || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={confirmOrder}
            className="w-full py-3 bg-NavBlue hover:bg-NavBlueDark text-white rounded-md font-medium transition-colors"
          >
            Complete Order
          </button>
        </div>
      </div>
    );
  }

  // Normal cart view
  return (
    <div className="cart-container fixed right-0 top-10 h-full w-1/4 bg-white text-gray-700 shadow-xl flex flex-col items-center py-6 overflow-y-auto max-h-screen">
      <h2 className="text-lg mt-5 font-bold mb-4 flex items-center gap-2">
        <ShoppingCart size={30} />
        CART ({cartItems.length})
      </h2>

      {error && (
        <div className="w-full px-4 mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2 flex items-start">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Delivery Options */}
      <div className="w-full flex justify-center gap-44 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryOption"
            value="selfPick"
            checked={deliveryOption === "selfPick"}
            onChange={() => setDeliveryOption("selfPick")}
            className="form-radio h-4 w-4 text-blue-500"
          />
          <span className="text-gray-700">Self Pick</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryOption"
            value="dispatch"
            checked={deliveryOption === "dispatch"}
            onChange={() => setDeliveryOption("dispatch")}
            className="form-radio h-4 w-4 text-blue-500"
          />
          <span className="text-gray-700">Dispatch</span>
        </label>
      </div>

      {/* Bus Stop Selection */}
      <div className="w-full px-4 mb-6 flex items-center space-x-2 shadow-md relative">
        <Image src="/BusLogo.png" alt="Bus Logo" width={40} height={30} />
        {/* Dropdown */}
        <div className="relative w-full">
          <select
            value={busStop}
            onChange={(e) => setBusStop(e.target.value)}
            className={`w-full h-14 p-2 pl-2 pr-8 appearance-none rounded border border-gray-300 ${
              deliveryOption === "selfPick"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={deliveryOption === "selfPick"}
          >
            <option value="centralStation">CTB</option>
            <option value="mainStreet">Private</option>
          </select>
          {/* Custom dropdown arrow */}
          <svg
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
        {/* Gray overlay for disabled state */}
        {deliveryOption === "selfPick" && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 cursor-not-allowed"></div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 w-full px-4 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Your cart is empty
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.ticket.LotteryID}
              className="flex flex-col p-2 mb-4 border-b border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 overflow-hidden rounded">
                    <Image
                      src={item.ticket.ImageUrl || "/default-image.png"}
                      alt={item.ticket.LotteryName}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">
                      {item.ticket.LotteryName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Rs {item.ticket.UnitPrice?.toFixed(2)} per unit
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.ticket.LotteryID)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.ticket.LotteryID, item.quantity - 1)
                    }
                    className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.ticket.LotteryID, item.quantity + 1)
                    }
                    className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="font-medium text-sm">
                  Rs {((item.ticket.UnitPrice || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                Commission: Rs{" "}
                {((item.ticket.UnitCommission || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white p-4 mt-auto shadow-inner flex flex-col">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal:</span>
          <span>Rs {getSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-md text-gray-600 mt-2">
          <span>Total Commission:</span>
          <span>Rs {getTotalCommission().toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4 mb-4">
          <button
            onClick={clearCart}
            className="flex-1 py-2 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
            disabled={cartItems.length === 0 || isSubmitting}
          >
            Clear
          </button>
          <button
            onClick={handleCheckout}
            className={`flex-1 py-2 px-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-NavBlue hover:bg-NavBlueDark"
            } text-white rounded transition-colors`}
            disabled={cartItems.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
