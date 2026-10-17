import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../functions/api/ai-brief.ts', import.meta.url), 'utf8')
const { outputText, diagnostics } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
})
assert.equal(diagnostics?.length ?? 0, 0)
const api = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(outputText))
const env = {
  OPENAI_API_KEY: 'qa-only-secret',
  AI_TOOLS_ENABLED: 'true',
  AI_RATE_LIMIT_CONFIRMED: 'true',
}
const input = {
  kind: 'strona',
  audience: ' Małe firmy ',
  goal: ' Potrzebuję nowej strony firmowej. ',
  website: '',
}
const completed = {
  status: 'completed',
  output: [
    { type: 'message', content: [{ type: 'output_text', text: ' Cel i zakres projektu. ' }] },
  ],
}
function request(body = input, overrides = {}) {
  return new Request(overrides.url ?? 'https://codefix.it/api/ai-brief', {
    method: 'POST',
    headers: {
      Origin: 'https://codefix.it',
      'Content-Type': 'application/json',
      ...overrides.headers,
    },
    body: overrides.raw ?? JSON.stringify(body),
    duplex: 'half',
  })
}

const originalFetch = globalThis.fetch
const calls = []
let provider = () => Response.json(completed)
let passed = 0
const failures = []
globalThis.fetch = async (url, options) => {
  calls.push({ url: String(url), options })
  return provider()
}
async function check(name, action) {
  try {
    await action()
    passed++
  } catch (error) {
    failures.push({ name, error: error.message })
  }
}
async function rejectWithoutProvider(req, status, configuration = env) {
  const before = calls.length
  const res = await api.onRequestPost({ request: req, env: configuration })
  assert.equal(res.status, status)
  assert.equal(calls.length, before, 'Rejected requests must not call a provider')
  assert.match(res.headers.get('cache-control'), /no-store/)
}

