/**
 * LAB-10 — Cloudflare Site Doctor infrastructure inspection.
 * Read-only Cloudflare REST API calls: GET exclusively, no redirects.
 * Never prints secrets, API responses, rule expressions, tokens or database IDs.
 *
 * Local-only invocation (credentials must never be committed or pasted):
 * CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_ZONE_ID=...
 * CLOUDFLARE_PAGES_PROJECT=... node scripts/site-doctor-infra-readiness.mjs
 *
 * A PASS means the visible configuration is plausible, NOT that an actual
 * WAF challenge or Google billing/quota has been independently verified.
 */
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

const API = 'https://api.cloudflare.com/client/v4'
const NAME = /^[a-z0-9][a-z0-9-]*$/
const ID = /^[a-f0-9]{32}$/i
const D1_UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
const PAGES = 'https://codefix.it'
const SECRET_KEYS = ['PAGESPEED_API_KEY', 'SITE_DOCTOR_PILOT_TOKEN']
const PILOT_FLAGS = ['SITE_DOCTOR_ENABLED', 'SITE_DOCTOR_PILOT_ENABLED', 'SITE_DOCTOR_RATE_LIMIT_CONFIRMED']

function variable(config, name) {
  const item = config?.env_vars?.[name]
  if (!item) return { exists: false, encrypted: false }
  return { exists: true, encrypted: item.type === 'secret_text' }
}
function state(config, name) {
  const item = config?.env_vars?.[name]
  if (!item) return 'unset'
  if (item.type !== 'plain_text') return 'unverifiable'
  return item.value === 'true' ? 'true' : item.value === 'false' ? 'false' : 'unexpected'
}
function ratelimitCandidates(entry) {
  return (entry?.rules ?? []).filter((rule) => {
    const expr = rule.expression ?? ''
    const chars = rule.ratelimit?.characteristics ?? []
    return rule.enabled === true &&
      rule.action === 'block' &&
      typeof expr === 'string' &&
      /http\.request\.uri\.path\s+eq\s+["']\/api\/site-doctor["']/.test(expr) &&
      Array.isArray(chars) &&
      (chars.includes('ip.src') || chars.includes('cf.unique_visitor_id')) &&
      Number.isInteger(rule.ratelimit?.requests_per_period) &&
      rule.ratelimit.requests_per_period > 0 &&
      Number.isInteger(rule.ratelimit?.period) &&
      rule.ratelimit.period > 0
  })
}
function blockersAdd(blockers, condition, message) {
  if (!condition) blockers.push(message)
}

export function assessCloudflare({ zone, pages, rateRuleset, database }) {
  const blockers = []
  const warnings = []
  if (zone?.name !== 'codefix.it' || zone?.status !== 'active' || zone?.paused === true) {
    blockers.push('Niepotwierdzona aktywna strefa codefix.it.')
  }
  const plan = zone?.plan?.legacy_id ?? zone?.plan?.name ?? 'nieustalony'
  const prod = pages?.deployment_configs?.production
  const preview = pages?.deployment_configs?.preview
  if (!prod || !preview) blockers.push('Brak konfiguracji produkcji lub preview w Cloudflare Pages.')
  blockersAdd(blockers, pages?.domains?.includes('codefix.it'),
    'Projekt Pages nie potwierdza domeny codefix.it.')
  const d1 = prod?.d1_databases?.SITE_DOCTOR_PILOT_DB?.id
  blockersAdd(blockers, typeof d1 === 'string' && D1_UUID.test(d1), 'Brak produkcyjnego bindingu D1 SITE_DOCTOR_PILOT_DB.')
  blockersAdd(blockers, Boolean(database && database.uuid === d1),
    'Niepotwierdzona oddzielna baza D1 wskazana przez binding.')
  blockersAdd(blockers, !preview?.d1_databases?.SITE_DOCTOR_PILOT_DB,
    'Preview nie może udostępniać produkcyjnego bindingu prywatnego pilota.')
  for (const secret of SECRET_KEYS) {
    blockersAdd(blockers, variable(prod, secret).encrypted,
      'Brak zaszyfrowanego sekretu Production: ' + secret + '.')
    blockersAdd(blockers, !variable(preview, secret).exists,
      'Sekret ' + secret + ' nie może być obecny w Preview.')
  }
  // During readiness the public switch should be OFF. Turning on the pilot
  // is a separate short-lived, manually approved production deployment.
  blockersAdd(blockers, state(prod, 'SITE_DOCTOR_ENABLED') !== 'true',
    'Publiczny Site Doctor jest włączony przed odbiorem pilota.')
  blockersAdd(blockers, state(prod, 'SITE_DOCTOR_PILOT_ENABLED') !== 'true',
    'Pilot jest już aktywny — trzeba zweryfikować jego bezpieczeństwo i czas trwania.')
  for (const flag of PILOT_FLAGS) {
    if (state(prod, flag) === 'unverifiable' || state(prod, flag) === 'unexpected') {
      blockers.push('Nie można bezpiecznie ustalić flagi ' + flag + '.')
    }
  }
  const matches = ratelimitCandidates(rateRuleset)
  blockersAdd(blockers, matches.length > 0, 'Nie wykryto aktywnej reguły WAF block/rate limiting dla /api/site-doctor i IP.')
  if (!rateRuleset?.rules?.length) warnings.push('Faza http_ratelimit nie zawiera aktywnych reguł strefy.')
  if (matches.length) warnings.push('WAF wykryty w konfiguracji, ale realne blokowanie wymaga kontroli Security Events.')
  // No Cloudflare REST GET can prove the current Google API quota, billing,
  // key restrictions, D1 table schema or actual WAF event.
  const manualChecks = [
    'Cloudflare Security Events: potwierdzony aktywny WAF blokujący nadmiarowe żądania.',
    'Cloudflare D1: istnieje tabela site_doctor_pilot_claims i brak zużytego rekordu.',
    'Google Cloud: PageSpeed API aktywne, klucz ograniczony do tego API, limity i budżet zaakceptowane.',
    'Właściciel zatwierdził jedną próbę, a operator ma procedurę natychmiastowego wyłączenia pilota.',
  ]
  return {
    status: 'HOLD',
    productionOrigin: PAGES,
    plan: String(plan).toLowerCase().slice(0, 32),
    wafRuleCandidates: matches.length,
    d1BindingPresent: Boolean(d1),
    d1DatabaseAccessible: Boolean(database && database.uuid === d1),
    productionSecretsEncrypted: SECRET_KEYS.every((key) => variable(prod, key).encrypted),
    previewSecretsAbsent: SECRET_KEYS.every((key) => !variable(preview, key).exists),
    publicScanOff: state(prod, 'SITE_DOCTOR_ENABLED') !== 'true',
    pilotOff: state(prod, 'SITE_DOCTOR_PILOT_ENABLED') !== 'true',
    blockers,
    warnings,
    manualChecks,
    note: 'HOLD until owner verifies WAF events, D1 table, Google quota and authorizes first scan. No secrets or IDs are returned.',
  }
}

export function validateInput(env) {
  assert.ok(typeof env.CLOUDFLARE_API_TOKEN === 'string' &&
    env.CLOUDFLARE_API_TOKEN.length >= 20, 'A scoped Cloudflare read-only API token is required')
  assert.match(env.CLOUDFLARE_ACCOUNT_ID ?? '', ID, 'A 32-char Cloudflare account ID is required')
  assert.match(env.CLOUDFLARE_ZONE_ID ?? '', ID, 'A 32-char Cloudflare zone ID is required')
  assert.match(env.CLOUDFLARE_PAGES_PROJECT ?? '', NAME, 'A valid Pages project name is required')
}

export async function inspectCloudflare(env = process.env, fetcher = globalThis.fetch) {
  // Always validate before the first network call: do not probe arbitrary accounts.
  validateInput(env)
  const account = env.CLOUDFLARE_ACCOUNT_ID
  const zoneId = env.CLOUDFLARE_ZONE_ID
  const project = env.CLOUDFLARE_PAGES_PROJECT
  const allowed = new Set([
    '/zones/' + zoneId,
    '/zones/' + zoneId + '/rulesets/phases/http_ratelimit/entrypoint',
    '/accounts/' + account + '/pages/projects/' + project,
  ])
  async function readApi(path, optional = false) {
    assert.ok(allowed.has(path), 'The audit only permits documented Cloudflare GET routes')
    const res = await fetcher(API + path, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      headers: { Authorization: 'Bearer ' + env.CLOUDFLARE_API_TOKEN, Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    })
    if (optional && res.status === 404) return null
    assert.equal(res.status, 200, 'Cloudflare read endpoint unavailable (' + res.status + ')')
    const data = await res.json()
    assert.equal(data?.success, true, 'Cloudflare returned a failed read response')
    return data.result
  }
  const zone = await readApi('/zones/' + zoneId)
  const pages = await readApi('/accounts/' + account + '/pages/projects/' + project)
  const ruleset = await readApi('/zones/' + zoneId + '/rulesets/phases/http_ratelimit/entrypoint', true)
  // D1 metadata is GET-only. Schema/row inspection uses POST even for SELECT,
  // and is deliberately left for an authorized operator.
  const d1Id = pages?.deployment_configs?.production?.d1_databases?.SITE_DOCTOR_PILOT_DB?.id
  let database = null
  if (typeof d1Id === 'string' && D1_UUID.test(d1Id)) {
    const dbPath = '/accounts/' + account + '/d1/database/' + d1Id
    allowed.add(dbPath)
    database = await readApi(dbPath, true)
  }
  const snapshot = assessCloudflare({
    zone, pages, rateRuleset: ruleset,
    database,
  })
  if (database?.uuid === d1Id) {
    snapshot.warnings.push('D1 istnieje; schemat tabeli i pusty stan rekordu pilota pozostają do ręcznego sprawdzenia.')
  }
  return snapshot
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const summary = await inspectCloudflare()
    console.log(JSON.stringify(summary, null, 2))
    console.log('HOLD: This read-only Cloudflare audit never authorizes a paid scan.')
  } catch {
    // Do not expose Cloudflare API responses, credentials or request headers.
    console.error('LAB-10 HOLD: odczyt konfiguracji Cloudflare nie został potwierdzony.')
    console.error('Sprawdź read-only API token, strefę, projekt i uprawnienia do WAF/Pages.')
    process.exitCode = 1
  }
}
