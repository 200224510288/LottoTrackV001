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
      <div className="w-[18%] md:w-[8%] lg:w-[16%] xl:w-[18%]   bg-DashboardBlue">
        <Link href="/" passHref>
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <Image
              src="/logo-white.png"
              alt="logo"
              width={200}
              height={50}
              className="mt-7 mr-3"
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
