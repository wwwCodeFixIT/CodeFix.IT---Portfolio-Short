import { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
} from 'lucide-react';

import type { WordPressGuide } from '../data/wordpress-guides';
import { Brand } from '../components/Brand';
import { wordpressGuides } from '../data/wordpress-guides';
import { markGuideToServiceJourney } from '../lib/conversion-journey';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './GuidePage.css';

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

const guideGroups = [
  {
    id: 'naprawa',
    kicker: 'NAPRAWA I AWARIE',
    title: 'Diagnoza i naprawa WordPress',
    description: 'Błędy 500, awarie po aktualizacjach, formularze, checkout WooCommerce i problemy krytyczne — w kolejności, która ogranicza zgadywanie na produkcji.',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Naprawa WordPress od 390 zł',
  },
  {
    id: 'opieka',
    kicker: 'OPIEKA I WYDAJNOŚĆ',
    title: 'Opieka, wydajność i utrzymanie',
    description: 'Materiały o stabilności, wydajności, backupach i kosztach stałej opieki nad WordPressem.',
    serviceHref: '/opieka-wordpress',
    serviceLabel: 'Opieka WordPress od 300 zł/mies.',
  },
  {
    id: 'strony',
    kicker: 'STRONY DLA FIRM',
    title: 'Strony WordPress i wycena wdrożenia',
    description: 'Co wpływa na koszt strony firmowej, jak przygotować zakres i czego oczekiwać od wdrożenia WordPress + ACF PRO.',
    serviceHref: '/strony-wordpress',
    serviceLabel: 'Strony WordPress — wycena',
  },
] as const;

