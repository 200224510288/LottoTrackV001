"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import SlideInCart from "./SlideInCart"; 
import { UserButton, useUser } from "@clerk/nextjs"; // Import useUser hook

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { user } = useUser(); // Get user data from Clerk

  const handleCloseCart = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile Menu Button */}
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

          {/* Desktop Menu */}
          <div className="hidden custom-md:flex space-x-6 flex-grow justify-center">
            <Link
              href="/agent"
              className={`text-gray-700 p-5 hover:text-NavBlue ${
                pathname.startsWith("/agent")
                  ? "bg-NavBlue p-5 rounded text-white font-semibold border-b-2 border-blue-700 hover:text-white"
                  : ""
              }`}
            >
              Home
            </Link>

            <Link
              href="/MyOrder"
              className={`text-gray-700 p-5 hover:text-NavBlue ${
                pathname.startsWith("/MyOrder")
                  ? "bg-NavBlue p-5 rounded text-white hover:text-white font-semibold border-b-2 border-blue-700"
                  : ""
              }`}
            >
              My Order
            </Link>

         

            <Link
              href="/OrderHistory"
              className={`text-gray-700 p-5 hover:text-NavBlue ${
                pathname.startsWith("/OrderHistory")
                  ? "bg-NavBlue p-5 rounded text-white font-semibold border-b-2 border-blue-700 hover:text-white"
                  : ""
              }`}
            >
              Order History
            </Link>
          </div>

          {/* Icons and User Info */}
          <div className="flex items-center space-x-4">
            <button
              className="Cart-icon text-gray-700 hover:text-blue-600 hidden"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={24} />
            </button>
            
            {/* Display username if user is signed in */}
            {user && (
              <span className="text-sm text-gray-600 hidden md:block">
                Hello, {user.username || user?.publicMetadata.role as string}
              </span>
            )}
            
            <UserButton afterSignOutUrl="/"   
            appearance={{
            elements: {
            avatarBox: 'w-10 h-10',
        },
  }} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
            <Link href="/MyOrder" className="block text-gray-700 hover:text-blue-600">
              My Order
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