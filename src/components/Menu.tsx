'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser, useClerk } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: "Menu",
    items: [
      { icon: "/home2.png", label: "Home", href: "/admin", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/order1.png", label: "View Orders", href: "/list/orders", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/agents1.png", label: "Agents", href: "/list/agents", visible: ["office_staff", "admin"] },
      { icon: "/ticket2.png", label: "Lotteries", href: "/list/lotteries", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/history1.png", label: "History", href: "/list/orders", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/stock1.png", label: "Stock", href: "/list/stocks", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/addAgent1.png", label: "Office Staff", href: "/list/staff", visible: ["admin", "district_agent"] }
    ],
  },
  {
    title: "User Settings",
    items: [
      { icon: "/userprofile1.png", label: "Profile", href: "/profile", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/logout.png", label: "Logout", href: "#", visible: ["office_staff", "admin", "district_agent"], logout: true },
    ],
  },
];

const Menu = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const role = user?.publicMetadata.role as string;
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className='mt-4 text-sm'>
      {menuItems.map((i) => (
        <div className='flex flex-col gap-2' key={i.title}>
          <span className='hidden lg:block text-gray-200 font-light mt-3 mb-2 ml-7'>{i.title}</span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              const isActive = pathname === item.href;
              return item.logout ? (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className={`flex items-center justify-center lg:justify-start gap-4 py-2 w-full hover:bg-[#6BAFB3]/30 ${isActive ? 'bg-[#6BAFB3]/30 text-white' : 'text-white'}`}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={34}
                    height={0}
                    className='ml-1'
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  key={item.label}
                  className={`flex items-center justify-center gap-4 lg:justify-start py-2 w-full hover:bg-[#6BAFB3]/30 ${isActive ? 'bg-[#6BAFB3]/30 text-white' : 'text-white'}`}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={34}
                    height={0}
                    className={`${item.icon === "/home2.png" ? "ml-1.5" : ""}`}
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
