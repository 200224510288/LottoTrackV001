"use client";

import { ShoppingCart,Bus } from "lucide-react";
import Image from 'next/image';


const Cart = () => {
  return (
    <div className="fixed right-0 top-10 h-full w-1/4 bg-white text-gray-700 shadow-xl flex flex-col items-center py-6 overflow-y-auto max-h-screen">
      <h2 className="text-lg mt-5 font-bold mb-4 flex items-center gap-2">
        <ShoppingCart size={30} />
        CART
      </h2>

      {/* Delivery Options */}
      <div className="w-full flex justify-center gap-40 mb-4 text-lg">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryOption"
            className="form-radio h-5 w-5 text-blue-500"
          />
          <span className="text-gray-700">Self Pick</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="deliveryOption"
            className="form-radio h-5 w-5 text-blue-500"
          />
          <span className="text-gray-700">Dispatch</span>
        </label>
      </div>

     {/* Bus Stop Selection */}
    <div className="w-full px-2 mb-6 flex items-center space-x-2 shadow-md">
      <Image src="/BusLogo.png" alt="Bus Logo" className="w-12 h-10" />
      {/* Dropdown */}
      <div className="relative w-full ">
        <select className="w-full p-6 pl-10 pr-4 appearance-none">
          <option value="centralStation">Central Station</option>
          <option value="mainStreet">Main Street</option>
          <option value="cityPark">City Park</option>
          <option value="westEnd">West End</option>
          <option value="northStation">North Station</option>
        </select>
        {/* Custom dropdown arrow */}
        <svg className="absolute right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
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
        <button className="cart-button">
        Clear
      </button>

          <button className="cart-button">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
