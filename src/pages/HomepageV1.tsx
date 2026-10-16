import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Layers3,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import { Brand } from '../components/Brand';
import { HeroEmblem, HeroExperience } from '../components/HeroExperience';
import { HeroServicePicker } from '../components/HeroServicePicker';
import { LeadField } from '../components/LeadField';
import { MobileNavigation } from '../components/MobileNavigation';
import {
  ProjectPreview,
  ProjectPreviewGroup,
  ProjectReference,
} from '../components/ProjectPreview';
import { projects } from '../data/projects';
import type { Project } from '../data/projects';
import homepageContent from '../data/homepage-content.json';
import { captureSessionAttribution } from '../lib/attribution';
import { clearConversionJourney, readConversionJourney } from '../lib/conversion-journey';
import { readLeadResponse } from '../lib/lead-response';
import { leadFieldError } from '../lib/lead-field';
import type { LeadFieldElement } from '../lib/lead-field';
import {
  measureAcceptedLead,
  openMeasurementSettings,
  trackMeasurementEvent,
} from '../lib/measurement';
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

const BriefScopePicker = lazy(() =>
  import('../components/BriefScopePicker').catch(() => ({
    default: () => <p role="status">Wpisz wybrany zakres w opisie poniżej.</p>,
  })),
);

const BriefCopy = lazy(() =>
  import('../components/BriefCopy').catch(() => ({
    default: () => <p role="status">Zaznacz podsumowanie, aby skopiować je ręcznie.</p>,
  })),
);

const AutomationDemo = lazy(() =>
  import('../components/AutomationDemo').catch(() => ({
    default: () => <p>Opisz swój proces — zaproponuję możliwe usprawnienia.</p>,
  })),
);

function focusContact(section: HTMLElement | null, behavior: ScrollBehavior) {
  const input = section?.querySelector<HTMLElement>(
    '[data-brief-step]:not([hidden]) input, [data-brief-step]:not([hidden]) button, [data-brief-step]:not([hidden]) textarea',
  );
  if (!input) return;
  // Focus renders the deferred sections before the scroll destination is measured.
  input.focus({ preventScroll: true });
  window.requestAnimationFrame(() => {
    if (!input.isConnected) return;
    if (window.matchMedia('(max-width: 720px)').matches) {
      // WebKit resolves focus styles after the event; measure the final layout.
      const box = input.getBoundingClientRect();
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const offset = viewport?.offsetTop ?? 0;
      window.scrollTo({
        top: Math.max(0, window.scrollY + box.top - offset - (height - box.height) / 2),
        behavior: 'instant',
      });
    } else {
      section?.scrollIntoView({ behavior, block: 'start' });
    }
  });
}

const quickFixService = 'WORDPRESS_QUICK_FIX';
const businessSiteService = 'CODEFIX_BUSINESS_SITE';
const miniAuditService = 'FREE_MINI_AUDIT';
const careService = 'WORDPRESS_CARE';
const agencyService = 'AGENCY_WHITE_LABEL';
const appService = 'development';

const briefServices = [
  [businessSiteService, 'Nowa strona', 'Od pomysłu do publikacji.'],
  [appService, 'Aplikacja / integracja', 'Panel, narzędzie lub połączenie systemów.'],
  [quickFixService, 'Naprawa WordPress', 'Błąd, formularz albo problem ze sklepem.'],
  [careService, 'Stała opieka', 'Aktualizacje i bieżący rozwój.'],
  [agencyService, 'Dla agencji', 'Wsparcie przy projektach Twoich klientów.'],
  [miniAuditService, 'Mini-ocena strony', 'Pierwsze wskazówki do istniejącej strony.'],
  ['other', 'Inny temat', 'Opisz, czego potrzebujesz.'],
];

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

const services = homepageContent.services;
const process = homepageContent.process;
const freeProject = homepageContent.freeProject;

const advantages = homepageContent.about.advantages.map((item, index) => ({
  ...item,
  icon: [MessageSquareText, GitBranch, Layers3][index] ?? Layers3,
}));

const faqItems = homepageContent.faqItems;

const featuredProjects = projects.slice(0, 3);
const publicProjectCount = featuredProjects.filter((project) => Boolean(project.demoUrl)).length;
const agencyCollaborationCount = featuredProjects.filter((project) =>
  Boolean(project.collaboration),
).length;

const contactEmail = 'wwwcodefixit@gmail.com';
const contactHref = `mailto:${contactEmail}?subject=${encodeURIComponent('Zapytanie ze strony CodeFix.IT')}`;
const leadApiUrl = 'https://app.codefix.it/api/public/leads';

