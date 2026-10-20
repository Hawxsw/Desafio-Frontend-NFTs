import { expireSessions } from './auth'
import { updateEdition } from './catalog'
import { resetDb } from './db'
import { settleDueOrders } from './orders'
import { disconnectRealtime, replayLastEvent, replayStaleNftEvent, restoreRealtime } from './realtime'
import { getScenario, SCENARIO_STORAGE_KEY, setScenario, type ScenarioId } from './scenarios'

const APP_STORAGE_PREFIX = 'kurio:'

function clearAppStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(APP_STORAGE_PREFIX) && key !== SCENARIO_STORAGE_KEY)
    .forEach((key) => localStorage.removeItem(key))
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(APP_STORAGE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key))
}

export function selectScenario(id: ScenarioId): void {
  setScenario(id)
  clearAppStorage()
  resetDb(id)
}

export function resetMocks(): void {
  selectScenario(getScenario())
}

export const mockControls = {
  getScenario,
  selectScenario,
  resetMocks,
  expireSessions,
  updateEdition,
  settleDueOrders,
  replayLastEvent,
  replayStaleNftEvent,
  disconnectRealtime,
  restoreRealtime,
}

export type MockControls = typeof mockControls