function schemaFor(guide: WordPressGuide) {
  const url = `https://codefix.it/poradniki/${guide.slug}/`;
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
      },
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        datePublished: guide.publishedOn,
        dateModified: guide.updatedOn,
        mainEntityOfPage: url,
        url,
        author: { '@id': 'https://codefix.it/#organization' },
        publisher: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
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
            name: 'Poradniki WordPress',
            item: 'https://codefix.it/poradniki/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: url,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export function GuidesIndex() {
  useEffect(() => {
    document.title = 'Poradniki WordPress — naprawa, opieka i wyceny | CodeFix.IT';
    const description =
      'Poradniki CodeFix.IT o WordPress: naprawa błędów, WooCommerce, wydajność, opieka techniczna oraz koszty napraw i stron dla firm.';
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', 'https://codefix.it/poradniki/');
    setMeta('meta[property="og:url"]', 'content', 'https://codefix.it/poradniki/');
    setMeta('meta[property="og:title"]', 'content', document.title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', document.title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }, []);

  return (
    <div className="homepage-v1 guide-page">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand />
          <a href="/#services" className="cf-nav-cta">Zobacz usługi</a>
        </div>
      </header>

      <main className="guide-index-main">
        <section className="cf-container guide-index-hero">
          <a className="guide-back" href="/">
            <ArrowLeft size={15} /> Strona główna
          </a>
          <p className="cf-section-kicker">PORADNIKI / WORDPRESS</p>
          <h1>Poradniki WordPress.<br/><span>Naprawa, opieka i wyceny.</span></h1>
          <p>
            {wordpressGuides.length} praktycznych poradników: od diagnozy błędów i WooCommerce po wydajność,
            opiekę, koszty naprawy i wycenę nowej strony WordPress.
          </p>

          <nav className="guide-index-nav" aria-label="Kategorie poradników">
            {guideGroups.map((group) => (
              <a href={`#${group.id}`} key={group.id}>
                {group.title}
              </a>
            ))}
          </nav>
        </section>

        <div className="cf-container guide-index-sections">
          {guideGroups.map((group) => {
            const guides = wordpressGuides.filter((guide) => guide.serviceHref === group.serviceHref);

            return (
              <section className="guide-index-group" id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
                <div className="guide-index-group-head">
                  <div>
                    <p className="cf-section-kicker">{group.kicker}</p>
                    <h2 id={`${group.id}-title`}>{group.title}</h2>
                    <p>{group.description}</p>
                  </div>
                  <a href={`${group.serviceHref}/`} className="guide-index-service-link">
                    {group.serviceLabel} <ArrowRight size={15} />
                  </a>
                </div>

                <div className="guide-index-grid">
                  {guides.map((guide) => (
                    <article className="guide-card" key={guide.slug}>
                      <div className="guide-card-meta">
                        <span>{guide.intent}</span>
                        <span><Clock3 size={13}/> {guide.readMinutes} min</span>
                      </div>
                      <h3>{guide.title}</h3>
                      <p>{guide.description}</p>
                      <a href={`/poradniki/${guide.slug}/`}>
                        Czytaj poradnik <ArrowRight size={15}/>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="cf-container guide-cta">
          <div>
            <p className="cf-section-kicker">Masz konkretny problem?</p>
            <h2>Nie musisz diagnozować go samodzielnie.</h2>
            <p>Jeśli poradnik nie wystarczy, podeślij URL i objaw. Najpierw ustalimy zakres i cenę, dopiero potem zmianę.</p>
          </div>
          <a className="cf-button cf-button-primary" href="/naprawa-wordpress/#kontakt">
            Naprawa od 390 zł <ArrowRight size={16}/>
          </a>
        </section>
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <a href="/polityka-prywatnosci/">Polityka prywatności</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}

export function GuidePage({ guide }: { guide: WordPressGuide }) {
  useEffect(() => {
    const canonical = `https://codefix.it/poradniki/${guide.slug}/`;
    document.title = guide.metaTitle;
    setMeta('meta[name="description"]', 'content', guide.description);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:title"]', 'content', guide.metaTitle);
    setMeta('meta[property="og:description"]', 'content', guide.description);
    setMeta('meta[name="twitter:title"]', 'content', guide.metaTitle);
    setMeta('meta[name="twitter:description"]', 'content', guide.description);

    let schema = document.getElementById('codefix-guide-schema') as HTMLScriptElement | null;
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'codefix-guide-schema';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(schemaFor(guide));
  }, [guide]);

  const related = wordpressGuides
    .filter((item) => item.slug !== guide.slug)
    .sort((a, b) => Number(b.serviceHref === guide.serviceHref) - Number(a.serviceHref === guide.serviceHref))
    .slice(0, 3);

  function trackServiceCta() {
    markGuideToServiceJourney(guide.slug, guide.serviceHref);

    const analyticsWindow = window as Window & {
      gtag?: (...args: unknown[]) => void;
      codefixAnalyticsAllowed?: boolean;
    };
    if (!analyticsWindow.codefixAnalyticsAllowed) return;
    analyticsWindow.gtag?.('event', 'service_cta_click', {
      event_category: 'conversion_path',
      journey_source: 'GUIDE',
      journey_guide: guide.slug,
      destination: guide.serviceHref,
    });
  }

  return (
    <div className="homepage-v1 guide-page">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand />
          <a href={`${guide.serviceHref}/`} className="cf-nav-cta" onClick={trackServiceCta}>{guide.serviceLabel}</a>
        </div>
      </header>

      <main>
        <article className="cf-container guide-article">
          <nav className="guide-breadcrumb" aria-label="Okruszki">
            <a href="/">CodeFix.IT</a>
            <span aria-hidden="true">/</span>
            <a href="/poradniki/">Poradniki WordPress</a>
            <span aria-hidden="true">/</span>
            <span>{guide.intent}</span>
          </nav>

          <header className="guide-article-header">
            <div className="guide-badges">
              <span>{guide.intent}</span>
              <span><Clock3 size={13}/> {guide.readMinutes} min czytania</span>
              <span>Aktualizacja: {guide.updatedOn}</span>
            </div>
            <h1>{guide.title}</h1>
            <p>{guide.intro}</p>
          </header>

          <aside className="guide-safety-note">
            <ShieldCheck size={18}/>
            <div>
              <strong>Zanim zmienisz produkcję</strong>
              <span>
                Jeżeli serwis obsługuje zamówienia, formularze lub dane klientów, wykonaj backup i zapisuj każdą zmianę.
                Przy większym ryzyku pracuj na stagingu.
              </span>
            </div>
          </aside>

          <div className="guide-body">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.checklist && (
                  <ul>
                    {section.checklist.map((item) => (
                      <li key={item}><CheckCircle2 size={16}/><span>{item}</span></li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="guide-cta">
            <div>
              <p className="cf-section-kicker">CODEFIX.IT</p>
              <h2>Nie chcesz diagnozować tego na produkcji samodzielnie?</h2>
              <p>Opisz objaw i podeślij URL. Najpierw ustalimy zakres, a dopiero potem zmianę.</p>
            </div>
            <a className="cf-button cf-button-primary" href={`${guide.serviceHref}/`} onClick={trackServiceCta}>
              {guide.serviceLabel}<ArrowRight size={16}/>
            </a>
          </section>

          <section className="guide-faq">
            <p className="cf-section-kicker">FAQ</p>
            <h2>Najczęstsze pytania</h2>
            <div>
              {guide.faq.map((item) => (
                <details className="cf-faq-item" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="guide-related">
            <p className="cf-section-kicker">WIĘCEJ</p>
            <h2>Powiązane poradniki</h2>
            <div>
              {related.map((item) => (
                <a href={`/poradniki/${item.slug}/`} key={item.slug}>
                  <FileText size={17}/>
                  <span>{item.title}</span>
                  <ArrowRight size={14}/>
                </a>
              ))}
            </div>
          </section>
        </article>
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <a href="/polityka-prywatnosci/">Polityka prywatności</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}
