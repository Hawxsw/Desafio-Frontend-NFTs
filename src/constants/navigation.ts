export interface NavItemData {
  label: string
  hash?: string
  available: boolean
}

export const MAIN_NAV: NavItemData[] = [
  { label: 'Início', available: true },
  { label: 'Mercado', hash: 'catalogo', available: true },
  { label: 'Criadores', available: false },
  { label: 'Aprenda', available: false },
]
