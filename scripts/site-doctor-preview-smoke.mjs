/**
 * Read-only smoke for a verified, immutable Cloudflare Pages preview.
 * Does not scan third-party sites, create leads or consume a PageSpeed request.
 *
 * Usage:
 * node scripts/site-doctor-preview-smoke.mjs https://<preview>.<project>.pages.dev/
 */
import assert from 'node:assert/strict';

const root = process.argv[2];
if (!root) {
  console.error('Provide a verified Cloudflare Pages preview URL (never codefix.it).');
  process.exit(2);
}

let base;
try { base = new URL(root); } catch { throw new Error('Invalid preview URL.'); }
const projectDomain = 'codefix-it---portfolio-short.pages.dev';
assert.equal(base.protocol, 'https:', 'Preview must use HTTPS');
assert.match(base.hostname, /^[a-z0-9-]+\.codefix-it---portfolio-short\.pages\.dev$/);
assert.notEqual(base.hostname, projectDomain, 'Use an immutable preview, not the production Pages alias');
assert.equal(base.pathname, '/', 'Provide the preview root');
assert.equal(base.search, '');
assert.equal(base.hash, '');
assert.equal(base.username, '');
assert.equal(base.password, '');
assert.equal(base.port, '');

const checked = [];
async function fetchPreview(path) {
  const target = new URL(path, base);
  assert.equal(target.origin, base.origin, 'Do not follow cross-origin paths');
  const res = await fetch(target, {
    redirect: 'manual',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
    headers: { Accept: path.endsWith('.webp') ? 'image/webp' : 'text/html, application/json' },
  });
  assert.ok(res.status < 400 || (path === '/api/site-doctor' && res.status === 405),
    `${path} returned HTTP ${res.status}`);
  checked.push(`${path}: ${res.status}`);
  return res;
}

const homepage = await fetchPreview('/');
assert.equal(homepage.status, 200, 'Homepage must render');
assert.match(await homepage.text(), /narzedzia\//, 'Homepage should link to the lab');

const lab = await fetchPreview('/narzedzia/');
assert.equal(lab.status, 200, 'Lab route must be reachable');
const labHtml = await lab.text();
assert.match(labHtml, /<title>[^<]*CodeFix\.IT/i, 'Lab requires static title metadata');
assert.match(labHtml, /AI Site Doctor/i, 'Lab requires crawlable Site Doctor content');
assert.match(labHtml, /<link[^>]+rel=["']canonical["'][^>]+narzedzia/i, 'Lab requires canonical URL');

const logo = await fetchPreview('/brand/codefix-devil-mark.webp');
assert.equal(logo.status, 200);
assert.match(logo.headers.get('content-type') ?? '', /image\/webp/i);
await logo.body?.cancel();

// GET only: this MUST NOT trigger an external PageSpeed/OpenAI request.
const getApi = await fetchPreview('/api/site-doctor');
assert.equal(getApi.status, 405, 'Preview must route /api/site-doctor to a disabled-by-method function');
assert.match(getApi.headers.get('cache-control') ?? '', /no-store/i);
const apiPayload = await getApi.json();
assert.equal(apiPayload.error, 'Metoda niedozwolona.');

console.log('Tools Lab immutable Pages preview smoke PASS: ' + checked.join('; '));
console.log('NOTE: this is not a live provider test or proof of preview SHA. Verify the SHA in Cloudflare before running.');
