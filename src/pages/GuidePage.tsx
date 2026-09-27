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
import { wordpressGuides } from '../data/wordpress-guides';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './GuidePage.css';

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function schemaFor(guide: WordPressGuide) {
  const url = `https://codefix.it/poradniki/${guide.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://codefix.it/#organization',
        name: 'CodeFix.IT',
        url: 'https://codefix.it/',
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
    document.title = 'Poradniki WordPress — diagnostyka i utrzymanie | CodeFix.IT';
    const description =
      'Praktyczne poradniki CodeFix.IT o WordPress: błędy 500, poczta i SMTP, awarie po aktualizacji oraz wydajność.';
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', 'https://codefix.it/poradniki');
  }, []);

  return (
    <div className="homepage-v1 guide-page">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <a href="/" className="cf-brand" aria-label="CodeFix.IT — strona główna">
            <span className="cf-brand-mark">&lt;/&gt;</span>
            <span className="cf-brand-name">CODEFIX<strong>.IT</strong></span>
          </a>
          <a href="/naprawa-wordpress" className="cf-nav-cta">Naprawa WordPress</a>
        </div>
      </header>

      <main className="guide-index-main">
        <section className="cf-container guide-index-hero">
          <a className="guide-back" href="/">
            <ArrowLeft size={15} /> Strona główna
          </a>
          <p className="cf-section-kicker">PORADNIKI / WORDPRESS</p>
          <h1>Najpierw diagnoza.<br/><span>Potem naprawa.</span></h1>
          <p>
            Konkretne checklisty dla najczęstszych problemów WordPress. Bez obietnic „jednego magicznego pluginu”
            i bez udawania, że każdy błąd ma tę samą przyczynę.
          </p>
        </section>

        <section className="cf-container guide-index-grid" aria-label="Poradniki WordPress">
          {wordpressGuides.map((guide) => (
            <article className="guide-card" key={guide.slug}>
              <div className="guide-card-meta">
                <span>{guide.intent}</span>
                <span><Clock3 size={13}/> {guide.readMinutes} min</span>
              </div>
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
              <a href={`/poradniki/${guide.slug}`}>
                Czytaj poradnik <ArrowRight size={15}/>
              </a>
            </article>
          ))}
        </section>
      </main>

      <footer className="cf-footer">
        <div className="cf-container cf-footer-bottom">
          <span>© 2026 CodeFix.IT</span>
          <a href="/polityka-prywatnosci">Polityka prywatności</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}

export function GuidePage({ guide }: { guide: WordPressGuide }) {
  useEffect(() => {
    const canonical = `https://codefix.it/poradniki/${guide.slug}`;
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

  const related = wordpressGuides.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <div className="homepage-v1 guide-page">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <a href="/" className="cf-brand" aria-label="CodeFix.IT — strona główna">
            <span className="cf-brand-mark">&lt;/&gt;</span>
            <span className="cf-brand-name">CODEFIX<strong>.IT</strong></span>
          </a>
          <a href={guide.serviceHref} className="cf-nav-cta">{guide.serviceLabel}</a>
        </div>
      </header>

      <main>
        <article className="cf-container guide-article">
          <a className="guide-back" href="/poradniki">
            <ArrowLeft size={15}/> Wszystkie poradniki
          </a>

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
            <a className="cf-button cf-button-primary" href={guide.serviceHref}>
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
                <a href={`/poradniki/${item.slug}`} key={item.slug}>
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
          <a href="/polityka-prywatnosci">Polityka prywatności</a>
          <span className="cf-footer-code">Diabeł tkwi w kodzie. 😈</span>
        </div>
      </footer>
    </div>
  );
}
