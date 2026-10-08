import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Layers3,
  MessageSquareText,
  Rocket,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Brand } from '../components/Brand';
import { ProjectPreview } from '../components/ProjectPreview';
import { projects } from '../data/projects';
import { captureSessionAttribution } from '../lib/attribution';
import { measureAcceptedLead, openMeasurementSettings } from '../lib/measurement';
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

const services = [
  {
    title: 'WordPress Quick Fix',
    description:
      'Formularz nie działa, aktualizacja coś zepsuła albo strona pokazuje błąd? Diagnozuję jeden konkretny problem, naprawiam go i sprawdzam efekt po wdrożeniu.',
    meta: 'Jeden problem • diagnoza • test po naprawie',
    price: 'Od 390 zł',
    service: quickFixService,
    cta: 'Zgłoś problem WordPress',
    detailsHref: '/naprawa-wordpress/',
    detailsLabel: 'Naprawa WordPress — pełny zakres',
  },
  {
    title: 'Strony internetowe dla firm — WordPress + ACF PRO',
    description:
      'Nowoczesna strona firmy od podstaw: czytelna oferta, wersja mobilna, formularz, techniczne SEO i wygodna edycja treści z panelu WordPress.',
    meta: 'Brief • projekt • preview • wdrożenie',
    price: 'Wycena indywidualna',
    service: businessSiteService,
    cta: 'Wyceń stronę firmową',
    detailsHref: '/strony-wordpress/',
    detailsLabel: 'Strony WordPress dla firm — pełny zakres',
  },
  {
    title: 'Opieka i rozwój WordPress',
    description:
      'Aktualizacje, backupy, drobne poprawki i rozwój istniejącej strony bez szukania wykonawcy od zera przy każdym kolejnym zadaniu.',
    meta: 'Stała obsługa • aktualizacje • rozwój',
    price: 'Od 300 zł / mies.',
    service: careService,
    cta: 'Zapytaj o opiekę',
    detailsHref: '/opieka-wordpress/',
    detailsLabel: 'Opieka WordPress — pełny zakres',
  },
];

const process = [
  'Opisujesz problem lub cel strony; możesz podać jej adres.',
  'Potwierdzam zakres, cenę i warunki rozpoczęcia.',
  'Przy większych zmianach pokazuję preview do akceptacji.',
  'Wdrażam, testuję kontakt i przekazuję dalsze kroki.',
];

const advantages = [
  {
    icon: MessageSquareText,
    title: 'Bezpośredni kontakt',
    description:
      'Rozmawiasz bezpośrednio z osobą, która analizuje problem, przygotowuje wycenę i wdraża rozwiązanie.',
  },
  {
    icon: GitBranch,
    title: 'Zmiany pod kontrolą',
    description:
      'Większe poprawki przechodzą przez branch, automatyczne checki i preview przed publikacją na produkcji.',
  },
  {
    icon: Layers3,
    title: 'Strona, którą da się edytować',
    description:
      'Przy nowych wdrożeniach WordPress + ACF PRO przygotowuję treści tak, żeby typowe aktualizacje można było zrobić z panelu bez zmieniania kodu.',
  },
];

const fitItems = [
  'Twoja strona wygląda przestarzale lub źle działa na telefonie.',
  'WordPress, formularz, WooCommerce lub aktualizacja wymagają naprawy.',
  'Chcesz nowej strony firmowej z prostą edycją treści.',
  'Szukasz stałego wsparcia przy poprawkach i rozwoju strony.',
];

