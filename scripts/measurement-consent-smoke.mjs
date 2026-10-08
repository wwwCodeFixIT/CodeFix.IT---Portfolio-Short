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

const homepage = await readFile(
  new URL('../src/pages/HomepageV1.tsx', import.meta.url),
  'utf8',
);

assert.match(
  homepage,
  /codefixAdConsentChoice\?: 'accepted' \| 'rejected' \| null;/,
  'Homepage lead measurement must know Ads consent separately from Analytics.',
);
assert.match(
  homepage,
  /analyticsWindow\.codefixAnalyticsAllowed\s*\|\|\s*analyticsWindow\.codefixAdConsentChoice === 'accepted'/,
  'Homepage must send generate_lead with either Analytics or Ads consent.',
);
const homepageAccepted = homepage.indexOf('if (!response.ok)');
const homepageDuplicate = homepage.indexOf('if (result.duplicate)');
const homepageEvent = homepage.indexOf("gtag?.('event', 'generate_lead'");
assert.ok(homepageAccepted >= 0 && homepageAccepted < homepageDuplicate);
assert.ok(homepageDuplicate >= 0 && homepageDuplicate < homepageEvent);
assert.match(
  homepage.slice(homepageDuplicate, homepageEvent),
  /else \{[\s\S]*?measureAcceptedLead\(\)/,
  'Only accepted, nonduplicate homepage leads may count as conversions.',
);

const responseGuard = serviceLanding.indexOf('if (!response.ok)');
const leadEvent = serviceLanding.indexOf("gtag?.('event', 'generate_lead'");
assert.ok(responseGuard >= 0, 'Lead API success guard is missing.');
assert.ok(
  leadEvent > responseGuard,
  'generate_lead must only be emitted after the lead API accepts the submission.',
);

process.stdout.write('Measurement consent smoke: OK\n');
