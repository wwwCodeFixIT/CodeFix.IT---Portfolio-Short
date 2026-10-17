import assert from 'node:assert/strict'
import { APPROVAL, LIVE_ARG, TARGET, mayProbe, probe } from './site-doctor-waf-get-only-probe.mjs'

const args = ['node', 'probe', LIVE_ARG]
const env = { SITE_DOCTOR_WAF_READONLY_APPROVAL: APPROVAL }
assert.equal(mayProbe(args, env), true)
for (const denied of [
  { args: [], env },
  { args, env: {} },
  { args, env: { SITE_DOCTOR_WAF_READONLY_APPROVAL: 'yes' } },
]) {
  let networkCalls = 0
  await assert.rejects(
    () => probe(denied, async () => { networkCalls++; throw Error('Must never reach network') }),
    /explicit owner approval/,
  )
  assert.equal(networkCalls, 0, 'No requests permitted before authorization')
}

const observed = []
const statuses = [405, 405, 429]
const fakeFetch = async (url, options) => {
  assert.equal(url, TARGET, 'Only the fixed own-domain Site Doctor endpoint is allowed')
  assert.equal(options.method, 'GET')
  assert.equal(options.redirect, 'manual')
  assert.equal(options.cache, 'no-store')
  assert.equal(options.credentials, 'omit')
  assert.equal(options.body, undefined)
  assert.equal(options.headers.Authorization, undefined)
  assert.ok(options.signal instanceof AbortSignal)
  observed.push(options.method)
  return new Response('', {
    status: statuses[observed.length - 1],
    headers: { 'cf-ray': 'mock-ray' },
  })
}
const result = await probe({ args, env }, fakeFetch)
assert.deepEqual(observed, ['GET', 'GET', 'GET'])
assert.equal(result.possibleBlockSeen, true)
assert.equal(result.verdict, 'POSSIBLE_WAF_ACTION_CHECK_SECURITY_EVENTS')
assert.equal(result.providerRequests, 0)
assert.equal(result.crmSubmissions, 0)
const inconclusive = await probe({ args, env }, async () =>
  new Response('', { status: 405, headers: { 'cf-ray': 'mock-ray' } }))
assert.equal(inconclusive.observations.length, 4)
assert.equal(inconclusive.possibleBlockSeen, false)
assert.equal(inconclusive.verdict, 'INCONCLUSIVE_HOLD')
const notCloudflare = await probe({ args, env }, async () =>
  new Response('', { status: 403 }))
assert.equal(notCloudflare.observations.length, 1)
assert.equal(notCloudflare.possibleBlockSeen, false)
assert.equal(notCloudflare.verdict, 'INCONCLUSIVE_HOLD')
console.log('LAB-12 WAF smoke PASS: explicit gate, four GET maximum, no POST/provider/CRM, no false certification.')
