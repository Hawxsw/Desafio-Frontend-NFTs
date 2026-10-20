import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useNftsQuery } from '@/hooks/useNft'
import type { NftCategory } from '@/types/nft'
import { formatEth } from '@/utils/money.helper'
import { cn } from '@/utils/shadcn.helper'

const PAGE_SIZE = 5
const MAX_DOTS = 4

interface RelatedNftsProps {
  title: string
  category?: NftCategory
  exclude?: string
}

export function RelatedNfts({ title, category, exclude }: RelatedNftsProps) {
  const [page, setPage] = useState(1)
  const { data, isPending } = useNftsQuery({
    category: category ? [category] : undefined,
    exclude,
    sort: 'popular',
    page,
    pageSize: PAGE_SIZE,
  })
  const totalPages = Math.min(data?.totalPages ?? 1, MAX_DOTS)

  if (!isPending && !data?.data.length) return null

  return (
    <section aria-labelledby="related-title" className="hidden flex-col gap-8 lg:flex">
      <h2
        id="related-title"
        className="border-b-[0.3px] border-primary pb-3 text-[17px] leading-4 font-bold text-text-accent"
      >
        {title}
      </h2>

      <ul aria-busy={isPending} className="flex justify-between gap-4">
        {isPending
          ? Array.from({ length: PAGE_SIZE }, (_, index) => (
              <li key={index} className="max-w-[218px] flex-1 animate-pulse motion-reduce:animate-none">
                <div className="aspect-[218/255] bg-surface-card" />
              </li>
            ))
          : data?.data.map((item) => (
              <li key={item.id} className="relative flex max-w-[218px] min-w-0 flex-1 flex-col gap-3">
                <div className="flex aspect-[218/255] items-center justify-center bg-surface-card px-3.5 py-1.5">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    width={190}
                    height={243}
                    loading="lazy"
                    className="block size-full rounded-[11px] object-cover"
                  />
                </div>
                <div>
                  <p className="truncate text-body leading-5">
                    <Link to="/nft/$nftId" params={{ nftId: item.id }} className="after:absolute after:inset-0">
                      {item.name}
                    </Link>
                  </p>
                  <p className="text-base leading-4 font-bold text-text-accent">{formatEth(item.editions[0].price)}</p>
                </div>
              </li>
            ))}
      </ul>

      {totalPages > 1 && (
        <div role="group" aria-label="Páginas de NFTs relacionados" className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Página ${index + 1}`}
              aria-current={page === index + 1}
              onClick={() => setPage(index + 1)}
              className={cn('size-3 rounded-full border-[1.3px] border-primary', page === index + 1 && 'bg-primary')}
            />
          ))}
        </div>
      )}
    </section>
  )
}
