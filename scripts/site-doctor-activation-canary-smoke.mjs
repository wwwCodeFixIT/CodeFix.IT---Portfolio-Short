import assert from 'node:assert/strict'
import { canRunLive, preflight, runOnce, ORIGIN } from './site-doctor-activation-canary.mjs'

const args = ['node', 'canary', '--one-live-site-doctor-scan']
const env = {
  SITE_DOCTOR_CANARY_APPROVAL: 'I_APPROVE_ONE_REAL_PAGESPEED_SCAN',
  SITE_DOCTOR_WAF_VERIFIED: 'true',
  SITE_DOCTOR_QUOTA_VERIFIED: 'true',
}
assert.equal(canRunLive(args, env), true)
for (const missing of [
  { args: [], env },
  { args, env: { ...env, SITE_DOCTOR_WAF_VERIFIED: 'false' } },
  { args, env: { ...env, SITE_DOCTOR_QUOTA_VERIFIED: 'false' } },
  { args, env: { ...env, SITE_DOCTOR_CANARY_APPROVAL: '' } },
]) {
  assert.equal(canRunLive(missing.args, missing.env), false)
  await assert.rejects(() => runOnce(missing, async () => {
    throw Error('Unsafe: network access before approval')
  }), /Live scan blocked/)
}
const sample = {
  source: 'Google PageSpeed Insights / Lighthouse',
  url: ORIGIN + '/',
  finalUrl: ORIGIN + '/',
  testedAt: '2026-10-17T10:00:00.000Z',
  scores: { performance: 79, seo: 88, accessibility: 94 },
  checks: [{ id: 'document-title', label: 'Title', status: 'pass' }],
}
function mockResponse(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store', ...extraHeaders },
  })
}
function makeMock({ doctor = true, postStatus = 200, report = sample } = {}) {
  const calls = []
  const fetcher = async (url, options) => {
    calls.push({ url, options })
    assert.equal(options.redirect, 'manual')
    assert.equal(options.cache, 'no-store')
    if (url === ORIGIN + '/api/tool-status') {
      assert.equal(options.method, 'GET')
      return mockResponse({ ai: false, doctor })
    }
    if (url === ORIGIN + '/api/site-doctor' && options.method === 'GET') {
      return mockResponse({ error: 'Metoda niedozwolona.' }, 405, { Allow: 'POST' })
    }
    if (url === ORIGIN + '/api/site-doctor' && options.method === 'POST') {
      assert.equal(options.headers.Origin, ORIGIN)
      assert.ok(options.signal instanceof AbortSignal)
      assert.deepEqual(JSON.parse(options.body), {
        url: 'https://codefix.it/', problem: 'seo', description: '', includeAi: false,
      })
      return mockResponse(report, postStatus)
    }
    throw Error('Unexpected URL: ' + url)
  }
  return { calls, fetcher }
}

const disabled = makeMock({ doctor: false })
const readOnly = await preflight(disabled.fetcher)
assert.equal(readOnly.configuredActive, false)
assert.equal(readOnly.providerRequests, 0)
assert.deepEqual(disabled.calls.map((call) => call.options.method), ['GET', 'GET'])
await assert.rejects(() => runOnce({ args, env }, disabled.fetcher), /disabled/)
assert.equal(disabled.calls.filter((call) => call.options.method === 'POST').length, 0)

const active = makeMock()
const success = await runOnce({ args, env }, active.fetcher)
assert.deepEqual([success.performance, success.seo, success.accessibility], [79, 88, 94])
assert.equal(success.providerRequests, 1)
assert.equal(success.crmSubmissions, 0)
assert.deepEqual(active.calls.map((call) => call.options.method), ['GET', 'GET', 'POST'])
assert.ok(active.calls.every((call) => !call.url.includes('openai.com') && !call.url.includes('app.codefix.it')))

const limit = makeMock({ postStatus: 429 })
await assert.rejects(() => runOnce({ args, env }, limit.fetcher), /HTTP 429/)
assert.equal(limit.calls.filter((call) => call.options.method === 'POST').length, 1)
const garbage = makeMock({ report: { ...sample, scores: { performance: null, seo: null, accessibility: null } } })
await assert.rejects(() => runOnce({ args, env }, garbage.fetcher), /No measured/)
const ai = makeMock({ report: { ...sample, aiExplanation: 'Must not exist' } })
await assert.rejects(() => runOnce({ args, env }, ai.fetcher), /AI commentary/)
const corrupt = makeMock({ report: { ...sample, url: 'https://unknown.invalid/' } })
await assert.rejects(() => runOnce({ args, env }, corrupt.fetcher), /Unexpected original scan URL/)

console.log('Site Doctor canary smoke PASS: disabled=GET-only, triple approval, one POST, no AI/CRM, no retries, report validation.')
