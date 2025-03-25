'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'new-password'>('email')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { client } = useClerk()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const signInAttempt = await client.signIn.create({
        identifier: email,
      })

      const resetPasswordFactor = signInAttempt.supportedFirstFactors?.find(
        (ff) => ff.strategy === 'reset_password_email_code'
      )

      if (!resetPasswordFactor || !('emailAddressId' in resetPasswordFactor)) {
        throw new Error('No email address found for password reset')
      }

      await client.signIn.prepareFirstFactor({
        strategy: 'reset_password_email_code',
        emailAddressId: resetPasswordFactor.emailAddressId
      })

      setStep('code')
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to send reset code. Please check your email address.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const signInAttempt = await client.signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      })

      if (signInAttempt.status === 'needs_new_password') {
        setStep('new-password')
      }
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Invalid verification code. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      await client.signIn.resetPassword({
        password: newPassword,
      })

      // Password reset successful
      window.location.href = '/login?reset=success'
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to reset password. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <>
            <p className="text-gray-600 text-center text-sm">
              Enter your email address and we&apos;ll send you a verification code.
            </p>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
              <div className="relative w-full px-4 md:px-11">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer p-3 md:p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-5 md:pt-6"
                  placeholder=" "
                />
                <label className="absolute left-4 md:left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Email Address
                </label>
              </div>

              <div className='flex justify-center'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#09B0BC] text-white my-1 rounded-full w-full md:w-1/3 text-sm p-3 md:p-4 shadow-xl shadow-gray-500/50 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            </form>
          </>
        )

      case 'code':
        return (
          <>
            <p className="text-gray-600 text-center text-sm">
              We&apos;ve sent a 6-digit code to {email}. Please enter it below.
            </p>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-5">
              <div className="relative w-full px-4 md:px-11">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  className="peer p-3 md:p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-5 md:pt-6 text-center tracking-widest"
                  placeholder=" "
                />
                <label className="absolute left-4 md:left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Verification Code
                </label>
              </div>

              <div className='flex justify-center'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#09B0BC] text-white my-1 rounded-full w-full md:w-1/3 text-sm p-3 md:p-4 shadow-xl shadow-gray-500/50 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          </>
        )

      case 'new-password':
        return (
          <>
            <p className="text-gray-600 text-center text-sm">
              Please enter your new password below.
            </p>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <form onSubmit={handleNewPasswordSubmit} className="flex flex-col gap-5">
              <div className="relative w-full px-4 md:px-11">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="peer p-3 md:p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-5 md:pt-6"
                  placeholder=" "
                />
                <label className="absolute left-4 md:left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  New Password
                </label>
              </div>

              <div className="relative w-full px-4 md:px-11">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="peer p-3 md:p-4 rounded-3xl ring-1 ring-gray-300 w-full focus:ring-2 focus:ring-blue-500 pt-5 md:pt-6"
                  placeholder=" "
                />
                <label className="absolute left-4 md:left-16 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-1/3 peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500">
                  Confirm Password
                </label>
              </div>

              <div className='flex justify-center'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#09B0BC] text-white my-1 rounded-full w-full md:w-1/3 text-sm p-3 md:p-4 shadow-xl shadow-gray-500/50 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/loginbg.png')" }}>
      <div className="bg-white p-6 md:p-12 w-full md:w-1/2 lg:w-1/3 rounded-3xl flex flex-col gap-5 shadow-2xl shadow-gray-700 mx-4">
        <div className="flex justify-center">
          <Image src="/userprofile.png" alt="User Profile" width={80} height={80} />
        </div>
        <div className="flex justify-center">
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
            {step === 'email' ? 'Reset Password' : 
             step === 'code' ? 'Enter Verification Code' : 'Create New Password'}
          </h1>
        </div>

        {renderStep()}

        <div className="text-center text-sm text-gray-600">
          {step !== 'email' && (
            <button 
              onClick={() => setStep(step === 'code' ? 'email' : 'code')}
              className="text-blue-600 hover:text-blue-500 hover:underline"
            >
              Go back
            </button>
          )}
          {step === 'email' && (
            <>
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage