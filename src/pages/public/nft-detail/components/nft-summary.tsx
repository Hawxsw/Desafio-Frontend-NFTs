import { Star } from 'lucide-react'
import type { Nft, NftEdition } from '@/types/nft'
import { formatEth } from '@/utils/money.helper'

interface NftSummaryProps {
  nft: Nft
  edition: NftEdition
}

export function NftSummary({ nft, edition }: NftSummaryProps) {
  const filledStars = Math.round(nft.rating)

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex min-h-[27px] items-center justify-between gap-3">
          <h1 className="text-xl leading-4 font-bold lg:text-[28px] lg:leading-none">{nft.name}</h1>
          <span className="flex h-[27px] shrink-0 items-center gap-1 rounded-[32px] border border-primary px-1.5 text-sm leading-4 lg:hidden">
            <Star aria-hidden fill="currentColor" strokeWidth={0} className="size-3.5 text-amber" />
            <span className="sr-only">Avaliação </span>
            <span className="font-medium">{nft.rating.toFixed(1)}</span>
            <span className="sr-only"> de 5, </span>
            <span className="text-text-secondary">
              ({nft.reviewCount}
              <span className="sr-only"> avaliações</span>)
            </span>
          </span>
        </div>

        <div className="hidden h-5 items-center justify-between lg:flex">
          <p className="flex items-center gap-3">
            <span className="text-[22px] leading-4 font-bold text-text-accent">{formatEth(edition.price)}</span>
            {edition.previousPrice && (
              <s className="text-sm text-muted-foreground">
                <span className="sr-only">Preço anterior: </span>
                {formatEth(edition.previousPrice)}
              </s>
            )}
          </p>
          <p className="flex items-center gap-1 text-body leading-none">
            <span aria-hidden className="flex text-primary">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  fill={index < filledStars ? 'currentColor' : 'none'}
                  strokeWidth={index < filledStars ? 0 : 2}
                  className="size-[15px]"
                />
              ))}
            </span>
            <span className="sr-only">Avaliação {nft.rating.toFixed(1)} de 5. </span>
            {nft.reviewCount} avaliações de colecionadores
          </p>
        </div>

        <hr className="hidden border-0 border-t-[0.3px] border-primary lg:block" />
      </div>

      <div className="flex flex-col gap-3">
        <p className="hidden text-body leading-4 font-bold lg:block">Sobre este NFT:</p>
        <p className="text-sm leading-6 text-text-secondary">{nft.description}</p>
      </div>
    </>
  )
}
