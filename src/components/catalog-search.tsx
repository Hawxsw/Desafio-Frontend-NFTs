import { Search } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Input } from '@/components/shadcn/ui/input'
import { cn } from '@/utils/shadcn.helper'

const DEBOUNCE_MS = 350

interface CatalogSearchProps {
  value: string
  onSearch: (value: string) => void
  className?: string
}

export function CatalogSearch({ value, onSearch, className }: CatalogSearchProps) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)

  if (value !== synced) {
    setSynced(value)
    setDraft(value)
  }

  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => onSearch(draft), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, value, onSearch])

  return (
    <div role="search" className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        Buscar NFTs
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-text-secondary" />
      <Input
        id={id}
        type="search"
        placeholder="Explorar coleções"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSearch(draft)
        }}
        className="h-11 rounded-xl border-0 bg-surface-card pl-12 text-base"
      />
    </div>
  )
}
