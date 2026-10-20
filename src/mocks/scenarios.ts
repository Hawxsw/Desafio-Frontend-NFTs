export const SCENARIOS = {
  default: 'Padrão (sucesso)',
  empty: 'Catálogo vazio',
  slow: 'Latência variável (0,8–3s)',
  'out-of-order': 'Respostas fora de ordem',
  offline: 'Sem conexão',
  unstable: 'Instável (503 e depois sucesso)',
  'server-error': 'Erro 500 em tudo',
  'session-expired': 'Sessão expira',
  forbidden: 'Acesso negado (403)',
  'price-changed': 'Preço muda na compra',
  'sold-out': 'Edição esgota na compra',
  'order-timeout': 'Timeout após criar pedido',
  'payment-declined': 'Pagamento recusado',
} as const

export type ScenarioId = keyof typeof SCENARIOS

export const DEFAULT_SCENARIO: ScenarioId = 'default'
export const SCENARIO_STORAGE_KEY = 'kurio:mock-scenario'

export function isScenarioId(value: string): value is ScenarioId {
  return Object.hasOwn(SCENARIOS, value)
}

export function getScenario(): ScenarioId {
  try {
    const stored = localStorage.getItem(SCENARIO_STORAGE_KEY)
    if (stored && isScenarioId(stored)) return stored
  } catch {
    return DEFAULT_SCENARIO
  }
  return DEFAULT_SCENARIO
}

export function setScenario(id: ScenarioId): void {
  localStorage.setItem(SCENARIO_STORAGE_KEY, id)
}
