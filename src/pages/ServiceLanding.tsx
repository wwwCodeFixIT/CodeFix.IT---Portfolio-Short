import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileCode2,
  LifeBuoy,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

import { projects } from '../data/projects';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './ServiceLanding.css';

type ServiceKey = 'WORDPRESS_QUICK_FIX' | 'WORDPRESS_CARE' | 'CODEFIX_BUSINESS_SITE';

type ServiceLandingConfig = {
  path: string;
  service: ServiceKey;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  price: string;
  pricingNote: string;
  cta: string;
  secondaryCta: string;
  heroPoints: string[];
  problemHeading: string;
  problems: { title: string; description: string }[];
  scopeHeading: string;
  scopeIntro: string;
  scope: string[];
  process: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  contactHeading: string;
  contactCopy: string;
  messagePlaceholder: string;
  pageUrlRequired: boolean;
  demoUrl?: string;
};

const contactEmail = 'wwwcodefixit@gmail.com';
const leadApiUrl = 'https://app.codefix.it/api/public/leads';

export const serviceLandings: Record<string, ServiceLandingConfig> = {
  '/naprawa-wordpress': {
    path: '/naprawa-wordpress',
    service: 'WORDPRESS_QUICK_FIX',
    eyebrow: 'WordPress Quick Fix',
    title: 'Naprawa WordPress',
    titleAccent: 'bez przebudowy całej strony.',
    description:
      'Masz konkretny błąd po aktualizacji, niedziałający formularz, problem z WooCommerce albo rozsypany widok? Najpierw diagnozuję przyczynę, potem ustalam zamknięty zakres naprawy i testuję efekt.',
    metaTitle: 'Naprawa WordPress – błędy, formularze, WooCommerce | CodeFix.IT',
    metaDescription:
      'Naprawa błędów WordPress, formularzy, WooCommerce, CSS i problemów po aktualizacjach. Quick Fix od 390 zł, zakres potwierdzany przed startem.',
    price: 'Od 390 zł',
    pricingNote:
      'Cena orientacyjna dla jednego, jasno zdefiniowanego problemu. Po diagnozie potwierdzam zakres i kwotę przed rozpoczęciem prac.',
    cta: 'Zgłoś problem WordPress',
    secondaryCta: 'Zobacz przykładowy zakres',
    heroPoints: ['Jeden konkretny problem', 'Diagnoza przed zmianą', 'Test po wdrożeniu'],
    problemHeading: 'Typowe problemy, które da się zamknąć jako Quick Fix.',
    problems: [
      {
        title: 'Błąd po aktualizacji',
        description:
          'Konflikt wtyczki, motywu, PHP lub zmiana zachowania strony po aktualizacji WordPressa.',
      },
      {
        title: 'Formularz nie wysyła',
        description:
          'Contact Form 7, SMTP, walidacja, komunikaty błędów, przekierowania i zachowanie formularza na mobile.',
      },
      {
        title: 'WooCommerce lub koszyk',
        description:
          'Drobne błędy widoku, checkoutu, przycisków, szablonów i integracji w istniejącym sklepie.',
      },
      {
        title: 'CSS / mobile / layout',
        description:
          'Rozjechane sekcje, elementy wychodzące poza ekran, błędy responsywności i wizualne regresje.',
      },
      {
        title: 'PHP / warning / 500',
        description:
          'Widoczne warningi, błędy serwera i problemy w motywie lub kodzie, które można odtworzyć i zdiagnozować.',
      },
      {
        title: 'Wydajność konkretnej podstrony',
        description:
          'Ciężkie obrazy, blokujące zasoby albo konkretny problem wpływający na Core Web Vitals.',
      },
    ],
    scopeHeading: 'Co obejmuje pojedyncza naprawa.',
    scopeIntro:
      'Quick Fix ma być małym, kontrolowanym zleceniem. Jeśli diagnoza pokaże większy problem, najpierw dostaniesz informację i osobną propozycję zakresu.',
    scope: [
      'Sprawdzenie objawu i próba odtworzenia problemu.',
      'Diagnoza najbardziej prawdopodobnej przyczyny.',
      'Jedna uzgodniona naprawa lub mały zestaw ściśle powiązanych zmian.',
      'Test działania po wdrożeniu na desktopie i telefonie, jeśli dotyczy.',
      'Krótka informacja, co zostało zmienione i czy widzę dalsze ryzyka.',
    ],
    process: [
      {
        title: '1. Podeślij URL i objaw',
        description: 'Najlepiej opisz, co nie działa, od kiedy i czy problem pojawił się po konkretnej zmianie.',
      },
      {
        title: '2. Ustalam zakres',
        description: 'Potwierdzam, czy temat mieści się w Quick Fixie, oraz podaję cenę przed rozpoczęciem.',
      },
      {
        title: '3. Naprawiam i testuję',
        description: 'Wprowadzam uzgodnioną zmianę i sprawdzam, czy problem został faktycznie rozwiązany.',
      },
    ],
    faq: [
      {
        question: 'Czy 390 zł to stała cena każdej naprawy?',
        answer:
          'Nie. To cena startowa dla małego, jasno zdefiniowanego problemu. Jeśli temat wymaga większej ingerencji, przed rozpoczęciem dostaniesz osobny zakres i wycenę.',
      },
      {
        question: 'Czy potrzebujesz od razu loginu do WordPressa?',
        answer:
          'Nie zawsze. Na początku wystarczy publiczny adres strony i opis problemu. Dostęp proszę dopiero wtedy, gdy jest potrzebny do diagnozy lub wdrożenia.',
      },
      {
        question: 'Czy naprawiasz Elementor i Contact Form 7?',
        answer:
          'Tak. Pracuję z WordPressem, Elementorem, ACF PRO, Contact Form 7, WooCommerce i niestandardowym front-endem.',
      },
      {
        question: 'Co jeśli problem okaże się większy?',
        answer:
          'Nie rozszerzam zakresu bez uzgodnienia. Zatrzymuję się po diagnozie i przedstawiam, co trzeba zrobić oraz ile będzie kosztował kolejny etap.',
      },
    ],
    contactHeading: 'Opisz jeden problem. Zacznijmy od diagnozy.',
    contactCopy:
      'Wklej adres strony i opisz objaw. Jeśli to temat na Quick Fix, dostaniesz konkretny zakres i cenę przed rozpoczęciem.',
    messagePlaceholder:
      'Np. po aktualizacji formularz przestał wysyłać wiadomości / na telefonie menu nachodzi na treść / na stronie produktu pojawia się błąd PHP.',
    pageUrlRequired: true,
  },
  '/opieka-wordpress': {
    path: '/opieka-wordpress',
    service: 'WORDPRESS_CARE',
    eyebrow: 'Opieka i rozwój WordPress',
    title: 'Stała opieka WordPress',
    titleAccent: 'bez szukania wykonawcy od zera.',
    description:
      'Aktualizacje, backupy, drobne poprawki i rozwój istniejącej strony w uzgodnionym miesięcznym zakresie. Masz jedną osobę, która zna serwis i może wracać do kolejnych zadań.',
    metaTitle: 'Opieka WordPress – aktualizacje, backupy i rozwój | CodeFix.IT',
    metaDescription:
      'Stała opieka nad WordPressem od 300 zł/mies.: aktualizacje, backupy, drobne poprawki i rozwój strony w uzgodnionym zakresie.',
    price: 'Od 300 zł / mies.',
    pricingNote:
      'Zakres abonamentu zależy od liczby stron, częstotliwości zmian, hostingu i oczekiwanego czasu reakcji.',
    cta: 'Zapytaj o opiekę',
    secondaryCta: 'Zobacz zakres opieki',
    heroPoints: ['Aktualizacje', 'Backupy', 'Drobne poprawki i rozwój'],
    problemHeading: 'Kiedy stała opieka ma więcej sensu niż pojedyncze zlecenia.',
    problems: [
      {
        title: 'Strona wymaga regularnych aktualizacji',
        description:
          'WordPress, motyw i wtyczki trzeba aktualizować, ale chcesz robić to z kontrolą i możliwością reakcji po zmianie.',
      },
      {
        title: 'Co miesiąc pojawiają się drobne zmiany',
        description:
          'Nowa sekcja, podmiana treści, poprawka formularza, CSS, integracja albo niewielka zmiana funkcjonalna.',
      },
      {
        title: 'Nie chcesz szukać wykonawcy przy każdej awarii',
        description:
          'Stała współpraca skraca wejście w temat, bo znam już środowisko, hosting i sposób działania strony.',
      },
      {
        title: 'Potrzebujesz kontroli backupów',
        description:
          'Regularne kopie i jasna informacja, gdzie są przechowywane oraz jak wygląda odtwarzanie w razie problemu.',
      },
      {
        title: 'Strona ma się rozwijać etapami',
        description:
          'Nie trzeba od razu robić redesignu. Możemy poprawiać serwis małymi, mierzalnymi krokami.',
      },
      {
        title: 'Chcesz technicznego punktu kontaktu',
        description:
          'Jedna osoba do WordPressa, hostingu, DNS, SSL, wydajności i typowych problemów strony firmowej.',
      },
    ],
    scopeHeading: 'Przykładowy miesięczny zakres.',
    scopeIntro:
      'Nie sprzedaję fikcyjnego „nielimitowanego supportu”. Przed startem ustalamy, co mieści się w abonamencie i jak rozliczamy większe zadania.',
    scope: [
      'Kontrolowane aktualizacje WordPressa, motywu i uzgodnionych wtyczek.',
      'Backup przed większymi zmianami i kontrola możliwości odtworzenia.',
      'Drobne poprawki front-endu, formularzy i treści technicznych.',
      'Pomoc przy DNS, SSL, Cloudflare i typowych problemach hostingowych.',
      'Podstawowa kontrola błędów i wydajności po zmianach.',
      'Lista większych tematów do osobnej wyceny, jeśli wychodzą poza abonament.',
    ],
    process: [
      {
        title: '1. Krótki przegląd obecnej strony',
        description: 'Ustalamy hosting, WordPress, krytyczne wtyczki, backupy i najczęstszy rodzaj zadań.',
      },
      {
        title: '2. Uzgadniamy miesięczny zakres',
        description: 'Potwierdzamy, co wchodzi do opieki, limit prac i sposób zgłaszania zmian.',
      },
      {
        title: '3. Pracujemy w stałym rytmie',
        description: 'Zmiany są dokumentowane, a większe zadania nie wchodzą do abonamentu bez osobnej zgody.',
      },
    ],
    faq: [
      {
        question: 'Co dokładnie obejmuje abonament od 300 zł?',
        answer:
          'Zakres ustalam indywidualnie. Przy prostym serwisie może obejmować aktualizacje, backup i niewielki miesięczny pakiet drobnych zmian. Większe lub częstsze potrzeby wymagają szerszego pakietu.',
      },
      {
        question: 'Czy opieka obejmuje awarie hostingu?',
        answer:
          'Mogę diagnozować problemy po stronie WordPressa, DNS, SSL i hostingu oraz współpracować z supportem dostawcy. Nie zastępuje to jednak SLA samej firmy hostingowej.',
      },
      {
        question: 'Czy mogę zlecać nowe sekcje i funkcje?',
        answer:
          'Tak. Małe zmiany mogą mieścić się w uzgodnionym pakiecie, a większe funkcje wyceniam osobno przed wdrożeniem.',
      },
      {
        question: 'Czy mogę zrezygnować ze stałej opieki?',
        answer:
          'Tak. Warunki współpracy i okres rozliczeniowy ustalamy przed startem, bez ukrywania zakresu czy kosztów.',
      },
    ],
    contactHeading: 'Pokaż obecną stronę i napisz, czego zwykle potrzebujesz.',
    contactCopy:
      'Na tej podstawie zaproponuję sensowny miesięczny zakres zamiast sprzedawać pakiet, którego nie wykorzystasz.',
    messagePlaceholder:
      'Np. zależy mi na aktualizacjach, backupach i 2–3 drobnych zmianach miesięcznie. Hosting: ..., WordPress: ...',
    pageUrlRequired: true,
  },
  '/strony-wordpress': {
    path: '/strony-wordpress',
    service: 'CODEFIX_BUSINESS_SITE',
    eyebrow: 'Strony firmowe WordPress + ACF PRO',
    title: 'Strona WordPress dla firmy',
    titleAccent: 'z wygodną edycją treści.',
    description:
      'Projektuję i wdrażam strony firmowe na WordPressie z ACF PRO, responsywnym front-endem, formularzem kontaktowym i technicznym SEO. Typowe treści edytujesz później z panelu bez grzebania w kodzie.',
    metaTitle: 'Strony WordPress dla firm + ACF PRO | CodeFix.IT',
    metaDescription:
      'Strony firmowe WordPress + ACF PRO: responsywny front-end, formularze, techniczne SEO, edytowalne sekcje i preview przed publikacją.',
    price: 'Wycena indywidualna',
    pricingNote:
      'Cena zależy od liczby podstron, zakresu projektu, treści, integracji i tego, czy startujemy od istniejącej strony.',
    cta: 'Wyceń stronę firmową',
    secondaryCta: 'Zobacz, co dostajesz',
    heroPoints: ['WordPress + ACF PRO', 'Mobile-first', 'Preview przed publikacją'],
    problemHeading: 'Dla firmy, która potrzebuje czegoś więcej niż gotowego szablonu.',
    problems: [
      {
        title: 'Nowa strona od zera',
        description:
          'Przejrzysta prezentacja oferty, usług, realizacji i kontaktu dopasowana do realnego procesu sprzedażowego firmy.',
      },
      {
        title: 'Przebudowa starej strony',
        description:
          'Możemy zachować wartościową treść i domenę, a zmienić strukturę, wygląd, mobile i sposób edycji.',
      },
      {
        title: 'Edycja przez ACF PRO',
        description:
          'Pola i sekcje są przygotowane tak, żeby typowe aktualizacje treści dało się robić bez modyfikowania kodu.',
      },
      {
        title: 'Formularze i kontakt',
        description:
          'Formularze, SMTP i logiczne CTA przygotowane tak, żeby zapytanie faktycznie docierało do firmy.',
      },
      {
        title: 'SEO techniczne',
        description:
          'Semantyczna struktura, metadata, sitemap, indeksacja i techniczne podstawy pod dalsze pozycjonowanie.',
      },
      {
        title: 'Wydajność i mobile',
        description:
          'Responsywny layout, optymalizacja zasobów i kontrola Core Web Vitals jako część wdrożenia.',
      },
    ],
    scopeHeading: 'Standard nowej strony firmowej.',
    scopeIntro:
      'Zakres dopasowuję do firmy, ale poniższe elementy traktuję jako bazę dobrego wdrożenia, a nie płatne dodatki do każdej drobnej rzeczy.',
    scope: [
      'Struktura strony i uzgodniony zestaw podstron / sekcji.',
      'Responsywny front-end przygotowany pod desktop i urządzenia mobilne.',
      'WordPress + ACF PRO do edycji uzgodnionych treści.',
      'Formularz kontaktowy z konfiguracją poprawnej dostarczalności.',
      'Techniczne SEO i podstawowe dane strukturalne.',
      'Preview przed większą publikacją oraz test kontaktu po wdrożeniu.',
    ],
    process: [
      {
        title: '1. Brief i zakres',
        description: 'Ustalamy cel strony, ofertę firmy, podstrony, materiały i to, co ma prowadzić użytkownika do kontaktu.',
      },
      {
        title: '2. Projekt i wdrożenie',
        description: 'Buduję front-end oraz edytowalne pola WordPress/ACF zgodnie z zaakceptowanym zakresem.',
      },
      {
        title: '3. Preview i publikacja',
        description: 'Najpierw oglądasz działającą wersję, potem poprawki, testy i publikacja na produkcji.',
      },
    ],
    faq: [
      {
        question: 'Czy dostanę gotowy motyw WordPress?',
        answer:
          'Przy wdrożeniu customowym przygotowuję motyw i strukturę dopasowaną do ustalonego projektu. Zakres techniczny zawsze opisuję przed rozpoczęciem prac.',
      },
      {
        question: 'Czy będę mógł sam zmieniać treści?',
        answer:
          'Tak. ACF PRO wykorzystuję właśnie po to, żeby uzgodnione teksty, obrazy, listy usług czy realizacje dało się edytować z panelu.',
      },
      {
        question: 'Czy wykonujesz także wersję mobilną?',
        answer:
          'Tak. Responsywność nie jest dodatkiem — strona jest projektowana i testowana również dla telefonów i tabletów.',
      },
      {
        question: 'Czy mogę zobaczyć przykład techniczny?',
        answer:
          'Tak. Na demo.codefix.it działa moje własne demo WordPress + ACF PRO. Jest oznaczone jako demo techniczne, a nie realizacja klienta.',
      },
    ],
    contactHeading: 'Opisz firmę i stronę, której potrzebujesz.',
    contactCopy:
      'Wystarczy krótki brief: czym zajmuje się firma, orientacyjna liczba podstron oraz informacja, czy masz już domenę, hosting, logo i teksty.',
    messagePlaceholder:
      'Np. firma instalacyjna, strona główna + usługi + realizacje + o nas + kontakt. Mam domenę i logo, teksty częściowo gotowe.',
    pageUrlRequired: false,
    demoUrl: 'https://demo.codefix.it/',
  },
};

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
        email: contactEmail,
      },
      {
        '@type': 'Service',
        name: config.eyebrow,
        provider: { '@id': 'https://codefix.it/#organization' },
        url: `https://codefix.it${config.path}`,
        serviceType: config.eyebrow,
        description: config.metaDescription,
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

function ServiceConsentBanner() {
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(() => {
    const value = (window as Window & { codefixConsentChoice?: string | null }).codefixConsentChoice;
    return value === 'accepted' || value === 'rejected' ? value : null;
  });
  const [open, setOpen] = useState(() => !choice);

  function save(nextChoice: 'accepted' | 'rejected') {
    (
      window as Window & {
        codefixSetAnalyticsConsent?: (choice: 'accepted' | 'rejected') => void;
      }
    ).codefixSetAnalyticsConsent?.(nextChoice);
    setChoice(nextChoice);
    setOpen(false);
  }

  return (
    <>
      {open && (
        <aside className="cf-consent-banner" aria-label="Ustawienia analityki">
          <div className="cf-consent-copy">
            <p className="cf-section-kicker">Prywatność</p>
            <h2>Analityka tylko za Twoją zgodą.</h2>
            <p>
              Google Analytics jest ładowane dopiero po akceptacji. Odrzucenie nie blokuje formularza ani strony.
              Szczegóły: <a href="/polityka-prywatnosci">polityka prywatności</a>.
            </p>
            {choice && (
              <p className="cf-consent-current">
                Aktualny wybór: {choice === 'accepted' ? 'analityka włączona' : 'analityka wyłączona'}.
              </p>
            )}
          </div>
          <div className="cf-consent-actions">
            <button type="button" className="cf-button cf-button-secondary" onClick={() => save('rejected')}>
              Odrzuć
            </button>
            <button type="button" className="cf-button cf-button-primary" onClick={() => save('accepted')}>
              Akceptuję analitykę
            </button>
          </div>
        </aside>
      )}
      {!open && (
        <button type="button" className="cf-service-consent-shortcut" onClick={() => setOpen(true)}>
          Ustawienia analityki
        </button>
      )}
    </>
  );
}

export function ServiceLanding({ config }: { config: ServiceLandingConfig }) {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [attribution] = useState(() => {
    const url = new URL(window.location.href);
    let referrerOrigin = '';

    if (document.referrer) {
      try {
        referrerOrigin = new URL(document.referrer).origin;
      } catch {
        referrerOrigin = '';
      }
    }

    const pick = (key: string) => (url.searchParams.get(key) ?? '').slice(0, 160);
    return {
      landingPath: url.pathname.slice(0, 240),
      referrerOrigin: referrerOrigin.slice(0, 240),
      utmSource: pick('utm_source'),
      utmMedium: pick('utm_medium'),
      utmCampaign: pick('utm_campaign'),
      utmContent: pick('utm_content'),
      utmTerm: pick('utm_term'),
    };
  });

  useEffect(() => {
    document.title = config.metaTitle;
    setMeta('meta[name="description"]', 'content', config.metaDescription);
    setMeta('link[rel="canonical"]', 'href', `https://codefix.it${config.path}`);
    setMeta('meta[property="og:url"]', 'content', `https://codefix.it${config.path}`);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setFormState('submitting');
    setFormMessage('');

    try {
      const response = await fetch(leadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          service: config.service,
          pageUrl: data.get('pageUrl'),
          message: data.get('message'),
          companyWebsite: data.get('companyWebsite'),
          startedAt: formStartedAt,
          ...attribution,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Nie udało się wysłać formularza.');

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
        });
      }

      form.reset();
      setFormStartedAt(Date.now());
      setFormState('success');
      setFormMessage('Dzięki — zapytanie trafiło do CodeFix.IT. Odpowiem po krótkiej analizie tematu.');
    } catch (error) {
      setFormState('error');
      setFormMessage(error instanceof Error ? error.message : 'Nie udało się wysłać formularza.');
    }
  }

  const related = Object.values(serviceLandings).filter((item) => item.path !== config.path);

  return (
    <div className="homepage-v1 service-landing">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <a href="/" className="cf-brand" aria-label="CodeFix.IT — strona główna">
            <span className="cf-brand-mark">&lt;/&gt;</span>
            <span className="cf-brand-name">CODEFIX<strong>.IT</strong></span>
          </a>
          <nav className="cf-nav-links service-nav-links" aria-label="Nawigacja usługi">
            <a href="#zakres">Zakres</a>
            <a href="#proces">Proces</a>
            <a href="#faq">FAQ</a>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <a href="#kontakt" className="cf-nav-cta">{config.cta}</a>
        </div>
      </header>

      <main>
        <section className="cf-container service-hero">
          <div className="service-hero-copy">
            <a href="/#services" className="service-back-link">
              <ArrowLeft size={15} aria-hidden="true" />
              Wszystkie usługi
            </a>
            <p className="cf-section-kicker">{config.eyebrow}</p>
            <h1>
              {config.title}
              <span>{config.titleAccent}</span>
            </h1>
            <p className="service-hero-lead">{config.description}</p>

            <div className="cf-actions">
              <a href="#kontakt" className="cf-button cf-button-primary">
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
            <a href="#kontakt" className="cf-button cf-button-primary">
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
              {projects.slice(0, 2).map((project) => (
                <article className="service-project-card" key={project.slug}>
                  <span>{project.year} · WordPress</span>
                  <h3>{project.title}</h3>
                  <p>{project.shortDescription}</p>
                  <div>
                    {project.technologies.slice(0, 4).map((technology) => (
                      <small key={technology}>{technology}</small>
                    ))}
                  </div>
                  <a href={`/realizacje/${project.slug}`}>
                    Zobacz zakres realizacji
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

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
                <a key={item.path} href={item.path} className="service-related-card">
                  <span>{item.price}</span>
                  <strong>{item.eyebrow}</strong>
                  <p>{item.metaDescription}</p>
                  <div>
                    Zobacz usługę
                    <ArrowRight size={14} aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="kontakt" className="cf-section cf-contact-section service-contact-section">
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
                <form className="cf-lead-form" onSubmit={handleSubmit}>
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

                  <p className="cf-form-privacy">
                    Wysyłając formularz, przekazujesz dane potrzebne do obsługi zapytania.
                    Szczegóły znajdziesz w <a href="/polityka-prywatnosci">polityce prywatności</a>.
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
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <a href="/polityka-prywatnosci">Polityka prywatności</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>

      <ServiceConsentBanner />
    </div>
  );
}
