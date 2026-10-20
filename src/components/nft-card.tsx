import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { Nft } from '@/types/nft'
import { formatEth } from '@/utils/money.helper'
import { cn } from '@/utils/shadcn.helper'

interface NftCardProps {
  nft: Nft
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function NftCard({ nft, isFavorite = false, onToggleFavorite }: NftCardProps) {
  const edition = nft.editions[0]
  const isRare = nft.editions.some((item) => item.supply === 1)
  const soldOut = nft.editions.every((item) => item.available === 0)

  return (
    <article className="relative flex flex-col gap-3">
      <div className="relative rounded-2xl bg-surface-card px-1 pt-3 pb-5 md:flex md:aspect-[258/300] md:items-center md:justify-center md:rounded-none md:p-0">
        <img
          src={nft.images[0]}
          alt={nft.name}
          width={250}
          height={250}
          loading="lazy"
          className="aspect-square w-full rounded-[14px] object-cover md:w-[calc(100%-8px)] md:rounded-[15px]"
        />
        {isRare && (
          <span className="pointer-events-none absolute top-3 left-0 bg-primary px-2 py-1.5 text-xs leading-4 font-bold text-primary-foreground uppercase md:hidden">
            Raro
          </span>
        )}
        {soldOut && (
          <span className="pointer-events-none absolute right-0 bottom-3 bg-ink/85 px-2 py-1.5 text-xs leading-4 font-bold text-text-primary uppercase md:bottom-2">
            Esgotado
          </span>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`}
            onClick={onToggleFavorite}
            className="absolute top-4 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-ink/70 text-text-accent md:hidden"
          >
            <Heart fill={isFavorite ? 'currentColor' : 'none'} className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 px-2 md:gap-3 md:px-0">
        <h3 className="text-base leading-5 md:leading-4">
          <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="after:absolute after:inset-0">
            {nft.name}
          </Link>
        </h3>
        <p className={cn('flex items-center gap-3 text-base leading-5 md:text-lg md:leading-4')}>
          <span className="font-bold text-text-accent">{formatEth(edition.price)}</span>
          {edition.previousPrice && (
            <s className="text-muted-foreground">
              <span className="sr-only">Preço anterior: </span>
              {formatEth(edition.previousPrice)}
            </s>
          )}
        </p>
      </div>
    </article>
  )
}
