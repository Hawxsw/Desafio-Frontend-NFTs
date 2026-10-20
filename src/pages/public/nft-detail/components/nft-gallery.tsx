import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import { ChevronLeft, Heart } from 'lucide-react'
import type { Nft } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'

interface NftGalleryProps {
  nft: Nft
  activeIndex: number
  onActiveChange: (index: number) => void
}

const ICON_BUTTON_CLASS =
  'flex size-[35px] items-center justify-center rounded-full border border-surface-border bg-surface-raised p-2 text-text-secondary transition-colors hover:text-text-accent'

export function NftGallery({ nft, activeIndex, onActiveChange }: NftGalleryProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  function handleBack() {
    if (canGoBack) router.history.back()
    else router.navigate({ to: '/' })
  }

  return (
    <div className="lg:flex lg:flex-none lg:gap-7">
      <ul className="hidden w-[100px] flex-col gap-4 lg:flex">
        {nft.images.map((image, index) => (
          <li key={image}>
            <button
              type="button"
              aria-label={`Ver imagem ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => onActiveChange(index)}
              className={cn(
                'block overflow-hidden rounded-lg border-2 border-transparent',
                index === activeIndex && 'border-primary',
              )}
            >
              <img src={image} alt="" width={100} height={100} loading="lazy" className="block size-24 object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative flex min-h-[506px] flex-col gap-2 bg-linear-to-b from-surface-card to-surface-raised px-7 pt-[23px] lg:size-[444px] lg:min-h-0 lg:flex-none lg:items-center lg:justify-center lg:rounded-md lg:bg-surface-card lg:bg-none lg:p-[18px]">
        <div className="flex h-[35px] items-center justify-between lg:hidden">
          <button type="button" aria-label="Voltar" onClick={handleBack} className={ICON_BUTTON_CLASS}>
            <ChevronLeft className="size-5" />
          </button>
          <Link to="/login" aria-label="Entre para favoritar" className={ICON_BUTTON_CLASS}>
            <Heart className="h-[14.23px] w-4 text-text-accent" />
          </Link>
        </div>
        <img
          src={nft.images[activeIndex]}
          alt={nft.name}
          width={361}
          height={356}
          fetchPriority="high"
          className="block h-[356px] w-full rounded-3xl object-cover lg:size-[404px]"
        />
        <div role="group" aria-label="Imagens do NFT" className="absolute top-[365px] left-1/2 flex -translate-x-1/2 gap-[7px] lg:hidden">
          {nft.images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Ver imagem ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => onActiveChange(index)}
              className={cn(
                'relative h-[7px] rounded-[25px] bg-primary after:absolute after:-inset-2',
                index === activeIndex ? 'w-7' : 'w-[7px]',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
