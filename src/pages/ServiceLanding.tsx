import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileCode2,
  FileText,
  LifeBuoy,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import type { ServiceLandingConfig } from '../data/service-landings';
import { projects } from '../data/projects';
import { wordpressGuides } from '../data/wordpress-guides';
import { captureSessionAttribution } from '../lib/attribution';
import { clearConversionJourney, readConversionJourney } from '../lib/conversion-journey';
import { measureAcceptedLead } from '../lib/measurement';
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
import './ServiceLanding.css';

const contactEmail = 'wwwcodefixit@gmail.com';
const leadApiUrl = 'https://app.codefix.it/api/public/leads';

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function buildSchema(config: ServiceLandingConfig) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://codefix.it/#organization',
        name: 'CodeFix.IT',
        url: 'https://codefix.it/',
        logo: 'https://codefix.it/brand/codefix-mark.png',
        slogan: 'Diabeł tkwi w kodzie',
        email: contactEmail,
      },
      {
        '@type': 'Service',
        '@id': `https://codefix.it${config.path}/#service`,
        name: config.title,
        provider: { '@id': 'https://codefix.it/#organization' },
        url: `https://codefix.it${config.path}/`,
        serviceType: config.eyebrow,
        description: config.metaDescription,
        mainEntityOfPage: `https://codefix.it${config.path}/`,
        areaServed: [{ '@type': 'Country', name: 'Polska' }],
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `https://codefix.it${config.path}/`,
          availableLanguage: ['pl'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'CodeFix.IT',
            item: 'https://codefix.it/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: config.title,
            item: `https://codefix.it${config.path}/`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: config.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export function ServiceLanding({
  config,
  allServices,
}: {
  config: ServiceLandingConfig;
  allServices: ServiceLandingConfig[];
}) {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [attribution] = useState(captureSessionAttribution);
  const [journey] = useState(readConversionJourney);
  const formStartTracked = useRef(false);
  const formViewTracked = useRef(false);
  const funnelViewTracked = useRef(false);
  const contactSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = config.metaTitle;
    setMeta('meta[name="description"]', 'content', config.metaDescription);
    setMeta('link[rel="canonical"]', 'href', `https://codefix.it${config.path}/`);
    setMeta('meta[property="og:url"]', 'content', `https://codefix.it${config.path}/`);
    setMeta('meta[property="og:title"]', 'content', config.metaTitle);
    setMeta('meta[property="og:description"]', 'content', config.metaDescription);
    setMeta('meta[name="twitter:title"]', 'content', config.metaTitle);
    setMeta('meta[name="twitter:description"]', 'content', config.metaDescription);

    let schema = document.getElementById('codefix-service-schema') as HTMLScriptElement | null;
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'codefix-service-schema';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(buildSchema(config));
  }, [config]);

  useEffect(() => {
    markFunnelService(config.service);

    function trackView() {
      if (funnelViewTracked.current) return;
      const analyticsWindow = window as Window & { codefixAnalyticsAllowed?: boolean };
      if (!analyticsWindow.codefixAnalyticsAllowed) return;
      funnelViewTracked.current = true;
      trackFunnelEvent('cf_funnel_view', {
        service: config.service,
        placement: 'service_landing',
      });
    }

    trackView();
    window.addEventListener('codefix:measurement-consent-changed', trackView);
    return () => window.removeEventListener('codefix:measurement-consent-changed', trackView);
  }, [config.service]);

  const trackLeadEvent = useCallback(
    (eventName: string, extra: Record<string, string> = {}) => {
      const analyticsWindow = window as Window & {
        gtag?: (...args: unknown[]) => void;
        codefixAnalyticsAllowed?: boolean;
      };
      if (!analyticsWindow.codefixAnalyticsAllowed) return;
      analyticsWindow.gtag?.('event', eventName, {
        event_category: 'lead_funnel',
        service: config.service,
        landing_path: config.path,
        journey_source: journey.journeySource || 'DIRECT',
        journey_guide: journey.journeyGuide || '(none)',
        ...extra,
      });
    },
    [config.path, config.service, journey.journeyGuide, journey.journeySource],
  );

  useEffect(() => {
    const section = contactSectionRef.current;
    if (!section || formViewTracked.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || formViewTracked.current) return;

        const analyticsWindow = window as Window & { codefixAnalyticsAllowed?: boolean };
        if (!analyticsWindow.codefixAnalyticsAllowed) return;

        formViewTracked.current = true;
        trackFunnelEvent('cf_form_view', { service: config.service });
        trackLeadEvent('lead_form_view');
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [config.service, trackLeadEvent]);

  function trackCtaClick(placement: string) {
    markFunnelCta(placement, config.service);
    trackFunnelEvent('cf_cta_click', {
      placement,
      service: config.service,
    });
    trackLeadEvent('lead_cta_click', { cta_placement: placement });
  }

  function handleFormStart() {
    if (formStartTracked.current) return;
    formStartTracked.current = true;
    markFunnelFormStart(config.service);
    trackFunnelEvent('cf_form_start', { service: config.service });
    trackLeadEvent('lead_form_start');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setFormState('submitting');
    setFormMessage('');
    trackFunnelEvent('cf_submit_attempt', { service: config.service });
    trackLeadEvent('lead_form_submit_attempt');

    try {
      const response = await fetch(leadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          company: data.get('company'),
          email: data.get('email'),
          service: config.service,
          pageUrl: data.get('pageUrl'),
          message: data.get('message'),
          companyWebsite: data.get('companyWebsite'),
          startedAt: formStartedAt,
          ...attribution,
          ...journey,
          ...readFunnelPayload(config.service),
        }),
      });

      const result = (await response.json()) as { error?: string; duplicate?: boolean; leadId?: string };
      if (!response.ok) throw new Error(result.error || 'Nie udało się wysłać formularza.');

      if (result.duplicate) {
        trackFunnelEvent('cf_duplicate_submit', { service: config.service });
      } else {
        measureAcceptedLead();
        trackFunnelEvent('cf_lead_created', { service: config.service });

        const analyticsWindow = window as Window & {
          gtag?: (...args: unknown[]) => void;
          codefixAnalyticsAllowed?: boolean;
        };
        if (analyticsWindow.codefixAnalyticsAllowed) {
          analyticsWindow.gtag?.('event', 'generate_lead', {
            event_category: 'lead',
            lead_source: 'service_landing',
            service: config.service,
            landing_path: config.path,
            journey_source: journey.journeySource || 'DIRECT',
            journey_guide: journey.journeyGuide || '(none)',
          });
        }
      }

      form.reset();
      if (!result.duplicate) clearFunnelSession();
      clearConversionJourney();
      setFormStartedAt(Date.now());
      setFormState('success');
      setFormMessage(
        result.duplicate
          ? 'To zgłoszenie już do mnie trafiło — nie musisz wysyłać go ponownie.'
          : config.successMessage ??
              'Dzięki — zapytanie trafiło do CodeFix.IT. Odpowiem po krótkiej analizie tematu.',
      );
    } catch (error) {
      trackFunnelEvent('cf_form_error', { service: config.service });
      trackLeadEvent('lead_form_error');
      setFormState('error');
      setFormMessage(error instanceof Error ? error.message : 'Nie udało się wysłać formularza.');
    }
  }

  const related = allServices.filter((item) => item.path !== config.path);
  const proofProjects = config.projectSlugs?.length
    ? config.projectSlugs
        .map((slug) => projects.find((project) => project.slug === slug))
        .filter((project): project is (typeof projects)[number] => Boolean(project))
    : projects.slice(0, 2);
  const relatedGuides = wordpressGuides
    .filter((item) => item.serviceHref === config.path)
    .sort((a, b) => Number(b.slug.startsWith('ile-kosztuje-')) - Number(a.slug.startsWith('ile-kosztuje-')))
    .slice(0, 3);

  return (
    <div className={`homepage-v1 service-landing${config.stickyCta ? ' has-sticky-service-cta' : ''}`}>
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand />
          <nav className="cf-nav-links service-nav-links" aria-label="Nawigacja usługi">
            <a href="#zakres">Zakres</a>
            <a href="#proces">Proces</a>
            <a href="#faq">FAQ</a>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <a href="#kontakt" className="cf-nav-cta" onClick={() => trackCtaClick('nav')}>{config.cta}</a>
        </div>
      </header>

      <main>
        <section className="cf-container service-hero">
          <div className="service-hero-copy">
            <nav className="service-breadcrumb" aria-label="Okruszki">
              <a href="/">CodeFix.IT</a>
              <span aria-hidden="true">/</span>
              <span>{config.eyebrow}</span>
            </nav>
            <p className="cf-section-kicker">{config.eyebrow}</p>
            <h1>
              {config.title}
              <span>{config.titleAccent}</span>
            </h1>
            <p className="service-hero-lead">{config.description}</p>

            <div className="cf-actions">
              <a
                href="#kontakt"
                className="cf-button cf-button-primary"
                onClick={() => trackCtaClick('hero')}
              >
                {config.cta}
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#zakres" className="cf-button cf-button-secondary">
                {config.secondaryCta}
              </a>
            </div>

            <div className="service-proof-row" aria-label="Najważniejsze cechy usługi">
              {config.heroPoints.map((item) => (
                <span key={item}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="service-offer-card" aria-label="Podsumowanie oferty">
            <div className="service-offer-icon">
              {config.service === 'WORDPRESS_QUICK_FIX' ? (
                <Wrench size={22} aria-hidden="true" />
              ) : config.service === 'WORDPRESS_CARE' ? (
                <LifeBuoy size={22} aria-hidden="true" />
              ) : (
                <FileCode2 size={22} aria-hidden="true" />
              )}
            </div>
            <span>Start</span>
            <strong>{config.price}</strong>
            <p>{config.pricingNote}</p>
            {config.offerPoints && (
              <ul className="service-offer-points">
                {config.offerPoints.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <a
              href="#kontakt"
              className="cf-button cf-button-primary"
              onClick={() => trackCtaClick('offer_card')}
            >
              Omów zakres
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            {config.demoUrl && (
              <a href={config.demoUrl} target="_blank" rel="noreferrer" className="service-demo-link">
                Demo WordPress + ACF PRO
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </aside>
        </section>

        {config.reassurance && (
          <section className="service-reassurance" aria-label="Jak wygląda start współpracy">
            <div className="cf-container service-reassurance-grid">
              {config.reassurance.map((item) => (
                <article key={item.title}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="cf-section cf-section-bordered service-problems-section">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Kiedy warto</p>
                <h2 className="cf-section-heading">{config.problemHeading}</h2>
              </div>
              <p className="cf-section-sidecopy">
                Najpierw ustalam realny problem i cel. Dopiero potem proponuję zakres techniczny.
              </p>
            </div>

            <div className="service-problems-grid">
              {config.problems.map((problem) => (
                <article key={problem.title} className="service-problem-card">
                  <CircleGauge size={19} aria-hidden="true" />
                  <h3>{problem.title}</h3>
                  <p>{problem.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="zakres" className="cf-section service-scope-section">
          <div className="cf-container service-scope-layout">
            <div>
              <p className="cf-section-kicker">Zakres</p>
              <h2 className="cf-section-heading">{config.scopeHeading}</h2>
              <p className="service-scope-intro">{config.scopeIntro}</p>
            </div>
            <ul className="service-scope-list">
              {config.scope.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="proces" className="cf-section cf-section-bordered">
          <div className="cf-container">
            <p className="cf-section-kicker">Proces</p>
            <h2 className="cf-section-heading">Krótko, konkretnie i bez ukrytego rozszerzania zakresu.</h2>
            <div className="service-process-grid">
              {config.process.map((step) => (
                <article key={step.title} className="service-process-card">
                  <span>{step.title}</span>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section service-proof-section">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Realizacje</p>
                <h2 className="cf-section-heading">WordPress w praktyce, nie tylko w opisie usługi.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Poniższe projekty to opisane, faktyczne wdrożenia. Szczegóły zakresu są dostępne na osobnych stronach realizacji.
              </p>
            </div>
            <div className="service-projects-grid">
              {proofProjects.map((project) => (
                <article className="service-project-card" key={project.slug}>
                  <span>{project.year} · WordPress</span>
                  <h3>{project.title}</h3>
                  <p>{project.shortDescription}</p>
                  <div>
                    {project.technologies.slice(0, 4).map((technology) => (
                      <small key={technology}>{technology}</small>
                    ))}
                  </div>
                  <a href={`/realizacje/${project.slug}/`}>
                    Zobacz zakres realizacji
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="kontakt"
          ref={contactSectionRef}
          className="cf-section cf-contact-section service-contact-section"
        >
          <div className="cf-container">
            <div className="cf-contact-panel">
              <div className="cf-contact-copy">
                <div className="cf-contact-icon" aria-hidden="true">
                  <Sparkles size={20} />
                </div>
                <p className="cf-section-kicker">Kontakt</p>
                <h2>{config.contactHeading}</h2>
                <p>{config.contactCopy}</p>
                <div className="cf-contact-tags">
                  <span><ShieldCheck size={14} /> Zakres przed startem</span>
                  <span><MessageSquareText size={14} /> Bezpośredni kontakt</span>
                  <span><CheckCircle2 size={14} /> Zgłoszenie trafia do CRM</span>
                </div>
              </div>

              <div className="cf-contact-action">
                <form className="cf-lead-form" onSubmit={handleSubmit} onFocusCapture={handleFormStart}>
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

                  {config.companyFieldLabel && (
                    <label>
                      <span>{config.companyFieldLabel} <small>opcjonalnie</small></span>
                      <input
                        name="company"
                        type="text"
                        autoComplete="organization"
                        maxLength={160}
                      />
                    </label>
                  )}

                  <p className="service-form-topic">
                    Temat: <strong>{config.eyebrow}</strong>
                  </p>

                  <label>
                    <span>Adres strony {config.pageUrlRequired ? '' : <small>opcjonalnie</small>}</span>
                    <input
                      name="pageUrl"
                      type="url"
                      inputMode="url"
                      placeholder="https://twojastrona.pl"
                      maxLength={500}
                      required={config.pageUrlRequired}
                    />
                  </label>

                  <label>
                    <span>Opisz temat</span>
                    <textarea
                      name="message"
                      rows={6}
                      minLength={10}
                      maxLength={4000}
                      placeholder={config.messagePlaceholder}
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
                    {formState === 'submitting' ? 'Wysyłam…' : config.cta}
                    {formState !== 'submitting' && <ArrowRight size={17} aria-hidden="true" />}
                  </button>

                  {config.ctaMicrocopy && (
                    <p className="service-form-microcopy">
                      <ShieldCheck size={14} aria-hidden="true" />
                      <span>{config.ctaMicrocopy}</span>
                    </p>
                  )}

                  <p className="cf-form-privacy">
                    Wysyłając formularz, przekazujesz dane potrzebne do obsługi zapytania.
                    Szczegóły znajdziesz w <a href="/polityka-prywatnosci/">polityce prywatności</a>.
                  </p>

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
                  Wolisz e-mail? <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {relatedGuides.length > 0 && (
          <section className="cf-section cf-section-bordered service-guides-section" aria-labelledby="service-guides-title">
            <div className="cf-container">
              <div className="cf-section-head-row">
                <div>
                  <p className="cf-section-kicker">Baza wiedzy</p>
                  <h2 id="service-guides-title" className="cf-section-heading">Poradniki powiązane z tą usługą.</h2>
                </div>
                <p className="cf-section-sidecopy">
                  Jeśli chcesz najpierw zrozumieć problem, zacznij od konkretnej diagnostyki. Każdy poradnik prowadzi z powrotem do właściwej usługi.
                </p>
              </div>
              <div className="service-guides-grid">
                {relatedGuides.map((guide) => (
                  <a key={guide.slug} href={`/poradniki/${guide.slug}/`} className="service-guide-card">
                    <FileText size={18} aria-hidden="true" />
                    <span>{guide.intent}</span>
                    <strong>{guide.title}</strong>
                    <p>{guide.description}</p>
                    <div>
                      Czytaj poradnik
                      <ArrowRight size={14} aria-hidden="true" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="faq" className="cf-section cf-section-bordered">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">FAQ</p>
                <h2 className="cf-section-heading">Najważniejsze pytania przed startem.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Jeśli Twój przypadek nie pasuje do tych odpowiedzi, opisz go w formularzu — zakres ustalam indywidualnie.
              </p>
            </div>
            <div className="cf-faq-list">
              {config.faq.map((item) => (
                <details key={item.question} className="cf-faq-item">
                  <summary>
                    <span>{item.question}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section service-related-section" aria-labelledby="related-services-title">
          <div className="cf-container">
            <p className="cf-section-kicker">Inny etap?</p>
            <h2 id="related-services-title" className="cf-section-heading">Pozostałe usługi WordPress.</h2>
            <div className="service-related-grid">
              {related.map((item) => (
                <a key={item.path} href={`${item.path}/`} className="service-related-card">
                  <span>{item.price}</span>
                  <strong>{item.eyebrow}</strong>
                  <p>{item.metaDescription}</p>
                  <div>
                    Zobacz usługę: {item.title}
                    <ArrowRight size={14} aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <a href="/polityka-prywatnosci/">Polityka prywatności</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>

      {config.stickyCta && (
        <a
          href="#kontakt"
          className="service-sticky-cta"
          onClick={() => trackCtaClick('sticky_mobile')}
        >
          <span>{config.stickyCta}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      )}

    </div>
  );
}
