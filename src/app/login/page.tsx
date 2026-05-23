import SukiverseIcon from '@/app/icon.svg'
import BackButton from '@/components/ui/BackButton'
import LoginFormSection from '@/features/auth/components/LoginFormSection'

export const metadata = {
  title: '로그인 | sukiverse',
  description: '소셜 계정으로 sukiverse에 로그인하세요',
}

export default function LoginPage() {
  return (
    <div className='bg-background-app flex h-full w-full flex-col'>
      {/* 뒤로가기 헤더 */}
      <div className='flex h-[5rem] items-center px-10 py-20'>
        <BackButton />
      </div>

      {/* 바디 */}
      <div className='flex flex-1 flex-col items-center justify-center gap-[2.5rem] px-20 pb-[6rem]'>
        {/* 아이콘 + 문구 */}
        <div className='flex h-fit w-full flex-col items-center gap-[0.5rem]'>
          <SukiverseIcon className='size-[15rem] shrink-0' />
          <p className='text-md text-text-secondary text-center'>
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>

        {/* 로그인 버튼 영역 */}
        <LoginFormSection />
      </div>
    </div>
  )
}
