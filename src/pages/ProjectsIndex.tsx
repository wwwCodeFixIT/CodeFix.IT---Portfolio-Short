import { useEffect } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Layers3, ShieldCheck } from 'lucide-react';

import { Brand } from '../components/Brand';
import { projects } from '../data/projects';
import './HomepageV1.css';
import './HomepageV1.v3.css';
import './ProjectsIndex.css';

const pageTitle = 'Realizacje WordPress i strony dla firm | CodeFix.IT';
const pageDescription =
  'Realizacje CodeFix.IT: trzy publiczne wdrożenia WordPress z opisanym zakresem, technologiami i działającymi stronami. Zobacz projekty dla firm i case współpracy agencyjnej.';
const canonicalUrl = 'https://codefix.it/realizacje/';

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function buildSchema() {
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
        '@type': 'CollectionPage',
        '@id': canonicalUrl + '#page',
        url: canonicalUrl,
        name: pageTitle,
        description: pageDescription,
        inLanguage: 'pl-PL',
        isPartOf: { '@id': 'https://codefix.it/#website' },
        about: { '@id': 'https://codefix.it/#organization' },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `https://codefix.it/realizacje/${project.slug}/`,
            name: project.title,
          })),
        },
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
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

export function ProjectsIndex() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle;

    setMeta('meta[name="description"]', 'content', pageDescription);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', pageDescription);
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', pageDescription);

    let schema = document.getElementById('codefix-projects-schema') as HTMLScriptElement | null;
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'codefix-projects-schema';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(buildSchema());

    return () => {
      document.title = previousTitle;
      schema?.remove();
    };
  }, []);

  const publicProjects = projects.filter((project) => project.demoUrl).length;
  const agencyProjects = projects.filter((project) => project.collaboration).length;

  return (
    <div className="homepage-v1 projects-index">
      <header className="cf-header">
        <div className="cf-container cf-nav">
          <Brand />
          <nav className="cf-nav-links" aria-label="Nawigacja realizacji">
            <a href="/strony-wordpress/">Strony dla firm</a>
            <a href="/dla-agencji-wordpress/">Dla agencji</a>
            <a href="/poradniki/">Poradniki</a>
          </nav>
          <a href="/strony-wordpress/#kontakt" className="cf-nav-cta">
            Omów podobne wdrożenie
          </a>
        </div>
      </header>

      <main>
        <section className="cf-container projects-index-hero">
          <div>
            <nav className="projects-breadcrumb" aria-label="Okruszki">
              <a href="/">CodeFix.IT</a>
              <span aria-hidden="true">/</span>
              <span>Realizacje</span>
            </nav>
            <p className="cf-section-kicker">Realizacje CodeFix.IT</p>
            <h1>
              Projekty, które można
              <span>sprawdzić przed kontaktem.</span>
            </h1>
            <p className="projects-index-lead">
              Nie pokazuję makiet udających realizacje. Każdy opisany case prowadzi do działającej strony
              i zawiera konkretny zakres prac, technologie oraz kontekst wdrożenia.
            </p>
            <div className="cf-actions">
              <a href="#projekty" className="cf-button cf-button-primary">
                Zobacz projekty
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="/strony-wordpress/" className="cf-button cf-button-secondary">
                Zobacz ofertę stron WordPress
              </a>
            </div>
          </div>

          <aside className="projects-index-proof" aria-label="Weryfikowalne informacje">
            <div>
              <strong>{projects.length}</strong>
              <span>opisane case studies</span>
            </div>
            <div>
              <strong>{publicProjects}/{projects.length}</strong>
              <span>publiczne adresy stron</span>
            </div>
            <div>
              <strong>{agencyProjects}</strong>
              <span>udokumentowany case agencyjny</span>
            </div>
            <div>
              <strong>WordPress + ACF PRO</strong>
              <span>w każdym pokazanym wdrożeniu</span>
            </div>
          </aside>
        </section>

        <section className="projects-index-trust">
          <div className="cf-container projects-index-trust-grid">
            <article>
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>Publiczny rezultat</strong>
                <p>Każdy case zawiera link do działającej strony klienta.</p>
              </div>
            </article>
            <article>
              <CheckCircle2 size={18} aria-hidden="true" />
              <div>
                <strong>Zakres bez ogólników</strong>
                <p>Opisuję wykonane elementy i użyty stack zamiast samych screenów.</p>
              </div>
            </article>
            <article>
              <Layers3 size={18} aria-hidden="true" />
              <div>
                <strong>Różne modele współpracy</strong>
                <p>Są wdrożenia bezpośrednie oraz przykład pracy dla innego zespołu.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="projekty" className="cf-section projects-index-list">
          <div className="cf-container">
            <div className="cf-section-head-row">
              <div>
                <p className="cf-section-kicker">Case studies</p>
                <h2 className="cf-section-heading">Trzy wdrożenia, trzy konkretne zakresy.</h2>
              </div>
              <p className="cf-section-sidecopy">
                Otwórz case, sprawdź zakres, technologie i publiczną stronę. Jeśli potrzebujesz podobnego wdrożenia,
                możemy zacząć od krótkiego zakresu i wyceny.
              </p>
            </div>

            <div className="projects-index-grid">
              {projects.map((project) => (
                <article key={project.id} className="projects-index-card">
                  <div className="projects-index-card-head">
                    <div>
                      <span>{project.year}</span>
                      {project.collaboration && <span>white-label / współpraca</span>}
                    </div>
                    <span className="projects-index-domain">
                      {project.demoUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </span>
                  </div>

                  <h3>{project.title}</h3>
                  <p>{project.shortDescription}</p>

                  <ul>
                    {project.scope.slice(0, 4).map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={15} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="projects-index-tech">
                    {project.technologies.slice(0, 5).map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>

                  <div className="projects-index-actions">
                    <a href={`/realizacje/${project.slug}/`} className="cf-button cf-button-primary">
                      Zobacz case study
                      <ArrowRight size={16} aria-hidden="true" />
                    </a>
                    <a href={project.demoUrl} target="_blank" rel="noreferrer" className="projects-live-link">
                      Otwórz stronę
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="projects-index-cta">
          <div className="cf-container projects-index-cta-inner">
            <div>
              <p className="cf-section-kicker">Masz podobny temat?</p>
              <h2>Najpierw zakres. Potem konkretna wycena.</h2>
              <p>
                Podeślij istniejącą stronę albo opisz nowe wdrożenie. Nie potrzebujesz pełnego briefu na start.
              </p>
            </div>
            <div className="projects-index-cta-actions">
              <a href="/strony-wordpress/#kontakt" className="cf-button cf-button-primary">
                Zapytaj o stronę dla firmy
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="/dla-agencji-wordpress/" className="cf-button cf-button-secondary">
                Współpraca white-label
              </a>
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
