import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // JWT 생성/갱신 시 실행 → 토큰에 데이터 추가
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id // 최초 로그인 시에만 user 존재
      }
      return token
    },
    // getServerSession() / useSession() 호출 시 실행 → 세션에 데이터 추가
    async session({ session, token }) {
      session.user.id = token.id as string // jwt에서 추가한 값을 세션으로 전달
      return session
    },
  },
}
