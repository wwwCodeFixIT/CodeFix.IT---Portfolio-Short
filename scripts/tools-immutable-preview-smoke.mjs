import assert from 'node:assert/strict';
import { checkImmutablePages, extractVerifiedPreview, probeImmutablePreview } from './tools-immutable-preview-qa.mjs';

const sha = '59b64e46b7d602ee76054d81f2033e216ce2ca77';
const preview = 'https://dfc0a18d.codefix-it---portfolio-short.pages.dev';
const checks = {
  check_runs: [{
    name: 'Cloudflare Pages',
    head_sha: sha,
    status: 'completed',
    conclusion: 'success',
    output: {
      summary: `<table><tr><td><strong>Latest commit:</strong></td><td><code>${sha.slice(0,7)}</code></td></tr>
      <tr><td><strong>Preview URL:</strong></td><td>
      <a href='${preview}'>${preview}</a></td></tr>
      <tr><td><strong>Branch Preview URL:</strong></td><td>
      <a href='https://branch.codefix-it---portfolio-short.pages.dev'>alias</a></td></tr></table>`,
    },
  }],
};
assert.equal(extractVerifiedPreview(checks, sha), preview);
for (const bad of [
  { ...checks, check_runs: [{ ...checks.check_runs[0], head_sha: 'a'.repeat(40) }] },
  { ...checks, check_runs: [{ ...checks.check_runs[0], conclusion: 'failure' }] },
  { ...checks, check_runs: [{ ...checks.check_runs[0], output: { summary: checks.check_runs[0].output.summary.replace('dfc0a18d', 'evil-site') } }] },
  { ...checks, check_runs: [{ ...checks.check_runs[0], output: { summary: checks.check_runs[0].output.summary.replace(`<code>${sha.slice(0,7)}`, '<code>abcdef0') } }] },
  { ...checks, check_runs: [{ ...checks.check_runs[0], output: { summary: checks.check_runs[0].output.summary.replace(preview, 'https://codefix.it') } }] },
]) assert.throws(() => extractVerifiedPreview(bad, sha));

const seen = [];
async function mockFetch(url, opts) {
  const target = new URL(url);
  seen.push({url,method:opts.method,redirect:opts.redirect});
  assert.equal(opts.method, 'GET', 'No write request is permitted');
  assert.equal(opts.redirect, 'manual', 'No uncontrolled redirects are permitted');
  if (target.hostname === 'api.github.com') return Response.json(checks);
  assert.equal(target.origin, preview, 'No unexpected host');
  if (target.pathname === '/api/tool-status')
    return Response.json({ ai: false, doctor: false }, {
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    });
  if (target.pathname === '/api/site-doctor' || target.pathname === '/api/ai-brief')
    return Response.json({ error: 'Metoda niedozwolona' }, {
      status: 405,
      headers: { Allow: 'POST', 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    });
  if (target.pathname.endsWith('.webp'))
    return new Response(new Uint8Array([82, 73, 70, 70]), {
      status: 200, headers: { 'Content-Type': 'image/webp' },
    });
  return new Response(target.pathname === '/narzedzia/'
    ? '<html><head><title>AI Site Doctor | CodeFix.IT</title></head><body>/narzedzia/</body></html>'
    : '<html><body>Link do /narzedzia/</body></html>', {
      status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

const result = await checkImmutablePages(sha, mockFetch);
assert.equal(result.preview, preview);
assert.equal(result.routes.length, 6);
assert.equal(result.leadSubmissions, 0);
assert.equal(result.providerRequests, 0);
assert.equal(seen.length, 7);
assert.ok(seen.every(({method}) => method === 'GET'));
await assert.rejects(() => probeImmutablePreview('https://codefix.it', mockFetch));
await assert.rejects(() => probeImmutablePreview('http://dfc0a18d.codefix-it---portfolio-short.pages.dev', mockFetch));
await assert.rejects(() => checkImmutablePages('not-a-sha', mockFetch));
console.log('Immutable Pages smoke PASS: SHA bound, exact Cloudflare preview, 6 GETs, redirect/private host guards.');
