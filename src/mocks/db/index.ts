import { getScenario, type ScenarioId } from '@/mocks/scenarios'
import type { MockDatabase } from './schema'
import { createSeed, SCHEMA_VERSION } from './seed'

export const DB_STORAGE_KEY = 'kurio:mock-db'

let cache: MockDatabase | null = null

function load(): MockDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as MockDatabase
      if (parsed.schemaVersion === SCHEMA_VERSION) return parsed
    }
  } catch {
    return createSeed(getScenario())
  }
  return createSeed(getScenario())
}

function persist(db: MockDatabase) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db))
  } catch {
    return
  }
}

export function getDb(): MockDatabase {
  cache ??= load()
  return cache
}

export function updateDb<T>(mutate: (db: MockDatabase) => T): T {
  const db = getDb()
  const result = mutate(db)
  persist(db)
  return result
}

export function resetDb(scenario: ScenarioId): void {
  cache = createSeed(scenario)
  persist(cache)
}

window.addEventListener('storage', (event) => {
  if (event.key === DB_STORAGE_KEY) cache = null
})
