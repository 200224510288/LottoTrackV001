"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import SlideInCart from "./SlideInCart"; 
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleCloseCart = () => {
    setIsAnimatingOut(true); // Start the slide-out animation
    setTimeout(() => {
      setIsCartOpen(false); // Close the cart after the animation completes
      setIsAnimatingOut(false); // Reset the animation state
    }, 300); // Match the duration of the slide-out animation
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile Menu Button (Visible on screens smaller than 770px) */}
          <div className="custom-md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 md:ml-4">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={150} height={40} />
            </Link>
          </div>

          {/* Desktop Menu (Visible on screens larger than 770px) */}
          <div className="hidden custom-md:flex space-x-6 flex-grow justify-center">
            <Link
              href="/Homepage"
              className={`text-gray-700 p-5 hover:text-NavBlue  ${
                pathname.startsWith("/Homepage")
                  ? "bg-NavBlue p-5 rounded text-white font-semibold border-b-2 border-blue-700 hover:text-white "
                  : ""
              }`}
            >
              Home
            </Link>

            <Link
              href="/MyOrder"
              className={`text-gray-700 p-5 hover:text-NavBlue  ${
                pathname.startsWith("/MyOrder")
                  ? "bg-NavBlue p-5 rounded text-white  hover:text-white font-semibold border-b-2 border-blue-700"
                  : ""
              }`}
            >
              My Order
            </Link>

            <Link
              href="/StockAvailability"
              className={`text-gray-700 p-5 hover:text-NavBlue ${
                pathname.startsWith("/StockAvailability")
                  ? "bg-NavBlue p-5 rounded text-white font-semibold border-b-2 border-blue-700 hover:text-white"
                  : ""
              }`}
            >
              Stock Availability
            </Link>

            <Link
              href="/OrderHistory"
              className={`text-gray-700 p-5 hover:text-NavBlue  ${
                pathname.startsWith("/OrderHistory")
                  ? "bg-NavBlue p-5 rounded text-white font-semibold border-b-2 border-blue-700 hover:text-white"
                  : ""
              }`}
            >
              Order History
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-2"> {/* Always flex and space-x-2 for consistent spacing */}
            <button
              className="Cart-icon text-gray-700 hover:text-blue-600 hidden"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={24} />
            </button>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Mobile Menu (Visible on screens smaller than 770px) */}
      {isOpen && (
        <div className="custom-md:hidden bg-white shadow-md">
          <div className="px-4 pt-2 pb-3 space-y-2">
            <Link
              href="/Homepage"
              className={`block text-gray-700 hover:text-blue-600 ${
                pathname === "/Homepage" ? "text-blue-600 font-semibold" : ""
              }`}
            >
              Home
            </Link>
            <Link href="/StockAvailability" className="block text-gray-700 hover:text-blue-600">
              Stock Availability
            </Link>
            <Link href="/OrderHistory" className="block text-gray-700 hover:text-blue-600">
              Order History
            </Link>
            
          </div>
        </div>
      )}

      {/* Slide-In Cart */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={handleCloseCart}
        >
          <SlideInCart
            className={isAnimatingOut ? "slide-out" : "slide-in"}
            onClose={handleCloseCart}
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
