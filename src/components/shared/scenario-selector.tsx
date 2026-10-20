import { useState } from 'react'
import { resetMocks, selectScenario } from '@/mocks/control'
import { getScenario, SCENARIOS, type ScenarioId } from '@/mocks/scenarios'

export default function ScenarioSelector() {
  const [scenario, setScenario] = useState<ScenarioId>(getScenario)

  function handleApply() {
    selectScenario(scenario)
    window.location.reload()
  }

  function handleReset() {
    resetMocks()
    window.location.reload()
  }

  return (
    <aside
      aria-label="Cenários de mock"
      className="fixed bottom-[142px] left-4 z-50 md:bottom-4 flex items-end gap-2 rounded-md border bg-card p-3 text-xs shadow-lg"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="mock-scenario" className="text-text-secondary">
          Cenário
        </label>
        <select
          id="mock-scenario"
          value={scenario}
          onChange={(e) => setScenario(e.target.value as ScenarioId)}
          className="h-8 rounded-sm border bg-background px-2"
        >
          {Object.entries(SCENARIOS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleApply}
        className="h-8 rounded-md bg-primary px-3 font-bold text-primary-foreground"
      >
        Aplicar
      </button>
      <button type="button" onClick={handleReset} className="h-8 rounded-md border px-3">
        Resetar
      </button>
    </aside>
  )
}
