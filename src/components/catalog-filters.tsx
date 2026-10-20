import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/shadcn/ui/button'
import { Slider } from '@/components/shadcn/ui/slider'
import { CATEGORY_LABELS, NETWORK_LABELS, PRICE_BOUNDS } from '@/constants/catalog'
import type { EthAmount } from '@/types/common'
import type { FacetCount, NftFacets, NftListParams } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'

interface CatalogFiltersProps {
  facets?: NftFacets
  params: NftListParams
  onParamsChange: (changes: Partial<NftListParams>) => void
  className?: string
}

export function CatalogFilters({ facets, params, onParamsChange, className }: CatalogFiltersProps) {
  const bounds = facets?.priceBounds ?? PRICE_BOUNDS
  const [draftPrice, setDraftPrice] = useState<[EthAmount, EthAmount] | null>(null)
  const price = draftPrice ?? [params.minPrice ?? bounds[0], params.maxPrice ?? bounds[1]]

  return (
    <section aria-label="Filtros" className={cn('flex flex-col gap-10 bg-surface-card p-5', className)}>
      <FilterGroup
        title="Coleções"
        labels={CATEGORY_LABELS}
        counts={facets?.categories}
        selected={params.category ?? []}
        onToggle={(value) => onParamsChange({ category: toggle(params.category, value), page: 1 })}
      />
      <PriceRange
        bounds={bounds}
        value={price}
        onValueChange={setDraftPrice}
        onApply={() => onParamsChange({ minPrice: price[0], maxPrice: price[1], page: 1 })}
      />
      <FilterGroup
        title="Rede"
        labels={NETWORK_LABELS}
        counts={facets?.networks}
        selected={params.network ?? []}
        onToggle={(value) => onParamsChange({ network: toggle(params.network, value), page: 1 })}
      />
    </section>
  )
}

function toggle<T>(list: T[] | undefined, value: T): T[] {
  const current = list ?? []
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
}

interface FilterGroupProps<T extends string> {
  title: string
  labels: Record<T, string>
  counts?: FacetCount<T>[]
  selected: T[]
  onToggle: (value: T) => void
}

function FilterGroup<T extends string>({ title, labels, counts, selected, onToggle }: FilterGroupProps<T>) {
  const titleId = useId()
  const values = Object.keys(labels) as T[]

  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-3">
      <h3 id={titleId} className="text-lg leading-4 font-bold">
        {title}
      </h3>
      <ul className="px-3">
        {values.map((value) => {
          const checked = selected.includes(value)
          const count = counts?.find((item) => item.value === value)?.count

          return (
            <li key={value}>
              <label
                className={cn(
                  'flex h-10 cursor-pointer items-center justify-between text-body leading-10 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring',
                  checked ? 'text-text-accent' : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <input type="checkbox" checked={checked} onChange={() => onToggle(value)} className="sr-only" />
                <span className="flex items-center gap-2.5">
                  {labels[value]}
                  {checked && <Check aria-hidden className="size-3.5" />}
                </span>
                {count !== undefined && <span className="font-bold">({count})</span>}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface PriceRangeProps {
  bounds: [EthAmount, EthAmount]
  value: [EthAmount, EthAmount]
  onValueChange: (value: [EthAmount, EthAmount]) => void
  onApply: () => void
}

function formatPrice(value: EthAmount) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function PriceRange({ bounds, value, onValueChange, onApply }: PriceRangeProps) {
  const titleId = useId()

  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-3">
      <h3 id={titleId} className="text-lg leading-4 font-bold">
        Faixa de preço
      </h3>
      <div className="flex flex-col gap-3 pl-3">
        <Slider
          min={Number(bounds[0])}
          max={Number(bounds[1])}
          step={0.01}
          value={[Number(value[0]), Number(value[1])]}
          onValueChange={([min, max]) => onValueChange([min.toFixed(2), max.toFixed(2)])}
          aria-labelledby={titleId}
          className="py-2"
        />
        <p className="text-body leading-5">
          Preço: {formatPrice(value[0])} – {formatPrice(value[1])} ETH
        </p>
        <Button type="button" onClick={onApply} className="h-9 self-start rounded-md px-3 py-2 text-base leading-5 font-bold">
          Aplicar
        </Button>
      </div>
    </div>
  )
}
