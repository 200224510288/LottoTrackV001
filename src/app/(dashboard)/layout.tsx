import Link from "next/link";
import Image from 'next/image';  // Import Image from next/image
import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';


// Define the type for the props
interface DashboardLayoutProps {
    children: React.ReactNode;  // Define children prop type as React.ReactNode
  }
  
  export default function DashboardLayout({children}: DashboardLayoutProps) {
    return (
      <div className="h-screen flex">
        {/* LEFT Sidebar */}
        <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
          <Link href="/" passHref>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Image src="/assignment.png" alt="logo" width={32} height={32} />
              <span className="hidden lg:block font-bold">LOTTO-TRACK</span>
            </div>
          </Link>
          <Menu />
        </div> 
  
        {/* RIGHT Content Area */}
        <div className="w-[86%] bg-gray-100 md:w-[92%] lg:w-[84%] xl:w-[86%] overflow-scroll flex flex-col">
        <Navbar/>
        {children}
        </div>
      </div>
    );
  }