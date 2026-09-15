import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import './HomepageV1.css';

const services = [
  {
    icon: Wrench,
    title: 'WordPress Rescue',
    description:
      'Naprawy błędów, formularzy, WooCommerce, integracji i problemów po aktualizacjach.',
    meta: 'Szybka diagnoza • konkretna wycena',
  },
  {
    icon: Braces,
    title: 'Development',
    description:
      'Dedykowane sekcje, komponenty i funkcje w WordPress, React oraz Next.js.',
    meta: 'ACF • API • React • Next.js',
  },
  {
    icon: Gauge,
    title: 'Performance',
    description:
      'Optymalizacja Core Web Vitals, obrazów, JavaScriptu, cache i warstwy front-end.',
    meta: 'LCP • CLS • INP • Cloudflare',
  },
];

const process = [
  'Opisujesz problem albo zakres prac.',
  'Dostajesz konkretny plan i wycenę.',
  'Zmiany trafiają na preview przed publikacją.',
  'Po akceptacji wdrażamy produkcję.',
];

export function HomepageV1() {
  return (
    <div className="homepage-v1">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <a href="#top" className="cf-brand" aria-label="CodeFix.IT - strona główna">
            <span className="cf-brand-mark">&lt;/&gt;</span>
            <span className="cf-brand-name">
              CODEFIX<strong>.IT</strong>
            </span>
          </a>

          <nav className="cf-nav-links" aria-label="Główna nawigacja">
            <a href="#services">Usługi</a>
            <a href="#process">Proces</a>
          </nav>

          <a href="#services" className="cf-nav-cta">
            Zobacz usługi
          </a>
        </div>
      </header>

      <main id="top">
        <section className="cf-container cf-hero">
          <div>
            <div className="cf-eyebrow">
              <span className="cf-eyebrow-dot" />
              Dostępny do nowych zleceń
            </div>

            <p className="cf-stack-label">WordPress • React • Next.js • API</p>

            <h1 className="cf-title">
              Diabeł tkwi
              <span className="cf-title-muted">w kodzie.</span>
            </h1>

            <p className="cf-lead">
              Naprawiam, rozwijam i optymalizuję strony oraz aplikacje internetowe.
              Bez zbędnego procesu — diagnoza, konkretne rozwiązanie i wdrożenie.
            </p>

            <div className="cf-actions">
              <a href="#services" className="cf-button cf-button-primary">
                Zobacz, w czym pomagam
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#process" className="cf-button cf-button-secondary">
                Jak wygląda współpraca
              </a>
            </div>

            <div className="cf-proof" aria-label="Standard pracy">
              <span className="cf-proof-item">
                <CheckCircle2 size={15} aria-hidden="true" />
                Preview przed wdrożeniem
              </span>
              <span className="cf-proof-item">
                <CheckCircle2 size={15} aria-hidden="true" />
                Git + CI/CD
              </span>
              <span className="cf-proof-item">
                <CheckCircle2 size={15} aria-hidden="true" />
                Mobile-first
              </span>
            </div>
          </div>

          <div className="cf-terminal-wrap">
            <div className="cf-terminal">
              <div className="cf-terminal-bar">
                <span className="cf-dot cf-dot-red" />
                <span className="cf-dot cf-dot-yellow" />
                <span className="cf-dot cf-dot-green" />
                <span className="cf-terminal-title">codefix.it / diagnose</span>
              </div>

              <div className="cf-terminal-body">
                <div className="cf-command">$ audit --project client-site</div>
                <p className="cf-terminal-copy">Analiza projektu...</p>

                <div className="cf-diagnostic-list">
                  <div className="cf-diagnostic-row">
                    <span>Błędy krytyczne</span>
                    <span className="cf-status-red">3 znalezione</span>
                  </div>
                  <div className="cf-diagnostic-row">
                    <span>Performance</span>
                    <span className="cf-status-yellow">do poprawy</span>
                  </div>
                  <div className="cf-diagnostic-row">
                    <span>Plan naprawczy</span>
                    <span className="cf-status-green">gotowy ✓</span>
                  </div>
                </div>

                <p className="cf-terminal-result">
                  <strong>→</strong> problem znaleziony. Możemy naprawiać.
                </p>
              </div>
            </div>

            <div className="cf-metrics" aria-label="Standard techniczny">
              <div className="cf-metric">
                <strong>Preview</strong>
                <span>przed produkcją</span>
              </div>
              <div className="cf-metric">
                <strong>CI/CD</strong>
                <span>automatyczne checki</span>
              </div>
              <div className="cf-metric">
                <strong>CWV</strong>
                <span>performance first</span>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="cf-section cf-section-bordered">
          <div className="cf-container">
            <p className="cf-section-kicker">Usługi</p>
            <h2 className="cf-section-heading">
              Kod ma działać. Szybko, stabilnie i bez niespodzianek.
            </h2>

            <div className="cf-services-grid">
              {services.map(({ icon: Icon, title, description, meta }) => (
                <article key={title} className="cf-service-card">
                  <div className="cf-service-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <p className="cf-service-meta">{meta}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="cf-section">
          <div className="cf-container cf-process-layout">
            <div className="cf-process-intro">
              <p className="cf-section-kicker">Proces</p>
              <h2 className="cf-section-heading">Bez wrzucania zmian w ciemno.</h2>
              <p>
                Każda większa zmiana przechodzi przez branch, automatyczne testy i osobne
                środowisko preview. Najpierw widzisz efekt, potem trafia on na produkcję.
              </p>
            </div>

            <ol className="cf-process-grid">
              {process.map((item, index) => (
                <li key={item} className="cf-process-card">
                  <span className="cf-process-number">0{index + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-inner">
          <span>© 2026 CodeFix.IT</span>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}
