'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-md text-text-muted cursor-pointer transition-colors hover:text-text-secondary"
    >
      뒤로 가기
    </button>
  )
}
