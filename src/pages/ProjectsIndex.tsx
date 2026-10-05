import { Brand } from '../components/Brand';
import { ProjectPreview } from '../components/ProjectPreview';
import { projects } from '../data/projects';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './ProjectsIndex.css';

export function ProjectsIndex() {
  return (
    <div className="homepage-v1 projects-index">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand />
          <a href="/strony-wordpress/#kontakt" className="cf-nav-cta">Wyceń stronę</a>
        </div>
      </header>

      <main>
        <section className="cf-container projects-index-hero">
          <div>
            <nav className="projects-breadcrumb" aria-label="Okruszki">
              <a href="/">CodeFix.IT</a><span>/</span><span>Realizacje</span>
            </nav>
            <p className="cf-section-kicker">Realizacje CodeFix.IT</p>
            <h1>Realizacje WordPress,<span>które możesz sprawdzić przed kontaktem.</span></h1>
            <p className="projects-index-lead">
              3 publiczne wdrożenia: działająca strona, mój zakres prac, użyty stack i osobny case study.
            </p>
            <div className="cf-actions">
              <a href="#projekty" className="cf-button cf-button-primary">Zobacz 3 realizacje</a>
            </div>
          </div>
        </section>

        <section id="projekty" className="cf-section projects-index-list">
          <div className="cf-container">
            <p className="cf-section-kicker">Publiczne case studies</p>
            <h2 className="cf-section-heading">Zakres, stack i działająca strona.</h2>

            <div className="projects-index-grid">
              {projects.map((project) => (
                <article key={project.id} className="projects-index-card">
                  <ProjectPreview project={project} />
                  <div className="projects-index-card-head">
                    <span>{project.year}</span>
                    <div>
                      {project.technologies.slice(0, 3).map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.shortDescription}</p>
                  {project.collaboration && <p className="cf-project-collaboration">Współpraca: <strong>{project.collaboration}</strong></p>}
                  <div className="projects-index-actions">
                    <a href={`/realizacje/${project.slug}/`} className="cf-button cf-button-primary">Case study</a>
                    <a href={project.demoUrl} target="_blank" rel="noreferrer" className="projects-live-link">Strona live</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section">
          <div className="cf-container">
            <div className="cf-contact-panel">
              <div className="cf-contact-copy">
                <p className="cf-section-kicker">Następny krok</p>
                <h2>Potrzebujesz podobnego wdrożenia?</h2>
                <p>Podeślij zakres nowej strony albo istniejący projekt. Przed startem potwierdzę zakres, wycenę i kolejny krok.</p>
              </div>
              <div className="cf-actions">
                <a href="/strony-wordpress/#kontakt" className="cf-button cf-button-primary">Wyceń stronę</a>
                <a href="/dla-agencji-wordpress/" className="cf-button cf-button-secondary">White-label dla agencji</a>
              </div>
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
    </div>
  );
}
