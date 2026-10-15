/* global document, window */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL('http://127.0.0.1:4173/')
const guides = JSON.parse(
  await readFile(new URL('../public/data/wordpress-guides.json', import.meta.url), 'utf8'),
)
const projects = ['kancelaria-adwokacka-witkowska', 'rzeczoznawca-marcin-dudek', 'em-air-system']
const results = []
const output = new URL('../qa-results/contact-submission/', import.meta.url)
await mkdir(output, { recursive: true })

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch()
  try {
    for (const item of [
      ...guides.map((guide) => ({ kind: 'guide', ...guide })),
      ...projects.map((slug) => ({ kind: 'project', slug })),
    ]) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        locale: 'pl-PL',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      let externalRequests = 0
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await context.route('**/*', (route) => {
        if (new URL(route.request().url()).origin === target.origin) return route.continue()
        externalRequests++
        return route.abort('blockedbyclient')
      })
      try {
        const entryPath = item.kind === 'guide' ? `/poradniki/${item.slug}/` : '/realizacje/'
        const entry = new URL(entryPath, target)
        entry.searchParams.set('utm_source', 'content_qa')
        await page.goto(entry.href, { waitUntil: 'networkidle' })
        const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
        if (await reject.isVisible()) await reject.click()
        if (item.kind === 'guide') {
          await page.locator('.guide-page main a.cf-button-primary').click()
          await page.waitForURL(new URL(item.serviceHref + '/', target).href)
          await page.locator('form.cf-lead-form').waitFor()
        } else {
          await page.locator(`a.cf-button-primary[href="/realizacje/${item.slug}/"]`).click()
          await page.waitForURL(new URL(`/realizacje/${item.slug}/`, target).href)
          await page.getByRole('link', { name: /Zapytaj o podobne wdrożenie/ }).click()
          await page.waitForURL(new URL('/?service=CODEFIX_BUSINESS_SITE#contact', target).href)
          await page.waitForFunction(
            () =>
              document.querySelector('select[name="service"]')?.value === 'CODEFIX_BUSINESS_SITE' &&
              document.activeElement?.getAttribute('name') === 'name',
          )
          await page.waitForFunction(() => {
            const box = document.querySelector('input[name="name"]')?.getBoundingClientRect()
            return box && box.top >= 0 && box.bottom <= window.innerHeight
          })
          const box = await page.locator('input[name="name"]').boundingBox()
          assert.ok(box && box.y >= 0 && box.y + box.height <= 844)
        }
        const attribution = await page.evaluate(() =>
          JSON.parse(window.sessionStorage.getItem('codefix_attribution_v1')),
        )
        assert.equal(attribution.landingPath, entryPath)
        assert.equal(attribution.utmSource, 'content_qa')
        assert.equal(externalRequests, 0)
        assert.deepEqual(errors, [])
        const result = {
          engine,
          kind: item.kind,
          slug: item.slug,
          destination: new URL(page.url()).pathname,
          attribution: 'preserved',
          liveLeadRequests: 0,
        }
        results.push(result)
        console.log(JSON.stringify(result))
        await writeFile(
          new URL('content-paths.json', output),
          JSON.stringify({ cases: results.length, results }, null, 2),
        )
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
}
assert.equal(results.length, 2 * (guides.length + projects.length))
console.log(
  `Content paths QA passed: ${results.length} native navigation scenarios. No live lead or measurement requests.`,
)
