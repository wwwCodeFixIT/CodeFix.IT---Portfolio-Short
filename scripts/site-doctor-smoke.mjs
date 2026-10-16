import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const filename = new URL('../functions/api/site-doctor.ts', import.meta.url);
const source = await readFile(filename, 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(transpiled.diagnostics?.length ?? 0, 0, 'Site Doctor function must transpile');
const api = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(transpiled.outputText));

for (const address of [
  'http://example.org', 'https://localhost', 'https://127.0.0.1',
  'https://[::1]/', 'https://192.168.1.4', 'https://10.0.0.1',
  'https://user:password@example.org', 'https://site.local',
  'https://site.internal', 'https://site.test', 'https://site.onion',
  'https://example.org:8080', 'https://example.org/#token',
  'https://0x7f000001', 'https://localhost.example.org',
  'https://a..example.org', 'https://test.example.org/\nHEADER',
]) {
  assert.equal(api.validatePublicUrl(address), null, 'Private or invalid address accepted: ' + address);
}
assert.equal(api.validatePublicUrl('https://www.codefix.it/blog/'), 'https://www.codefix.it/blog/');

const sample = {
  lighthouseResult: {
    finalUrl: 'https://example.org/',
    fetchTime: '2026-10-16T13:00:00.000Z',
    audits: {
      'document-title': { score: 1 },
      'meta-description': { score: 0 },
      'html-has-lang': { score: 1 },
      'is-crawlable': { score: 1 },
      canonical: { score: null, scoreDisplayMode: 'manual' },
      viewport: { score: 1 },
      'largest-contentful-paint': { numericValue: 3200 },
      'cumulative-layout-shift': { numericValue: 0.03 },
      'total-blocking-time': { numericValue: 160 },
    },
    categories: {
      performance: { score: 0.71 },
      seo: { score: 0.89 },
      accessibility: { score: 0.96 },
    },
  },
};
const input = { url: 'https://example.org/', problem: 'forms', description: 'Mail nie przychodzi', includeAi: false };
const report = api.buildReport(input, sample);
assert.equal(report.scores.performance, 71);
assert.equal(report.scores.seo, 89);
assert.equal(report.checks.find((item) => item.id === 'meta-description').status, 'fail');
assert.equal(report.checks.find((item) => item.id === 'canonical').status, 'unknown');
assert.equal(report.checks.find((item) => item.id === 'largest-contentful-paint').status, 'warning');
assert.ok(report.recommendations.some((item) => item.includes('Lighthouse nie potwierdza')));
assert.equal(api.buildReport(input, { lighthouseResult: { runtimeError: { code: 'ERROR' } } }), null);

const env = {
  SITE_DOCTOR_ENABLED: 'true',
  SITE_DOCTOR_RATE_LIMIT_CONFIRMED: 'true',
  PAGESPEED_API_KEY: 'local-test-secret',
};
function request(body, url = 'https://codefix.it/api/site-doctor', origin = 'https://codefix.it') {
  return new Request(url, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

let outbound = [];
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (url) => {
  outbound.push(new URL(String(url)));
  return Response.json(sample);
};

try {
  let res = await api.onRequestPost({
    request: request(input),
    env: {},
  });
  assert.equal(res.status, 503, 'Disabled must fail closed');
  assert.equal(outbound.length, 0, 'Disabled function must not fetch');

  res = await api.onRequestPost({ request: request(input), env: { ...env, SITE_DOCTOR_RATE_LIMIT_CONFIRMED: 'false' } });
  assert.equal(res.status, 503);
  res = await api.onRequestPost({ request: request(input, 'https://other.example/api/site-doctor'), env });
  assert.equal(res.status, 403);
  res = await api.onRequestPost({ request: request(input, undefined, 'https://evil.test'), env });
  assert.equal(res.status, 403);
  res = await api.onRequestPost({ request: request({ ...input, url: 'https://127.0.0.1' }), env });
  assert.equal(res.status, 400);
  assert.equal(outbound.length, 0, 'Unsafe requests must not reach Google');

  res = await api.onRequestPost({ request: request(input), env });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store, private, max-age=0');
  const body = await res.json();
  assert.equal(body.scores.performance, 71);
  assert.equal(body.aiExplanation, undefined);
  assert.equal(outbound.length, 1);
  assert.equal(outbound[0].hostname, 'www.googleapis.com');
  assert.equal(outbound[0].searchParams.get('url'), input.url);
  assert.deepEqual(outbound[0].searchParams.getAll('category'), ['performance', 'seo', 'accessibility']);
  assert.equal(outbound[0].searchParams.get('key'), 'local-test-secret');

  // AI opt-in is ignored unless dedicated AI flags and key are enabled.
  res = await api.onRequestPost({ request: request({ ...input, includeAi: true }), env });
  assert.equal(res.status, 200);
  assert.equal(outbound.length, 2);
  assert.ok(!(await res.json()).aiExplanation);
  assert.equal(api.onRequestGet().status, 405);

  globalThis.fetch = async () => new Response('Unavailable', { status: 429 });
  res = await api.onRequestPost({ request: request(input), env });
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('retry-after'), '120');
} finally {
  globalThis.fetch = fetchOriginal;
}

console.log('Site Doctor API smoke PASS: input security, gated API, real-report mapping, limited provider and no false AI.');
