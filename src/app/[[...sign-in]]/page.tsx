'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role;
      if (role) {
        router.push(`/${role}`);
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/loginbg.png')" }}>
      <SignIn.Root>
        {/* Login Step */}
        <SignIn.Step name="start" className="bg-white p-6 md:p-12 w-full md:w-1/2 lg:w-1/3 rounded-3xl flex flex-col gap-5 shadow-2xl shadow-gray-700 mx-4">
          <div className="flex justify-center">
            <Image src="/userprofile.png" alt="User Profile" width={80} height={80} />
          </div>
          <div className="flex justify-center">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center">Sign In</h1>
          </div>

          <Clerk.GlobalError className="text-sm text-red-400" />

          <Clerk.Field name="identifier" className="relative w-full px-4 md:px-11">
            <Clerk.Input
              type="text"
              required
              className="peer p-3 md:p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-5 md:pt-6"
              placeholder=" "
            />
            <Clerk.Label className="absolute left-4 md:left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
              Username
            </Clerk.Label>
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <Clerk.Field name="password" className="relative w-full px-4 md:px-10">
            <Clerk.Input
              type="password"
              required
              className="peer p-3 md:p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-5 md:pt-6"
              placeholder=" "
            />
            <Clerk.Label className="absolute left-4 md:left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
              Password
            </Clerk.Label>
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <div className="flex items-center justify-between px-5 pr-9 pl-9">
            <Clerk.Field name="remember" className="flex items-center">
              <Clerk.Input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Clerk.Label className="ml-2 block text-sm text-gray-700">
                Remember me
              </Clerk.Label>
            </Clerk.Field>

            <Link 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className='flex justify-center'>
            <SignIn.Action
              submit
              className="bg-[#09B0BC] text-white my-1 rounded-full w-full md:w-1/3 text-sm p-3 md:p-4 shadow-xl shadow-gray-500/50"
            >
              Login
            </SignIn.Action>
          </div>
        </SignIn.Step>

        {/* Two-Step Verification Step */}
        <SignIn.Step name="verifications" className="bg-white p-6 md:p-12 w-full md:w-1/2 lg:w-1/3 rounded-3xl flex flex-col gap-5 shadow-2xl shadow-gray-700 mx-4">
          <header className="text-center">
            <h1 className="text-xl md:text-2xl font-semibold flex items-center">Two-Factor Authentication (2FA) Code</h1>
          </header>

          <Clerk.GlobalError className="text-sm text-red-400" />

          <Clerk.Field name="code">
            <Clerk.Label className="text-gray-700">Enter Code</Clerk.Label>
            <Clerk.Input 
              type="text" 
              required 
              className="w-full p-3 rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <div className='flex justify-center'>
            <SignIn.Action
              submit
              className="bg-[#09B0BC] text-white my-1 rounded-full w-full md:w-1/3 text-sm p-3 md:p-4 shadow-xl shadow-gray-500/50"
            >
              Verify
            </SignIn.Action>
          </div>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
}

export default LoginPage;