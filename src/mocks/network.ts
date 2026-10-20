import { delay, HttpResponse } from 'msw'
import { apiError } from './errors'
import { getScenario, type ScenarioId } from './scenarios'

let requestCount = 0

function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function latencyFor(scenario: ScenarioId, n: number): number {
  if (scenario === 'slow') return 800 + Math.round(seededRandom(n) * 2200)
  if (scenario === 'out-of-order') return n % 2 === 1 ? 1800 : 200
  return 100 + Math.round(seededRandom(n) * 200)
}

export async function simulateNetwork(): Promise<Response | undefined> {
  const n = ++requestCount
  const scenario = getScenario()

  await delay(latencyFor(scenario, n))

  if (scenario === 'offline') return HttpResponse.error()
  if (scenario === 'server-error') {
    return apiError(500, 'INTERNAL_ERROR', 'Erro interno no servidor simulado.')
  }
  if (scenario === 'unstable' && n % 2 === 1) {
    return apiError(503, 'SERVICE_UNAVAILABLE', 'Serviço temporariamente indisponível. Tente novamente.')
  }
  return undefined
}

export const hang = () => delay('infinite')