const faqItems = [
  {
    question: 'Ile kosztuje praca przy WordPressie?',
    answer:
      'Quick Fix od 390 zł, opieka od 300 zł/mies. Nowe strony wyceniam indywidualnie. Kwotę i zakres potwierdzam przed startem.',
  },
  {
    question: 'Czy mogę zacząć od jednego małego zadania?',
    answer:
      'Tak. Możemy zacząć od jednego płatnego zadania, bez zobowiązania do większej współpracy.',
  },
  {
    question: 'Czy pracujesz na istniejących stronach WordPress?',
    answer:
      'Tak. Naprawiam błędy, formularze, WooCommerce, CSS, integracje i awarie po aktualizacjach.',
  },
  {
    question: 'Czy przy pierwszym kontakcie muszę podawać loginy?',
    answer:
      'Nie. Na początek wystarczy publiczny adres strony i opis problemu. O dostęp poproszę tylko w razie potrzeby.',
  },
  {
    question: 'Jak szybko dostanę odpowiedź i termin realizacji?',
    answer:
      'Odpowiadam zwykle w ciągu dnia roboczego. Termin realizacji ustalam po poznaniu zakresu.',
  },
  {
    question: 'Czy po wdrożeniu samodzielnie zmienię treści?',
    answer:
      'Tak. W WordPress + ACF PRO możesz edytować typowe treści z panelu, bez programowania.',
  },
  {
    question: 'Czy oferujesz opiekę po wdrożeniu?',
    answer:
      'Tak. Oferuję miesięczną opiekę lub pojedyncze zadania rozliczane osobno.',
  },
  {
    question: 'Czy pracujesz white-label dla agencji?',
    answer:
      'Tak. Pracuję na stagingu i Git, także bez kontaktu z klientem końcowym.',
  },
]

