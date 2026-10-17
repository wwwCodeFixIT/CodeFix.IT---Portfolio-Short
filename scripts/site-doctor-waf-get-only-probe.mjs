/**
 * LAB-12: four GET-only observations of the production WAF rule.
 *
 * This is deliberately NOT a background check or CI live test. Every probe
 * must be explicitly approved by the site owner and may cause a temporary
 * 10-second block of the requesting IP at /api/site-doctor.
 * It cannot run PageSpeed: no POST, credentials, cookies, or request body.
 */
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

export const TARGET = 'https://codefix.it/api/site-doctor'
export const APPROVAL = 'I_APPROVE_FOUR_WAF_READONLY_GETS'
export const LIVE_ARG = '--one-waf-get-only-observation'

export function mayProbe(args, env) {
  return args.includes(LIVE_ARG) && env.SITE_DOCTOR_WAF_READONLY_APPROVAL === APPROVAL
}

export async function probe(options = {}, fetcher = globalThis.fetch) {
  const { args = [], env = {} } = options
  assert.ok(mayProbe(args, env), 'WAF probe refused: explicit owner approval is required')
  const requests = []
  // Serial requests inside one 10-second window. No retries and no POST.
  for (let i = 0; i < 4; i++) {
    const response = await fetcher(TARGET, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    const observation = {
      attempt: i + 1,
      status: response.status,
      cloudflareResponse: Boolean(response.headers.get('cf-ray')),
    }
    requests.push(observation)
    // Stop after a possible block: do not keep hammering the endpoint.
    if ([403, 429].includes(response.status)) break
  }
  const normalSeen = requests.some((r) => r.status === 405 && r.cloudflareResponse)
  const possibleBlockSeen = normalSeen && requests.some((r) =>
    [403, 429].includes(r.status) && r.cloudflareResponse)
  return {
    target: TARGET,
    method: 'GET',
    observations: requests,
    possibleBlockSeen,
    providerRequests: 0,
    crmSubmissions: 0,
    verdict: possibleBlockSeen ? 'POSSIBLE_WAF_ACTION_CHECK_SECURITY_EVENTS' : 'INCONCLUSIVE_HOLD',
    note: 'HTTP codes alone cannot identify the exact Cloudflare WAF rule. Verify the corresponding Security Event, expression, and action in the dashboard. Never treat this probe as full WAF certification.',
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    console.log(JSON.stringify(await probe({ args: process.argv, env: process.env }), null, 2))
  } catch (error) {
    console.error('LAB-12 WAF GET-only probe stopped:',
      error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
