import { useRef, useState } from 'react'
import {
  automationProcesses,
  automationScope,
  automationSteps,
  initialAutomationConfig,
  selectAutomationProcess,
  systemNames,
} from '../lib/automation-map'
import type { AutomationConfig, ProcessId, SystemId } from '../lib/automation-map'
import './AutomationMap.css'

export default function AutomationMap() {
  const [config, setConfig] = useState(initialAutomationConfig)
  const [selected, setSelected] = useState('input')
  const [status, setStatus] = useState('')
  const preview = useRef<HTMLDetailsElement>(null)
  const output = useRef<HTMLTextAreaElement>(null)
  const revision = useRef(0)
  const definition = automationProcesses[config.process]
  const steps = automationSteps(config)
  const step = steps.find((item) => item.id === selected) ?? steps[0]
  const exceptionSelected = selected === 'exception'
  const scope = automationScope(config)

  function update(patch: Partial<AutomationConfig>) {
    revision.current++
    setConfig((current) => ({ ...current, ...patch }))
    setStatus('')
  }

  function changeProcess(process: ProcessId) {
    revision.current++
    setConfig((current) => selectAutomationProcess(current, process))
    setStatus('')
  }

  async function copyScope() {
    const copiedRevision = revision.current
    try {
      await navigator.clipboard.writeText(scope)
      setStatus(
        revision.current === copiedRevision
          ? 'Skopiowano plan automatyzacji.'
          : 'Skopiowano wcześniejszy plan. Po zmianach skopiuj go ponownie.',
      )
    } catch {
      if (preview.current) preview.current.open = true
      output.current?.focus()
      output.current?.select()
      setStatus('Zaznaczony plan możesz skopiować ręcznie.')
    }
  }

  function reset() {
    revision.current++
    setConfig(initialAutomationConfig())
    setSelected('input')
    setStatus('Przywrócono ustawienia początkowe.')
  }

  return (
    <section className="cf-tool-panel cf-automation-map" aria-labelledby="automation-map-title">
      <div className="cf-tool-heading">
        <div>
          <p className="cf-section-kicker">05 / Procesy firmy</p>
          <h2 id="automation-map-title">Mapa automatyzacji</h2>
        </div>
        <span className="cf-tool-chip">Plan do omówienia</span>
      </div>
      <p>Wybierz proces i systemy. Kliknij etap na mapie, aby zobaczyć jego zadanie.</p>

      <div className="cf-automation-layout">
        <div className="cf-tool-form cf-automation-config">
          <label>
            Proces
            <select
              value={config.process}
              onChange={(event) => changeProcess(event.target.value as ProcessId)}
            >
              {Object.entries(automationProcesses).map(([id, item]) => (
                <option key={id} value={id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="cf-automation-systems">
            <label>
              Źródło danych
              <select
                value={config.source}
                onChange={(event) => update({ source: event.target.value as SystemId })}
              >
                {definition.sources.map((id) => (
                  <option key={id} value={id}>
                    {systemNames[id]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Miejsce wyniku
              <select
                value={config.destination}
                onChange={(event) => update({ destination: event.target.value as SystemId })}
              >
                {definition.destinations.map((id) => (
                  <option key={id} value={id}>
                    {systemNames[id]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="cf-automation-options">
            <legend>Obsługa procesu</legend>
            <label>
              <input
                type="checkbox"
                checked={config.useAi}
                onChange={(event) => update({ useAi: event.target.checked })}
              />
              <span>
                Roboczy szkic z AI <small>Opcjonalny etap w planie.</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.review}
                onChange={(event) => update({ review: event.target.checked })}
              />
              <span>
                Moja akceptacja <small>Przed przekazaniem wyniku dalej.</small>
              </span>
            </label>
          </fieldset>
          <details className="cf-automation-note">
            <summary>Dodaj własne wymagania</summary>
            <label>
              Co chcesz usprawnić?
              <textarea
                rows={3}
                maxLength={280}
                value={config.note}
                onChange={(event) => update({ note: event.target.value })}
                placeholder="Np. chcę zbierać zapytania w jednym miejscu i sprawdzać odpowiedź przed wysłaniem."
              />
            </label>
          </details>
          <p className="cf-automation-local">
            Plan powstaje w tej karcie. Połączenia z systemami ustalimy przy wdrożeniu.
          </p>
        </div>

        <div className="cf-automation-preview">
          <p className="cf-automation-caption">
            Twój przepływ <span>{steps.length === 4 ? '4 etapy' : '5 etapów'}</span>
          </p>
          <ol className="cf-automation-flow" aria-label="Etapy automatyzacji">
            {steps.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={!exceptionSelected && step.id === item.id}
                  aria-controls="automation-step-detail"
                  onClick={() => setSelected(item.id)}
                >
                  <span className="cf-automation-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.mode}</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="cf-automation-exception"
            aria-pressed={exceptionSelected}
            aria-controls="automation-step-detail"
            onClick={() => setSelected('exception')}
          >
            Braki lub błąd → ręczna obsługa
          </button>
          <div
            id="automation-step-detail"
            className="cf-automation-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <h3>{exceptionSelected ? 'Gdy proces wymaga pomocy' : step.title}</h3>
            <p>{exceptionSelected ? definition.exception : step.detail}</p>
          </div>
        </div>
      </div>

      <div className="cf-automation-bottom">
        <details ref={preview} className="cf-automation-scope">
          <summary>Podgląd zakresu do skopiowania</summary>
          <label htmlFor="automation-scope">Twój plan automatyzacji</label>
          <textarea ref={output} id="automation-scope" readOnly rows={10} value={scope} />
        </details>
        <div className="cf-tool-actions">
          <button type="button" className="cf-tool-primary" onClick={() => void copyScope()}>
            Skopiuj plan
          </button>
          <a href="/?service=development#contact">Omów automatyzację →</a>
          <button type="button" onClick={reset}>
            Zacznij od nowa
          </button>
        </div>
        <p role="status" className="cf-automation-status">
          {status}
        </p>
      </div>
    </section>
  )
}
