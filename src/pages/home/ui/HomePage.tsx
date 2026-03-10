import { NavigateToLoginButton } from '@/features/navigate-to-login'

export default function HomePage() {
  return (
    <>
      <div className='flex w-full flex-col bg-black'>
        <h1 className='text-white'>好き + Universe + desu</h1>
      </div>
      <NavigateToLoginButton />
    </>
  )
}
