import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/shadcn/ui/sheet'
import { Container } from '@/components/shared/container'
import type { NftFacets, NftListParams } from '@/types/nft'
import { CatalogFilters } from './catalog-filters'
import { CatalogSearch } from './catalog-search'

interface CatalogMobileBarProps {
  facets?: NftFacets
  params: NftListParams
  onParamsChange: (changes: Partial<NftListParams>) => void
  onSearch: (value: string) => void
}

export function CatalogMobileBar({ facets, params, onParamsChange, onSearch }: CatalogMobileBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Container className="flex gap-3 xl:hidden">
      <CatalogSearch value={params.q ?? ''} onSearch={onSearch} className="flex-1" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Abrir filtros"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[340px] overflow-y-auto bg-background">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription className="sr-only">Filtre o catálogo por coleção, preço e rede</SheetDescription>
          </SheetHeader>
          <CatalogFilters
            key={`${params.minPrice}-${params.maxPrice}`}
            facets={facets}
            params={params}
            onParamsChange={onParamsChange}
          />
        </SheetContent>
      </Sheet>
    </Container>
  )
}
