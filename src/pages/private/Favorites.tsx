import { Link } from '@tanstack/react-router'
import { NftGrid } from '@/components/nft-grid'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import { useFavoritesQuery } from '@/hooks/useFavorites'
import { getErrorMessage } from '@/utils/api-error.helper'

export function Favorites() {
  const favorites = useFavoritesQuery()

  return (
    <Container className="py-12">
      <h1 className="text-section font-bold">Favoritos</h1>
      <div className="mt-8">
        {favorites.isError && !favorites.data ? (
          <div role="alert" className="flex flex-col items-start gap-4">
            <p className="text-sm leading-6 text-text-secondary">{getErrorMessage(favorites.error)}</p>
            <Button type="button" onClick={() => favorites.refetch()} className="h-10 rounded-md px-4 text-base font-bold">
              Tentar novamente
            </Button>
          </div>
        ) : favorites.data?.nfts.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm leading-6 text-text-secondary">Você ainda não favoritou nenhum NFT.</p>
            <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
              <Link to="/" hash="catalogo">
                Explorar catálogo
              </Link>
            </Button>
          </div>
        ) : (
          <NftGrid nfts={favorites.data?.nfts ?? []} isLoading={favorites.isPending} />
        )}
      </div>
    </Container>
  )
}
