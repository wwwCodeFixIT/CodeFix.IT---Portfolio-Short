import { Brand } from '../components/Brand';
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
          <a href="/strony-wordpress/#kontakt" className="cf-nav-cta">Omów wdrożenie</a>
        </div>
      </header>

      <main>
        <section className="cf-container projects-index-hero">
          <div>
            <nav className="projects-breadcrumb" aria-label="Okruszki">
              <a href="/">CodeFix.IT</a><span>/</span><span>Realizacje</span>
            </nav>
            <p className="cf-section-kicker">Realizacje CodeFix.IT</p>
            <h1>Projekty, które można<span>sprawdzić przed kontaktem.</span></h1>
            <p className="projects-index-lead">
              Trzy publiczne wdrożenia WordPress z opisanym zakresem, stackiem i działającą stroną klienta.
            </p>
            <div className="cf-actions">
              <a href="#projekty" className="cf-button cf-button-primary">Zobacz projekty →</a>
              <a href="/dla-agencji-wordpress/" className="cf-button cf-button-secondary">Dla agencji</a>
            </div>
          </div>
        </section>

        <section id="projekty" className="cf-section projects-index-list">
          <div className="cf-container">
            <p className="cf-section-kicker">Case studies</p>
            <h2 className="cf-section-heading">Zakres, technologie i rezultat.</h2>

            <div className="projects-index-grid">
              {projects.map((project) => (
                <article key={project.id} className="projects-index-card">
                  <div className="projects-index-card-head">
                    <span>{project.year}</span>
                    <span className="projects-index-domain">
                      {project.demoUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.shortDescription}</p>
                  {project.collaboration && <p className="cf-project-collaboration">Współpraca: <strong>{project.collaboration}</strong></p>}
                  <div className="projects-index-actions">
                    <a href={`/realizacje/${project.slug}/`} className="cf-button cf-button-primary">Case study →</a>
                    <a href={project.demoUrl} target="_blank" rel="noreferrer" className="projects-live-link">Strona ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
