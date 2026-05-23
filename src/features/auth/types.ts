/* 소셜 로그인 방식 */
export type OAuthProvider = 'kakao' | 'naver' | 'google'

/* 로그인 후 반환 값 */
export interface LoginResponseDto {
  accessToken: string
  userDetails: UserDetails
}

/* 유저 정보 */
export interface UserDetails {
  id: string
  profileImage: string
}

/* 로그인 API 응답 방식 */
export interface LoginResponse {
  isSuccess: boolean
  responseDto: LoginResponseDto
}

