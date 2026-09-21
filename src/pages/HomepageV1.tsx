import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  CheckCircle2,
  Code2,
  Gauge,
  GitBranch,
  Layers3,
  MessageSquareText,
  Rocket,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { projects } from '../data/projects';
import './HomepageV1.css';
import './HomepageV1.v3.css';

const quickFixService = 'WORDPRESS_QUICK_FIX';

const services = [
  {
    icon: Wrench,
    title: 'WordPress Quick Fix',
    description:
      'Nie działa formularz, strona wyświetla błąd albo aktualizacja coś zepsuła? Diagnoza i naprawa jednego uzgodnionego problemu technicznego.',
    meta: 'Jeden problem • test po naprawie',
    price: 'Od 390 zł netto',
    service: quickFixService,
    cta: 'Zgłoś problem ze stroną',
  },
  {
    icon: Wrench,
    title: 'WordPress Rescue',
    service: 'wordpress',
    description:
      'Naprawy błędów, formularzy, WooCommerce, integracji i problemów po aktualizacjach.',
    meta: 'Szybka diagnoza • konkretna wycena',
  },
  {
    icon: Braces,
    title: 'Development',
    service: 'development',
    description:
      'Dedykowane sekcje, komponenty i funkcje w WordPress, React oraz Next.js.',
    meta: 'ACF • API • React • Next.js',
  },
  {
    icon: Gauge,
    title: 'Performance',
    service: 'performance',
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

const advantages = [
  {
    icon: MessageSquareText,
    title: 'Kontakt bez pośredników',
    description:
      'Rozmawiasz bezpośrednio z osobą, która analizuje problem i wdraża rozwiązanie.',
  },
  {
    icon: GitBranch,
    title: 'Preview przed produkcją',
    description:
      'Większe zmiany przechodzą przez branch, automatyczne checki i osobny podgląd.',
  },
  {
    icon: Layers3,
    title: 'Pełny stack webowy',
    description:
      'WordPress, front-end, API i infrastruktura wdrożeniowa w jednym procesie.',
  },
];

const faqItems = [
  {
    question: 'Czy naprawiasz istniejące strony WordPress?',
    answer:
      'Tak. Diagnozuję i naprawiam błędy WordPress, problemy po aktualizacjach, formularze, WooCommerce, integracje, motywy i niestandardowe funkcje.',
  },
  {
    question: 'Czy zajmujesz się optymalizacją szybkości i Core Web Vitals?',
    answer:
      'Tak. Analizuję LCP, CLS i INP oraz optymalizuję obrazy, JavaScript, CSS, cache i sposób ładowania zasobów, aby poprawić realną wydajność strony.',
  },
  {
    question: 'Czy rozwijasz aplikacje w React i Next.js?',
    answer:
      'Tak. Tworzę i rozwijam komponenty, widoki, integracje API oraz funkcje w aplikacjach React i Next.js, także w istniejących projektach.',
  },
  {
    question: 'Jak wygląda wdrożenie zmian?',
    answer:
      'Większe zmiany trafiają najpierw na osobny branch i środowisko preview. Po akceptacji i przejściu automatycznych kontroli wdrażam je na produkcję.',
  },
];

const featuredProjects = projects.slice(0, 3);
const contactEmail = 'wwwcodefixit@gmail.com';
const contactHref = `mailto:${contactEmail}?subject=${encodeURIComponent('Zapytanie ze strony CodeFix.IT')}`;
const leadApiUrl = 'https://app.codefix.it/api/public/leads';

export function HomepageV1() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [selectedService, setSelectedService] = useState('');

  function chooseService(service: string) {
    setSelectedService(service);
    setFormMessage('');
    setFormState('idle');
  }
  const [consentChoice, setConsentChoice] = useState<'accepted' | 'rejected' | null>(() => {
    const value = (window as Window & { codefixConsentChoice?: string | null }).codefixConsentChoice;
    return value === 'accepted' || value === 'rejected' ? value : null;
  });
  const [showConsent, setShowConsent] = useState(() => {
    return !(window as Window & { codefixConsentChoice?: string | null }).codefixConsentChoice;
  });

  function saveConsent(choice: 'accepted' | 'rejected') {
    (window as Window & {
      codefixSetAnalyticsConsent?: (choice: 'accepted' | 'rejected') => void;
    }).codefixSetAnalyticsConsent?.(choice);
    setConsentChoice(choice);
    setShowConsent(false);
  }


  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const service = selectedService;

    setFormState('submitting');
    setFormMessage('');

    try {
      const response = await fetch(leadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          service,
          pageUrl: data.get('pageUrl'),
          message: data.get('message'),
          companyWebsite: data.get('companyWebsite'),
          startedAt: formStartedAt,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się wysłać formularza.');
      }

      const analyticsWindow = window as Window & {
        gtag?: (...args: unknown[]) => void;
        codefixAnalyticsAllowed?: boolean;
      };

      if (analyticsWindow.codefixAnalyticsAllowed) analyticsWindow.gtag?.('event', 'generate_lead', {
        event_category: 'lead',
        lead_source: 'website_form',
        service: service || 'not_selected',
      });

      form.reset();
      setSelectedService('');
      setFormStartedAt(Date.now());
      setFormState('success');
      setFormMessage('Dzięki — zgłoszenie trafiło do CodeFix.IT. Odezwę się po analizie tematu.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się wysłać formularza.';
      setFormState('error');
      setFormMessage(message);
    }
  }

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
            <a href="#work">Realizacje</a>
            <a href="#process">Proces</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Kontakt</a>
          </nav>

          <a href="#contact" className="cf-nav-cta">
            Porozmawiajmy
          </a>
        </div>
      </header>

      <main id="top">
        <section className="cf-container cf-hero">
          <div className="cf-hero-copy">
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
              Naprawiam strony WordPress, rozwijam aplikacje w React i Next.js oraz
              optymalizuję Core Web Vitals. Diagnoza, konkretne rozwiązanie i bezpieczne wdrożenie.
            </p>

            <div className="cf-actions">
              <a href="#contact" className="cf-button cf-button-primary"
                onClick={() => chooseService(quickFixService)}>
                Zgłoś problem ze stroną
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#work" className="cf-button cf-button-secondary">
                Zobacz realizacje
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
            <div className="cf-terminal cf-terminal-polished">
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
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Usługi</p>
                <h2 className="cf-section-heading">
                  Naprawa WordPress, development React / Next.js i optymalizacja wydajności.
                </h2>
              </div>
              <p className="cf-section-sidecopy">
                Od błędów WordPress i WooCommerce po rozwój front-endu, API i Core Web Vitals.
              </p>
            </div>

            <div className="cf-services-grid">
              {services.map(({ icon: Icon, title, description, meta, price, service, cta }) => (
                <article key={title}
                  className={`cf-service-card${service === quickFixService ? ' cf-service-card-featured' : ''}`}>
                  <div className="cf-service-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  {price && <p className="cf-service-price">{price}</p>}
                  {price && <p className="cf-service-pricing-note">
                    Cena początkowa. Ostateczna wycena zależy od problemu;
                    kwotę brutto i warunki rozliczenia potwierdzę przed zleceniem.
                  </p>}
                  <p className="cf-service-meta">{meta}</p>
                  <a href="#contact" className="cf-card-link"
                    onClick={() => chooseService(service)}>
                    {cta ?? 'Omów zakres'}
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="cf-section cf-work-section">
          <div className="cf-container">
            <div className="cf-work-heading-row">
              <div>
                <p className="cf-section-kicker">Wybrane realizacje</p>
                <h2 className="cf-section-heading">Nie tylko kod. Efekt, który da się zmierzyć.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Przykłady projektów i wyników zapisanych w obecnym portfolio CodeFix.IT.
              </p>
            </div>

            <div className="cf-projects-grid">
              {featuredProjects.map((project) => (
                <article key={project.id} className="cf-project-card">
                  <div className="cf-project-topline">
                    <span>{project.year}</span>
                    <span>{project.category}</span>
                  </div>

                  <h3>{project.title}</h3>
                  {project.client && <p className="cf-project-client">{project.client}</p>}
                  <p className="cf-project-description">{project.shortDescription}</p>

                  <div className="cf-project-tech">
                    {project.technologies.slice(0, 4).map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>

                  {project.caseStudy && (
                    <div className="cf-project-results">
                      {project.caseStudy.results.slice(0, 2).map((result) => (
                        <div key={`${project.id}-${result.metric}`} className="cf-project-result">
                          <span>{result.metric}</span>
                          <strong>{result.value}</strong>
                          {result.description && <small>{result.description}</small>}
                        </div>
                      ))}
                    </div>
                  )}

                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cf-project-link"
                  >
                    Zobacz projekt
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section cf-why-section">
          <div className="cf-container cf-why-layout">
            <div className="cf-why-intro">
              <p className="cf-section-kicker">Dlaczego CodeFix.IT</p>
              <h2 className="cf-section-heading">Mniej chaosu. Więcej kontroli nad wdrożeniem.</h2>
              <p>
                Techniczny proces ma być przewidywalny także dla osoby, która nie siedzi na co dzień w kodzie.
              </p>
            </div>

            <div className="cf-advantages-grid">
              {advantages.map(({ icon: Icon, title, description }) => (
                <article key={title} className="cf-advantage-card">
                  <span className="cf-advantage-icon">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="cf-section cf-section-bordered">
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


        <section id="faq" className="cf-section cf-section-bordered">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">FAQ</p>
                <h2 className="cf-section-heading">Najczęstsze pytania o naprawę i rozwój stron.</h2>
              </div>
              <p className="cf-section-sidecopy">
                WordPress, React, Next.js, API i optymalizacja wydajności — konkretnie i bez marketingowego dymu.
              </p>
            </div>

            <div className="cf-advantages-grid">
              {faqItems.map((item) => (
                <article key={item.question} className="cf-advantage-card">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="cf-section cf-contact-section">
          <div className="cf-container">
            <div className="cf-contact-panel">
              <div className="cf-contact-copy">
                <div className="cf-contact-icon" aria-hidden="true">
                  <Sparkles size={20} />
                </div>
                <p className="cf-section-kicker">Kontakt</p>
                <h2>Masz problem ze stroną albo coś trzeba po prostu dowieźć?</h2>
                <p>
                  Opisz krótko sytuację. Najpierw ustalimy, co faktycznie trzeba zrobić — bez rozdmuchiwania zakresu.
                </p>

                <div className="cf-contact-tags" aria-label="Przykładowe tematy">
                  <span><Wrench size={14} /> Awaria / bug</span>
                  <span><Code2 size={14} /> Nowa funkcja</span>
                  <span><Rocket size={14} /> Performance</span>
                </div>
              </div>

              <div className="cf-contact-action">
                <div className="cf-contact-status">
                  <span className="cf-eyebrow-dot" />
                  Formularz trafia bezpośrednio do mojego CRM
                </div>

                <form className="cf-lead-form" onSubmit={handleLeadSubmit}>
                  <div className="cf-form-row">
                    <label>
                      <span>Imię / firma</span>
                      <input name="name" type="text" autoComplete="name" minLength={2} maxLength={120} required />
                    </label>
                    <label>
                      <span>E-mail</span>
                      <input name="email" type="email" autoComplete="email" maxLength={254} required />
                    </label>
                  </div>

                  <label>
                    <span>Temat</span>
                    <select name="service" value={selectedService}
                      onChange={(event) => chooseService(event.target.value)}>
                      <option value="">Wybierz opcjonalnie</option>
                      <option value={quickFixService}>WordPress Quick Fix — naprawa jednego problemu</option>
                      <option value="wordpress">WordPress / WooCommerce</option>
                      <option value="development">React / Next.js / API</option>
                      <option value="performance">Performance / Core Web Vitals</option>
                      <option value="other">Inny temat</option>
                    </select>
                  </label>

                  {selectedService === quickFixService && (
                    <p className="cf-quickfix-selection" role="status">
                      Wybrano WordPress Quick Fix. Opisz jeden problem — przed rozpoczęciem
                      prac otrzymasz indywidualną wycenę i kwotę brutto.
                    </p>
                  )}

                  <label>
                    <span>Adres strony <small>opcjonalnie</small></span>
                    <input name="pageUrl" type="url" inputMode="url" placeholder="https://twojastrona.pl" maxLength={500} />
                  </label>

                  <label>
                    <span>Co trzeba zrobić?</span>
                    <textarea
                      name="message"
                      rows={5}
                      minLength={10}
                      maxLength={4000}
                      placeholder="Krótko opisz problem, zakres albo oczekiwany efekt."
                      required
                    />
                  </label>

                  <label className="cf-form-honeypot" aria-hidden="true">
                    <span>Strona firmy</span>
                    <input name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
                  </label>

                  <button
                    type="submit"
                    className="cf-button cf-button-primary cf-contact-button"
                    disabled={formState === 'submitting'}
                  >
                    {formState === 'submitting' ? 'Wysyłam…' : 'Wyślij zgłoszenie'}
                    {formState !== 'submitting' && <ArrowRight size={17} aria-hidden="true" />}
                  </button>

                  {formMessage && (
                    <p
                      className={`cf-form-feedback ${formState === 'success' ? 'is-success' : 'is-error'}`}
                      role="status"
                    >
                      {formMessage}
                    </p>
                  )}
                </form>

                <p className="cf-contact-fallback">
                  Wolisz e-mail? <a href={contactHref}>{contactEmail}</a>
                </p>

                <a
                  href="https://github.com/wwwCodeFixIT"
                  target="_blank"
                  rel="noreferrer"
                  className="cf-github-link"
                >
                  Zobacz GitHub CodeFix.IT
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-inner">
          <span>© 2026 CodeFix.IT</span>
          <button className="cf-consent-settings" type="button" onClick={() => setShowConsent(true)}>
            Ustawienia analityki
          </button>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>

      {showConsent && (
        <section
          className="cf-consent-banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cf-consent-title"
          aria-describedby="cf-consent-description"
        >
          <div className="cf-consent-copy">
            <p className="cf-section-kicker">Prywatność • CodeFix.IT</p>
            <h2 id="cf-consent-title">Czy zgadzasz się na analitykę?</h2>
            <p id="cf-consent-description">
              Używam Google Analytics do pomiaru odwiedzin i zgłoszeń. Jeśli wyrazisz zgodę,
              Google może zapisywać i odczytywać identyfikatory analityczne na Twoim urządzeniu.
              Odrzucenie nie ogranicza korzystania ze strony ani wysłania formularza.
            </p>
            {consentChoice && (
              <p className="cf-consent-current">
                Obecne ustawienie: {consentChoice === 'accepted' ? 'analityka włączona' : 'analityka wyłączona'}.
              </p>
            )}
          </div>
          <div className="cf-consent-actions">
            <button
              type="button"
              className="cf-button cf-button-secondary"
              onClick={() => saveConsent('rejected')}
            >
              Odrzucam
            </button>
            <button
              type="button"
              className="cf-button cf-button-primary"
              onClick={() => saveConsent('accepted')}
            >
              Akceptuję analitykę
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
