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

const emptySample = { lighthouseResult: { finalUrl: input.url, audits: {}, categories: {} } };
assert.equal(api.buildReport(input, emptySample), null, 'An empty measurement cannot produce a healthy report');
const completeSample = structuredClone(sample);
completeSample.lighthouseResult.audits['meta-description'].score = 1;
completeSample.lighthouseResult.audits.canonical.score = 1;
completeSample.lighthouseResult.audits['largest-contentful-paint'].numericValue = 1800;
const complete = api.buildReport(input, completeSample);
assert.ok(complete.note.includes('nie znalazł ostrzeżeń'));
assert.ok(!complete.note.includes('niepełny'));
const partialSample = structuredClone(completeSample);
delete partialSample.lighthouseResult.audits['document-title'];
delete partialSample.lighthouseResult.categories.seo;
const partial = api.buildReport(input, partialSample);
assert.equal(partial.scores.seo, null);
assert.ok(partial.note.includes('niepełny'));
assert.ok(!partial.note.includes('nie znalazł ostrzeżeń'));
assert.ok(partial.recommendations.some((item) => item.includes('Powtórz pomiar')));
assert.ok(!partial.recommendations.some((item) => item.includes('nie znaleziono istotnego problemu')));
assert.ok(report.note.includes('niepełny'), 'Known failures must also disclose missing checks');
assert.ok(report.recommendations.some((item) => item.startsWith('Meta description:')));
const scoresOnly = structuredClone(emptySample);
scoresOnly.lighthouseResult.categories = { performance: { score: 0.9 } };
assert.ok(api.buildReport(input, scoresOnly).note.includes('niepełny'));

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
let hardeningCases = 0;
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

  globalThis.fetch = async () => Response.json(emptySample);
  res = await api.onRequestPost({ request: request(input), env });
  assert.equal(res.status, 502, 'Missing measurements must surface as an unavailable report');

  globalThis.fetch = async () => new Response('Unavailable', { status: 429 });
  res = await api.onRequestPost({ request: request(input), env });
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('retry-after'), '120');

  // Invalid requests must stop before either upstream is reached.
  let invalidCalls = 0;
  globalThis.fetch = async () => { invalidCalls++; throw Error('Unexpected provider request'); };
  for (const url of ['http://codefix.it/api/site-doctor', 'https://codefix.it:8443/api/site-doctor']) {
    res = await api.onRequestPost({ request: request(input, url), env });
    assert.equal(res.status, 403);
    hardeningCases++;
  }
  for (const contentType of ['application/jsonp', 'application/json-invalid']) {
    const req = request(input);
    req.headers.set('Content-Type', contentType);
    assert.equal((await api.onRequestPost({ request: req, env })).status, 415);
    hardeningCases++;
  }
  const declared = request(input);
  declared.headers.set('Content-Length', '3072');
  assert.equal((await api.onRequestPost({ request: declared, env })).status, 413);
  hardeningCases++;
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(3072)); },
    cancel() { cancelled = true; },
  });
  const streamed = new Request('https://codefix.it/api/site-doctor', {
    method: 'POST', headers: { Origin: 'https://codefix.it', 'Content-Type': 'application/json' },
    body: stream, duplex: 'half',
  });
  assert.equal((await api.onRequestPost({ request: streamed, env })).status, 413);
  assert.equal(cancelled, true);
  hardeningCases++;
  assert.equal(invalidCalls, 0);

  const aiEnv = { ...env, AI_TOOLS_ENABLED: 'true', AI_RATE_LIMIT_CONFIRMED: 'true', OPENAI_API_KEY: 'qa-ai-secret' };
  globalThis.fetch = async () => Response.json(completeSample);
  const unicodeInput = {
    ...input,
    url: 'https://example.org/' + 'a'.repeat(240) + '?q=' + 'b'.repeat(130),
    description: '漢'.repeat(400),
  };
  assert.ok(new TextEncoder().encode(JSON.stringify(unicodeInput)).length > 1300);
  assert.equal((await api.onRequestPost({ request: request(unicodeInput), env })).status, 200,
    'The advertised 400-character description and valid URL must fit the UTF-8 body limit');
  hardeningCases++;
  const withAi = { ...input, includeAi: true };
  let aiCalls = 0;
  let aiProvider = () => Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: 'Wyjaśnienie pomiaru.' }] }] });
  globalThis.fetch = async (url, options) => {
    const host = new URL(String(url)).hostname;
    if (host === 'www.googleapis.com') return Response.json(completeSample);
    assert.equal(String(url), 'https://api.openai.com/v1/responses');
    aiCalls++;
    assert.equal(options.redirect, 'error');
    const payload = JSON.parse(options.body);
    assert.equal(payload.store, false);
    assert.equal(payload.max_output_tokens, 260);
    return aiProvider();
  };
  // Configured AI still requires an explicit visitor opt-in.
  res = await api.onRequestPost({ request: request(input), env: aiEnv });
  assert.equal(res.status, 200);
  assert.equal(aiCalls, 0);
  hardeningCases++;
  res = await api.onRequestPost({ request: request(withAi), env: aiEnv });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).aiExplanation, 'Wyjaśnienie pomiaru.');
  assert.equal(aiCalls, 1);
  hardeningCases++;
  for (const status of ['incomplete', 'failed', 'cancelled', undefined]) {
    aiProvider = () => Response.json({ status, output: [{ content: [{ type: 'output_text', text: 'Niedokończone wyjaśnienie' }] }] });
    res = await api.onRequestPost({ request: request(withAi), env: aiEnv });
    assert.equal(res.status, 200, 'Optional AI cannot remove the real Lighthouse report');
    const body = await res.json();
    assert.equal(body.aiExplanation, undefined);
    assert.equal(body.scores.performance, 71);
    hardeningCases++;
  }
  for (const providerFailure of [
    () => new Response('private error qa-ai-secret', { status: 429 }),
    () => new Response('not JSON'),
    () => { throw new DOMException('Timeout', 'TimeoutError'); },
  ]) {
    aiProvider = providerFailure;
    res = await api.onRequestPost({ request: request(withAi), env: aiEnv });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.aiExplanation, undefined);
    assert.equal(body.scores.performance, 71);
    assert.doesNotMatch(JSON.stringify(body), /private error|qa-ai-secret/);
    hardeningCases++;
  }
  for (const [providerFailure, expected] of [
    [() => { throw new DOMException('Timeout', 'TimeoutError'); }, 504],
    [() => new Response('not JSON'), 502],
    [() => new Response('private error local-test-secret', { status: 500 }), 502],
  ]) {
    globalThis.fetch = providerFailure;
    res = await api.onRequestPost({ request: request(input), env });
    assert.equal(res.status, expected);
    assert.doesNotMatch(await res.text(), /private error|local-test-secret/);
    hardeningCases++;
  }
} finally {
  globalThis.fetch = fetchOriginal;
}

console.log(`Site Doctor API smoke PASS: input security, gated API, real-report mapping and ${hardeningCases} additional provider/activation cases. All provider calls mocked.`);
