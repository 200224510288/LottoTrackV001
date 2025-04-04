import Link from "next/link";
import Image from "next/image"; // Import Image from next/image
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";

// Define the type for the props
interface DashboardLayoutProps {
  children: React.ReactNode; // Define children prop type as React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="">
        <Navbar />
        <Cart />
        {children}
      </div>
  );
}
