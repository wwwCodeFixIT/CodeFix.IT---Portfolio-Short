/**
 * Site Doctor activation: a safe GET-only preflight by default, with an
 * explicitly owner-authorized, SINGLE paid-provider canary when ready.
 *
 * Neither mode ever calls OpenAI nor touches the CRM. This does NOT inspect
 * or prove Cloudflare WAF rules, API key restrictions, or billing limits.
 */
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

export const ORIGIN = 'https://codefix.it'
const AUTHORIZE = 'I_APPROVE_ONE_REAL_PAGESPEED_SCAN'
const CANARY_ARG = '--one-live-site-doctor-scan'

export function canRunLive(args, env) {
  return args.includes(CANARY_ARG) &&
    env.SITE_DOCTOR_CANARY_APPROVAL === AUTHORIZE &&
    env.SITE_DOCTOR_WAF_VERIFIED === 'true' &&
    env.SITE_DOCTOR_QUOTA_VERIFIED === 'true' &&
    /^[a-f0-9]{64}$/.test(env.SITE_DOCTOR_PILOT_TOKEN ?? '')
}

async function getJson(fetcher, path) {
  const res = await fetcher(ORIGIN + path, {
    method: 'GET',
    redirect: 'manual',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  })
  assert.equal(res.status, path === '/api/tool-status' ? 200 : 405,
    path + ': unexpected HTTP ' + res.status)
  assert.match(res.headers.get('content-type') ?? '', /^application\/json\b/i,
    path + ': expected an API response, not a static HTML fallback')
  assert.match(res.headers.get('cache-control') ?? '', /no-store/i)
  if (path === '/api/site-doctor') assert.equal(res.headers.get('allow'), 'POST')
  return res.json()
}

export async function preflight(fetcher = globalThis.fetch) {
  const availability = await getJson(fetcher, '/api/tool-status')
  assert.ok(availability && typeof availability.doctor === 'boolean')
  assert.equal(typeof availability.ai, 'boolean')
  assert.deepEqual(Object.keys(availability).sort(), ['ai', 'doctor'])
  const method = await getJson(fetcher, '/api/site-doctor')
  assert.equal(typeof method?.error, 'string')
  return {
    endpoint: ORIGIN + '/api/site-doctor',
    configuredActive: availability.doctor,
    aiConfiguredActive: availability.ai,
    providerRequests: 0,
    crmSubmissions: 0,
    note: 'GET-only. This cannot certify WAF or the supplier quota.',
  }
}

function validateReport(report) {
  assert.ok(report && typeof report === 'object' && !Array.isArray(report), 'Invalid report JSON')
  assert.equal(report.source, 'Google PageSpeed Insights / Lighthouse')
  assert.equal(report.url, ORIGIN + '/', 'Unexpected original scan URL')
  assert.ok(typeof report.testedAt === 'string' && Number.isFinite(Date.parse(report.testedAt)))
  assert.ok(typeof report.finalUrl === 'string' && report.finalUrl.startsWith('https://'))
  assert.ok(report.scores && typeof report.scores === 'object')
  const scores = ['performance', 'seo', 'accessibility'].map((name) => {
    const score = report.scores[name]
    assert.ok(score === null || (Number.isInteger(score) && score >= 0 && score <= 100),
      name + ': score outside [0,100]')
    return score
  })
  assert.ok(scores.some((value) => value !== null), 'No measured Lighthouse scores')
  assert.ok(Array.isArray(report.checks) && report.checks.length > 0, 'No Lighthouse audits')
  assert.equal(report.aiExplanation, undefined, 'This test must never generate an AI commentary')
  return {
    performance: scores[0],
    seo: scores[1],
    accessibility: scores[2],
    checks: report.checks.length,
  }
}

export async function runOnce(options = {}, fetcher = globalThis.fetch) {
  const { args = [], env = {} } = options
  // Fail CLOSED *before* any live network access. Explicitly approve the
  // real provider call and separately attest WAF and quota configuration.
  // The private token must only be supplied from a local/owner-controlled secret store.
  assert.ok(canRunLive(args, env), 'Live scan blocked: explicit approval, WAF and quota attestations are required')
  const state = await preflight(fetcher)
  assert.equal(state.configuredActive, false,
    'Pilot must not run while public Site Doctor is available')
  const body = JSON.stringify({
    url: ORIGIN + '/',
    problem: 'seo',
    description: '',
    includeAi: false,
  })
  // Exactly one POST. Never retry automatically (even on 429 / 5xx / timeout).
  const res = await fetcher(ORIGIN + '/api/site-doctor', {
    method: 'POST',
    cache: 'no-store',
    redirect: 'manual',
    headers: {
      Origin: ORIGIN,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + env.SITE_DOCTOR_PILOT_TOKEN,
    },
    body,
    signal: AbortSignal.timeout(70000),
  })
  assert.equal(res.status, 200, 'PageSpeed canary HTTP ' + res.status + ' (no retry)')
  assert.match(res.headers.get('content-type') ?? '', /^application\/json\b/i)
  const data = await res.json()
  return {
    ...validateReport(data),
    providerRequests: 1,
    crmSubmissions: 0,
    scanUrl: ORIGIN + '/',
    note: 'Single live pilot request with public scanner disabled. Disable the pilot and rotate its token after use.',
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const result = process.argv.includes(CANARY_ARG)
      ? await runOnce({ args: process.argv, env: process.env })
      : await preflight()
    console.log(JSON.stringify({ status: 'passed', ...result }, null, 2))
  } catch (error) {
    console.error('Site Doctor activation check:', error instanceof Error ? error.message : String(error))
    console.error('No automatic retries; do not assume provider activity if the request timed out.')
    process.exitCode = 1
  }
}
