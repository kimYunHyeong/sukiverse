'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ORDER_BY_OPTIONS } from '@/types/api/anime'
import type { OrderBy } from '@/types/api/anime'
import { cn } from '@/lib/utils'

const ORDER_BY_LABELS: Record<OrderBy, string> = {
  Popularity: '인기순',
  Latest: '최신순',
  Score: '평점순',
  Comments: '댓글순',
}

export default function SortFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeOrderBy = (searchParams.get('orderBy') ?? 'Popularity') as OrderBy

  function handleSelect(orderBy: OrderBy) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('orderBy', orderBy)
    router.push(`/?${params}`)
  }

  return (
    <div className='flex items-center justify-end gap-5 py-2'>
      {ORDER_BY_OPTIONS.map((option, i) => (
        <span key={option} className='flex items-center gap-5'>
          {i > 0 && <span className='bg-text-dimmed inline-block h-10 w-1' />}
          <button
            onClick={() => handleSelect(option)}
            className={cn(
              'text-[1.2rem] leading-none transition-colors',
              activeOrderBy === option
                ? 'text-text-brand font-bold'
                : 'text-text-dimmed font-normal'
            )}>
            {ORDER_BY_LABELS[option]}
          </button>
        </span>
      ))}
    </div>
  )
}
