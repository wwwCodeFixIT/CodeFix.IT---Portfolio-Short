import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Brand } from '../components/Brand';
import { HeroEmblem, HeroExperience } from '../components/HeroExperience';
import { HomeProjectCard } from '../components/HomeProjectCard';
import homepageContent from '../data/homepage-content.json';
import { projects } from '../data/projects';
import { captureSessionAttribution } from '../lib/attribution';
import { measureAcceptedLead, openMeasurementSettings } from '../lib/measurement';
import { mergeProjectBrief } from '../lib/project-estimator';
import type { ProjectBrief } from '../lib/project-estimator';
import {
  clearFunnelSession,
  markFunnelCta,
  markFunnelFormStart,
  markFunnelService,
  readFunnelPayload,
  trackFunnelEvent,
} from '../lib/sales-funnel';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './HomepageMinimal.css';

function EstimatorUnavailable() {
  return (
    <p role="status">
      Kalkulator jest chwilowo niedostępny. <a href="#contact">Przejdź do formularza wyceny</a>.
    </p>
  );
}

const ProjectEstimator = lazy(() =>
  import('../components/ProjectEstimator').catch(() => ({ default: EstimatorUnavailable })),
);

const quickFixService = 'WORDPRESS_QUICK_FIX';
const businessSiteService = 'CODEFIX_BUSINESS_SITE';
const miniAuditService = 'FREE_MINI_AUDIT';
const careService = 'WORDPRESS_CARE';
const agencyService = 'AGENCY_WHITE_LABEL';

const allowedServiceDeepLinks = new Set([
  quickFixService,
  businessSiteService,
  careService,
  miniAuditService,
  agencyService,
  'development',
  'other',
]);

function initialServiceFromUrl() {
  const value = new URL(window.location.href).searchParams.get('service') ?? '';
  return allowedServiceDeepLinks.has(value) ? value : '';
}

const { hero, services, process, faqItems } = homepageContent;
const featuredProjects = projects.slice(0, 3);

const contactEmail = 'wwwcodefixit@gmail.com';
const contactHref = `mailto:${contactEmail}?subject=${encodeURIComponent('Zapytanie ze strony CodeFix.IT')}`;
const leadApiUrl = 'https://app.codefix.it/api/public/leads';

const serviceFormGuidance: Record<string, { submit: string; placeholder: string; hint: string }> = {
  [quickFixService]: {
    submit: 'Wyślij zgłoszenie Quick Fix',
    placeholder: 'Co dokładnie nie działa, od kiedy i co widzisz na ekranie?',
    hint: 'Opisz jeden problem: co nie działa i od kiedy. Zakres i cenę potwierdzę przed rozpoczęciem prac.',
  },
  [businessSiteService]: {
    submit: 'Wyślij brief do wyceny',
    placeholder:
      'Czym zajmuje się firma, jakich podstron potrzebujesz i jaki jest główny cel strony?',
    hint: 'Napisz, czym zajmuje się firma, czego potrzebuje strona i czy masz już domenę, teksty oraz logo.',
  },
  [careService]: {
    submit: 'Zapytaj o stałą opiekę',
    placeholder: 'Jak wygląda obecna strona i czego oczekujesz w ramach stałej opieki?',
    hint: 'Podeślij adres strony i napisz, co mam regularnie aktualizować, sprawdzać lub poprawiać.',
  },
  [agencyService]: {
    submit: 'Zapytaj o współpracę white-label',
    placeholder:
      'Jakiego typu zadania chcesz oddelegować, w jakim stacku pracuje zespół i jak wygląda Wasz workflow?',
    hint: 'Opisz zadanie, technologie i termin. Dodaj, czy mam pracować bez kontaktu z klientem końcowym.',
  },
  [miniAuditService]: {
    submit: 'Poproś o mini-ocenę',
    placeholder: 'Co najbardziej Cię niepokoi na obecnej stronie?',
    hint: 'Wklej publiczny adres strony i opisz, co Cię niepokoi. Nie potrzebuję danych logowania.',
  },
};

