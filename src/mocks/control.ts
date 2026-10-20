import { resetDb } from './db'
import { getScenario, SCENARIO_STORAGE_KEY, setScenario, type ScenarioId } from './scenarios'

const APP_STORAGE_PREFIX = 'kurio:'

function clearAppStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(APP_STORAGE_PREFIX) && key !== SCENARIO_STORAGE_KEY)
    .forEach((key) => localStorage.removeItem(key))
}

export function selectScenario(id: ScenarioId): void {
  setScenario(id)
  clearAppStorage()
  resetDb(id)
}

export function resetMocks(): void {
  selectScenario(getScenario())
}
