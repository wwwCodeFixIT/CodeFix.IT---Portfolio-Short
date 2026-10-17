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

const TOKEN = 'a'.repeat(64)
const homepage = 'https://codefix.it/'
let claimed = false
const pilotDb = {
  prepare(sql) {
    assert.match(sql, /^INSERT OR IGNORE INTO site_doctor_pilot_claims/)
    return {
      async run() {
        if (claimed) return { success: true, meta: { changes: 0 } }
        claimed = true
        return { success: true, meta: { changes: 1 } }
      },
    }
  },
}
const env = {
  SITE_DOCTOR_PILOT_DB: pilotDb,
  SITE_DOCTOR_ENABLED: 'false',
  SITE_DOCTOR_PILOT_ENABLED: 'true',
  SITE_DOCTOR_PILOT_TOKEN: TOKEN,
  SITE_DOCTOR_RATE_LIMIT_CONFIRMED: 'true',
  PAGESPEED_API_KEY: 'mocked-page-speed-key',
  AI_TOOLS_ENABLED: 'true',
  AI_RATE_LIMIT_CONFIRMED: 'true',
  OPENAI_API_KEY: 'mocked-openai-key',
}
const input = { url: homepage, problem: 'seo', description: '', includeAi: false }
function request(body = input, token = TOKEN, origin = 'https://codefix.it', base = 'https://codefix.it/api/site-doctor') {
  return new Request(base, {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(token === null ? {} : { Authorization: 'Bearer ' + token }),
    },
    body: JSON.stringify(body),
  })
}
const report = {
  lighthouseResult: {
    finalUrl: homepage,
    fetchTime: '2026-10-17T10:00:00.000Z',
    audits: { 'meta-description': { score: 0 }, 'document-title': { score: 1 } },
    categories: { performance: { score: 0.7 }, seo: { score: 0.91 }, accessibility: { score: 0.94 } },
  },
}
const previousFetch = globalThis.fetch
const outbound = []
globalThis.fetch = async (url) => {
  const destination = new URL(String(url))
  outbound.push(destination)
  assert.equal(destination.hostname, 'www.googleapis.com', 'Pilot must never call OpenAI or arbitrary hosts')
  assert.equal(destination.searchParams.get('url'), homepage)
  return Response.json(report)
}
let tested = 0
async function expectBlock(req, conf, status) {
  const before = outbound.length
  const res = await api.onRequestPost({ request: req, env: conf })
  assert.equal(res.status, status)
  assert.equal(outbound.length, before, 'Unsafe request reached provider')
  assert.doesNotMatch(await res.text(), /mocked-page-speed-key|mocked-openai-key|aaaaaaaaaaaaaaaa/)
  tested++
}
try {
  // Unauthenticated traffic sees the same unavailable state as a disabled scanner.
  await expectBlock(request(input, null), env, 503)
  await expectBlock(request(input, 'b'.repeat(64)), env, 503)
  await expectBlock(request(input, TOKEN.toUpperCase()), env, 503)
  await expectBlock(request(input, 'too-short'), env, 503)
  await expectBlock(request(input, TOKEN), { ...env, SITE_DOCTOR_PILOT_TOKEN: 'weak' }, 503)
  await expectBlock(request(input, TOKEN), { ...env, SITE_DOCTOR_PILOT_ENABLED: 'false' }, 503)
  await expectBlock(request(input, TOKEN), { ...env, SITE_DOCTOR_ENABLED: 'true' }, 503)
  await expectBlock(request(input, TOKEN), { ...env, SITE_DOCTOR_RATE_LIMIT_CONFIRMED: 'false' }, 503)
  await expectBlock(request(input, TOKEN), { ...env, PAGESPEED_API_KEY: '' }, 503)

  // A valid token is NOT sufficient for third-party domains, AI or personal text.
  await expectBlock(request({ ...input, url: 'https://other-business.pl/' }), env, 403)
  await expectBlock(request({ ...input, url: homepage + '?x=1' }), env, 403)
  await expectBlock(request({ ...input, problem: 'forms' }), env, 403)
  await expectBlock(request({ ...input, description: 'Someone may enter private data' }), env, 403)
  await expectBlock(request({ ...input, includeAi: true }), env, 403)
  await expectBlock(request(input, TOKEN, 'https://evil.example'), env, 403)
  await expectBlock(request(input, TOKEN, 'https://codefix.it', 'https://other.example/api/site-doctor'), env, 403)

  // A missing binding must fail closed before any Google request.
  await expectBlock(request(), { ...env, SITE_DOCTOR_PILOT_DB: undefined }, 503)
  assert.equal(claimed, false, 'Missing D1 must not consume an attempt')

  const res = await api.onRequestPost({ request: request(), env })
  assert.equal(res.status, 200)
  const result = await res.json()
  assert.equal(result.url, homepage)
  assert.equal(result.scores.seo, 91)
  assert.equal(result.aiExplanation, undefined)
  assert.equal(outbound.length, 1, 'Pilot canary must invoke exactly one Google request')
  await expectBlock(request(), env, 409)
  assert.equal(outbound.length, 1, 'Replayed token must never reach Google')

  // The public availability JSON MUST stay false while pilot access exists.
  const statusSource = await readFile(new URL('../functions/api/tool-status.ts', import.meta.url), 'utf8')
  const statusJs = ts.transpileModule(statusSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  const statusModule = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(statusJs))
  const status = await statusModule.onRequestGet({
    request: new Request('https://codefix.it/api/tool-status'),
    env,
  }).json()
  assert.deepEqual(status, { ai: true, doctor: false })
  console.log('Site Doctor private pilot PASS: ' + tested +
    ' blocks, only own homepage, no AI, public unavailable, one mocked PageSpeed call.')
} finally {
  globalThis.fetch = previousFetch
}
