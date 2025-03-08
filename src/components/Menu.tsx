'use client';

import Link from 'next/link';  // Import Link from next/link
import Image from 'next/image';  // Import Image from next/image
import { useUser, useClerk } from '@clerk/nextjs'; // Use useUser and useClerk hooks from Clerk

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/lesson.png", label: "View Orders", href: "/list/orders", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/profile.png", label: "Manage Agents", href: "/list/agents", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/lesson.png", label: "Manage Lotteries", href: "/list/lotteries", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/lesson.png", label: "Order History", href: "/list/agents", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/lesson.png", label: "Stock Availability", href: "/list/agents", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/lesson.png", label: "Add Office Staff", href: "/list/staff", visible: ["admin", "district_agent"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["office_staff", "admin", "district_agent"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["office_staff", "admin", "district_agent"] },
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
          <span className='hidden lg:block text-gray-400 font-light my-4'>{i.title}</span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return item.logout ? (
                <button
                  key={item.label}
                  onClick={handleLogout} // Handle logout on button click
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-Sky"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-Sky"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
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
