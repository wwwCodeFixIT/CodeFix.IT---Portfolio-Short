import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const origin = 'https://codefix.it'
const html = await readFile(new URL('../dist/narzedzia/index.html', import.meta.url), 'utf8')
const expected = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1]
assert.ok(expected?.startsWith('/assets/'))
const output = 'qa-results/tools-production'
await mkdir(output, { recursive: true })
const results = []

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true })
  try {
    for (const width of [320, 390, 1280]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: 'pl-PL',
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(20000)
      const errors = []
      const forbidden = []
      page.on('pageerror', (error) => errors.push(error.message))
      await context.route('**/*', (route) => {
        const request = route.request()
        const url = new URL(request.url())
        if (url.origin === origin && ['GET', 'HEAD'].includes(request.method()))
          return route.continue()
        if (!(
          request.method() === 'GET' &&
          url.hostname === 'static.cloudflareinsights.com' &&
          url.pathname.startsWith('/beacon.min.js/')
        ))
          forbidden.push({ url: request.url(), method: request.method() })
        return route.abort('blockedbyclient')
      })
      const result = { engine, width, status: 'running', providerCalls: 0, leadSubmissions: 0 }
      results.push(result)
      try {
        const response = page.waitForResponse(
          (r) => r.url() === origin + '/api/tool-status' && r.request().method() === 'GET',
        )
        await page.goto(origin + '/narzedzia/', { waitUntil: 'networkidle' })
        // Cloudflare can inject another module script; verify the app entry only.
        assert.equal(
          await page.locator('script[type="module"][src^="/assets/index-"]').getAttribute('src'),
          expected,
          'Verify the published runtime',
        )
        const availabilityResponse = await response
        assert.equal(availabilityResponse.status(), 200)
        const availability = await availabilityResponse.json()
        assert.equal(typeof availability.ai, 'boolean')
        assert.equal(typeof availability.doctor, 'boolean')
        const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
        if (await reject.isVisible()) await reject.click()
        const brief = page.locator('[aria-labelledby="brief-title"]')
        await brief.waitFor()
        assert.equal(
          await brief.getByRole('button', { name: 'Generuj z AI', exact: true }).count(),
          availability.ai ? 1 : 0,
        )
        const note = 'Test odczytu: potrzebuję strony z opisem usług i kontaktem.'
        await brief.getByLabel(/Cel lub problem/).fill(note)
        await brief.getByRole('button', { name: 'Szkic bez AI', exact: true }).click()
        assert.match(await brief.locator('textarea[readOnly]').inputValue(), /WERSJA LOKALNA/)
        await brief.screenshot({ path: `${output}/${engine}-${width}-local.png` })
        await page.getByRole('button', { name: 'Mapa automatyzacji', exact: true }).click()
        const map = page.locator('.cf-automation-map')
        await map.getByRole('combobox', { name: /^Proces\b/ }).selectOption('documents')
        await map.getByRole('button', { name: /Braki lub błąd/ }).click()
        await map.getByRole('heading', { name: 'Gdy proces wymaga pomocy' }).waitFor()
        await page.getByRole('button', { name: 'AI Site Doctor 😈', exact: true }).click()
        await page.locator('.cf-doctor').waitFor()
        assert.equal(await page.locator('.cf-doctor-form').count(), availability.doctor ? 1 : 0)
        await page.getByRole('button', { name: 'Asystent briefu', exact: true }).click()
        assert.equal(await brief.getByLabel(/Cel lub problem/).inputValue(), note)
        assert.equal(
          await page.evaluate(
            () =>
              globalThis.document.documentElement.scrollWidth >
              globalThis.document.documentElement.clientWidth,
          ),
          false,
        )
        assert.deepEqual(errors, [])
        assert.deepEqual(forbidden, [], 'Production QA must never send POST or external requests')
        result.status = 'passed'
        result.availability = availability
        console.log(`PASS published tools ${engine} ${width}px; no write requests.`)
      } catch (error) {
        result.status = 'failed'
        result.error = error.message
        await page.screenshot({ path: `${output}/${engine}-${width}-failure.png` }).catch(() => {})
        throw error
      } finally {
        await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
}
console.log(`Published tools QA PASS: ${results.length} browser/viewport combinations.`)
