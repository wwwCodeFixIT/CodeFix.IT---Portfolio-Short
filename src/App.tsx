import { HomepageV1 } from './pages/HomepageV1';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/polityka-prywatnosci') {
    return <PrivacyPolicy />;
  }

  return <HomepageV1 />;
}

export default App;
