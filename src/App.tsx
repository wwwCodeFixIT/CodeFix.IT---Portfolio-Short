import { HomepageV1 } from './pages/HomepageV1';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ProjectCaseStudy } from './pages/ProjectCaseStudy';
import { ServiceLanding, serviceLandings } from './pages/ServiceLanding';
import { GuidePage, GuidesIndex } from './pages/GuidePage';
import { guideByPath } from './data/wordpress-guides';
import { projects } from './data/projects';

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/polityka-prywatnosci') {
    return <PrivacyPolicy />;
  }

  if (path === '/poradniki') {
    return <GuidesIndex />;
  }

  const guide = guideByPath[path];
  if (guide) {
    return <GuidePage guide={guide} />;
  }

  const serviceLanding = serviceLandings[path];
  if (serviceLanding) {
    return <ServiceLanding config={serviceLanding} />;
  }

  if (path.startsWith('/realizacje/')) {
    const slug = path.replace('/realizacje/', '');
    const project = projects.find((item) => item.slug === slug);
    if (project) return <ProjectCaseStudy project={project} />;
  }

  return <HomepageV1 />;
}

export default App;
