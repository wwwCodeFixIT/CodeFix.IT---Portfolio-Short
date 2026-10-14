import assert from 'node:assert/strict'

const target = new URL(process.env.AUDIT_SITE_URL)
assert.ok(
  target.protocol === 'https:' &&
    target.hostname.endsWith('.codefix-it---portfolio-short.pages.dev'),
)
assert.ok(!target.username && !target.password && !target.search && !target.hash)
for (let attempt = 1; attempt <= 12; attempt++) {
  const response = await fetch(target, { signal: AbortSignal.timeout(15000) })
  assert.equal(response.status, 200, 'Audit preview is not publicly reachable')
  if ((await response.text()).includes(process.env.AUDIT_EXPECTED_ENTRY)) {
    console.log('Verified deployed entry:', process.env.AUDIT_EXPECTED_ENTRY)
    process.exit(0)
  }
  assert.ok(attempt < 12, 'Preview did not reach the expected build')
  console.log(`Waiting for expected preview build (${attempt}/12)`)
  await new Promise((resolve) => setTimeout(resolve, 10000))
}