const featuredProjects = projects.slice(0, 3);
const publicProjectCount = featuredProjects.filter((project) => Boolean(project.demoUrl)).length;
const agencyCollaborationCount = featuredProjects.filter((project) => Boolean(project.collaboration)).length;

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
    placeholder: 'Czym zajmuje się firma, jakich podstron potrzebujesz i jaki jest główny cel strony?',
    hint: 'Napisz, czym zajmuje się firma, czego potrzebuje strona i czy masz już domenę, teksty oraz logo.',
  },
  [careService]: {
    submit: 'Zapytaj o stałą opiekę',
    placeholder: 'Jak wygląda obecna strona i czego oczekujesz w ramach stałej opieki?',
    hint: 'Podeślij adres strony i napisz, co mam regularnie aktualizować, sprawdzać lub poprawiać.',
  },
  [agencyService]: {
    submit: 'Zapytaj o współpracę white-label',
    placeholder: 'Jakiego typu zadania chcesz oddelegować, w jakim stacku pracuje zespół i jak wygląda Wasz workflow?',
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

  const trackHomepageEvent = useCallback((eventName: string, parameters: Record<string, string> = {}) => {
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
  }, [selectedService]);

  function chooseService(service: string, placement?: string) {
    if (formState === 'submitting') return;
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
    const value = (window as Window & { codefixConsentChoice?: string | null }).codefixConsentChoice;
    return value === 'accepted' || value === 'rejected' ? value : null;
  });

  useEffect(() => {
    function updateConsentChoice() {
      const value = (window as Window & { codefixConsentChoice?: string | null }).codefixConsentChoice;
      setConsentChoice(value === 'accepted' || value === 'rejected' ? value : null);
    }
    window.addEventListener('codefix:measurement-consent-changed', updateConsentChoice);
    return () => window.removeEventListener('codefix:measurement-consent-changed', updateConsentChoice);
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

  const messagePlaceholder = guidance?.placeholder || 'Krótko opisz problem, zakres albo oczekiwany efekt.';

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const service = selectedService;

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
          message: data.get('message'),
          companyWebsite: data.get('companyWebsite'),
          startedAt: formStartedAt,
          ...attribution,
          ...readFunnelPayload(service),
        }),
      });

      const result = (await response.json()) as { error?: string; duplicate?: boolean; leadId?: string };

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
        };

        if (analyticsWindow.codefixAnalyticsAllowed) analyticsWindow.gtag?.('event', 'generate_lead', {
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
      const message = error instanceof Error && !(error instanceof TypeError || error instanceof SyntaxError)
        ? error.message
        : 'Nie udało się połączyć ze stroną. Spróbuj ponownie za chwilę.';
      setFormState('error');
      setFormMessage(message);
    }
  }

  return (
    <div className={`homepage-v1 has-mobile-cta${contactAreaVisible ? ' cf-contact-in-view' : ''}`}>
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand href="#top" />

          <nav className="cf-nav-links" aria-label="Główna nawigacja">
            <a href="#services">Usługi</a>
            <a href="#work">Realizacje</a>
            <a href="#process">Proces</a>
            <a href="#faq">FAQ</a>
            <a href="/poradniki/">Poradniki</a>
            <a href="#contact">Kontakt</a>
          </nav>

          <a
            href="#contact"
            className="cf-nav-cta"
            onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'nav' })}
          >
            Opisz temat
          </a>
        </div>
      </header>

      <main id="top">
        <section className="cf-container cf-hero">
          <div className="cf-hero-copy">
            <div className="cf-eyebrow">
              <span className="cf-eyebrow-dot" />
              WordPress dla firm i agencji • zdalnie cała Polska
            </div>

            <p className="cf-stack-label">Naprawa • nowe strony • opieka • white-label</p>

            <h1 className="cf-title">
              CodeFix.IT — WordPress dla firm.
              <span className="cf-title-muted">Naprawa, nowe strony i stała opieka.</span>
            </h1>

            <p className="cf-lead">
              Masz problem z WordPressem, potrzebujesz nowej strony albo chcesz oddać techniczną opiekę?
              Opisz temat. Przed startem potwierdzam zakres, cenę i kolejny krok — zdalnie w całej Polsce.
            </p>

            <div className="cf-actions">
              <a href="#contact" className="cf-button cf-button-primary"
                onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'hero_primary_generic' })}>
                Opisz temat
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#work" className="cf-button cf-button-secondary"
                onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'hero_secondary_work' })}>
                Zobacz realizacje
              </a>
            </div>

            <div className="cf-proof" aria-label="Standard pracy">
              <span className="cf-proof-item">
                <CheckCircle2 size={15} aria-hidden="true" />
                Odpowiedź zwykle w 1 dzień roboczy
              </span>
              <span className="cf-proof-item">
                <CheckCircle2 size={15} aria-hidden="true" />
                Zakres i cena przed startem
              </span>
              <span className="cf-proof-item">
                <CheckCircle2 size={15} aria-hidden="true" />
                Preview przy większych zmianach
              </span>
            </div>
          </div>

          <aside className="cf-hero-paths" aria-labelledby="cf-hero-paths-title">
            <p className="cf-section-kicker">Od czego zaczynamy?</p>
            <h2 id="cf-hero-paths-title">Wybierz, czego potrzebujesz.</h2>

            <div className="cf-hero-path-list">
              <a
                href="#contact"
                className="cf-hero-path"
                onClick={() => chooseService(quickFixService, 'hero_path_quickfix')}
              >
                <span className="cf-hero-path-icon"><Wrench size={19} aria-hidden="true" /></span>
                <span className="cf-hero-path-copy">
                  <strong>Coś nie działa</strong>
                  <small>Błąd, formularz, WooCommerce, aktualizacja</small>
                </span>
                <span className="cf-hero-path-price">od 390 zł</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>

              <a
                href="#contact"
                className="cf-hero-path"
                onClick={() => chooseService(businessSiteService, 'hero_path_business_site')}
              >
                <span className="cf-hero-path-icon"><Layers3 size={19} aria-hidden="true" /></span>
                <span className="cf-hero-path-copy">
                  <strong>Potrzebuję nowej strony</strong>
                  <small>WordPress + ACF PRO, mobile, SEO techniczne</small>
                </span>
                <span className="cf-hero-path-price">wycena</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>

              <a
                href="#contact"
                className="cf-hero-path"
                onClick={() => chooseService(careService, 'hero_path_care')}
              >
                <span className="cf-hero-path-icon"><MessageSquareText size={19} aria-hidden="true" /></span>
                <span className="cf-hero-path-copy">
                  <strong>Chcę stałej opieki</strong>
                  <small>Aktualizacje, backupy, poprawki i rozwój</small>
                </span>
                <span className="cf-hero-path-price">od 300 zł/mies.</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>

            <p className="cf-hero-path-help">
              Nie wiesz? Podeślij URL i opisz problem — wskażę najkrótszą sensowną ścieżkę.
            </p>
            <a
              href="/dla-agencji-wordpress/"
              className="cf-mini-audit-link cf-hero-agency-link"
              onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'hero_agency_landing' })}
            >
              Jesteś agencją? Zobacz współpracę white-label
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </aside>
        </section>

        <section id="services" className="cf-section cf-section-bordered">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Usługi</p>
                <h2 className="cf-section-heading">
                  Trzy proste sposoby, żeby ruszyć ze stroną do przodu.
                </h2>
              </div>
              <p className="cf-section-sidecopy">
                Naprawa konkretnego problemu, nowa strona firmowa albo stała opieka nad WordPressem.
              </p>
            </div>

            <div className="cf-services-grid">
              {services.map(({ title, description, meta, price, service, cta, detailsHref, detailsLabel }) => {
                const artwork = `/graphics/${service}`;
                return (
                  <article key={title}
                    className={`cf-service-card${service === quickFixService ? ' cf-service-card-featured' : ''}`}>
                    {service === businessSiteService && (
                      <span className="cf-service-badge">Najlepsze do nowej strony</span>
                    )}
                    <img className="cf-service-art"
                      src={`${artwork}-720.webp`}
                      srcSet={`${artwork}-360.webp 360w, ${artwork}-720.webp 720w`}
                      sizes="(min-width: 801px) 350px, 85vw"
                      width={720} height={480} alt="" loading="lazy" decoding="async" />
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <p className="cf-service-price">{price}</p>
                    {service !== businessSiteService && <p className="cf-service-pricing-note">
                      Cena orientacyjna. Dokładny zakres, kwotę i sposób rozliczenia
                      potwierdzam przed rozpoczęciem prac.
                    </p>}
                    <p className="cf-service-meta">{meta}</p>
                    <div className="cf-service-card-actions">
                      <a href={detailsHref} className="cf-card-link cf-card-link-secondary">
                        {detailsLabel}
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                      <a href="#contact" className="cf-card-link"
                        onClick={() => chooseService(service, 'service_card')}>
                        {cta}
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    </div>
                    {service === businessSiteService && (
                      <div className="cf-service-proof">
                        <a href="https://demo.codefix.it/" target="_blank"
                          rel="noreferrer" className="cf-card-link cf-card-link-secondary">
                          Zobacz demo WordPress + ACF PRO
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                        <small>Własne demo techniczne CodeFix.IT — nie realizacja klienta.</small>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="agencies" className="cf-agency-strip" aria-labelledby="cf-agency-title">
          <div className="cf-container cf-revenue-strip-inner cf-agency-strip-inner">
            <div className="cf-agency-copy">
              <p className="cf-section-kicker">Dla agencji / white-label</p>
              <h2 id="cf-agency-title">Masz overflow WordPress? Mogę przejąć część kolejki.</h2>
              <p>
                WordPress, ACF PRO, WooCommerce, poprawki front-endowe i mniejsze integracje.
                Mogę pracować na stagingu i Git, według Waszych standardów oraz bez kontaktu z klientem końcowym.
              </p>
              <div className="cf-revenue-proof cf-agency-tags" aria-label="Zakres współpracy agencyjnej">
                <span>WordPress + ACF PRO</span>
                <span>WooCommerce</span>
                <span>Git / staging / preview</span>
                <span>white-label</span>
              </div>
            </div>

            <div className="cf-revenue-action cf-agency-actions">
              <a
                href="/dla-agencji-wordpress/"
                className="cf-button cf-button-primary"
                onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'agency_strip_landing' })}
              >
                Zobacz współpracę white-label
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="cf-card-link cf-card-link-secondary"
                onClick={() => chooseService(agencyService, 'agency_strip_contact')}
              >
                Mam konkretny task
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="cf-section cf-fit-section" aria-labelledby="cf-fit-title">
          <div className="cf-container cf-fit-layout">
            <div className="cf-fit-copy">
              <p className="cf-section-kicker">Dla kogo</p>
              <h2 id="cf-fit-title" className="cf-section-heading">
                Gdy strona ma pomagać firmie, a nie być kolejnym problemem do pilnowania.
              </h2>
              <p>
                Nie musisz wiedzieć, czy problem leży w motywie, wtyczce, hostingu czy samym
                projekcie. Na początku ustalamy cel i najkrótszą sensowną drogę do rozwiązania.
              </p>
            </div>
            <ul className="cf-fit-list">
              {fitItems.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="work" className="cf-section cf-work-section">
          <div className="cf-container">
            <div className="cf-work-heading-row">
              <div>
                <p className="cf-section-kicker">Wybrane projekty</p>
                <h2 className="cf-section-heading">Przykłady stron i wdrożeń, przy których pracowałem.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Każdy case prowadzi do działającej strony i opisuje konkretny zakres prac, technologie oraz sposób realizacji.
                {' '}<a href="/realizacje/">Zobacz wszystkie realizacje</a>.
              </p>
            </div>

            <div className="cf-proof-facts" aria-label="Weryfikowalne informacje o realizacjach">
              <div className="cf-proof-fact">
                <strong>{featuredProjects.length}</strong>
                <span>opisane realizacje</span>
              </div>
              <div className="cf-proof-fact">
                <strong>{publicProjectCount}/{featuredProjects.length}</strong>
                <span>case studies z publicznym adresem strony</span>
              </div>
              <div className="cf-proof-fact">
                <strong>WordPress + ACF PRO</strong>
                <span>w każdym pokazanym wdrożeniu</span>
              </div>
              <div className="cf-proof-fact">
                <strong>{agencyCollaborationCount > 0 ? 'Tak' : '—'}</strong>
                <span>współpraca agencyjna opisana w portfolio</span>
              </div>
            </div>

            <div className="cf-projects-grid">
              {featuredProjects.map((project) => (
                <article key={project.id} className="cf-project-card">
                  <ProjectPreview project={project} />

                  <div className="cf-project-topline">
                    <span>{project.year}</span>
                    <span>{project.collaboration ? 'Współpraca agencyjna' : 'Strona firmowa'}</span>
                  </div>

                  <h3>{project.title}</h3>
                  <p className="cf-project-description">{project.shortDescription}</p>

                  <div className="cf-project-tech">
                    {project.technologies.slice(0, 4).map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>

                  <div className="cf-project-proof">
                    <p className="cf-project-proof-label">Zakres wykonany</p>
                    <ul className="cf-project-scope-preview">
                      {project.scope.slice(0, 3).map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={14} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {project.collaboration && (
                      <p className="cf-project-collaboration">
                        Współpraca: <strong>{project.collaboration}</strong>
                      </p>
                    )}
                  </div>

                  <div className="cf-project-actions">
                    <a
                      href={`/realizacje/${project.slug}/`}
                      className="cf-project-link"
                    >
                      Case study
                      <ArrowRight size={16} aria-hidden="true" />
                    </a>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cf-project-live-link"
                    >
                      Sprawdź stronę live
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        <section className="cf-revenue-strip" aria-labelledby="cf-revenue-strip-title">
          <div className="cf-container cf-revenue-strip-inner">
            <div>
              <p className="cf-section-kicker">Szybki start</p>
              <h2 id="cf-revenue-strip-title">Masz już stronę i nie wiesz, od czego zacząć?</h2>
              <p>Wyślij publiczny adres. Sprawdzę trzy podstawowe punkty techniczne i wskażę, czy sensowniejsza jest naprawa, optymalizacja czy większa przebudowa — bez proszenia o login.</p>
            </div>
            <div className="cf-revenue-action">
              <div className="cf-revenue-proof" aria-label="Zakres mini-oceny">
                <span>bez loginu</span>
                <span>3 punkty</span>
                <span>krótka odpowiedź</span>
              </div>
              <a href="#contact" className="cf-button cf-button-primary"
                onClick={() => chooseService(miniAuditService, 'revenue_strip')}>
                Poproś o mini-ocenę
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="cf-section cf-why-section">
          <div className="cf-container cf-why-layout">
            <div className="cf-why-intro">
              <p className="cf-section-kicker">Jak pracuję</p>
              <h2 className="cf-section-heading">Mniej technicznego chaosu. Więcej jasnych ustaleń.</h2>
              <p>
                Przed startem ustalamy zakres, sposób rozliczenia i efekt, który ma zostać dostarczony.
                Większe zmiany można zobaczyć przed publikacją.
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
              <h2 className="cf-section-heading">Od pierwszej wiadomości do działającej strony.</h2>
              <p>
                Najpierw ustalamy, co naprawdę trzeba zrobić. Dopiero później wycena, realizacja,
                test i publikacja — bez dokładania przypadkowych funkcji po drodze.
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
                <h2 className="cf-section-heading">Najważniejsze pytania przed pierwszym zleceniem.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Cena, mały pierwszy task, dostępy, termin i dalsza opieka — konkrety przed wysłaniem zapytania.
              </p>
            </div>

            <div className="cf-faq-list">
              {faqItems.map((item) => (
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

        <section className="cf-revenue-strip" aria-labelledby="cf-trust-strip-title">
          <div className="cf-container cf-revenue-strip-inner">
            <div>
              <p className="cf-section-kicker">Do sprawdzenia przed kontaktem</p>
              <h2 id="cf-trust-strip-title">Nie musisz opierać decyzji tylko na opisie oferty.</h2>
              <p>
                W portfolio są trzy opisane wdrożenia z publicznymi adresami stron. Jedno z nich —
                Kancelaria Adwokacka Witkowska — zostało wykonane we współpracy agencyjnej z SyloSoftware.
                Możesz sprawdzić realizacje, zakres prac i sposób współpracy przed wysłaniem zapytania.
              </p>
              <div className="cf-revenue-proof" aria-label="Weryfikowalne informacje o CodeFix.IT">
                <span>3/3 publiczne realizacje</span>
                <span>WordPress + ACF PRO</span>
                <span>udokumentowany case agencyjny</span>
                <span>zakres i cena przed startem</span>
              </div>
            </div>

            <div className="cf-revenue-action">
              <a
                href="#contact"
                className="cf-button cf-button-primary"
                onClick={() => trackHomepageEvent('homepage_cta_click', { placement: 'trust_strip_contact' })}
              >
                Opisz temat
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="/realizacje/kancelaria-adwokacka-witkowska/"
                className="cf-card-link cf-card-link-secondary"
                onClick={() => trackHomepageEvent('homepage_proof_click', { placement: 'trust_strip_agency_case' })}
              >
                Sprawdź case agencyjny
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="contact" ref={contactSectionRef} className="cf-section cf-contact-section">
          <div className="cf-container">
            <div className="cf-contact-panel">
              <div className="cf-contact-copy">
                <div className="cf-contact-icon" aria-hidden="true">
                  <Sparkles size={20} />
                </div>
                <p className="cf-section-kicker">Kontakt</p>
                <h2>Powiedz, co ma działać lepiej. Resztę ustalimy razem.</h2>
                <p>
                  Opisz problem lub pomysł na stronę. Wystarczy kilka zdań i adres, jeśli już masz stronę.
                </p>

                <div className="cf-contact-tags" aria-label="Przykładowe tematy">
                  <span><Wrench size={14} /> Naprawa WordPress</span>
                  <span><Layers3 size={14} /> Nowa strona firmowa</span>
                  <span><MessageSquareText size={14} /> Stała opieka</span>
                  <span><GitBranch size={14} /> White-label / overflow</span>
                  <span><Rocket size={14} /> Mini-ocena techniczna</span>
                </div>
              </div>

              <div className="cf-contact-action">
                <div className="cf-contact-status">
                  <span className="cf-eyebrow-dot" />
                  Odpowiedź zwykle do 1 dnia roboczego
                </div>

                <form className="cf-lead-form" onSubmit={handleLeadSubmit} onFocusCapture={handleFormStart}>
                  <fieldset disabled={formState === 'submitting'} aria-label="Dane zapytania">
                    <div className="cf-form-row">
                      <label>
                        <span>Imię / osoba kontaktowa</span>
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
                        <span>{selectedService === agencyService ? 'Nazwa agencji / firmy' : 'Firma'} <small>opcjonalnie</small></span>
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
                        <option value="" disabled>Wybierz temat</option>
                        <option value={quickFixService}>WordPress Quick Fix — jeden konkretny problem</option>
                        <option value={businessSiteService}>Nowa strona firmowa WordPress + ACF PRO</option>
                        <option value={careService}>Opieka i rozwój WordPress</option>
                        <option value={agencyService}>Współpraca agencyjna / white-label</option>
                        <option value={miniAuditService}>Mini-ocena techniczna publicznej strony</option>
                        <option value="development">React / Next.js / API</option>
                        <option value="other">Inny temat</option>
                      </select>
                    </label>

                    {guidance && (
                      <p className="cf-quickfix-selection" role="status">{guidance.hint}</p>
                    )}

                    <label>
                      <span>
                        Adres strony {selectedService !== miniAuditService && <small>opcjonalnie</small>}
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

                    <label>
                      <span>Co trzeba zrobić?</span>
                      <textarea
                        name="message"
                        rows={5}
                        minLength={10}
                        maxLength={4000}
                        placeholder={messagePlaceholder}
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
                      <strong>{formState === 'success' ? 'Wiadomość dotarła' : 'Nie udało się wysłać'}</strong>
                      <p>{formMessage}</p>
                      {formState === 'error' && <p>Dane pozostały w formularzu. Spróbuj ponownie lub napisz e-mail poniżej.</p>}
                    </div>
                  )}

                  <p className="cf-home-form-reassurance">
                    Bez zobowiązań: najpierw poznasz zakres i cenę. Prace zaczynam po Twojej akceptacji.
                    Na tym etapie nie podawaj haseł ani dostępów.
                  </p>

                  <p className="cf-form-privacy">
                    Wysyłając formularz, przekazujesz dane potrzebne do obsługi zapytania.
                    Szczegóły znajdziesz w <a href="/polityka-prywatnosci/">polityce prywatności</a>.
                  </p>
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

      <footer className="cf-footer" ref={footerRef}>
        <div className="cf-container cf-footer-main">
          <div className="cf-footer-brand">
            <Brand href="#top" tagline />
            <p>
              Strony firmowe WordPress + ACF PRO, naprawy, dalsza opieka techniczna
              i wsparcie white-label dla agencji.
            </p>
          </div>

          <nav className="cf-footer-nav" aria-label="Nawigacja w stopce">
            <a href="#services">Usługi</a>
            <a href="#work">Realizacje</a>
            <a href="#process">Proces</a>
            <a href="#faq">FAQ</a>
            <a href="/poradniki/">Poradniki</a>
            <a href="#contact">Kontakt</a>
          </nav>

          <div className="cf-footer-contact">
            <span>Kontakt</span>
            <a href={contactHref}>{contactEmail}</a>
            <a href="https://github.com/wwwCodeFixIT" target="_blank" rel="noreferrer">
              GitHub CodeFix.IT ↗
            </a>
          </div>
        </div>

        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <div className="cf-footer-legal">
            <a href="/polityka-prywatnosci/">Polityka prywatności</a>
            <button className="cf-consent-settings" type="button" onClick={openMeasurementSettings}>
              Ustawienia prywatności
            </button>
          </div>
          <span className="cf-footer-code">Zdalnie • cała Polska</span>
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
            <small>Zakres i cena przed startem</small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}