try {
  for (const configuration of [
    {},
    { ...env, AI_TOOLS_ENABLED: 'false' },
    { ...env, AI_RATE_LIMIT_CONFIRMED: 'false' },
    { ...env, OPENAI_API_KEY: '' },
  ]) {
    await check('Disabled or incomplete configuration', () =>
      rejectWithoutProvider(request(), 503, configuration),
    )
  }
  for (const url of [
    'http://codefix.it/api/ai-brief',
    'https://codefix.it:8443/api/ai-brief',
    'https://example.org/api/ai-brief',
  ]) {
    await check('Reject non-production origin ' + url, () =>
      rejectWithoutProvider(request(input, { url }), 403),
    )
  }
  for (const origin of ['', 'https://evil.example', 'null']) {
    await check('Reject foreign/missing browser origin', () =>
      rejectWithoutProvider(request(input, { headers: { Origin: origin } }), 403),
    )
  }
  for (const contentType of ['text/plain', 'application/jsonp', 'application/json-invalid']) {
    await check('Reject unsupported media type ' + contentType, () =>
      rejectWithoutProvider(request(input, { headers: { 'Content-Type': contentType } }), 415),
    )
  }
  await check('Reject oversized declared body', () =>
    rejectWithoutProvider(request(input, { headers: { 'Content-Length': '5000' } }), 413),
  )
  await check('Reject and cancel oversized streamed body', async () => {
    let cancelled = false
    const raw = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(5000))
      },
      cancel() {
        cancelled = true
      },
    })
    await rejectWithoutProvider(request(input, { raw }), 413)
    assert.equal(cancelled, true)
  })
  for (const raw of ['{', 'null', '[]', '"text"', new Uint8Array([0xff])]) {
    await check('Reject malformed JSON or UTF-8', () =>
      rejectWithoutProvider(request(input, { raw }), 400),
    )
  }
  for (const invalid of [
    { ...input, kind: 'unknown' },
    { ...input, kind: null },
    { ...input, audience: 'x'.repeat(121) },
    { ...input, audience: 42 },
    { ...input, goal: 'too short' },
    { ...input, goal: 'x'.repeat(901) },
    { ...input, website: 'x'.repeat(201) },
    { ...input, website: null },
  ]) {
    await check('Validate project fields before provider request', () =>
      rejectWithoutProvider(request(invalid), 400),
    )
  }
  await check('Completed response and bounded provider request', async () => {
    const res = await api.onRequestPost({
      request: request(input, { headers: { 'Content-Type': 'application/json; charset=utf-8' } }),
      env,
    })
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { brief: 'Cel i zakres projektu.' })
    const call = calls.at(-1)
    assert.equal(call.url, 'https://api.openai.com/v1/responses')
    assert.equal(call.options.method, 'POST')
    assert.equal(call.options.redirect, 'error')
    assert.ok(call.options.signal instanceof AbortSignal)
    assert.equal(call.options.headers.Authorization, 'Bearer qa-only-secret')
    const payload = JSON.parse(call.options.body)
    assert.equal(payload.store, false)
    assert.equal(payload.max_output_tokens, 620)
    assert.equal(payload.model, 'gpt-4.1-mini')
    assert.equal(JSON.parse(payload.input).odbiorcy, 'Małe firmy')
  })
  for (const status of ['incomplete', 'failed', 'cancelled', 'queued', undefined]) {
    await check('Do not serve unfinished text as a completed brief', async () => {
      provider = () => Response.json({ ...completed, status })
      const res = await api.onRequestPost({ request: request(), env })
      assert.equal(res.status, 502)
      assert.ok(!JSON.stringify(await res.json()).includes('Cel i zakres projektu.'))
    })
  }
  for (const output of [
    null,
    {},
    [],
    [{ content: [{ type: 'refusal', refusal: 'Refused' }] }],
    [{ content: [{ type: 'output_text', text: ' ' }] }],
  ]) {
    await check('Malformed, refused or empty provider result', async () => {
      provider = () => Response.json({ status: 'completed', output })
      assert.equal((await api.onRequestPost({ request: request(), env })).status, 502)
    })
  }
  for (const status of [401, 429, 500]) {
    await check('Provider errors do not expose payload or secret', async () => {
      provider = () => new Response('private provider message qa-only-secret', { status })
      const res = await api.onRequestPost({ request: request(), env })
      assert.equal(res.status, status === 429 ? 429 : 502)
      assert.equal(res.headers.get('retry-after'), status === 429 ? '60' : null)
      assert.doesNotMatch(await res.text(), /private provider|qa-only-secret/)
    })
  }
  await check('Timeout or connection failure', async () => {
    provider = () => {
      throw new DOMException('Timeout', 'TimeoutError')
    }
    assert.equal((await api.onRequestPost({ request: request(), env })).status, 502)
  })
  await check('Bound returned text and honor configured model', async () => {
    provider = () =>
      Response.json({
        status: 'completed',
        output: [{ content: [{ type: 'output_text', text: 'x'.repeat(5000) }] }],
      })
    const res = await api.onRequestPost({
      request: request(),
      env: { ...env, OPENAI_MODEL: 'qa-configured-model' },
    })
    assert.equal((await res.json()).brief.length, 3800)
    assert.equal(JSON.parse(calls.at(-1).options.body).model, 'qa-configured-model')
  })
  await check('GET is read-only and rejects provider invocation', async () => {
    const before = calls.length
    const res = api.onRequestGet()
    assert.equal(res.status, 405)
    assert.equal(res.headers.get('allow'), 'POST')
    assert.match(res.headers.get('content-type'), /^application\/json/)
    assert.equal(calls.length, before)
  })
} finally {
  globalThis.fetch = originalFetch
}

for (const failure of failures) console.error(failure)
assert.equal(failures.length, 0, 'AI brief API regressions')
console.log(`AI brief API smoke PASS: ${passed} cases; all provider calls mocked.`)
