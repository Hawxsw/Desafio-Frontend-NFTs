import { updateDb } from '@/mocks/db'
import { publishNftUpdated } from '@/mocks/realtime'
import type { EthAmount } from '@/types/common'
import type { Nft } from '@/types/nft'

export interface EditionChanges {
  price?: EthAmount
  available?: number
}

export function updateEdition(nftId: string, editionId: string, changes: EditionChanges): Nft | null {
  const nft = updateDb((db) => {
    const target = db.nfts.find((item) => item.id === nftId)
    const edition = target?.editions.find((item) => item.id === editionId)
    if (!target || !edition) return null
    if (changes.price !== undefined && changes.price !== edition.price) {
      edition.previousPrice = edition.price
      edition.price = changes.price
    }
    if (changes.available !== undefined) edition.available = Math.max(0, Math.min(changes.available, edition.supply))
    target.version += 1
    return structuredClone(target)
  })
  if (nft) publishNftUpdated(nft)
  return nft
}
