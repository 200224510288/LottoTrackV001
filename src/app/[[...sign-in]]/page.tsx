'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";


const LoginPage = () => {

  
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk(); // Use signOut from useClerk

  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push("/"); // Redirect user to the home page after sign out
  };

  useEffect(() => {
    const role = user?.publicMetadata.role;
 
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);
  return (
    <div className="h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/loginbg.png')" }}>
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white p-12 w-1/3 rounded-3xl flex flex-col gap-5 shadow-2xl shadow-gray-700"
        >
          <div className="flex justify-center">
            <Image src="/userprofile.png" alt="User Profile" width={80} height={80} />
            
          </div>
          <div className="flex justify-center">
          <h1 className="text-3xl font-semibold flex items-center ">
            Sign In
          </h1>
          </div>
          <Clerk.GlobalError className="text-sm text-red-400" />
          <Clerk.Field name="identifier" className="relative w-full px-11">
            <Clerk.Input
              type="text"
              required
              className="peer p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-6"
              placeholder=" "
            />
            <Clerk.Label className="absolute left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
              Username
            </Clerk.Label>
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <Clerk.Field name="password" className="relative w-full px-10">
            <Clerk.Input
              type="password"
              required
              className="peer p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-6"
              placeholder=" "
            />
            <Clerk.Label className="absolute left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
              Password
            </Clerk.Label>
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <div className='flex justify-center'>
          <SignIn.Action
            submit
            className="bg-[#09B0BC] text-white my-1 rounded-full w-1/3 text-sm p-4 shadow-xl shadow-gray-500/50"
          >
            Login
          </SignIn.Action>
        </div>

        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
}

export default LoginPage;

function signOut() {
  throw new Error('Function not implemented.');
}
