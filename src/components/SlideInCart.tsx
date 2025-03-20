"use client";

import { ShoppingCart, X } from "lucide-react";
import React, { useState } from "react";

interface SlideInCartProps {
  className?: string;
  onClose: () => void;
}

const SlideInCart = ({ className, onClose }: SlideInCartProps) => {
  const [deliveryOption, setDeliveryOption] = useState<"selfPick" | "dispatch">("selfPick");

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col overflow-y-auto ${className}`}
      onClick={handleCartClick}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart size={24} />
          Your Cart
        </h2>
        <button className="text-gray-700 hover:text-gray-900" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* Delivery Options */}
      <div className="w-full flex justify-center gap-36 my-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryOption"
            value="selfPick"
            checked={deliveryOption === "selfPick"}
            onChange={() => setDeliveryOption("selfPick")}
            className="form-radio text-blue-500 ml-4"
          />
          <span className="text-gray-700">Self Pick</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="deliveryOption"
            value="dispatch"
            checked={deliveryOption === "dispatch"}
            onChange={() => setDeliveryOption("dispatch")}
            className="form-radio text-blue-500"
          />
          <span className="text-gray-700">Dispatch</span>
        </label>
      </div>

      {/* Bus Stop Selection */}
      <div className="w-full px-2 mb-6 flex items-center space-x-2 shadow-md relative">
        <img src="/BusLogo.png" alt="Bus Logo" className="w-12 h-10" />
        {/* Dropdown */}
        <div className="relative w-full">
          <select
            className={`w-full p-6 pl-10 pr-4 appearance-none ${
              deliveryOption === "selfPick" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={deliveryOption === "selfPick"}
          >
            <option value="centralStation">Central Station</option>
            <option value="mainStreet">Main Street</option>
            <option value="cityPark">City Park</option>
            <option value="westEnd">West End</option>
            <option value="northStation">North Station</option>
          </select>
          {/* Custom dropdown arrow */}
          <svg
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
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

      {/* Cart Items (Replace with dynamic content) */}
      <div className="flex-1 w-full px-4 overflow-y-auto max-h-screen">
        {/* Cart items go here */}
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white p-4 mt-auto shadow-inner flex flex-col">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal:</span>
          <span>$XX.XX</span>
        </div>
        <div className="flex justify-between text-md text-gray-600 mt-2">
          <span>Total Commission:</span>
          <span>$XX.XX</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4 mb-5">
          <button className="cart-button">Clear</button>
          <button className="cart-button">Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default SlideInCart;