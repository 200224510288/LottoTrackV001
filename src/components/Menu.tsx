'use client';

import Link from 'next/link';  // Import Link from next/link
import Image from 'next/image';  // Import Image from next/image
import { useUser, useClerk } from '@clerk/nextjs'; // Use useUser and useClerk hooks from Clerk

const menuItems = [
  {
    title: "Menu",
    items: [
      { icon: "/order1.png", label: "View Orders", href: "/list/orders", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/agents1.png", label: "Agents", href: "/list/agents", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/ticket2.png", label: "Lotteries", href: "/list/lotteries", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/history1.png", label: "History", href: "/list/orders", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/stock1.png", label: "Stock", href: "/list/stock", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/addAgent1.png", label: "Add Office Staff", href: "/list/staff", visible: ["admin", "district_agent"] }
    ],
  },
  {
    title: "User Settings",
    items: [
      { icon: "/userprofile1.png", label: "Profile", href: "/profile", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/logout.png", label: "Logout", href: "#", visible: ["office_staff", "admin", "district_agent"], logout: true }, // Add logout action
    ],
  },
];

const Menu = () => {
  const { user } = useUser(); // Use Clerk's useUser hook to get the user data
  const { signOut } = useClerk(); // Get the signOut function from Clerk
  const role = user?.publicMetadata.role as string;

  const handleLogout = async () => {
    await signOut(); // Perform sign out
    window.location.href = '/'; // Redirect user to the home page after logout
  };

  return (
    
    <div className='mt-4 text-sm'>
      {menuItems.map(i => (
        <div className='flex flex-col gap-2' key={i.title}>
          <span className='hidden lg:block text-gray-200 font-light mt-3 mb-2 ml-7'>{i.title}</span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return item.logout ? (
                <button
                  key={item.label}
                  onClick={handleLogout} // Handle logout on button click
                  className="flex items-center justify-center lg:justify-start gap-4 text-white py-2 w-full hover:bg-[#6BAFB3]/30"
                >
                  <Image src={item.icon} alt="" width={45} height={0} className='ml-1' />
                  <span className="hidden lg:block text-white">{item.label}</span>
                </button>
              ) : (
                //menu items
                <Link
                href={item.href}
                key={item.label}
                className="flex items-center justify-center  gap-4 lg:justify-start text-white py-2 w-full hover:bg-[#6BAFB3]/30"
              >
                <Image src={item.icon} alt={item.label} width={45} height={0} className=''/>
                <span className="hidden lg:block ">{item.label}</span>
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
