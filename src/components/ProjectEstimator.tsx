import { useEffect, useState } from 'react'
import { loadServiceLandingCatalog } from '../lib/service-landing-catalog'
import {
  agencyRanges,
  carePeriods,
  estimateProject,
  estimatorServices,
  featureOptions,
  initialEstimatorAnswers,
  issueOptions,
  materialOptions,
  pageRanges,
  readEstimatorRates,
  siteTypes,
} from '../lib/project-estimator'
import type { EstimatorAnswers, EstimatorRates, ProjectBrief } from '../lib/project-estimator'
import './ProjectEstimator.css'

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Record<string, string>
  onChange: (value: string) => void
}) {
  return (
    <label className="cf-estimator-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function ProjectEstimator({
  initialService,
  disabled,
  onUseBrief,
}: {
  initialService: string
  disabled: boolean
  onUseBrief: (brief: ProjectBrief) => void
}) {
  const [answers, setAnswers] = useState(() => initialEstimatorAnswers(initialService))
  const [rates, setRates] = useState<EstimatorRates | null>(null)
  const [rateStatus, setRateStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let active = true
    void loadServiceLandingCatalog()
      .then((catalog) => {
        if (!active) return
        setRates(readEstimatorRates(catalog))
        setRateStatus('ready')
      })
      .catch(() => {
        if (active) setRateStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  function update<K extends keyof EstimatorAnswers>(key: K, value: EstimatorAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  const result = estimateProject(answers, rates)
  const awaitingPrice = rateStatus === 'loading' && answers.kind !== 'site'

  return (
    <div className="cf-estimator-grid">
      <div className="cf-estimator-config">
        <fieldset className="cf-estimator-services">
          <legend>1. Czego potrzebujesz?</legend>
          <div className="cf-estimator-service-options">
            {Object.entries(estimatorServices).map(([key, value]) => (
              <label key={key}>
                <input
                  type="radio"
                  name="estimator-service"
                  value={key}
                  checked={answers.kind === key}
                  onChange={() => update('kind', key as EstimatorAnswers['kind'])}
                />
                <span>{value.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="cf-estimator-settings">
          <legend>2. Dopasuj zakres</legend>
          {answers.kind === 'site' && (
            <>
              <Choice
                label="Rodzaj strony"
                value={answers.siteType}
                options={siteTypes}
                onChange={(value) => update('siteType', value as EstimatorAnswers['siteType'])}
              />
              <Choice
                label="Liczba stron / podstron"
                value={answers.pages}
                options={pageRanges}
                onChange={(value) => update('pages', value as EstimatorAnswers['pages'])}
              />
              <Choice
                label="Teksty i zdjęcia"
                value={answers.materials}
                options={materialOptions}
                onChange={(value) => update('materials', value as EstimatorAnswers['materials'])}
              />
              <fieldset className="cf-estimator-features">
                <legend>Dodatkowe funkcje</legend>
                {Object.entries(featureOptions).map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={answers.features.includes(key as keyof typeof featureOptions)}
                      onChange={(event) => {
                        const feature = key as keyof typeof featureOptions
                        const checked = event.target.checked
                        setAnswers((current) => ({
                          ...current,
                          features: checked
                            ? [...current.features, feature]
                            : current.features.filter((item) => item !== feature),
                        }))
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
            </>
          )}
          {answers.kind === 'fix' && (
            <Choice
              label="Co nie działa?"
              value={answers.issue}
              options={issueOptions}
              onChange={(value) => update('issue', value as EstimatorAnswers['issue'])}
            />
          )}
          {answers.kind === 'care' && (
            <Choice
              label="Dla jakiego okresu chcesz policzyć budżet?"
              value={answers.period}
              options={carePeriods}
              onChange={(value) => update('period', value as EstimatorAnswers['period'])}
            />
          )}
          {answers.kind === 'agency' && (
            <Choice
              label="Ile godzin wsparcia planujesz?"
              value={answers.hours}
              options={agencyRanges}
              onChange={(value) => update('hours', value as EstimatorAnswers['hours'])}
            />
          )}
        </fieldset>
      </div>
      <aside className="cf-estimator-result" aria-labelledby="cf-estimator-result-title">
        <p className="cf-section-kicker">Twój projekt</p>
        <h3 id="cf-estimator-result-title">{result.label}</h3>
        <p className="cf-estimator-price" role="status" aria-live="polite" aria-atomic="true">
          {awaitingPrice ? 'Sprawdzam aktualną cenę…' : result.price}
        </p>
        <p>{result.note}</p>
        {rateStatus === 'error' && answers.kind !== 'site' && (
          <p role="status">
            Aktualny cennik jest chwilowo niedostępny. Możesz przesłać zakres do indywidualnej
            wyceny.
          </p>
        )}
        <ul>
          {result.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <button
          type="button"
          className="cf-button cf-button-primary"
          disabled={disabled || awaitingPrice}
          onClick={() => onUseBrief({ service: result.service, brief: result.brief })}
        >
          Przenieś zakres do formularza
        </button>
        <small>
          Wynik zobaczysz bez podawania e-maila. Zgłoszenie wyślesz dopiero w formularzu
          kontaktowym.
        </small>
      </aside>
    </div>
  )
}
