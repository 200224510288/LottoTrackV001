import Link from "next/link";
import Image from "next/image"; // Import Image from next/image
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar(dashborad)";

// Define the type for the props
interface DashboardLayoutProps {
  children: React.ReactNode; // Define children prop type as React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex">
    {/* LEFT Sidebar */}
<div className="w-[18%] md:w-[8%] lg:w-[16%] xl:w-[18%] bg-DashboardBlue">
  <Link href="/" passHref>
    <div className="flex items-center justify-center lg:justify-start gap-2">
      {/* Regular logo - shown on screens larger than 770px */}
      <Image
        src="/logo-white.png"
        alt="logo"
        width={200}
        height={50}
        className="logo mt-7 mr-3"
      />
      
      {/* Small logo - shown on screens 770px and smaller */}
      <Image
        src="/logosmall.png"  
        alt="logo"
        width={50} 
        height={0}  
        className="logosmall mt-5 ml-4 mr-4"
      />
    </div>
  </Link>
  <Menu />
</div>

      {/* RIGHT Content Area */}
      <div className="w-[86%] bg-[#f3efee] md:w-[92%] lg:w-[84%] xl:w-[86%] overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
