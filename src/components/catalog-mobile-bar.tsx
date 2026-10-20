import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/shadcn/ui/input'
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

interface CatalogMobileBarProps {
  facets?: NftFacets
  params: NftListParams
  onParamsChange: (changes: Partial<NftListParams>) => void
}

export function CatalogMobileBar({ facets, params, onParamsChange }: CatalogMobileBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Container className="flex gap-3 xl:hidden">
      <div role="search" className="relative flex-1">
        <label htmlFor="mobile-search" className="sr-only">
          Buscar NFTs
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-text-secondary" />
        <Input
          id="mobile-search"
          type="search"
          placeholder="Explorar coleções"
          value={params.q ?? ''}
          onChange={(event) => onParamsChange({ q: event.target.value, page: 1 })}
          className="h-11 rounded-xl border-0 bg-surface-card pl-12 text-base"
        />
      </div>

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
          <CatalogFilters facets={facets} params={params} onParamsChange={onParamsChange} />
        </SheetContent>
      </Sheet>
    </Container>
  )
}
