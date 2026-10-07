import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const serviceLanding = await readFile(
  new URL('../src/pages/ServiceLanding.tsx', import.meta.url),
  'utf8',
);

assert.match(
  html,
  /function loadGoogleTag\(sendPageView\)/,
  'Google tag loader must remain independent from Analytics consent.',
);
assert.match(
  html,
  /send_page_view: Boolean\(sendPageView\)/,
  'Ads-only measurement must not create an Analytics page view.',
);
assert.match(
  html,
  /var googleAdsId = 'AW-18496694311';/,
  'The production Google Ads tag ID must stay wired into the measurement bootstrap.',
);
assert.match(
  html,
  /window\.gtag\('config', googleAdsId, \{ send_page_view: false \}\);/,
  'Ads consent must configure the Google Ads destination without an Analytics page view.',
);
assert.match(
  html,
  /if \(allowed\) configureGoogleAds\(\);/,
  'Granting Ads consent must configure the Google Ads destination.',
);
assert.match(
  serviceLanding,
  /codefixAdConsentChoice\?: 'accepted' \| 'rejected' \| null;/,
  'Service lead measurement must know the Ads consent state.',
);
assert.match(
  serviceLanding,
  /analyticsWindow\.codefixAnalyticsAllowed\s*\|\|\s*analyticsWindow\.codefixAdConsentChoice === 'accepted'/,
  'Accepted leads must be measurable after Analytics consent OR Ads consent.',
);

const responseGuard = serviceLanding.indexOf('if (!response.ok)');
const leadEvent = serviceLanding.indexOf("gtag?.('event', 'generate_lead'");
assert.ok(responseGuard >= 0, 'Lead API success guard is missing.');
assert.ok(
  leadEvent > responseGuard,
  'generate_lead must only be emitted after the lead API accepts the submission.',
);

process.stdout.write('Measurement consent smoke: OK\n');
