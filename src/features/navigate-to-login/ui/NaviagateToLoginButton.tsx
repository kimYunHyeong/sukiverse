'use client'

import { useRouter } from 'next/navigation'

export function NavigateToLoginButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/login')}
      className='mt-4 rounded-xl bg-white px-4 py-2 text-black transition hover:bg-gray-200'>
      Login
    </button>
  )
}
