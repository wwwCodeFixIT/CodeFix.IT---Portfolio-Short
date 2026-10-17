import { lazy, Suspense, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ToolsWorkspaceProps } from '../pages/ToolsLab'

const ToolsWorkspace = lazy(() =>
  import('../pages/ToolsLab')
    .then((module) => ({ default: module.ToolsWorkspace }))
    .catch(() => ({
      default: () => (
        <p role="alert">
          Nie udało się załadować Laboratorium.{' '}
          <a
            href="/narzedzia/"
            target="_blank"
            rel="noopener"
            aria-label="Otwórz narzędzia osobno w nowej karcie"
          >
            Otwórz narzędzia osobno
          </a>
          .
        </p>
      ),
    })),
)

export function HomeLaboratory(props: ToolsWorkspaceProps) {
  const [started, setStarted] = useState(false)

  return (
    <section
      id="laboratorium"
      className="cf-section cf-section-bordered"
      aria-labelledby="cf-laboratory-title"
    >
      <div className="cf-container">
        <div className="cf-section-head-row">
          <div>
            <p className="cf-section-kicker">Wypróbuj</p>
            <h2 id="cf-laboratory-title" className="cf-section-heading">
              Laboratorium CodeFix.IT.
            </h2>
          </div>
          <p className="cf-section-sidecopy">
            Przygotuj brief, ułóż proces lub sprawdź SEO i kontrast.
          </p>
        </div>
        <details
          className="cf-laboratory"
          onToggle={(event) => {
            if (event.currentTarget.open) setStarted(true)
          }}
        >
          <summary className="cf-button cf-button-secondary">
            Wypróbuj narzędzia <ChevronDown size={18} aria-hidden="true" />
          </summary>
          {started && (
            <Suspense fallback={<p role="status">Ładuję narzędzia…</p>}>
              <ToolsWorkspace {...props} />
            </Suspense>
          )}
        </details>
        <a
          href="/narzedzia/"
          target="_blank"
          rel="noopener"
          className="cf-card-link cf-card-link-secondary"
        >
          Otwórz w nowej karcie ↗
        </a>
      </div>
    </section>
  )
}
