import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import NavigationBar from '@/components/layout/NavigationBar'

const pretendard = localFont({
  src: '../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '45 920',
})

export const metadata: Metadata = {
  title: 'sukiverse',
  description: '애니메이션, J-POP, 성우 정보를 하나의 세계관에서',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='ko'
      className={`${pretendard.variable} dark h-full antialiased`}>
      <body className='bg-background-app flex min-h-full flex-col'>
        <main className='flex flex-1 items-center justify-center'>
          {/* 모바일: 고정 크기 카드 / PC: 전체 화면 */}
          <div className='border-border-default relative flex h-[85.2rem] w-[39.3rem] items-center justify-center overflow-hidden rounded-2xl border md:h-screen md:w-full md:max-w-screen-2xl md:rounded-none md:border-x-0'>
            {children}
            <NavigationBar />
          </div>
        </main>
      </body>
    </html>
  )
}
