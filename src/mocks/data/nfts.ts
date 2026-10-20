import { NETWORK_LABELS } from '@/constants/catalog'
import type { Network } from '@/types/common'
import type { Nft, NftCategory, NftEdition } from '@/types/nft'
import { mulEth } from '@/utils/money.helper'

export const NFT_COUNT = 60
const IMAGE_COUNT = 4

const TEMPLATES = [
  { name: 'Emerald Ape', image: 1, attributes: ['Óculos', 'Esmeralda', 'Raro'] },
  { name: 'Sage Nomad', image: 2, attributes: ['Capuz', 'Sálvia', 'Incomum'] },
  { name: 'Neon Vessel', image: 3, attributes: ['Neon', 'Cromado', 'Raro'] },
  { name: 'Cosmic Bloom', image: 2, attributes: ['Floral', 'Cósmico', 'Épico'] },
  { name: 'Violet Nomad', image: 2, attributes: ['Capuz', 'Violeta', 'Comum'] },
  { name: 'Ivory Baron', image: 3, attributes: ['Coroa', 'Marfim', 'Lendário'] },
  { name: 'Golden Beast', image: 4, attributes: ['Juba', 'Dourado', 'Épico'] },
  { name: 'Golden Signal', image: 4, attributes: ['Antena', 'Dourado', 'Incomum'] },
]
const CATEGORIES: NftCategory[] = [
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativa',
  'jogos',
  'assinaturas',
  'utilidade',
]
const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const CREATORS = ['Ateliê Cobre', 'MintLab', 'Pixel Terra', 'GreenMint Studio']

const finney = (amount: number) => mulEth('0.001', amount)
const heroImage = (image: number) => `/images/hero/hero-${image}.png`

function createEditions(index: number, id: string): NftEdition[] {
  const base = 390 + ((index * 137) % 1600)

  const editions: NftEdition[] = [
    {
      id: `${id}-padrao`,
      name: 'Padrão',
      price: finney(base),
      previousPrice: index % 4 === 1 ? finney(Math.floor((base * 5) / 4)) : null,
      supply: 50,
      available: index % 9 === 8 ? 0 : 50 - ((index * 7) % 45),
      maxPerOrder: 5,
    },
  ]

  if (index % 2 === 0) {
    editions.push({
      id: `${id}-dourada`,
      name: 'Dourada',
      price: finney(base * 3),
      previousPrice: null,
      supply: 10,
      available: index % 4 === 0 ? 0 : 3,
      maxPerOrder: 2,
    })
  }

  if (index % 5 === 0) {
    editions.push({
      id: `${id}-genesis`,
      name: 'Gênesis',
      price: finney(base * 10),
      previousPrice: null,
      supply: 1,
      available: 1,
      maxPerOrder: 1,
    })
  }

  return editions
}

function createImages(main: number) {
  return Array.from({ length: IMAGE_COUNT }, (_, k) => heroImage(((main - 1 + k) % IMAGE_COUNT) + 1))
}

function createContractAddress(index: number) {
  const chunks = Array.from({ length: 5 }, (_, k) =>
    (((index + 1) * (k + 7) * 2654435761) >>> 0).toString(16).padStart(8, '0'),
  )
  return `0x${chunks.join('')}`
}

export function createNfts(): Nft[] {
  return Array.from({ length: NFT_COUNT }, (_, index) => {
    const template = TEMPLATES[index % TEMPLATES.length]
    const tokenId = String((index * 47 + 42) % 1000).padStart(3, '0')
    const id = `nft-${String(index + 1).padStart(3, '0')}`
    const network = NETWORKS[Math.floor(index / CATEGORIES.length) % NETWORKS.length]

    return {
      id,
      name: `${template.name} #${tokenId}`,
      description: `Um colecionável digital 1/50 feito à mão da coleção Kurio Editions, cunhado na ${NETWORK_LABELS[network]}.`,
      creator: CREATORS[index % CREATORS.length],
      category: CATEGORIES[index % CATEGORIES.length],
      network,
      images: createImages(template.image),
      editions: createEditions(index, id),
      featured: index < 4,
      likes: (index * 53) % 400,
      rating: Number((4 + ((index * 3) % 11) / 10).toFixed(1)),
      reviewCount: 2 + ((index * 7) % 30),
      contractAddress: createContractAddress(index),
      tokenId,
      attributes: template.attributes,
      createdAt: new Date(Date.UTC(2026, 0, 1 + index * 3)).toISOString(),
      version: 1,
    }
  })
}
