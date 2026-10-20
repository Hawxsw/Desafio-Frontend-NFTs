import { useId } from 'react'
import type { NftEdition } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'

interface EditionPickerProps {
  editions: NftEdition[]
  selectedId: string
  onSelect: (id: string) => void
}

export function EditionPicker({ editions, selectedId, onSelect }: EditionPickerProps) {
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2 lg:gap-3">
      <p id={labelId} className="text-body leading-4 font-bold">
        Edição:
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-3 lg:gap-2">
        {editions.map((edition) => {
          const active = edition.id === selectedId
          const soldOut = edition.available === 0
          return (
            <button
              key={edition.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={soldOut}
              onClick={() => onSelect(edition.id)}
              className={cn(
                'h-7 min-w-[42px] rounded-full border px-2 text-center text-sm leading-4 transition-colors lg:min-w-[46px] lg:px-1.5',
                active
                  ? 'border-primary text-text-primary lg:font-medium lg:text-text-accent'
                  : 'border-surface-border text-text-secondary hover:text-text-primary',
                soldOut && 'cursor-not-allowed line-through opacity-60 hover:text-text-secondary',
              )}
            >
              {edition.name}
              {soldOut && <span className="sr-only"> (esgotada)</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
