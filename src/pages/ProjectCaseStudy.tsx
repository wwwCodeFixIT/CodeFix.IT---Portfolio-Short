import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Project } from '../data/projects';
import './ProjectCaseStudy.css';

type ProjectCaseStudyProps = {
  project: Project;
};

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const description = project.shortDescription;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.href ?? '';
    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = metaDescription?.content ?? '';

    document.title = `${project.title} — case study | CodeFix.IT`;
    if (canonical) canonical.href = `https://codefix.it/realizacje/${project.slug}`;
    if (metaDescription) metaDescription.content = description;

    return () => {
      document.title = previousTitle;
      if (canonical) canonical.href = previousCanonical;
      if (metaDescription) metaDescription.content = previousDescription;
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
          <a href="/" className="cf-brand" aria-label="CodeFix.IT — strona główna">
            <span className="cf-brand-mark">&lt;/&gt;</span>
            <span className="cf-brand-name">CODEFIX<strong>.IT</strong></span>
          </a>
          <a href="/#work" className="cf-case-back">
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
              <a href="/#contact" className="cf-button cf-button-primary">
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
            <a href="/#contact" className="cf-button cf-button-primary">
              Przejdź do kontaktu
              <ArrowRight size={17} aria-hidden="true" />
            </a>
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
    </div>
  );
}
