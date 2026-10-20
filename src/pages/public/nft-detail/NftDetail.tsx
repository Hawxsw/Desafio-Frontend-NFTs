import { useNavigate, useParams } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useAddToCartMutation } from '@/hooks/useCart'
import { useNftQuery } from '@/hooks/useNft'
import type { Nft } from '@/types/nft'
import { getErrorMessage } from '@/utils/api-error.helper'
import { EditionPicker } from './components/edition-picker'
import { NftBreadcrumb } from './components/nft-breadcrumb'
import { NftBuyBar } from './components/nft-buy-bar'
import { NftDetailSkeleton, NftLoadError, NftNotFound } from './components/nft-detail-status'
import { NftDetailTabs } from './components/nft-detail-tabs'
import { NftGallery } from './components/nft-gallery'
import { NftPurchaseActions } from './components/nft-purchase-actions'
import { NftShareLinks } from './components/nft-share-links'
import { NftSummary } from './components/nft-summary'
import { NftTokenInfo } from './components/nft-token-info'
import { RelatedNfts } from '@/components/related-nfts'

export function NftDetail() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { data: nft, isPending, isError, error, refetch } = useNftQuery(nftId)

  if (isPending) return <NftDetailSkeleton />

  if (isError) {
    if (isAxiosError(error) && error.response?.status === 404) return <NftNotFound />
    return <NftLoadError onRetry={() => refetch()} />
  }

  return <NftDetailView key={nft.id} nft={nft} />
}

interface NftDetailViewProps {
  nft: Nft
}

function NftDetailView({ nft }: NftDetailViewProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [editionId, setEditionId] = useState(
    () => (nft.editions.find((edition) => edition.available > 0) ?? nft.editions[0]).id,
  )
  const [quantity, setQuantity] = useState(1)

  const edition = nft.editions.find((item) => item.id === editionId) ?? nft.editions[0]
  const soldOut = edition.available === 0
  const maxQuantity = Math.max(1, Math.min(edition.available, edition.maxPerOrder))

  const navigate = useNavigate()
  const addToCart = useAddToCartMutation()

  function handleSelectEdition(id: string) {
    setEditionId(id)
    setQuantity(1)
    addToCart.reset()
  }

  function handleAddToCart() {
    addToCart.mutate({ nftId: nft.id, editionId: edition.id, quantity })
  }

  function handleBuyNow() {
    addToCart.mutate(
      { nftId: nft.id, editionId: edition.id, quantity },
      { onSuccess: () => navigate({ to: '/carrinho' }) },
    )
  }

  return (
    <div className="flex flex-col lg:mx-auto lg:w-full lg:max-w-page lg:gap-24 lg:px-10 lg:pt-8 xl:px-0">
      <div className="flex flex-col lg:gap-3">
        <NftBreadcrumb />

        <div className="flex flex-col lg:flex-row lg:gap-8">
          <NftGallery nft={nft} activeIndex={activeImage} onActiveChange={setActiveImage} />

          <div className="relative -mt-[114px] flex flex-col gap-3 rounded-t-[31px] bg-surface-card px-6 pt-8 pb-48 lg:m-0 lg:min-w-0 lg:flex-1 lg:justify-between lg:gap-0 lg:rounded-none lg:bg-transparent lg:p-0">
            <NftSummary nft={nft} edition={edition} />
            <EditionPicker editions={nft.editions} selectedId={edition.id} onSelect={handleSelectEdition} />
            <NftPurchaseActions
              quantity={quantity}
              maxQuantity={maxQuantity}
              onQuantityChange={setQuantity}
              soldOut={soldOut}
              onBuyNow={handleBuyNow}
              pending={addToCart.isPending}
            />
            {addToCart.isError && (
              <p role="alert" className="text-sm leading-5 text-destructive">
                {getErrorMessage(addToCart.error)}
              </p>
            )}
            {addToCart.isSuccess && (
              <p role="status" className="text-sm leading-5 text-text-accent lg:hidden">
                Adicionado ao carrinho.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <NftTokenInfo nft={nft} />
              <NftShareLinks name={nft.name} />
            </div>
          </div>
        </div>
      </div>

      <NftDetailTabs nft={nft} />
      <RelatedNfts title="Mais desta coleção" category={nft.category} exclude={nft.id} />

      <NftBuyBar
        price={edition.price}
        quantity={quantity}
        maxQuantity={maxQuantity}
        onQuantityChange={setQuantity}
        soldOut={soldOut}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCart}
        pending={addToCart.isPending}
      />
    </div>
  )
}
