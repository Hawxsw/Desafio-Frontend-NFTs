import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select'
import { CATALOG_TABS, SORT_LABELS } from '@/constants/catalog'
import type { NftListParams, NftSort } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'

interface CatalogToolbarProps {
  params: NftListParams
  onParamsChange: (changes: Partial<NftListParams>) => void
}

export function CatalogToolbar({ params, onParamsChange }: CatalogToolbarProps) {
  const activeTab = params.tab ?? 'all'

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div role="group" aria-label="Listagem" className="flex gap-5">
        {CATALOG_TABS.map((tab) => {
          const active = tab.value === activeTab
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => onParamsChange({ tab: tab.value, page: 1 })}
              className={cn(
                'relative text-body leading-4 font-medium transition-colors',
                active
                  ? 'text-text-accent after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-[101px] after:bg-primary'
                  : 'text-text-primary hover:text-text-accent',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <Select
        value={params.sort ?? 'recent'}
        onValueChange={(value) => onParamsChange({ sort: value as NftSort, page: 1 })}
      >
        <SelectTrigger
          aria-label="Ordenar por"
          className="h-auto w-auto gap-2 border-0 bg-transparent p-0 text-body leading-5 text-text-primary shadow-none dark:bg-transparent"
        >
          <span>Ordenar por:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
