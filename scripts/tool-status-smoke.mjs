import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

async function load(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
  })
  assert.equal(result.diagnostics?.length ?? 0, 0)
  return import('data:text/javascript;charset=utf-8,' + encodeURIComponent(result.outputText))
}
const [status, brief, doctor] = await Promise.all([
  load('../functions/api/tool-status.ts'),
  load('../functions/api/ai-brief.ts'),
  load('../functions/api/site-doctor.ts'),
])
const original = globalThis.fetch
let calls = 0
globalThis.fetch = async () => {
  calls++
  throw Error('No provider requests allowed')
}
const names = [
  'AI_TOOLS_ENABLED',
  'AI_RATE_LIMIT_CONFIRMED',
  'OPENAI_API_KEY',
  'SITE_DOCTOR_ENABLED',
  'SITE_DOCTOR_RATE_LIMIT_CONFIRMED',
  'PAGESPEED_API_KEY',
]
function post(path) {
  return new Request('https://codefix.it/api/' + path, {
    method: 'POST',
    headers: { Origin: 'https://codefix.it', 'Content-Type': 'application/json' },
    body: '{}',
  })
}
try {
  for (let mask = 0; mask < 64; mask++) {
    const env = Object.fromEntries(
      names.map((name, index) => [
        name,
        mask & (1 << index) ? (name.endsWith('_KEY') ? 'qa-secret-value' : 'true') : '',
      ]),
    )
    const response = status.onRequestGet({
      request: new Request('https://codefix.it/api/tool-status'),
      env,
    })
    assert.equal(response.status, 200)
    assert.match(response.headers.get('cache-control'), /no-store/)
    const data = await response.json()
    assert.deepEqual(Object.keys(data).sort(), ['ai', 'doctor'])
    assert.equal(typeof data.ai, 'boolean')
    assert.equal(typeof data.doctor, 'boolean')
    const briefResponse = await brief.onRequestPost({ request: post('ai-brief'), env })
    const doctorResponse = await doctor.onRequestPost({ request: post('site-doctor'), env })
    assert.equal(
      data.ai,
      briefResponse.status !== 503,
      'Availability must match authoritative AI gate',
    )
    assert.equal(
      data.doctor,
      doctorResponse.status !== 503,
      'Availability must match authoritative scan gate',
    )
    assert.doesNotMatch(JSON.stringify(data), /qa-secret-value|KEY|CONFIRMED/)
  }
  const env = Object.fromEntries(
    names.map((name) => [name, name.endsWith('_KEY') ? 'qa-secret-value' : 'true']),
  )
  for (const origin of [
    'http://codefix.it',
    'https://codefix.it:8443',
    'https://preview.pages.dev',
  ]) {
    assert.deepEqual(
      await status.onRequestGet({ request: new Request(origin + '/api/tool-status'), env }).json(),
      { ai: false, doctor: false },
    )
  }
  assert.equal(calls, 0)
} finally {
  globalThis.fetch = original
}
console.log(
  'Tool availability PASS: 64 configurations match POST gates; 3 non-production origins off; no provider calls or secret disclosure.',
)
