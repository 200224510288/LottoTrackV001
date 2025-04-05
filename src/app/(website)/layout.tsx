"use client";

import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import { CartProvider } from "@/components/CartContext"; 

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <CartProvider>
      <div className="">
        <Navbar />
        <Cart />
        {children}
      </div>
    </CartProvider>
  );
}