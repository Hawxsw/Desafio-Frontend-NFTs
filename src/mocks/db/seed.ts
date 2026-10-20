import { SEED_COUPONS } from '@/mocks/data/coupons'
import { createNfts } from '@/mocks/data/nfts'
import { SEED_USERS } from '@/mocks/data/users'
import { SEED_WALLETS } from '@/mocks/data/wallets'
import type { ScenarioId } from '@/mocks/scenarios'
import type { MockDatabase } from './schema'

export const SCHEMA_VERSION = 6

export function createSeed(scenario: ScenarioId): MockDatabase {
  return {
    schemaVersion: SCHEMA_VERSION,
    nfts: scenario === 'empty' ? [] : createNfts(),
    users: structuredClone(SEED_USERS),
    sessions: [],
    wallets: structuredClone(SEED_WALLETS),
    coupons: structuredClone(SEED_COUPONS),
    favorites: { 'usr-ana': ['nft-002', 'nft-005'], 'usr-bruno': [] },
    carts: {},
    quotes: {},
    orders: {},
    idempotency: {},
    disruptionApplied: false,
  }
}
