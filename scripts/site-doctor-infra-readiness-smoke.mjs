import assert from 'node:assert/strict'
import { assessCloudflare, inspectCloudflare, validateInput } from './site-doctor-infra-readiness.mjs'

const uuid = '12345678-1111-4222-8aaa-123456789abc'
const key = 'mock-not-real'
const rule = {
  enabled: true, action: 'block',
  expression: '(http.host eq "codefix.it" and http.request.uri.path eq "/api/site-doctor")',
  ratelimit: { characteristics: ['cf.colo.id', 'ip.src'], period: 10, requests_per_period: 2, mitigation_timeout: 10 },
}
const zone = { name: 'codefix.it', status: 'active', paused: false, plan: { legacy_id: 'free' } }
const vars = {
  PAGESPEED_API_KEY: { type: 'secret_text', value: key },
  SITE_DOCTOR_PILOT_TOKEN: { type: 'secret_text', value: key },
  SITE_DOCTOR_ENABLED: { type: 'plain_text', value: 'false' },
  SITE_DOCTOR_PILOT_ENABLED: { type: 'plain_text', value: 'false' },
  SITE_DOCTOR_RATE_LIMIT_CONFIRMED: { type: 'plain_text', value: 'false' },
}
const pages = {
  domains: ['codefix.it'],
  deployment_configs: {
    production: { env_vars: vars, d1_databases: { SITE_DOCTOR_PILOT_DB: { id: uuid } } },
    preview: { env_vars: {}, d1_databases: {} },
  },
}
const input = { zone, pages, rateRuleset: { rules: [rule] }, database: { uuid } }
const good = assessCloudflare(input)
assert.equal(good.status, 'HOLD')
assert.equal(good.blockers.length, 0)
assert.equal(good.wafRuleCandidates, 1)
assert.equal(good.d1DatabaseAccessible, true)
assert.ok(good.manualChecks.some((x) => x.includes('Google')))
assert.ok(!JSON.stringify(good).includes(key), 'No config values may leak into output')
for (const variant of [
  { ...input, rateRuleset: { rules: [] } },
  { ...input, rateRuleset: { rules: [{ ...rule, enabled: false }] } },
  { ...input, rateRuleset: { rules: [{ ...rule, action: 'skip' }] } },
  { ...input, rateRuleset: { rules: [{ ...rule, ratelimit: { ...rule.ratelimit, characteristics: ['cf.colo.id'] } }] } },
  { ...input, database: null },
  { ...input, zone: { ...zone, status: 'pending' } },
  { ...input, pages: { ...pages, deployment_configs: {
    ...pages.deployment_configs, preview: { env_vars: { SITE_DOCTOR_PILOT_TOKEN: vars.SITE_DOCTOR_PILOT_TOKEN } },
  } } },
  { ...input, pages: { ...pages, deployment_configs: {
    ...pages.deployment_configs, production: { ...pages.deployment_configs.production, env_vars: {
      ...vars, SITE_DOCTOR_ENABLED: { type: 'plain_text', value: 'true' },
    } },
  } } },
]) assert.ok(assessCloudflare(variant).blockers.length > 0)
const credentials = {
  CLOUDFLARE_API_TOKEN: 'fixture-' + 'x'.repeat(40),
  CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32),
  CLOUDFLARE_ZONE_ID: 'b'.repeat(32),
  CLOUDFLARE_PAGES_PROJECT: 'codefix-it---portfolio-short',
}
validateInput(credentials)
let calls = 0
const fetcher = async (url, options) => {
  calls++
  assert.equal(options.method, 'GET')
  assert.equal(options.redirect, 'manual')
  const path = new URL(url).pathname
  if (path.endsWith('/d1/database/' + uuid))
    return Response.json({ success: true, result: { uuid } })
  if (path.endsWith('/pages/projects/' + credentials.CLOUDFLARE_PAGES_PROJECT))
    return Response.json({ success: true, result: pages })
  if (path.endsWith('/rulesets/phases/http_ratelimit/entrypoint'))
    return Response.json({ success: true, result: { rules: [rule] } })
  if (path.endsWith('/zones/' + credentials.CLOUDFLARE_ZONE_ID))
    return Response.json({ success: true, result: zone })
  throw Error('Unexpected GET path')
}
const summary = await inspectCloudflare(credentials, fetcher)
assert.equal(calls, 4)
assert.equal(summary.status, 'HOLD')
assert.equal(summary.d1BindingPresent, true)
assert.equal(summary.d1DatabaseAccessible, true)
assert.ok(!JSON.stringify(summary).includes(key))
let forbidden = 0
await assert.rejects(() => inspectCloudflare({}, async () => { forbidden++; throw Error() }))
assert.equal(forbidden, 0)
console.log('Site Doctor infrastructure smoke PASS: 4 GET requests, WAF/D1/secret checks, HOLD and no configuration changes.')
