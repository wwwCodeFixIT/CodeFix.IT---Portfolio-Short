import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Brand } from '../components/Brand';
import type { Project } from '../data/projects';
import './ProjectCaseStudy.css';

type ProjectCaseStudyProps = {
  project: Project;
};

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function buildProjectSchema(project: Project) {
  const canonical = `https://codefix.it/realizacje/${project.slug}/`;
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
        email: 'wwwcodefixit@gmail.com',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://codefix.it/#website',
        url: 'https://codefix.it/',
        name: 'CodeFix.IT',
        publisher: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
      },
      {
        '@type': 'CreativeWork',
        '@id': canonical + '#case-study',
        name: project.title,
        headline: `${project.title} — case study`,
        url: canonical,
        description: project.shortDescription,
        creator: { '@id': 'https://codefix.it/#organization' },
        publisher: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
        dateCreated: String(project.year),
        keywords: project.technologies,
        about: project.scope,
        sameAs: [project.demoUrl],
        isPartOf: { '@id': 'https://codefix.it/#website' },
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
            name: 'Realizacje',
            item: 'https://codefix.it/realizacje/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: project.title,
            item: canonical,
          },
        ],
      },
    ],
  };
}

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  useEffect(() => {
    const title = `${project.title} — case study WordPress | CodeFix.IT`;
    const description = project.shortDescription;
    const canonicalUrl = `https://codefix.it/realizacje/${project.slug}/`;

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let schema = document.getElementById('codefix-project-schema') as HTMLScriptElement | null;
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'codefix-project-schema';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(buildProjectSchema(project));

    return () => {
      schema?.remove();
    };
  }, [project]);

  const paragraphs = project.fullDescription
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="homepage-v1 cf-case-page">
      <header className="cf-header">
        <div className="cf-container cf-case-nav">
          <Brand />
          <a href="/realizacje/" className="cf-case-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Wszystkie realizacje
          </a>
        </div>
      </header>

      <main>
        <section className="cf-container cf-case-hero">
          <div>
            <p className="cf-section-kicker">Realizacja • {project.year}</p>
            <h1>{project.title}</h1>
            <p className="cf-case-lead">{project.shortDescription}</p>
            <div className="cf-case-actions">
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="cf-button cf-button-secondary"
              >
                Otwórz działającą stronę
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href="/?service=CODEFIX_BUSINESS_SITE#contact" className="cf-button cf-button-primary">
                Zapytaj o podobne wdrożenie
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <aside className="cf-case-summary" aria-label="Informacje o realizacji">
            <div>
              <span>Klient</span>
              <strong>{project.client ?? project.title}</strong>
            </div>
            <div>
              <span>Rok</span>
              <strong>{project.year}</strong>
            </div>
            <div>
              <span>Zakres</span>
              <strong>WordPress / front-end</strong>
            </div>
            {project.collaboration && (
              <div>
                <span>Współpraca</span>
                <strong>{project.collaboration}</strong>
              </div>
            )}
          </aside>
        </section>

        <section className="cf-case-verification" aria-labelledby="cf-case-verification-title">
          <div className="cf-container">
            <p className="cf-section-kicker">Weryfikowalne fakty</p>
            <h2 id="cf-case-verification-title" className="cf-case-verification-title">
              Co możesz sprawdzić bez proszenia mnie o „case study PDF”.
            </h2>

            <div className="cf-case-verification-grid">
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="cf-case-verification-item cf-case-verification-link"
              >
                <span>Strona online</span>
                <strong>Publiczny adres projektu</strong>
                <small>Otwórz działającą stronę klienta</small>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>

              <div className="cf-case-verification-item">
                <span>Zakres</span>
                <strong>{project.scope.length} opisanych elementów</strong>
                <small>Zakres realizacji rozpisany punkt po punkcie</small>
              </div>

              <div className="cf-case-verification-item">
                <span>Stack</span>
                <strong>{project.technologies.length} technologii</strong>
                <small>Technologie użyte w konkretnym wdrożeniu</small>
              </div>

              <div className="cf-case-verification-item">
                <span>Realizacja</span>
                <strong>{project.year}</strong>
                <small>
                  {project.collaboration
                    ? `Współpraca z ${project.collaboration}`
                    : 'Projekt opisany na podstawie faktycznego zakresu prac'}
                </small>
              </div>
            </div>
          </div>
        </section>

        <section className="cf-case-section">
          <div className="cf-container cf-case-layout">
            <article className="cf-case-story">
              <p className="cf-section-kicker">O projekcie</p>
              <h2>Co zostało wykonane.</h2>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <aside className="cf-case-scope">
              <p className="cf-section-kicker">Zakres</p>
              <ul>
                {project.scope.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="cf-case-section cf-case-section-bordered">
          <div className="cf-container">
            <p className="cf-section-kicker">Technologie</p>
            <h2 className="cf-case-tech-heading">Stack użyty w realizacji.</h2>
            <div className="cf-case-tech">
              {project.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-case-cta">
          <div className="cf-container cf-case-cta-inner">
            <div>
              <p className="cf-section-kicker">Masz podobny temat?</p>
              <h2>Możemy zacząć od konkretnego zakresu i wyceny.</h2>
              <p>
                Wyślij adres obecnej strony albo krótko opisz, czego potrzebuje firma.
                Odpowiem z propozycją następnego kroku.
              </p>
            </div>
            <a href="/?service=CODEFIX_BUSINESS_SITE#contact" className="cf-button cf-button-primary">
              Przejdź do kontaktu
              <ArrowRight size={17} aria-hidden="true" />
            </a>
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
    </div>
  );
}
