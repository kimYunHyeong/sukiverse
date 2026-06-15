import Image from 'next/image'
import type { AnimeCharacter } from '@/types/api/anime-detail'

interface AnimeCharactersProps {
  characters: AnimeCharacter[]
}

/* 출연 캐릭터 + 일본어 성우 목록 */
export default function AnimeCharacters({ characters }: AnimeCharactersProps) {
  return (
    <section className='flex flex-col gap-16'>
      <h2 className='text-text-primary typography-h3'>출연진</h2>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {characters.map((item) => {
          const jaVoice = item.voice_actors.find((v) => v.language === 'Japanese')
          return (
            <div
              key={item.character.mal_id}
              className='bg-background-elevated border-border-subtle rounded-8 flex items-center gap-12 border p-10'>
              {/* 캐릭터 이미지 */}
              <div className='bg-card-thumbnail-bg rounded-6 relative size-[4.8rem] shrink-0 overflow-hidden'>
                {item.character.images.jpg.image_url ? (
                  <Image
                    src={item.character.images.jpg.image_url}
                    alt={item.character.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='bg-card-thumbnail-empty h-full w-full' />
                )}
              </div>

              {/* 캐릭터 정보 */}
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <span className='text-text-primary typography-label truncate'>
                  {item.character.name}
                </span>
                <span className='text-text-muted typography-caption'>{item.role}</span>
              </div>

              {/* 성우 정보 */}
              {jaVoice && (
                <div className='flex shrink-0 flex-col items-end gap-2'>
                  <span className='text-text-secondary typography-label truncate max-w-[10rem]'>
                    {jaVoice.person.name}
                  </span>
                  <div className='bg-card-thumbnail-bg rounded-full relative size-[3.2rem] overflow-hidden'>
                    {jaVoice.person.images.jpg.image_url ? (
                      <Image
                        src={jaVoice.person.images.jpg.image_url}
                        alt={jaVoice.person.name}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='bg-card-thumbnail-empty h-full w-full' />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
