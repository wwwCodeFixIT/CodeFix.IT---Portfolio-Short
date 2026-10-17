import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../functions/api/site-doctor.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
})
assert.equal(compiled.diagnostics?.length ?? 0, 0)
const api = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(compiled.outputText))
const token = 'a'.repeat(64)
const page = 'https://codefix.it/'
const body = JSON.stringify({ url: page, problem: 'seo', description: '', includeAi: false })
const scanRequest = () => new Request('https://codefix.it/api/site-doctor', {
  method: 'POST',
  headers: { Origin: page.slice(0, -1), Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
  body,
})
function createDb() {
  let used = false
  let claims = 0
  return {
    get claims() { return claims },
    prepare(sql) {
      assert.match(sql, /^INSERT OR IGNORE INTO site_doctor_pilot_claims /)
      assert.match(sql, /VALUES \(1, datetime\('now'\)\)/)
      return {
        async run() {
          // Represents one unique-index insert; concurrent attempts get 0.
          if (used) return { success: true, meta: { changes: 0 } }
          used = true
          claims++
          return { success: true, meta: { changes: 1 } }
        },
      }
    },
  }
}
function env(db) {
  return {
    SITE_DOCTOR_ENABLED: 'false',
    SITE_DOCTOR_PILOT_ENABLED: 'true',
    SITE_DOCTOR_PILOT_TOKEN: token,
    SITE_DOCTOR_RATE_LIMIT_CONFIRMED: 'true',
    PAGESPEED_API_KEY: 'test-not-a-real-key',
    SITE_DOCTOR_PILOT_DB: db,
  }
}
const lighthouse = {
  lighthouseResult: {
    finalUrl: page,
    fetchTime: '2026-10-17T10:00:00.000Z',
    audits: { 'document-title': { score: 1 }, 'meta-description': { score: 0.5 } },
    categories: { performance: { score: 0.81 }, seo: { score: 0.86 }, accessibility: { score: 0.96 } },
  },
}
const fetchBefore = globalThis.fetch
let upstreamCalls = 0
let upstream = () => Response.json(lighthouse)
globalThis.fetch = async (url) => {
  upstreamCalls++
  const endpoint = new URL(String(url))
  assert.equal(endpoint.hostname, 'www.googleapis.com')
  assert.equal(endpoint.searchParams.get('url'), page)
  return upstream()
}

try {
  // Without persistent D1, no real Google requests are possible.
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(undefined) })).status, 503)
  assert.equal(upstreamCalls, 0)

  const firstDb = createDb()
  const requests = await Promise.all(
    Array.from({ length: 12 }, () =>
      api.onRequestPost({ request: scanRequest(), env: env(firstDb) }),
    ),
  )
  const statuses = requests.map((res) => res.status)
  assert.equal(statuses.filter((status) => status === 200).length, 1)
  assert.equal(statuses.filter((status) => status === 409).length, 11)
  assert.equal(firstDb.claims, 1)
  assert.equal(upstreamCalls, 1, 'Only first claim may call Google')
  const accepted = requests.find((res) => res.status === 200)
  assert.equal((await accepted.json()).source, 'Google PageSpeed Insights / Lighthouse')

  // A second request from another instance using the SAME binding is blocked.
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(firstDb) })).status, 409)
  assert.equal(upstreamCalls, 1)

  // Missing SQL schema/failed binding must fail shut.
  const dbThrows = { prepare() { throw Error('missing table') } }
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(dbThrows) })).status, 503)
  const dbNetwork = { prepare() { return { run: async () => { throw Error('unreachable') } } } }
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(dbNetwork) })).status, 503)
  const dbFail = { prepare() { return { run: async () => ({ success: false, meta: { changes: 0 } }) } } }
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(dbFail) })).status, 503)
  const dbUnknown = { prepare() { return { run: async () => ({ success: true, meta: {} }) } } }
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(dbUnknown) })).status, 409)
  assert.equal(upstreamCalls, 1, 'Any D1 fault must block Google')

  // A provider failure still CONSUMES the claim: no auto retry.
  upstream = () => new Response('limit', { status: 429 })
  const failureDb = createDb()
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(failureDb) })).status, 429)
  assert.equal((await api.onRequestPost({ request: scanRequest(), env: env(failureDb) })).status, 409)
  assert.equal(failureDb.claims, 1)
  assert.equal(upstreamCalls, 2)

  // No claim may be consumed by invalid input or missing WAF gate.
  const guardDb = createDb()
  assert.equal((await api.onRequestPost({
    request: scanRequest(), env: { ...env(guardDb), SITE_DOCTOR_RATE_LIMIT_CONFIRMED: 'false' },
  })).status, 503)
  assert.equal(guardDb.claims, 0)
  assert.equal(upstreamCalls, 2)

  // The SQL schema must have a unique singleton key and not be reset automatically.
  const migration = await readFile(new URL('../migrations/site-doctor-pilot/0001_one_shot.sql', import.meta.url), 'utf8')
  assert.match(migration, /id INTEGER PRIMARY KEY CHECK \(id = 1\)/)
  assert.doesNotMatch(migration, /DROP TABLE|DELETE FROM/i)
  console.log('One-shot pilot D1 smoke PASS: 12 concurrent POSTs -> 1 provider call, replay denied, D1 fail-closed, failed provider consumes claim.')
} finally {
  globalThis.fetch = fetchBefore
}
