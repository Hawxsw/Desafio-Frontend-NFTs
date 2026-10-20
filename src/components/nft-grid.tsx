import { Button } from '@/components/shadcn/ui/button'
import { useFavoriteToggle } from '@/hooks/useFavorites'
import type { Nft } from '@/types/nft'
import { NftCard } from './nft-card'

interface NftGridProps {
  nfts: Nft[]
  isLoading?: boolean
  onClear?: () => void
  emptyMessage?: string
}

const GRID_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-[repeat(3,258px)] xl:justify-between xl:gap-x-0 xl:gap-y-[72px]'

export function NftGrid({ nfts, isLoading = false, onClear, emptyMessage = 'Nenhum NFT encontrado.' }: NftGridProps) {
  const favorites = useFavoriteToggle()

  if (isLoading) {
    return (
      <ul aria-busy="true" aria-label="Carregando NFTs" className={GRID_CLASS}>
        {Array.from({ length: 9 }, (_, index) => (
          <li key={index} className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
            <div className="aspect-[258/300] rounded-2xl bg-surface-card md:rounded-none" />
            <div className="h-4 w-3/4 rounded-sm bg-surface-card" />
            <div className="h-4 w-1/3 rounded-sm bg-surface-card" />
          </li>
        ))}
      </ul>
    )
  }

  if (nfts.length === 0) {
    return (
      <>
        <p className="py-16 text-center text-text-secondary">{emptyMessage}</p>
        {onClear && (
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={onClear} className="h-10 rounded-md px-4">
              Limpar busca e filtros
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <ul className={GRID_CLASS}>
      {nfts.map((nft) => (
        <li key={nft.id}>
          <NftCard
            nft={nft}
            isFavorite={favorites.isFavorite(nft.id)}
            onToggleFavorite={() => favorites.onToggle(nft)}
          />
        </li>
      ))}
    </ul>
  )
}
