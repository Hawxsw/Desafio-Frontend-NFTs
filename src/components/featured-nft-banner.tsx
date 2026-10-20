import { Link } from '@tanstack/react-router'
import type { Nft } from '@/types/nft'

interface FeaturedNftBannerProps {
  nft: Nft
}

export function FeaturedNftBanner({ nft }: FeaturedNftBannerProps) {
  return (
    <section
      aria-labelledby="featured-title"
      className="flex flex-col gap-4 bg-linear-to-b from-primary/10 to-primary/3 pt-6 pb-1"
    >
      <div className="flex flex-col gap-4">
        <h2 id="featured-title" className="px-5 text-2xl font-bold text-text-accent uppercase">
          NFT em destaque
        </h2>
        <p className="px-5 text-center text-[22px] leading-4 font-bold uppercase">Oferta limitada</p>
      </div>
      <Link to="/nft/$nftId" params={{ nftId: nft.id }}>
        <img
          src={nft.images[0]}
          alt={nft.name}
          width={310}
          height={368}
          loading="lazy"
          className="h-[368px] w-full rounded-[22px] object-cover"
        />
      </Link>
    </section>
  )
}
