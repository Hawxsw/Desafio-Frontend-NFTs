import { CATEGORY_LABELS } from '@/constants/catalog'
import type { Nft } from '@/types/nft'

interface NftTokenInfoProps {
  nft: Nft
}

export function NftTokenInfo({ nft }: NftTokenInfoProps) {
  const rows = [
    { label: 'ID do token', value: `#${nft.tokenId.padStart(4, '0')}` },
    { label: 'Coleção', value: CATEGORY_LABELS[nft.category] },
    { label: 'Atributos', value: nft.attributes.join(', ') },
  ]

  return (
    <dl className="grid gap-3 text-body leading-5 text-muted-foreground">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-1.5">
          <dt>{row.label}:</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
