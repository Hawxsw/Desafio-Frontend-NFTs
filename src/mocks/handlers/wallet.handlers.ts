import { http, HttpResponse } from 'msw'
import { requireUser } from '@/mocks/auth'
import { getDb, updateDb } from '@/mocks/db'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'
import { getScenario } from '@/mocks/scenarios'
import type { Network } from '@/types/common'
import type { Wallet, WalletConnection, WalletInput, WalletKind, WalletProvider } from '@/types/wallet'
import { isValidWalletAddress } from '@/utils/validation.helper'

const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const PROVIDERS: WalletProvider[] = ['walletconnect', 'metamask', 'coinbase']
const KINDS: WalletKind[] = ['primary', 'secondary']

function validate(input: WalletInput) {
  const fieldErrors: Record<string, string> = {}
  if (!input.label?.trim()) fieldErrors.label = 'Informe um apelido para a carteira.'
  if (!isValidWalletAddress(input.address ?? '')) fieldErrors.address = 'Informe um endereço 0x com 40 caracteres.'
  if (!input.networks?.length || !input.networks.every((network) => NETWORKS.includes(network))) {
    fieldErrors.networks = 'Selecione uma rede.'
  }
  if (!PROVIDERS.includes(input.provider)) fieldErrors.provider = 'Selecione o tipo de carteira.'
  if (!KINDS.includes(input.kind)) fieldErrors.kind = 'Tipo de carteira inválido.'
  return fieldErrors
}

function applyInput(wallet: Wallet, input: WalletInput) {
  wallet.kind = input.kind
  wallet.provider = input.provider
  wallet.label = input.label.trim()
  wallet.address = input.address.trim()
  wallet.ensName = input.ensName?.trim() || null
  wallet.networks = input.networks
  wallet.updatedAt = new Date().toISOString()
}

export const walletHandlers = [
  http.get('/api/wallets', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user
    return HttpResponse.json(getDb().wallets.filter((wallet) => wallet.userId === user.id))
  }),

  http.post<never, WalletInput>('/api/wallets', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const input = await request.json()
    const fieldErrors = validate(input)
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fieldErrors })
    }

    return updateDb((db) => {
      if (db.wallets.some((wallet) => wallet.userId === user.id && wallet.kind === input.kind)) {
        return apiError(409, 'CONFLICT', 'Você já tem uma carteira deste tipo. Edite a existente.')
      }
      const now = new Date().toISOString()
      const wallet: Wallet = {
        id: `wal-${crypto.randomUUID()}`,
        userId: user.id,
        kind: input.kind,
        provider: input.provider,
        label: '',
        address: '',
        ensName: null,
        networks: [],
        createdAt: now,
        updatedAt: now,
      }
      applyInput(wallet, input)
      db.wallets.push(wallet)
      return HttpResponse.json(wallet, { status: 201 })
    })
  }),

  http.patch<{ id: string }, WalletInput>('/api/wallets/:id', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const input = await request.json()
    const fieldErrors = validate(input)
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fieldErrors })
    }

    return updateDb((db) => {
      const wallet = db.wallets.find((item) => item.id === params.id && item.userId === user.id)
      if (!wallet) return apiError(404, 'NOT_FOUND', 'Carteira não encontrada.')
      applyInput(wallet, input)
      return HttpResponse.json(wallet)
    })
  }),

  http.post<{ id: string }, { network: Network }>('/api/wallets/:id/connect', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const { network } = await request.json()
    const wallet = getDb().wallets.find((item) => item.id === params.id && item.userId === user.id)
    if (!wallet) return apiError(404, 'NOT_FOUND', 'Carteira não encontrada.')
    if (!wallet.networks.includes(network)) {
      return apiError(422, 'VALIDATION_ERROR', 'Esta carteira não opera na rede escolhida.', {
        fieldErrors: { network: 'Esta carteira não opera na rede escolhida.' },
      })
    }
    if (getScenario() === 'wallet-rejected') {
      return apiError(409, 'WALLET_REJECTED', 'A conexão foi recusada na carteira. Tente novamente.')
    }

    const connection: WalletConnection = {
      walletId: wallet.id,
      address: wallet.address,
      network,
      connectedAt: new Date().toISOString(),
    }
    return HttpResponse.json(connection)
  }),
]
