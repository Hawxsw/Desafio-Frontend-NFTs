import { CATALOG_TABS, CATEGORY_LABELS, NETWORK_LABELS, SORT_LABELS } from '@/constants/catalog'
import type { Network } from '@/types/common'
import type { CatalogTab, NftCategory, NftListParams, NftSort } from '@/types/nft'
import { isValidEth } from '@/utils/money.helper'

export interface CatalogSearch {
  q?: string
  tab?: CatalogTab
  category?: NftCategory[]
  network?: Network[]
  minPrice?: string
  maxPrice?: string
  sort?: NftSort
  page?: number
}

const DEFAULT_TAB: CatalogTab = 'all'
const DEFAULT_SORT: NftSort = 'recent'

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value) return [value]
  return []
}

function pickList<T extends string>(value: unknown, allowed: Record<T, string>): T[] | undefined {
  const list = [...new Set(toList(value))].filter((item): item is T => Object.hasOwn(allowed, item))
  return list.length > 0 ? list : undefined
}

function pickPrice(value: unknown): string | undefined {
  const price = typeof value === 'number' ? String(value) : value
  return typeof price === 'string' && isValidEth(price) ? price : undefined
}

export function validateCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const q = typeof search.q === 'string' ? search.q.slice(0, 80) : typeof search.q === 'number' ? String(search.q) : ''
  const tab = CATALOG_TABS.some((item) => item.value === search.tab) ? (search.tab as CatalogTab) : undefined
  const sort = Object.hasOwn(SORT_LABELS, String(search.sort)) ? (search.sort as NftSort) : undefined
  const page = Number(search.page)

  return compactCatalogSearch({
    q,
    tab,
    category: pickList(search.category, CATEGORY_LABELS),
    network: pickList(search.network, NETWORK_LABELS),
    minPrice: pickPrice(search.minPrice),
    maxPrice: pickPrice(search.maxPrice),
    sort,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
  })
}

export function compactCatalogSearch(search: CatalogSearch): CatalogSearch {
  const result: CatalogSearch = {}
  if (search.q?.trim()) result.q = search.q
  if (search.tab && search.tab !== DEFAULT_TAB) result.tab = search.tab
  if (search.category?.length) result.category = search.category
  if (search.network?.length) result.network = search.network
  if (search.minPrice) result.minPrice = search.minPrice
  if (search.maxPrice) result.maxPrice = search.maxPrice
  if (search.sort && search.sort !== DEFAULT_SORT) result.sort = search.sort
  if (search.page && search.page > 1) result.page = search.page
  return result
}

export function toNftListParams(search: CatalogSearch): NftListParams {
  return {
    ...search,
    q: search.q?.trim() || undefined,
    tab: search.tab ?? DEFAULT_TAB,
    sort: search.sort ?? DEFAULT_SORT,
    page: search.page ?? 1,
  }
}
