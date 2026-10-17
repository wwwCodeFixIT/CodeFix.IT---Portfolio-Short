/**
 * Immutable Cloudflare preview smoke: resolves the exact URL from a successful
 * GitHub Cloudflare Pages check for the exact commit SHA. No guessed URLs.
 *
 * Read-only: GET /, /narzedzia/, logo and three /api/* endpoints.
 * This script NEVER submits leads or calls PageSpeed/OpenAI.
 *
 * Usage: node scripts/tools-immutable-preview-qa.mjs <40-char-commit-sha>
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const REPO = 'wwwCodeFixIT/CodeFix.IT---Portfolio-Short';
const PREVIEW_SUFFIX = '.codefix-it---portfolio-short.pages.dev';
const PATHS = ['/', '/narzedzia/', '/brand/codefix-devil-mark.webp',
  '/api/tool-status', '/api/ai-brief', '/api/site-doctor'];

export function extractVerifiedPreview(checks, sha) {
  assert.match(sha, /^[a-f0-9]{40}$/i, 'A full 40-character commit SHA is required');
  assert.ok(Array.isArray(checks?.check_runs), 'Malformed GitHub checks response');
  const deployment = checks.check_runs.find((check) =>
    check.name === 'Cloudflare Pages' &&
    check.head_sha === sha &&
    check.status === 'completed' &&
    check.conclusion === 'success'
  );
  assert.ok(deployment, 'A successful Cloudflare Pages check for the requested SHA is required');
  const summary = deployment.output?.summary;
  assert.equal(typeof summary, 'string', 'Cloudflare must publish a preview URL');
  const match = summary.match(/<strong>Preview URL:<\/strong>[\s\S]*?<a href=['"](https:\/\/[0-9a-f]{8}\.codefix-it---portfolio-short\.pages\.dev\/?)['"]/i);
  assert.ok(match, 'Cloudflare check must contain a matching immutable preview URL');
  assert.ok(summary.includes('<code>' + sha.slice(0, 7)), 'Preview SHA must match the check summary');

  const url = new URL(match[1]);
  assert.equal(url.protocol, 'https:');
  assert.match(url.hostname, /^[0-9a-f]{8}\.codefix-it---portfolio-short\.pages\.dev$/);
  assert.ok(url.hostname.endsWith(PREVIEW_SUFFIX));
  assert.equal(url.username, '');
  assert.equal(url.password, '');
  assert.equal(url.port, '');
  assert.equal(url.search, '');
  assert.equal(url.hash, '');
  return url.origin;
}

export async function probeImmutablePreview(origin, fetcher = globalThis.fetch) {
  const base = new URL(origin);
  assert.match(base.hostname, /^[0-9a-f]{8}\.codefix-it---portfolio-short\.pages\.dev$/);
  assert.equal(base.protocol, 'https:');
  assert.equal(base.href, base.origin + '/');
  const results = [];
  for (const path of PATHS) {
    const url = new URL(path, base);
    assert.equal(url.origin, base.origin);
    const res = await fetcher(url.href, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual',
      headers: { Accept: path.endsWith('.webp') ? 'image/webp' : 'text/html, application/json' },
      signal: AbortSignal.timeout(16000),
    });
    const wanted = path === '/api/ai-brief' || path === '/api/site-doctor' ? 405 : 200;
    assert.equal(res.status, wanted, path + ': expected ' + wanted + ', got ' + res.status);
    if (path.startsWith('/api/')) {
      assert.match(res.headers.get('cache-control') ?? '', /\bno-store\b/i,
        path + ': API response must not be cached');
      assert.match(res.headers.get('content-type') ?? '', /^application\/json\b/i,
        path + ': expected a JSON function');
      if (wanted === 405) {
        assert.equal(res.headers.get('allow'), 'POST', path + ': a real Pages Function is required');
        assert.equal(typeof (await res.json()).error, 'string');
      } else {
        const flags = await res.json();
        assert.deepEqual(Object.keys(flags).sort(), ['ai', 'doctor']);
        assert.equal(typeof flags.ai, 'boolean');
        assert.equal(typeof flags.doctor, 'boolean');
      }
    } else if (path.endsWith('.webp')) {
      assert.match(res.headers.get('content-type') ?? '', /image\/webp/i);
      await res.body?.cancel();
    } else {
      const html = await res.text();
      assert.match(res.headers.get('content-type') ?? '', /text\/html/i);
      if (path === '/narzedzia/') {
        assert.match(html, /AI Site Doctor/i, 'Lab page lacks indexable Site Doctor content');
        assert.match(html, /<title>[^<]+/i, 'Lab page missing static SEO title');
        assert.match(html, /\/narzedzia\//i, 'Lab page URL not present in prerender');
      } else {
        assert.match(html, /\/narzedzia\//i, 'Homepage lacks laboratory link');
      }
    }
    results.push({ path, status: res.status });
  }
  return results;
}

export async function checkImmutablePages(sha, fetcher = globalThis.fetch, token = '') {
  assert.match(sha, /^[a-f0-9]{40}$/i);
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const result = await fetcher('https://api.github.com/repos/' + REPO + '/commits/' + sha + '/check-runs?per_page=100', {
    method: 'GET', cache: 'no-store', redirect: 'manual', headers,
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(result.status, 200, 'Could not read verified GitHub deployment checks');
  const checks = await result.json();
  const preview = extractVerifiedPreview(checks, sha);
  const routes = await probeImmutablePreview(preview, fetcher);
  return { sha, preview, routes, providerRequests: 0, leadSubmissions: 0 };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const sha = process.argv[2] ?? '';
  try {
    const outcome = await checkImmutablePages(sha, globalThis.fetch, process.env.GITHUB_TOKEN ?? '');
    console.log(JSON.stringify({ status: 'passed', ...outcome }, null, 2));
    console.log('READ ONLY: no POST, no provider requests, no CRM submissions.');
  } catch (error) {
    console.error('Immutable preview QA FAILED:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