const serviceFormGuidance: Record<string, { submit: string; placeholder: string; hint: string }> = {
  [appService]: {
    submit: 'Zapytaj o aplikację',
    placeholder: 'Kto będzie używać aplikacji i jakie zadania ma ułatwiać?',
    hint: 'Opisz cel aplikacji i potrzebne integracje.',
  },
  [quickFixService]: {
    submit: 'Wyślij zgłoszenie Quick Fix',
    placeholder: 'Co dokładnie nie działa, od kiedy i co widzisz na ekranie?',
    hint: 'Co nie działa i od kiedy? Zakres i cenę potwierdzę przed pracą.',
  },
  [businessSiteService]: {
    submit: 'Wyślij brief do wyceny',
    placeholder: 'Co oferuje firma i co użytkownik ma zrobić na stronie?',
    hint: 'Opisz firmę i cel strony. Daj znać, czy masz domenę, teksty i logo.',
  },
  [careService]: {
    submit: 'Zapytaj o stałą opiekę',
    placeholder: 'Jakiej pomocy potrzebujesz przy obecnej stronie?',
    hint: 'Podaj adres strony i zakres regularnego wsparcia.',
  },
  [agencyService]: {
    submit: 'Zapytaj o współpracę white-label',
    placeholder: 'Jakie zadania chcesz zlecić i na kiedy?',
    hint: 'Opisz zadania, technologie i termin.',
  },
  [miniAuditService]: {
    submit: 'Poproś o mini-ocenę',
    placeholder: 'Co warto sprawdzić na stronie?',
    hint: 'Podaj publiczny adres strony i opisz problem.',
  },
};

