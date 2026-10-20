import { http, HttpResponse } from 'msw'
import { CATEGORY_LABELS, NETWORK_LABELS, PRICE_BOUNDS } from '@/constants/catalog'
import { getDb } from '@/mocks/db'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'
import type { EthAmount, Network } from '@/types/common'
import type { CatalogTab, Nft, NftCategory, NftListResponse, NftSort } from '@/types/nft'
import { compareEth, isValidEth } from '@/utils/money.helper'

const NEW_SINCE = '2026-06-01T00:00:00.000Z'
const TRENDING_MIN_LIKES = 200
const DEFAULT_PAGE_SIZE = 9
const MAX_PAGE_SIZE = 48

function lowestPrice(nft: Nft): EthAmount {
  return nft.editions
    .map((edition) => edition.price)
    .reduce((min, price) => (compareEth(price, min) < 0 ? price : min))
}

function isAvailable(nft: Nft) {
  return nft.editions.some((edition) => edition.available > 0)
}

function matchesTab(nft: Nft, tab: CatalogTab) {
  if (tab === 'new') return nft.createdAt >= NEW_SINCE
  if (tab === 'trending') return nft.likes >= TRENDING_MIN_LIKES
  return true
}

const SORTERS: Record<NftSort, (a: Nft, b: Nft) => number> = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => compareEth(lowestPrice(a), lowestPrice(b)),
  'price-desc': (a, b) => compareEth(lowestPrice(b), lowestPrice(a)),
  popular: (a, b) => b.likes - a.likes,
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
}

function countBy<T extends string>(values: T[], nfts: Nft[], pick: (nft: Nft) => T) {
  return values.map((value) => ({ value, count: nfts.filter((nft) => pick(nft) === value).length }))
}

function priceBounds(nfts: Nft[]): [EthAmount, EthAmount] {
  if (nfts.length === 0) return PRICE_BOUNDS
  const prices = nfts.map(lowestPrice)
  const min = prices.reduce((acc, price) => (compareEth(price, acc) < 0 ? price : acc))
  const max = prices.reduce((acc, price) => (compareEth(price, acc) > 0 ? price : acc))
  return [min, max]
}

export const nftHandlers = [
  http.get('/api/nfts/featured', async () => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const featured = getDb().nfts.find((nft) => nft.featured && isAvailable(nft))
    if (!featured) return apiError(404, 'NOT_FOUND', 'Nenhum NFT em destaque.')
    return HttpResponse.json(featured)
  }),

  http.get('/api/nfts/:id', async ({ params }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const nft = getDb().nfts.find((item) => item.id === params.id)
    if (!nft) return apiError(404, 'NOT_FOUND', 'NFT não encontrado.')
    return HttpResponse.json(nft)
  }),

  http.get('/api/nfts', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const search = new URL(request.url).searchParams
    const minPrice = search.get('minPrice')
    const maxPrice = search.get('maxPrice')

    const fieldErrors: Record<string, string> = {}
    if (minPrice && !isValidEth(minPrice)) fieldErrors.minPrice = 'Preço mínimo inválido.'
    if (maxPrice && !isValidEth(maxPrice)) fieldErrors.maxPrice = 'Preço máximo inválido.'
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Filtros de preço inválidos.', { fieldErrors })
    }

    const q = search.get('q')?.trim().toLowerCase() ?? ''
    const categories = search.getAll('category') as NftCategory[]
    const networks = search.getAll('network') as Network[]
    const availableOnly = search.get('availableOnly') === 'true'
    const exclude = search.get('exclude')
    const tab = (search.get('tab') ?? 'all') as CatalogTab
    const sort = (search.get('sort') ?? 'recent') as NftSort
    const page = Math.max(1, Number(search.get('page')) || 1)
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(search.get('pageSize')) || DEFAULT_PAGE_SIZE))

    const all = getDb().nfts
    const filtered = all
      .filter(
        (nft) =>
          nft.id !== exclude &&
          matchesTab(nft, tab) &&
          (!q || nft.name.toLowerCase().includes(q) || nft.creator.toLowerCase().includes(q)) &&
          (categories.length === 0 || categories.includes(nft.category)) &&
          (networks.length === 0 || networks.includes(nft.network)) &&
          (!minPrice || compareEth(lowestPrice(nft), minPrice) >= 0) &&
          (!maxPrice || compareEth(lowestPrice(nft), maxPrice) <= 0) &&
          (!availableOnly || isAvailable(nft)),
      )
      .sort(SORTERS[sort] ?? SORTERS.recent)

    const total = filtered.length
    const body: NftListResponse = {
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      facets: {
        categories: countBy(Object.keys(CATEGORY_LABELS) as NftCategory[], all, (nft) => nft.category),
        networks: countBy(Object.keys(NETWORK_LABELS) as Network[], all, (nft) => nft.network),
        priceBounds: priceBounds(all),
      },
    }
    return HttpResponse.json(body)
  }),
]
