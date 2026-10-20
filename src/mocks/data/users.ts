import type { StoredUser } from '@/mocks/db/schema'

export const SEED_USERS: StoredUser[] = [
  {
    id: 'usr-ana',
    name: 'Ana Souza',
    username: 'ana',
    email: 'ana@kurio.dev',
    phone: '(11) 98888-1111',
    ensName: null,
    referralCode: null,
    avatarUrl: null,
    passwordHash: 'e07c9d295404752589a39228b47ede32419f99f2b77b9d1a4282d5ea53240676',
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
  },
  {
    id: 'usr-bruno',
    name: 'Bruno Lima',
    username: 'bruno',
    email: 'bruno@kurio.dev',
    phone: '(21) 97777-2222',
    ensName: null,
    referralCode: null,
    avatarUrl: null,
    passwordHash: '485ae0a48db930f68ca8fdea599aac0ecd5245cacfd3c3adc2b3b0cee763202b',
    createdAt: '2026-02-05T12:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z',
  },
]
