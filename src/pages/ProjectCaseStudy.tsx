import { Brand } from '../components/Brand';
import { ProjectPreview } from '../components/ProjectPreview';
import type { Project } from '../data/projects';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './ProjectCaseStudy.css';

type ProjectCaseStudyProps = {
  project: Project;
};

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  return (
    <div className="homepage-v1 cf-case-page">
      <header className="cf-header">
        <div className="cf-container cf-case-nav">
          <Brand />
          <nav className="cf-nav-links" aria-label="Nawigacja główna">
            <a href="/#services">Usługi</a>
            <a href="/poradniki/">Poradniki</a>
          </nav>
          <a href="/realizacje/" className="cf-case-back">
            <span aria-hidden="true">←</span>
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
                Otwórz działającą stronę ↗
              </a>
              <a href="/?service=CODEFIX_BUSINESS_SITE#contact" className="cf-button cf-button-primary">
                Zapytaj o podobne wdrożenie →
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

        <section className="cf-case-previews" aria-labelledby="cf-case-previews-title">
          <div className="cf-container">
            <p className="cf-section-kicker">Podgląd strony</p>
            <h2 id="cf-case-previews-title" className="cf-case-verification-title">Na komputerze i telefonie.</h2>
            <p className="cf-case-preview-note">Zrzuty aktualnej publicznej strony z 5 października 2026. Zakres mojej realizacji opisuję poniżej.</p>
            <ProjectPreview project={project} gallery />
          </div>
        </section>

        <section className="cf-case-verification" aria-labelledby="cf-case-verification-title">
          <div className="cf-container">
            <p className="cf-section-kicker">Cel i realizacja</p>
            <h2 id="cf-case-verification-title" className="cf-case-verification-title">
              Potrzeba firmy, moja rola i efekt wdrożenia.
            </h2>

            <div className="cf-case-verification-grid">
              <div className="cf-case-verification-item">
                <h3>Cel strony</h3>
                <p>{project.goal}</p>
              </div>

              <div className="cf-case-verification-item">
                <h3>Moja rola</h3>
                <p>{project.contribution}</p>
              </div>

              <div className="cf-case-verification-item">
                <h3>Efekt wdrożenia</h3>
                <p>{project.result}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cf-case-section">
          <div className="cf-container">
            <p className="cf-section-kicker">Zakres prac</p>
            <h2 className="cf-case-tech-heading">Co obejmowała realizacja.</h2>
            <div className="cf-case-scope">
              <ul>
                {project.scope.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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
              Przejdź do kontaktu →
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
