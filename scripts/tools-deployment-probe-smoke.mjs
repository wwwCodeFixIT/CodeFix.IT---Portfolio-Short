import assert from 'node:assert/strict'
import { checkToolsDeployment } from './tools-deployment-smoke.mjs'

const response = () =>
  Response.json(
    { error: 'Metoda niedozwolona.' },
    {
      status: 405,
      headers: { Allow: 'POST', 'Cache-Control': 'no-store, max-age=0' },
    },
  )
const calls = []
const results = await checkToolsDeployment(async (url, options) => {
  calls.push({ url, options })
  return url.endsWith('/tool-status')
    ? Response.json({ ai: false, doctor: false }, { headers: { 'Cache-Control': 'no-store' } })
    : response()
})
assert.equal(results.length, 3)
assert.deepEqual(
  calls.map((x) => x.url),
  [
    'https://codefix.it/api/ai-brief',
    'https://codefix.it/api/site-doctor',
    'https://codefix.it/api/tool-status',
  ],
)
assert.ok(
  calls.every(
    (x) => x.options.method === 'GET' && x.options.redirect === 'error' && !x.options.body,
  ),
)
assert.ok(calls.every((x) => x.options.signal instanceof AbortSignal))
for (const badResponse of [
  () => new Response('<html>SPA fallback</html>'),
  () => new Response('not found', { status: 404 }),
  () => Response.json({ error: 'missing allow' }, { status: 405 }),
  () => new Response('<html>not JSON</html>', { status: 405, headers: { Allow: 'POST' } }),
  () => Response.json({ error: 'cached' }, { status: 405, headers: { Allow: 'POST' } }),
  () => Response.json({}, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } }),
  () => {
    throw new Error('Unavailable')
  },
]) {
  await assert.rejects(() => checkToolsDeployment(async () => badResponse()))
}
for (const invalidStatus of [
  () => new Response('Not found', { status: 404 }),
  () => Response.json({ ai: 'true', doctor: false }, { headers: { 'Cache-Control': 'no-store' } }),
  () =>
    Response.json(
      { ai: false, doctor: false, secret: 'qa-only-value' },
      { headers: { 'Cache-Control': 'no-store' } },
    ),
])
  await assert.rejects(() =>
    checkToolsDeployment(async (url) =>
      url.endsWith('/tool-status') ? invalidStatus() : response(),
    ),
  )
console.log('Deployment probe smoke PASS: 11 cases; GET-only, no live requests.')
