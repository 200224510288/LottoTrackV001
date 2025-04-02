import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import LotteryForm from './forms/LotteryForm';

export const getUserData = async () => {
  const user = await currentUser();
  return user;
};

const Navbar = async () => {
  const user = await getUserData();

  return (
    <div className='flex items-center justify-between p-4'>
      {/* SEARCH BAR */}
      <div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2'>	
        <Image src='/search.png' alt='search' width={20} height={20} />
        <input 
          type='text' 
          placeholder='Search...' 
          className='w-[200px] p-2 bg-transparent outline-none'
        />
      </div>

      {/* Icons And USERS */}
      <div className='flex items-center gap-4 justify-end w-full'>
        <div className='flex flex-col'>
          <span className='text-xs text-gray-500 text-right'>{user?.username}</span>
          <span className='text-xs text-gray-500 text-right'>{user?.publicMetadata.role as string}</span>
        </div>

        <UserButton 
          appearance={{
          elements: {
          avatarBox: 'w-12 h-12',
        },
  }} 
/>      </div>
    </div>
  );
};

export default Navbar;
