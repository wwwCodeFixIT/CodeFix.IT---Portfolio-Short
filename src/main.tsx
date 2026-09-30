import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const servicePaths = new Set(['/naprawa-wordpress', '/opieka-wordpress', '/strony-wordpress']);

async function loadHomepage(): Promise<ReactNode> {
  const { HomepageV1 } = await import('./pages/HomepageV1');
  return <HomepageV1 />;
}

async function resolveRoute(path: string): Promise<ReactNode> {
  if (path === '/polityka-prywatnosci') {
    const { PrivacyPolicy } = await import('./pages/PrivacyPolicy');
    return <PrivacyPolicy />;
  }

  if (path === '/poradniki') {
    const { GuidesIndex } = await import('./pages/GuidePage');
    return <GuidesIndex />;
  }

  if (path.startsWith('/poradniki/')) {
    const [{ GuidePage }, { guideByPath }] = await Promise.all([
      import('./pages/GuidePage'),
      import('./data/wordpress-guides'),
    ]);

    const guide = guideByPath[path];
    if (guide) return <GuidePage guide={guide} />;

    return loadHomepage();
  }

  if (servicePaths.has(path)) {
    const { ServiceLanding, serviceLandings } = await import('./pages/ServiceLanding');
    const config = serviceLandings[path];

    if (config) return <ServiceLanding config={config} />;
  }

  if (path.startsWith('/realizacje/')) {
    const [{ ProjectCaseStudy }, { projects }] = await Promise.all([
      import('./pages/ProjectCaseStudy'),
      import('./data/projects'),
    ]);

    const slug = path.replace('/realizacje/', '');
    const project = projects.find((item) => item.slug === slug);
    if (project) return <ProjectCaseStudy project={project} />;

    return loadHomepage();
  }

  return loadHomepage();
}

async function bootstrap() {
  const root = document.getElementById('root');

  if (!root) {
    throw new Error('Root element #root was not found.');
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const hasStaticPrerender = root.dataset.staticPrerender === 'true';

  try {
    const route = await resolveRoute(path);

    // Keep the server/prerendered HTML visible until the exact route chunk is ready.
    // This avoids a blank screen and reduces layout shift on slower connections.
    if (hasStaticPrerender) {
      root.replaceChildren();
      delete root.dataset.staticPrerender;
    }

    createRoot(root).render(<StrictMode>{route}</StrictMode>);
  } catch (error) {
    console.error('CodeFix.IT bootstrap failed:', error);

    // Production pages already contain crawlable prerendered HTML. Keep it visible
    // if a route chunk fails to load instead of replacing it with an empty shell.
    if (!hasStaticPrerender) {
      root.innerHTML =
        '<main style="max-width:720px;margin:80px auto;padding:24px;font-family:Inter,system-ui,sans-serif">' +
        '<h1>Nie udało się załadować strony.</h1>' +
        '<p>Odśwież stronę lub spróbuj ponownie za chwilę.</p>' +
        '<p><a href="/">Wróć do CodeFix.IT</a></p>' +
        '</main>';
    }
  }
}

void bootstrap();
