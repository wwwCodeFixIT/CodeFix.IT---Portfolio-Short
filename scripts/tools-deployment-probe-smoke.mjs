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
  return response()
})
assert.equal(results.length, 2)
assert.deepEqual(
  calls.map((x) => x.url),
  ['https://codefix.it/api/ai-brief', 'https://codefix.it/api/site-doctor'],
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
console.log('Deployment probe smoke PASS: 8 cases; GET-only, no live requests.')