export function HomepageV1() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [selectedService, setSelectedService] = useState(initialServiceFromUrl);
  const [briefStep, setBriefStep] = useState(0);
  const [briefError, setBriefError] = useState('');
  const [scopeHelpOpen, setScopeHelpOpen] = useState(false);
  const [briefOptions, setBriefOptions] = useState<string[]>([]);
  const [freeProjectRequested, setFreeProjectRequested] = useState(false);
  const previousBriefStep = useRef(0);
  const [briefSummary, setBriefSummary] = useState({ pageUrl: '', message: '' });
  const briefFormRef = useRef<HTMLFormElement | null>(null);
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [estimatorStarted, setEstimatorStarted] = useState(false);
  const [projectBrief, setProjectBrief] = useState<ProjectBrief | null>(null);
  const [referenceProject, setReferenceProject] = useState<Project | null>(null);
  const referenceFocusPending = useRef(false);
  const invalidFieldFocus = useRef<LeadFieldElement | null>(null);
  const [attribution] = useState(captureSessionAttribution);
  const formStartTracked = useRef(false);
  const formViewTracked = useRef(false);
  const funnelViewTracked = useRef(false);
  const estimatorToggleRef = useRef<HTMLButtonElement | null>(null);
  const contactSectionRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [contactAreaVisible, setContactAreaVisible] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  useLayoutEffect(() => {
    if (previousBriefStep.current === briefStep && !referenceFocusPending.current) return;
    previousBriefStep.current = briefStep;
    referenceFocusPending.current = false;
    const heading = briefFormRef.current?.querySelector<HTMLElement>(
      `[data-brief-step="${briefStep}"] [data-step-heading]`,
    );
    const target = invalidFieldFocus.current ?? heading;
    invalidFieldFocus.current = null;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [briefStep, referenceProject]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let frame = 0;

    const keepActiveFieldVisible = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const input = document.activeElement;
        if (
          !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) ||
          !contactSectionRef.current?.contains(input) ||
          !window.matchMedia('(max-width: 720px)').matches ||
          viewport.scale !== 1
        ) {
          return;
        }
        const box = input.getBoundingClientRect();
        const headerBottom =
          document.querySelector('.cf-header')?.getBoundingClientRect().bottom ?? 0;
        const top = Math.max(viewport.offsetTop, headerBottom) + 8;
        const bottom = viewport.offsetTop + viewport.height - 8;
        // Let the browser keep the caret visible if a field exceeds the available height.
        if (box.height > bottom - top) return;
        const delta = box.bottom > bottom ? box.bottom - bottom : box.top < top ? box.top - top : 0;
        if (delta) window.scrollBy({ top: delta, behavior: 'instant' });
      });
    };

    viewport.addEventListener('resize', keepActiveFieldVisible);
    return () => {
      viewport.removeEventListener('resize', keepActiveFieldVisible);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // The static page is replaced when this lazy route mounts. Restore the anchor
    // against the final layout so links from portfolio and guides reach their target.
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      if (hash === '#contact') {
        focusContact(target, 'auto');
      } else {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    // Resolve deferred section heights before a visitor reaches the brief.
    // Otherwise focusing the first tile can move the next pointer target.
    const layoutObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLayoutReady(true);
          layoutObserver.disconnect();
        }
      },
      { rootMargin: '1200px 0px' },
    );
    if (contactSectionRef.current) layoutObserver.observe(contactSectionRef.current);

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
    return () => {
      observer.disconnect();
      layoutObserver.disconnect();
    };
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
      trackMeasurementEvent(eventName, {
        event_category: 'homepage_funnel',
        page_path: '/',
        ...parameters,
      });
    },
    [selectedService],
  );

  function chooseService(service: string, placement?: string) {
    if (formState === 'submitting') return;
    setFreeProjectRequested(false);
    setReferenceProject(null);
    setProjectBrief(null);
    setBriefStep(0);
    setBriefError('');
    setBriefOptions([]);
    setScopeHelpOpen(false);
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

  function chooseHeroService(service: string, placement: string) {
    if (formState === 'submitting') return;
    chooseService(service, placement);
  }

  function handleContactLink(event: MouseEvent<HTMLDivElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    if (formState === 'submitting' || !(event.target instanceof Element)) return;
    if (!event.target.closest('a[href="#contact"]')) return;
    // Preserve each link's service selection, tracking and native URL fragment.
    window.requestAnimationFrame(() => {
      focusContact(
        contactSectionRef.current,
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      );
    });
  }

  function openEstimator() {
    setEstimatorStarted(true);
    setEstimatorOpen(true);
    window.requestAnimationFrame(() => {
      const toggle = estimatorToggleRef.current;
      toggle?.closest('#kalkulator')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
      toggle?.focus({ preventScroll: true });
    });
  }

  function useProjectBrief(project: ProjectBrief) {
    if (formState === 'submitting') return;
    chooseService(project.service, 'estimator_contact');
    setProjectBrief(project);
    window.requestAnimationFrame(() => {
      focusContact(
        contactSectionRef.current,
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      );
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

  function useProjectReference(project: Project) {
    if (formState === 'submitting') return;
    if (selectedService !== businessSiteService) chooseService(businessSiteService);
    referenceFocusPending.current = true;
    setReferenceProject({ ...project });
    setBriefStep(1);
    setFormMessage('');
    setFormState('idle');
    trackHomepageEvent('homepage_cta_click', {
      placement: 'project_preview',
      service: businessSiteService,
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
    selectedService === agencyService ||
    selectedService === appService;

  const messagePlaceholder =
    guidance?.placeholder || 'Krótko opisz problem, zakres albo oczekiwany efekt.';
  const scopeText = briefOptions.length ? `Wybrany zakres: ${briefOptions.join(', ')}.` : '';
  const referenceText = referenceProject
    ? `Punkt odniesienia: ${referenceProject.title} — https://codefix.it/realizacje/${referenceProject.slug}/`
    : '';
  const supplementText = [
    scopeText,
    referenceText,
    freeProjectRequested ? freeProject.requestLabel : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  const serviceLabel = briefServices.find(([value]) => value === selectedService)?.[1] ?? '';
  const messageLimit = Math.max(
    0,
    4000 -
      (projectBrief ? projectBrief.brief.length + 2 : 0) -
      (supplementText ? supplementText.length + 2 : 0),
  );

  function toggleBriefOption(option: string) {
    setBriefOptions((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  function briefMessage(description: string) {
    return mergeProjectBrief(
      [description.trim(), supplementText].filter(Boolean).join('\n\n'),
      projectBrief,
    );
  }

  function goToBriefStep(step: number) {
    const form = briefFormRef.current;
    if (step === 2 && form) {
      const data = new FormData(form);
      setBriefSummary({
        pageUrl: String(data.get('pageUrl') ?? ''),
        message: String(data.get('message') ?? ''),
      });
    }
    setBriefStep(step);
  }

  function validateBriefStep(step: number) {
    if (step === 0 && !selectedService) {
      setBriefError('Wybierz temat, aby przejść dalej.');
      briefFormRef.current?.querySelector<HTMLButtonElement>('.cf-brief-choices button')?.focus();
      return false;
    }
    const fields = briefFormRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      `[data-brief-step="${step}"] input, [data-brief-step="${step}"] textarea`,
    );
    for (const field of fields ?? []) {
      leadFieldError(field);
      if (!field.checkValidity()) {
        if (briefStep !== step) {
          invalidFieldFocus.current = field;
          goToBriefStep(step);
        } else field.focus();
        return false;
      }
    }
    return true;
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState === 'submitting') return;

    const form = event.currentTarget;
    if (!validateBriefStep(briefStep)) return;
    if (briefStep < 2) {
      goToBriefStep(briefStep + 1);
      return;
    }
    for (const step of [0, 1]) {
      if (!validateBriefStep(step)) return;
    }
    const journey = readConversionJourney();
    const data = new FormData(form);
    const service = selectedService;
    const message = briefMessage(String(data.get('message') ?? ''));
    if (message.length > 4000) {
      setFormState('error');
      setFormMessage(
        'Opis i dołączony zakres mogą mieć łącznie maksymalnie 4000 znaków. Skróć opis lub zmniejsz zakres.',
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
          ...journey,
          ...readFunnelPayload(service),
        }),
      });

      const result = await readLeadResponse(response);

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się wysłać formularza.');
      }

      if (result.duplicate) {
        trackFunnelEvent('cf_duplicate_submit', {
          service: service || 'not_selected',
        });
      } else if (result.leadId) {
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
          trackMeasurementEvent('generate_lead', {
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
      clearConversionJourney();
      setProjectBrief(null);
      setReferenceProject(null);
      if (!result.duplicate) clearFunnelSession();
      setSelectedService('');
      setBriefStep(0);
      setBriefSummary({ pageUrl: '', message: '' });
      setBriefOptions([]);
      setFreeProjectRequested(false);
      setScopeHelpOpen(false);
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
      className={`homepage-v1 has-mobile-cta${contactAreaVisible ? ' cf-contact-in-view' : ''}${layoutReady ? ' cf-layout-ready' : ''}`}
      onClick={handleContactLink}
      onFocusCapture={() => setLayoutReady(true)}
    >
      <header className="cf-header">
        <div className="cf-container cf-nav cf-nav-with-menu">
          <Brand href="#top" />

          <nav className="cf-nav-links" aria-label="Główna nawigacja">
            {homepageContent.navigation.map(({ href, label }) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <MobileNavigation />

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
        <HeroExperience>
          <div className="cf-hero-copy">
            <div className="cf-eyebrow">
              <span className="cf-eyebrow-dot" />
              {homepageContent.hero.eyebrow}
            </div>

            <h1 className="cf-title">
              {homepageContent.hero.title}
              <span className="cf-title-muted">{homepageContent.hero.accent}</span>
            </h1>

            <p className="cf-lead">{homepageContent.hero.description}</p>

            <div className="cf-actions">
              <a
                href="#contact"
                className="cf-button cf-button-primary"
                onClick={() =>
                  trackHomepageEvent('homepage_cta_click', { placement: 'hero_primary_generic' })
                }
              >
                Opisz temat
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="cf-button cf-button-secondary"
                aria-label="Kalkulator WordPress"
                onClick={openEstimator}
              >
                Kalkulator <span className="cf-action-scope">WordPress</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className="cf-hero-paths" aria-labelledby="cf-hero-paths-title">
            <h2 id="cf-hero-paths-title">Czego potrzebujesz?</h2>

            <HeroServicePicker onChoose={chooseHeroService} disabled={formState === 'submitting'} />
            <a
              href="/dla-agencji-wordpress/"
              className="cf-mini-audit-link cf-hero-agency-link"
              onClick={() =>
                trackHomepageEvent('homepage_cta_click', { placement: 'hero_agency_landing' })
              }
            >
              Dla agencji: współpraca white-label
              <ArrowRight size={14} aria-hidden="true" />
            </a>
            <HeroEmblem />
          </aside>

          <div className="cf-hero-followup">
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
        </HeroExperience>

        <section id="services" className="cf-section cf-section-bordered">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Usługi</p>
                <h2 className="cf-section-heading">Strony i wsparcie WordPress.</h2>
              </div>
              <p className="cf-section-sidecopy">Nowa strona, szybka naprawa lub stała opieka.</p>
            </div>

            <div className="cf-services-grid">
              {services.map(
                ({ title, description, meta, price, service, cta, detailsHref, detailsLabel }) => {
                  const artwork = `/graphics/${service}`;
                  return (
                    <article
                      key={title}
                      className={`cf-service-card${service === quickFixService ? ' cf-service-card-featured' : ''}`}
                    >
                      {service === businessSiteService && (
                        <span className="cf-service-badge">Nowa strona</span>
                      )}
                      <img
                        className="cf-service-art"
                        src={`${artwork}-720.webp`}
                        srcSet={`${artwork}-360.webp 360w, ${artwork}-720.webp 720w`}
                        sizes="(min-width: 801px) 350px, 85vw"
                        width={720}
                        height={480}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <h3>{title}</h3>
                      <p>{description}</p>
                      <p className="cf-service-price">{price}</p>
                      {service !== businessSiteService && (
                        <p className="cf-service-pricing-note">
                          Zakres i cenę potwierdzam przed startem.
                        </p>
                      )}
                      <p className="cf-service-meta">{meta}</p>
                      <div className="cf-service-card-actions">
                        <a href={detailsHref} className="cf-card-link cf-card-link-secondary">
                          {detailsLabel}
                          <ArrowRight size={15} aria-hidden="true" />
                        </a>
                        <a
                          href="#contact"
                          className="cf-card-link"
                          onClick={() => chooseService(service, 'service_card')}
                        >
                          {cta}
                          <ArrowRight size={15} aria-hidden="true" />
                        </a>
                      </div>
                      {service === businessSiteService && (
                        <div className="cf-service-proof">
                          <a
                            href="https://demo.codefix.it/"
                            target="_blank"
                            rel="noreferrer"
                            className="cf-card-link cf-card-link-secondary"
                          >
                            Zobacz demo
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </a>
                          <small>Własne demo techniczne CodeFix.IT.</small>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
            <aside
              id="free-project"
              className="cf-free-project"
              aria-labelledby="cf-free-project-title"
            >
              <div>
                <h3 id="cf-free-project-title">{freeProject.title}</h3>
                <p>{freeProject.description}</p>
              </div>
              <a
                href="#contact"
                className="cf-button cf-button-secondary"
                onClick={(event) => {
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  if (formState === 'submitting') {
                    event.preventDefault();
                    return;
                  }
                  chooseService('other', 'free_project');
                  setFreeProjectRequested(true);
                  setBriefStep(1);
                }}
              >
                {freeProject.cta}
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </aside>
            <div id="kalkulator" className="cf-estimator-entry">
              <button
                ref={estimatorToggleRef}
                type="button"
                className="cf-button cf-button-secondary"
                aria-expanded={estimatorOpen}
                aria-controls="cf-project-estimator"
                onClick={() => {
                  setEstimatorStarted(true);
                  setEstimatorOpen((current) => !current);
                }}
              >
                {estimatorOpen ? 'Zwiń kalkulator' : 'Otwórz kalkulator WordPress'}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
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

        <section id="agencies" className="cf-agency-strip" aria-labelledby="cf-agency-title">
          <div className="cf-container cf-revenue-strip-inner cf-agency-strip-inner">
            <div className="cf-agency-copy">
              <p className="cf-section-kicker">Dla agencji / white-label</p>
              <h2 id="cf-agency-title">Potrzebujesz wsparcia przy WordPressie?</h2>
              <p>WordPress, ACF PRO i WooCommerce. Pracuję na stagingu i Git, także white-label.</p>
              <div
                className="cf-revenue-proof cf-agency-tags"
                aria-label="Zakres współpracy agencyjnej"
              >
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
                onClick={() =>
                  trackHomepageEvent('homepage_cta_click', { placement: 'agency_strip_landing' })
                }
              >
                Zobacz współpracę white-label
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="cf-card-link cf-card-link-secondary"
                onClick={() => chooseService(agencyService, 'agency_strip_contact')}
              >
                Zleć zadanie
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="applications"
          className="cf-section cf-fit-section"
          aria-labelledby="cf-fit-title"
        >
          <div className="cf-container cf-fit-layout">
            <div className="cf-fit-copy">
              <p className="cf-section-kicker">{homepageContent.application.kicker}</p>
              <h2 id="cf-fit-title" className="cf-section-heading">
                {homepageContent.application.title}
              </h2>
              <p>{homepageContent.application.description}</p>
              <a
                href="#contact"
                className="cf-card-link"
                onClick={() => chooseService(appService, 'application_section')}
              >
                {homepageContent.application.cta}
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <Suspense fallback={<p role="status">Ładuję demo…</p>}>
              <AutomationDemo />
            </Suspense>
          </div>
        </section>

        <section id="work" className="cf-section cf-work-section">
          <div className="cf-container">
            <div className="cf-work-heading-row">
              <div>
                <p className="cf-section-kicker">Wybrane projekty</p>
                <h2 className="cf-section-heading">Wybrane wdrożenia CodeFix.IT.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Szczegóły i zakres prac znajdziesz w case studies.{' '}
                <a href="/realizacje/">Zobacz wszystkie realizacje</a>.
              </p>
            </div>

            <div className="cf-proof-facts" aria-label="Weryfikowalne informacje o realizacjach">
              <div className="cf-proof-fact">
                <strong>{featuredProjects.length}</strong>
                <span>opisane realizacje</span>
              </div>
              <div className="cf-proof-fact">
                <strong>
                  {publicProjectCount}/{featuredProjects.length}
                </strong>
                <span>publiczne adresy stron</span>
              </div>
              <div className="cf-proof-fact">
                <strong>WordPress + ACF PRO</strong>
                <span>w każdym pokazanym wdrożeniu</span>
              </div>
              <div className="cf-proof-fact">
                <strong>{agencyCollaborationCount > 0 ? 'Tak' : '—'}</strong>
                <span>opisany projekt agencyjny</span>
              </div>
            </div>

            <ProjectPreviewGroup onEnquire={useProjectReference}>
              <div className="cf-projects-grid">
                {featuredProjects.map((project) => (
                  <article key={project.id} className="cf-project-card">
                    <ProjectPreview project={project} />

                    <div className="cf-project-topline">
                      <span>{project.year}</span>
                      <span>
                        {project.collaboration ? 'Współpraca agencyjna' : 'Strona firmowa'}
                      </span>
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
                      <a href={`/realizacje/${project.slug}/`} className="cf-project-link">
                        Case study
                        <ArrowRight size={16} aria-hidden="true" />
                      </a>
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cf-project-live-link"
                      >
                        Zobacz stronę
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </ProjectPreviewGroup>
          </div>
        </section>

        <section className="cf-revenue-strip" aria-labelledby="cf-revenue-strip-title">
          <div className="cf-container cf-revenue-strip-inner">
            <div>
              <p className="cf-section-kicker">Szybki start</p>
              <h2 id="cf-revenue-strip-title">Nie wiesz, od czego zacząć?</h2>
              <p>Podeślij adres strony. Sprawdzę trzy podstawowe punkty i wskażę kolejny krok.</p>
            </div>
            <div className="cf-revenue-action">
              <div className="cf-revenue-proof" aria-label="Zakres mini-oceny">
                <span>bez loginu</span>
                <span>3 punkty</span>
                <span>krótka odpowiedź</span>
              </div>
              <a
                href="#contact"
                className="cf-button cf-button-primary"
                onClick={() => chooseService(miniAuditService, 'revenue_strip')}
              >
                Poproś o mini-ocenę
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="cf-section cf-why-section"
          aria-labelledby="cf-about-heading"
        >
          <div className="cf-container cf-why-layout">
            <div className="cf-why-intro">
              <p className="cf-section-kicker">{homepageContent.about.kicker}</p>
              <h2 id="cf-about-heading" className="cf-section-heading">
                {homepageContent.about.title}
              </h2>
              <p>{homepageContent.about.description}</p>
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
              <h2 className="cf-section-heading">Od wiadomości do wdrożenia.</h2>
              <p>Wybierz etap i zobacz, jak wygląda współpraca.</p>
            </div>

            <ol className="cf-process-grid" aria-label="Etapy współpracy">
              {process.map((item, index) => (
                <li key={item.title}>
                  <details className="cf-process-card" name="codefix-process">
                    <summary>
                      <span className="cf-process-number" aria-hidden="true">
                        0{index + 1}
                      </span>
                      <ChevronDown size={18} aria-hidden="true" />
                      <h3>{item.title}</h3>
                    </summary>
                    <dl>
                      <div>
                        <dt>Otrzymujesz</dt>
                        <dd>{item.receive}</dd>
                      </div>
                      <div>
                        <dt>Twoja część</dt>
                        <dd>{item.provide}</dd>
                      </div>
                    </dl>
                  </details>
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
                <h2 className="cf-section-heading">Przed pierwszym zleceniem.</h2>
              </div>
              <p className="cf-section-sidecopy">Koszty, terminy i zasady współpracy.</p>
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
              <p className="cf-section-kicker">Sprawdź przed kontaktem</p>
              <h2 id="cf-trust-strip-title">Zobacz działające realizacje.</h2>
              <p>Trzy publiczne wdrożenia i opisany projekt we współpracy z SyloSoftware.</p>
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
                onClick={() =>
                  trackHomepageEvent('homepage_cta_click', { placement: 'trust_strip_contact' })
                }
              >
                Opisz temat
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="/realizacje/kancelaria-adwokacka-witkowska/"
                className="cf-card-link cf-card-link-secondary"
                onClick={() =>
                  trackHomepageEvent('homepage_proof_click', {
                    placement: 'trust_strip_agency_case',
                  })
                }
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
                <h2>Opisz temat. Ustalmy kolejny krok.</h2>
                <p>Kilka zdań i adres strony wystarczą na początek.</p>
              </div>

              <div className="cf-contact-action">
                <div className="cf-contact-status">
                  <span className="cf-eyebrow-dot" />
                  Odpowiedź zwykle do 1 dnia roboczego
                </div>

                <form
                  className="cf-lead-form"
                  ref={briefFormRef}
                  noValidate
                  onSubmit={handleLeadSubmit}
                  onFocusCapture={handleFormStart}
                >
                  <ol className="cf-brief-progress" role="list" aria-label="Etapy zapytania">
                    {['Temat', 'Szczegóły', 'Kontakt'].map((label, index) => (
                      <li
                        key={label}
                        aria-current={briefStep === index ? 'step' : undefined}
                        data-complete={index < briefStep || undefined}
                      >
                        {label}
                      </li>
                    ))}
                  </ol>
                  <p className="cf-brief-step-count" role="status">
                    Krok {briefStep + 1} z 3
                  </p>
                  <fieldset disabled={formState === 'submitting'} aria-label="Dane zapytania">
                    <div data-brief-step="0" hidden={briefStep !== 0}>
                      <h3 tabIndex={-1} data-step-heading>
                        Czego potrzebujesz?
                      </h3>
                      <p>Wybierz temat. Dopasuję kolejne pytania.</p>
                      <div
                        className="cf-brief-choices cf-topic-list"
                        role="group"
                        aria-label="Wybierz temat"
                      >
                        {briefServices.map(([value, label, hint]) => (
                          <button
                            key={value}
                            type="button"
                            aria-label={label}
                            aria-describedby={
                              selectedService === value ? 'cf-topic-hint' : undefined
                            }
                            aria-pressed={selectedService === value}
                            onClick={() => {
                              if (selectedService !== value) chooseService(value);
                            }}
                          >
                            <span>{label}</span>
                            {selectedService === value && <small id="cf-topic-hint">{hint}</small>}
                            {selectedService === value ? (
                              <CheckCircle2 size={18} aria-hidden="true" />
                            ) : (
                              <ArrowRight size={16} aria-hidden="true" />
                            )}
                          </button>
                        ))}
                      </div>
                      <input type="hidden" name="service" value={selectedService} />
                      {briefError && <p role="alert">{briefError}</p>}
                    </div>
                    <div data-brief-step="1" hidden={briefStep !== 1}>
                      <h3 tabIndex={-1} data-step-heading>
                        Co trzeba zrobić?
                      </h3>
                      {selectedService === 'other' && (
                        <label className="cf-free-project-choice">
                          <input
                            type="checkbox"
                            checked={freeProjectRequested}
                            onChange={(event) =>
                              setFreeProjectRequested(event.currentTarget.checked)
                            }
                          />
                          <span>{freeProject.checkboxLabel}</span>
                        </label>
                      )}
                      {guidance && (
                        <p className="cf-quickfix-selection" role="status">
                          {guidance.hint}
                        </p>
                      )}

                      {referenceProject && (
                        <ProjectReference
                          project={referenceProject}
                          onRemove={() => setReferenceProject(null)}
                        />
                      )}

                      <details
                        className="cf-brief-help"
                        open={scopeHelpOpen}
                        onToggle={(event) => setScopeHelpOpen(event.currentTarget.open)}
                      >
                        <summary>
                          Pomóż mi wybrać zakres <small>opcjonalnie</small>
                        </summary>
                        <p>Zaznacz pasujące elementy. Dołączę je do podsumowania zapytania.</p>
                        {scopeHelpOpen && (
                          <Suspense fallback={<p role="status">Ładuję podpowiedzi…</p>}>
                            <BriefScopePicker
                              service={selectedService}
                              selected={briefOptions}
                              onToggle={toggleBriefOption}
                            />
                          </Suspense>
                        )}
                      </details>

                      <LeadField
                        label="Adres strony"
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

                      <LeadField
                        label={projectBrief ? 'Dodatkowe informacje' : 'Co trzeba zrobić?'}
                        name="message"
                        rows={5}
                        minLength={projectBrief ? undefined : 10}
                        maxLength={messageLimit}
                        placeholder={messagePlaceholder}
                        required={!projectBrief}
                      />
                    </div>
                    <div data-brief-step="2" hidden={briefStep !== 2}>
                      <h3 tabIndex={-1} data-step-heading>
                        Kontakt i podsumowanie
                      </h3>
                      <div
                        className="cf-brief-summary"
                        role="group"
                        aria-label="Podsumowanie zapytania"
                      >
                        <strong>{serviceLabel}</strong>
                        {briefSummary.pageUrl && <p>{briefSummary.pageUrl}</p>}
                        <p>{briefSummary.message}</p>
                        {scopeText && <p className="cf-brief-scope">{scopeText}</p>}
                        {freeProjectRequested && <p>{freeProject.requestLabel}</p>}
                        {projectBrief && <p>Zakres z kalkulatora dołączony.</p>}
                        {referenceProject && (
                          <ProjectReference
                            project={referenceProject}
                            onRemove={() => setReferenceProject(null)}
                          />
                        )}
                        {briefStep === 2 && (
                          <div className="cf-brief-copy">
                            <Suspense fallback={null}>
                              <BriefCopy
                                service={serviceLabel}
                                pageUrl={briefSummary.pageUrl}
                                message={briefMessage(briefSummary.message)}
                              />
                            </Suspense>
                          </div>
                        )}
                        <div className="cf-brief-review-actions">
                          <button type="button" onClick={() => goToBriefStep(0)}>
                            Zmień temat
                          </button>
                          <button type="button" onClick={() => goToBriefStep(1)}>
                            Popraw opis
                          </button>
                        </div>
                      </div>
                      <div className="cf-form-row">
                        <LeadField
                          label="Imię / osoba kontaktowa"
                          name="name"
                          type="text"
                          autoComplete="name"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          minLength={2}
                          maxLength={120}
                          required
                        />
                        <LeadField
                          label="E-mail"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          enterKeyHint="next"
                          maxLength={254}
                          required
                        />
                      </div>

                      {showCompanyField && (
                        <LeadField
                          label={
                            selectedService === agencyService ? 'Nazwa agencji / firmy' : 'Firma'
                          }
                          name="company"
                          type="text"
                          autoComplete="organization"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          maxLength={160}
                        />
                      )}
                    </div>
                    <label className="cf-form-honeypot" aria-hidden="true">
                      <span>Strona firmy</span>
                      <input name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
                    </label>

                    <div className="cf-brief-actions">
                      {briefStep > 0 && (
                        <button
                          type="button"
                          className="cf-button"
                          onClick={() => goToBriefStep(briefStep - 1)}
                        >
                          Wstecz
                        </button>
                      )}
                      <button
                        type="submit"
                        className="cf-button cf-button-primary cf-contact-button"
                        disabled={formState === 'submitting'}
                      >
                        {formState === 'submitting'
                          ? 'Wysyłam…'
                          : briefStep < 2
                            ? 'Dalej'
                            : submitButtonLabel}
                        {formState !== 'submitting' && <ArrowRight size={17} aria-hidden="true" />}
                      </button>
                    </div>
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
                    Prace zaczynam po akceptacji zakresu i ceny. Na początek wystarczy opis, bez
                    haseł.
                  </p>

                  <p className="cf-form-privacy">
                    Wysyłając formularz, przekazujesz dane potrzebne do obsługi zapytania. Szczegóły
                    znajdziesz w <a href="/polityka-prywatnosci/">polityce prywatności</a>.
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
              Strony i aplikacje tworzone z wykorzystaniem AI. WordPress i wsparcie dla firm oraz
              agencji.
            </p>
          </div>

          <nav className="cf-footer-nav" aria-label="Nawigacja w stopce">
            <a href="#services">Usługi</a>
            <a href="#work">Realizacje</a>
            <a href="#about">O mnie</a>
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
            <button
              className="cf-consent-settings"
              type="button"
              onClick={(event) => {
                // Safari pointer clicks do not focus buttons automatically.
                event.currentTarget.focus({ preventScroll: true });
                openMeasurementSettings();
              }}
            >
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
