import assert from 'node:assert/strict'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const target = new URL(process.env.AUDIT_SITE_URL)
assert.ok(
  target.protocol === 'https:' &&
    target.hostname.endsWith('.codefix-it---portfolio-short.pages.dev'),
)
assert.ok(!target.username && !target.password && !target.search && !target.hash)
const runtimeCommit = process.env.AUDIT_RUNTIME_COMMIT
assert.match(runtimeCommit, /^[a-f0-9]{40}$/)
const output = new URL('../qa-results/lighthouse/', import.meta.url)
await mkdir(output, { recursive: true })
const cases = [
  ['home-mobile-1', '/', false],
  ['home-mobile-2', '/', false],
  ['home-mobile-3', '/', false],
  ['home-desktop', '/', true],
  ['repair-mobile', '/naprawa-wordpress/', false],
]
const summaries = []
for (const [name, path, desktop] of cases) {
  const url = new URL(path, target)
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  assert.equal(response.status, 200)
  assert.ok(
    (await response.text()).includes(process.env.AUDIT_EXPECTED_ENTRY),
    'Unexpected deployed entry',
  )
  const prefix = new URL(name, output).pathname
  const args = [
    url.href,
    '--quiet',
    '--chrome-flags=--headless',
    '--output=json',
    '--output=html',
    `--output-path=${prefix}`,
  ]
  if (desktop) args.push('--preset=desktop')
  const run = spawnSync(
    new URL('../.qa-tools/node_modules/.bin/lighthouse', import.meta.url).pathname,
    args,
    {
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 2 * 1024 * 1024,
    },
  )
  assert.equal(run.status, 0, run.error?.message || run.stderr)
  const report = JSON.parse(await readFile(`${prefix}.report.json`, 'utf8'))
  assert.ok(!report.runtimeError, JSON.stringify(report.runtimeError))
  const scores = Object.fromEntries(
    Object.entries(report.categories).map(([id, category]) => [
      id,
      Math.round(category.score * 100),
    ]),
  )
  const metrics = Object.fromEntries(
    [
      'first-contentful-paint',
      'largest-contentful-paint',
      'total-blocking-time',
      'cumulative-layout-shift',
      'speed-index',
    ].map((id) => [id, report.audits[id]?.numericValue]),
  )
  const issues = Object.values(report.audits)
    .filter((audit) => typeof audit.score === 'number' && audit.score < 1)
    .map((audit) => ({
      id: audit.id,
      title: audit.title,
      score: audit.score,
      displayValue: audit.displayValue,
      items: audit.details?.items?.slice(0, 5),
    }))
  const summary = {
    name,
    url: report.finalDisplayedUrl || report.finalUrl,
    lighthouseVersion: report.lighthouseVersion,
    fetchTime: report.fetchTime,
    scores,
    metrics,
    issues,
    warnings: report.runWarnings,
  }
  summaries.push(summary)
  console.log(
    JSON.stringify({
      name,
      scores,
      metrics,
      issues: issues.map(({ id, title, displayValue }) => ({ id, title, displayValue })),
    }),
  )
}
const mobiles = summaries
  .filter((result) => result.name.startsWith('home-mobile'))
  .sort((a, b) => a.scores.performance - b.scores.performance)
const result = {
  runtimeCommit,
  workflowCommit: process.env.GITHUB_SHA,
  target: target.href,
  homeMobileMedian: mobiles[1].name,
  runs: summaries,
}
await writeFile(new URL('summary.json', output), JSON.stringify(result, null, 2))
const table = [
  '| Run | Performance | Accessibility | Best practices | SEO | LCP ms | CLS |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...summaries.map(
    (r) =>
      `| ${r.name} | ${r.scores.performance} | ${r.scores.accessibility} | ${r.scores['best-practices']} | ${r.scores.seo} | ${Math.round(r.metrics['largest-contentful-paint'])} | ${r.metrics['cumulative-layout-shift'].toFixed(4)} |`,
  ),
].join('\n')
const markdown = `Audited runtime: ${runtimeCommit}\n\n${table}\n\nHome mobile median: ${mobiles[1].name}. Preview noindex is intentional. Lab results are not real-user CWV.\n`
await writeFile(new URL('summary.md', output), markdown)
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown)