export function HomepageV1() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [selectedService, setSelectedService] = useState(initialServiceFromUrl);
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [estimatorStarted, setEstimatorStarted] = useState(false);
  const [projectBrief, setProjectBrief] = useState<ProjectBrief | null>(null);
  const [attribution] = useState(captureSessionAttribution);
  const formStartTracked = useRef(false);
  const formViewTracked = useRef(false);
  const funnelViewTracked = useRef(false);
  const contactSectionRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [contactAreaVisible, setContactAreaVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    // Avoid showing a redundant fixed CTA above the actual contact form or footer.
    // Track both targets, since a single observer callback may contain only one entry.
    const targets = [contactSectionRef.current, footerRef.current].filter(
      (element): element is HTMLElement => element !== null,
    );
    const visibleTargets = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        }
        setContactAreaVisible(visibleTargets.size > 0);
      },
      { threshold: 0, rootMargin: '0px 0px 72px 0px' },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (formState === 'success' || formState === 'error') feedbackRef.current?.focus();
  }, [formState]);

  const trackHomepageEvent = useCallback(
    (eventName: string, parameters: Record<string, string> = {}) => {
      if (eventName === 'homepage_cta_click') {
        const placement = parameters.placement || 'unknown';
        markFunnelCta(placement, parameters.service || selectedService);
        trackFunnelEvent('cf_cta_click', {
          placement,
          service: parameters.service || selectedService || 'not_selected',
        });
      }

      const analyticsWindow = window as Window & {
        gtag?: (...args: unknown[]) => void;
        codefixAnalyticsAllowed?: boolean;
      };
      if (!analyticsWindow.codefixAnalyticsAllowed) return;
      analyticsWindow.gtag?.('event', eventName, {
        event_category: 'homepage_funnel',
        page_path: '/',
        ...parameters,
      });
    },
    [selectedService],
  );

  function chooseService(service: string, placement?: string) {
    if (formState === 'submitting') return;
    setProjectBrief(null);
    setSelectedService(service);
    setFormMessage('');
    setFormState('idle');
    markFunnelService(service);
    trackFunnelEvent('cf_service_select', {
      service,
      placement: placement || 'direct',
    });

    if (placement) {
      markFunnelCta(placement, service);
      trackFunnelEvent('cf_cta_click', { service, placement });
      trackHomepageEvent('homepage_service_choice', {
        service,
        placement,
      });
    }
  }

  function useProjectBrief(project: ProjectBrief) {
    if (formState === 'submitting') return;
    chooseService(project.service, 'estimator_contact');
    setProjectBrief(project);
    window.requestAnimationFrame(() => {
      const section = contactSectionRef.current;
      section?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      section?.querySelector<HTMLInputElement>('[name="name"]')?.focus({ preventScroll: true });
    });
  }

  function removeProjectBrief() {
    setProjectBrief(null);
    window.requestAnimationFrame(() => {
      contactSectionRef.current
        ?.querySelector<HTMLTextAreaElement>('[name="message"]')
        ?.focus({ preventScroll: true });
    });
  }

  function handleFormStart() {
    if (formStartTracked.current) return;
    formStartTracked.current = true;
    markFunnelFormStart(selectedService);
    trackFunnelEvent('cf_form_start', {
      service: selectedService || 'not_selected',
    });
    trackHomepageEvent('lead_form_start', {
      service: selectedService || 'not_selected',
    });
  }
  const [consentChoice, setConsentChoice] = useState<'accepted' | 'rejected' | null>(() => {
    const value = (window as Window & { codefixConsentChoice?: string | null })
      .codefixConsentChoice;
    return value === 'accepted' || value === 'rejected' ? value : null;
  });

  useEffect(() => {
    function updateConsentChoice() {
      const value = (window as Window & { codefixConsentChoice?: string | null })
        .codefixConsentChoice;
      setConsentChoice(value === 'accepted' || value === 'rejected' ? value : null);
    }
    window.addEventListener('codefix:measurement-consent-changed', updateConsentChoice);
    return () =>
      window.removeEventListener('codefix:measurement-consent-changed', updateConsentChoice);
  }, []);

  useEffect(() => {
    if (selectedService) markFunnelService(selectedService);
    if (funnelViewTracked.current) return;

    const analyticsWindow = window as Window & { codefixAnalyticsAllowed?: boolean };
    if (!analyticsWindow.codefixAnalyticsAllowed) return;

    funnelViewTracked.current = true;
    trackFunnelEvent('cf_funnel_view', {
      service: selectedService || 'not_selected',
      placement: 'homepage',
    });
  }, [consentChoice, selectedService]);

  useEffect(() => {
    const section = contactSectionRef.current;
    if (!section || formViewTracked.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || formViewTracked.current) return;

        const analyticsWindow = window as Window & { codefixAnalyticsAllowed?: boolean };
        if (!analyticsWindow.codefixAnalyticsAllowed) return;

        formViewTracked.current = true;
        trackFunnelEvent('cf_form_view', {
          service: selectedService || 'not_selected',
        });
        trackHomepageEvent('lead_form_view', {
          service: selectedService || 'not_selected',
        });
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [consentChoice, selectedService, trackHomepageEvent]);

  const guidance = serviceFormGuidance[selectedService];
  const submitButtonLabel = guidance?.submit || 'Wyślij zapytanie';

  const showCompanyField =
    selectedService === businessSiteService ||
    selectedService === careService ||
    selectedService === agencyService;

  const messagePlaceholder =
    guidance?.placeholder || 'Krótko opisz problem, zakres albo oczekiwany efekt.';

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const service = selectedService;
    const message = mergeProjectBrief(String(data.get('message') ?? ''), projectBrief);
    if (message.length > 4000) {
      setFormState('error');
      setFormMessage(
        'Opis razem z zakresem z kalkulatora może mieć maksymalnie 4000 znaków. Skróć dodatkowe informacje albo usuń załączony zakres.',
      );
      return;
    }

    setFormState('submitting');
    setFormMessage('');
    trackFunnelEvent('cf_submit_attempt', {
      service: service || 'not_selected',
    });
    trackHomepageEvent('lead_form_submit_attempt', {
      service: service || 'not_selected',
    });

    try {
      const response = await fetch(leadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          company: data.get('company'),
          email: data.get('email'),
          service,
          pageUrl: data.get('pageUrl'),
          message,
          companyWebsite: data.get('companyWebsite'),
          startedAt: formStartedAt,
          ...attribution,
          ...readFunnelPayload(service),
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        duplicate?: boolean;
        leadId?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się wysłać formularza.');
      }

      if (result.duplicate) {
        trackFunnelEvent('cf_duplicate_submit', {
          service: service || 'not_selected',
        });
      } else {
        measureAcceptedLead();
        trackFunnelEvent('cf_lead_created', {
          service: service || 'not_selected',
        });

        const analyticsWindow = window as Window & {
          gtag?: (...args: unknown[]) => void;
          codefixAnalyticsAllowed?: boolean;
          codefixAdConsentChoice?: 'accepted' | 'rejected' | null;
        };

        if (
          analyticsWindow.codefixAnalyticsAllowed ||
          analyticsWindow.codefixAdConsentChoice === 'accepted'
        )
          analyticsWindow.gtag?.('event', 'generate_lead', {
            event_category: 'lead',
            lead_source: 'website_form',
            service: service || 'not_selected',
          });
      }

      const successMessage = result.duplicate
        ? 'To zgłoszenie już do mnie trafiło — nie musisz wysyłać go ponownie.'
        : service === agencyService
          ? 'Dzięki — mam zapytanie o współpracę white-label. Odpowiem z propozycją kolejnego kroku i modelu współpracy.'
          : service === businessSiteService
            ? 'Dzięki — brief dotarł. Odpowiem z pytaniami uzupełniającymi albo proponowanym zakresem i kolejnym krokiem.'
            : service === quickFixService
              ? 'Dzięki — zgłoszenie Quick Fix dotarło. Najpierw sprawdzę opis i potwierdzę zakres oraz cenę przed startem.'
              : 'Dzięki — zapytanie trafiło do CodeFix.IT. Odpowiem po krótkiej analizie tematu.';

      form.reset();
      setProjectBrief(null);
      if (!result.duplicate) clearFunnelSession();
      setSelectedService('');
      setFormStartedAt(Date.now());
      setFormState('success');
      setFormMessage(successMessage);
    } catch (error) {
      trackFunnelEvent('cf_form_error', {
        service: service || 'not_selected',
      });
      trackHomepageEvent('lead_form_error', {
        service: service || 'not_selected',
      });
      const message =
        error instanceof Error && !(error instanceof TypeError || error instanceof SyntaxError)
          ? error.message
          : 'Nie udało się połączyć ze stroną. Spróbuj ponownie za chwilę.';
      setFormState('error');
      setFormMessage(message);
    }
  }

  return (
    <div
      className={`homepage-v1 cf-home-minimal has-mobile-cta${contactAreaVisible ? ' cf-contact-in-view' : ''}`}
    >
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand href="#top" />
          <nav className="cf-nav-links" aria-label="Główna nawigacja">
            <a href="#services">Usługi</a>
            <a href="#work">Realizacje</a>
            <a href="/poradniki/">Poradniki</a>
          </nav>
          <a
            href="#contact"
            className="cf-nav-cta"
            onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'nav' })}
          >
            Kontakt
          </a>
        </div>
      </header>

      <main id="top">
        <HeroExperience>
          <div className="cf-hero-copy">
            <p className="cf-home-eyebrow">{hero.eyebrow}</p>
            <h1 className="cf-title">
              {hero.title} <span className="cf-title-muted">{hero.accent}</span>
            </h1>
            <p className="cf-lead">{hero.description}</p>
            <div className="cf-actions">
              <a
                href="#contact"
                className="cf-button cf-button-primary"
                onClick={() =>
                  trackHomepageEvent('homepage_cta_click', { placement: 'hero_primary_generic' })
                }
              >
                Opisz temat <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#work"
                className="cf-home-text-link"
                onClick={() =>
                  trackHomepageEvent('homepage_cta_click', { placement: 'hero_secondary_work' })
                }
              >
                Zobacz realizacje
              </a>
            </div>
            <p className="cf-home-hero-note">Zdalnie • cała Polska</p>
          </div>
          <div className="cf-hero-visual">
            <HeroEmblem />
          </div>
        </HeroExperience>

        <section
          id="services"
          className="cf-section cf-section-bordered"
          aria-labelledby="cf-services-title"
        >
          <div className="cf-container">
            <p className="cf-section-kicker">Usługi</p>
            <h2 id="cf-services-title" className="cf-section-heading">
              Czego potrzebujesz?
            </h2>
            <div className="cf-services-grid">
              {services.map(({ title, description, price, detailsHref }) => (
                <article key={detailsHref} className="cf-service-card">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <p className="cf-service-price">{price}</p>
                  <a
                    href={detailsHref}
                    className="cf-home-text-link cf-home-service-link"
                    aria-label={`Zobacz zakres: ${title}`}
                  >
                    Zobacz zakres <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
            <p className="cf-home-pricing-note">
              Ceny startowe. Dokładny zakres i cenę potwierdzam przed rozpoczęciem prac.
            </p>
            <div id="kalkulator" className="cf-home-tools">
              <div className="cf-home-tools-row">
                <button
                  type="button"
                  className="cf-home-text-link cf-home-estimator-toggle"
                  aria-expanded={estimatorOpen}
                  aria-controls="cf-project-estimator"
                  onClick={() => {
                    setEstimatorStarted(true);
                    setEstimatorOpen((current) => !current);
                  }}
                >
                  {estimatorOpen ? 'Zwiń kalkulator' : 'Otwórz kalkulator'}
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                <a
                  href="/dla-agencji-wordpress/"
                  className="cf-home-text-link"
                  onClick={() =>
                    trackHomepageEvent('homepage_cta_click', { placement: 'agency_landing' })
                  }
                >
                  Wsparcie dla agencji <ArrowRight size={15} aria-hidden="true" />
                </a>
              </div>
              <div id="cf-project-estimator" hidden={!estimatorOpen}>
                {estimatorStarted && (
                  <Suspense fallback={<p role="status">Ładuję kalkulator…</p>}>
                    <ProjectEstimator
                      initialService={selectedService}
                      disabled={formState === 'submitting'}
                      onUseBrief={useProjectBrief}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="cf-section" aria-labelledby="cf-work-title">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Realizacje</p>
                <h2 id="cf-work-title" className="cf-section-heading">
                  Wybrane projekty.
                </h2>
              </div>
              <a href="/realizacje/" className="cf-home-text-link">
                Wszystkie realizacje <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
            <div className="cf-home-projects">
              {featuredProjects.map((project) => (
                <HomeProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="process"
          className="cf-section cf-section-bordered"
          aria-labelledby="cf-process-title"
        >
          <div className="cf-container">
            <p className="cf-section-kicker">Jak pracuję</p>
            <h2 id="cf-process-title" className="cf-section-heading">
              Prosta współpraca.
            </h2>
            <ol className="cf-home-process-steps">
              {process.map(({ title, description }, index) => (
                <li key={title}>
                  <span className="cf-home-step-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
            <div id="faq" className="cf-home-faq" aria-labelledby="cf-home-faq-title">
              <h3 id="cf-home-faq-title">Przed pierwszą wiadomością</h3>
              <div className="cf-faq-list">
                {faqItems.map(({ question, answer }) => (
                  <details key={question} className="cf-faq-item">
                    <summary>
                      <span>{question}</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="contact"
          ref={contactSectionRef}
          className="cf-section cf-contact-section cf-section-bordered"
          aria-labelledby="cf-contact-title"
        >
          <div className="cf-container">
            <div className="cf-contact-panel">
              <div className="cf-contact-copy">
                <p className="cf-section-kicker">Kontakt</p>
                <h2 id="cf-contact-title">Porozmawiajmy o Twojej stronie.</h2>
                <p>Wystarczy opis i adres strony.</p>
                <p className="cf-home-response-note">Odpowiedź zwykle w 1 dzień roboczy.</p>
                <a className="cf-home-text-link cf-home-contact-email" href={contactHref}>
                  {contactEmail}
                </a>
              </div>
              <div className="cf-contact-action">
                <form
                  className="cf-lead-form"
                  onSubmit={handleLeadSubmit}
                  onFocusCapture={handleFormStart}
                >
                  <fieldset disabled={formState === 'submitting'} aria-label="Dane zapytania">
                    <div className="cf-form-row">
                      <label>
                        <span>Imię</span>
                        <input
                          name="name"
                          type="text"
                          autoComplete="name"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          minLength={2}
                          maxLength={120}
                          required
                        />
                      </label>
                      <label>
                        <span>E-mail</span>
                        <input
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          enterKeyHint="next"
                          maxLength={254}
                          required
                        />
                      </label>
                    </div>

                    {showCompanyField && (
                      <label>
                        <span>
                          {selectedService === agencyService ? 'Nazwa agencji / firmy' : 'Firma'}{' '}
                          <small>opcjonalnie</small>
                        </span>
                        <input
                          name="company"
                          type="text"
                          autoComplete="organization"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          maxLength={160}
                        />
                      </label>
                    )}

                    <label>
                      <span>Temat</span>
                      <select
                        name="service"
                        value={selectedService}
                        onChange={(event) => chooseService(event.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Wybierz temat
                        </option>
                        <option value={quickFixService}>Naprawa WordPress</option>
                        <option value={businessSiteService}>Nowa strona</option>
                        <option value={careService}>Stała opieka</option>
                        <option value={agencyService}>Dla agencji</option>
                        <option value={miniAuditService}>Darmowa mini-ocena</option>
                        <option value="development">Aplikacja lub integracja</option>
                        <option value="other">Inny temat</option>
                      </select>
                    </label>

                    {guidance && (
                      <p className="cf-quickfix-selection" role="status">
                        {guidance.hint}
                      </p>
                    )}

                    <label>
                      <span>
                        Adres strony{' '}
                        {selectedService !== miniAuditService && <small>opcjonalnie</small>}
                      </span>
                      <input
                        name="pageUrl"
                        type="url"
                        inputMode="url"
                        autoComplete="url"
                        autoCapitalize="none"
                        enterKeyHint="next"
                        placeholder="https://twojastrona.pl"
                        maxLength={500}
                        required={selectedService === miniAuditService}
                      />
                    </label>

                    {projectBrief && (
                      <div className="cf-estimator-attachment">
                        <details open>
                          <summary>Zakres z kalkulatora dołączony do zapytania</summary>
                          <pre>{projectBrief.brief}</pre>
                        </details>
                        <button type="button" onClick={removeProjectBrief}>
                          Usuń dołączony zakres
                        </button>
                      </div>
                    )}

                    <label>
                      <span>
                        {projectBrief ? 'Dodatkowe informacje (opcjonalnie)' : 'Co trzeba zrobić?'}
                      </span>
                      <textarea
                        name="message"
                        rows={5}
                        minLength={projectBrief ? undefined : 10}
                        maxLength={4000 - (projectBrief ? projectBrief.brief.length + 2 : 0)}
                        placeholder={messagePlaceholder}
                        required={!projectBrief}
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
                      {formState === 'submitting' ? 'Wysyłam…' : submitButtonLabel}
                      {formState !== 'submitting' && <ArrowRight size={17} aria-hidden="true" />}
                    </button>
                  </fieldset>

                  {formMessage && (
                    <div
                      ref={feedbackRef}
                      className={`cf-form-feedback ${formState === 'success' ? 'is-success' : 'is-error'}`}
                      role={formState === 'success' ? 'status' : 'alert'}
                      tabIndex={-1}
                    >
                      <strong>
                        {formState === 'success' ? 'Wiadomość dotarła' : 'Nie udało się wysłać'}
                      </strong>
                      <p>{formMessage}</p>
                      {formState === 'error' && (
                        <p>
                          Dane pozostały w formularzu. Spróbuj ponownie lub napisz e-mail poniżej.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="cf-home-form-reassurance">
                    Najpierw zakres i cena. Nie podawaj haseł w formularzu.
                  </p>

                  <p className="cf-form-privacy">
                    Dane wykorzystuję do obsługi zapytania. Szczegóły w{' '}
                    <a href="/polityka-prywatnosci/">polityce prywatności</a>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="cf-footer" ref={footerRef}>
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <nav className="cf-home-footer-links" aria-label="Nawigacja w stopce">
            <a href="#faq">FAQ</a>
            <a href="/poradniki/">Poradniki</a>
            <a href="https://github.com/wwwCodeFixIT" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="/polityka-prywatnosci/">Prywatność</a>
            <button className="cf-consent-settings" type="button" onClick={openMeasurementSettings}>
              Ustawienia prywatności
            </button>
          </nav>
        </div>
      </footer>
      <a
        href="#contact"
        className="cf-mobile-sticky-cta"
        onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'sticky_mobile' })}
        aria-label="Przejdź do formularza kontaktowego"
      >
        <span>
          <strong>Opisz temat</strong>
        </span>
        <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}
