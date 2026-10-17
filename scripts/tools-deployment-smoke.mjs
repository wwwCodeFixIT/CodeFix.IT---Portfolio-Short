import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

// These GET requests never invoke a paid provider or submit a lead.
export async function checkToolsDeployment(fetcher = globalThis.fetch) {
  const results = []
  for (const path of ['/api/ai-brief', '/api/site-doctor', '/api/tool-status']) {
    const response = await fetcher('https://codefix.it' + path, {
      method: 'GET',
      redirect: 'error',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })
    const statusRoute = path === '/api/tool-status'
    assert.equal(response.status, statusRoute ? 200 : 405, `${path}: unexpected function status`)
    if (!statusRoute)
      assert.equal(response.headers.get('allow'), 'POST', `${path}: missing POST method contract`)
    assert.match(
      response.headers.get('content-type') ?? '',
      /^application\/json(?:;|$)/i,
      `${path}: not JSON`,
    )
    assert.match(
      response.headers.get('cache-control') ?? '',
      /\bno-store\b/i,
      `${path}: cached API response`,
    )
    const body = await response.json()
    if (statusRoute) {
      assert.ok(
        body && typeof body.ai === 'boolean' && typeof body.doctor === 'boolean',
        'Invalid availability',
      )
      assert.deepEqual(
        Object.keys(body).sort(),
        ['ai', 'doctor'],
        'Availability must not expose configuration details',
      )
    } else
      assert.ok(body && typeof body.error === 'string', `${path}: unexpected response contract`)
    results.push({ path, status: response.status, method: 'GET', ...(statusRoute ? body : {}) })
  }
  return results
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const results = await checkToolsDeployment()
    console.log(JSON.stringify({ status: 'passed', results, providerCalls: 0, leadSubmissions: 0 }))
    console.log(
      'Functions are deployed. This GET-only probe does not verify secrets, WAF or live providers.',
    )
  } catch (error) {
    console.error(
      'Tools deployment probe failed:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    console.error('No provider requests were sent.')
    process.exitCode = 1
  }
}
