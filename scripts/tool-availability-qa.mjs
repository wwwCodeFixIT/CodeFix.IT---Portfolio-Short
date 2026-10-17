import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const origin = 'http://127.0.0.1:4173'
const output = 'qa-results/tool-availability'
await mkdir(output, { recursive: true })
const results = []
const report = {
  url: 'https://example.org/',
  finalUrl: 'https://example.org/',
  testedAt: '2026-10-17T08:00:00.000Z',
  source: 'Google PageSpeed Insights / Lighthouse',
  scores: { performance: 80, seo: 90, accessibility: 95 },
  checks: [],
  note: 'Raport testowy.',
  recommendations: ['Sprawdź wynik.'],
}

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true })
  try {
    for (const width of [320, 390, 1280]) {
      for (const mode of [
        'off',
        'ai',
        'doctor',
        'both',
        'retry',
        ...(width === 320 ? ['timeout'] : []),
      ]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          locale: 'pl-PL',
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        let availability = {
          ai: mode === 'ai' || mode === 'both',
          doctor: mode === 'doctor' || mode === 'both',
        }
        let retryReady = false
        let statusReads = 0
        const posts = []
        const errors = []
        const forbidden = []
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', (route) => {
          const req = route.request()
          const url = new URL(req.url())
          if (url.origin !== origin) {
            forbidden.push(req.url())
            return route.abort()
          }
          if (url.pathname === '/api/tool-status') {
            statusReads++
            if (mode === 'timeout' && !retryReady) {
              return new Promise((resolve) => setTimeout(resolve, 5500)).then(() =>
                route
                  .fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(availability),
                  })
                  .catch(() => {}),
              )
            }
            if (mode === 'retry' && !retryReady) {
              if (width === 320) return route.abort()
              return route.fulfill({
                status: width === 1280 ? 503 : 200,
                contentType: 'application/json',
                body: '{"ai":"true","doctor":true}',
              })
            }
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(availability),
            })
          }
          if (
            req.method() === 'POST' &&
            ['/api/ai-brief', '/api/site-doctor'].includes(url.pathname)
          ) {
            posts.push({ path: url.pathname, body: req.postDataJSON() })
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(
                url.pathname.endsWith('ai-brief') ? { brief: 'Brief z testowego modelu.' } : report,
              ),
            })
          }
          if (['GET', 'HEAD'].includes(req.method())) return route.continue()
          forbidden.push(req.url())
          return route.abort()
        })
        const result = { engine, width, mode, status: 'running' }
        results.push(result)
        try {
          await page.goto(origin + '/narzedzia/', {
            waitUntil: mode === 'timeout' ? 'domcontentloaded' : 'networkidle',
          })
          await page.locator('#brief-title').waitFor()
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          const brief = page.locator('[aria-labelledby="brief-title"]')
          const goal = brief.getByLabel(/Cel lub problem/)
          await goal.fill('QA: chcę uporządkować zapytania i przygotować ofertę.')
          await brief.getByLabel('Do kogo kierujesz stronę lub aplikację?').fill('Moja firma')
          await brief.getByLabel('Do kogo kierujesz stronę lub aplikację?').press('Enter')
          await brief.locator('textarea[readOnly]').waitFor()
          assert.match(await brief.locator('textarea[readOnly]').inputValue(), /WERSJA LOKALNA/)
          assert.equal(posts.length, 0, 'Enter must never opt the visitor into paid AI')
          assert.equal(
            await brief.getByRole('button', { name: 'Generuj z AI', exact: true }).count(),
            availability.ai ? 1 : 0,
          )
          if (mode === 'off' && width <= 390)
            await brief.screenshot({ path: `${output}/${engine}-${width}-local.png` })

          await page.getByRole('button', { name: 'AI Site Doctor 😈', exact: true }).click()
          const doctor = page.locator('.cf-doctor')
          await doctor.waitFor()
          if (mode === 'retry' || mode === 'timeout') {
            await doctor.getByRole('button', { name: 'Sprawdź ponownie', exact: true }).waitFor()
            assert.equal(await doctor.locator('form').count(), 0)
            assert.equal(statusReads, 1)
            availability = { ai: true, doctor: true }
            retryReady = true
            await doctor.getByRole('button', { name: 'Sprawdź ponownie', exact: true }).click()
            await doctor.locator('form').waitFor()
            await page.waitForFunction(() =>
              globalThis.document.activeElement?.matches('.cf-doctor-form input[type=url]'),
            )
            assert.equal(statusReads, 2)
          }
          if (availability.doctor) {
            await doctor.locator('input[type=url]').fill('https://example.org/')
            assert.equal(
              await doctor.getByRole('checkbox', { name: /Dodaj komentarz/ }).count(),
              availability.ai ? 1 : 0,
            )
            await doctor.getByRole('button', { name: /Uruchom diagnozę/ }).click()
            await doctor.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor()
            assert.equal(posts.at(-1).body.includeAi, false, 'AI stays opt-in even when configured')
          } else {
            await doctor
              .getByText('Diagnoza online jest niedostępna. Opisz problem w zgłoszeniu.', {
                exact: true,
              })
              .waitFor()
            assert.equal(await doctor.locator('form').count(), 0)
            assert.equal(await doctor.getByRole('button', { name: /Uruchom diagnozę/ }).count(), 0)
            assert.equal(
              await doctor.getByRole('link', { name: /Opisz problem/ }).getAttribute('href'),
              '/?service=WORDPRESS_QUICK_FIX#contact',
            )
            if (mode === 'off')
              await doctor.screenshot({ path: `${output}/${engine}-${width}-offline-doctor.png` })
          }
          await page.getByRole('button', { name: 'Asystent briefu', exact: true }).click()
          assert.equal(
            await goal.inputValue(),
            'QA: chcę uporządkować zapytania i przygotować ofertę.',
          )
          if (availability.ai) {
            await brief.getByRole('button', { name: 'Generuj z AI', exact: true }).click()
            await brief.getByText('Brief przygotowany przez model AI.', { exact: false }).waitFor()
            assert.equal(posts.filter((p) => p.path === '/api/ai-brief').length, 1)
            await brief.getByRole('button', { name: 'Szkic bez AI', exact: true }).click()
            assert.match(await brief.locator('textarea[readOnly]').inputValue(), /WERSJA LOKALNA/)
            assert.equal(posts.filter((p) => p.path === '/api/ai-brief').length, 1)
          }
          assert.equal(
            statusReads,
            mode === 'retry' || mode === 'timeout' ? 2 : 1,
            'Subscribers share a single availability request',
          )
          assert.equal(
            await page.evaluate(
              () =>
                globalThis.document.documentElement.scrollWidth >
                globalThis.document.documentElement.clientWidth,
            ),
            false,
          )
          assert.deepEqual(errors, [])
          assert.deepEqual(forbidden, [])
          result.status = 'passed'
          console.log(`PASS availability ${engine} ${width}px ${mode}`)
        } catch (error) {
          result.status = 'failed'
          result.error = error.message
          await page
            .screenshot({ path: `${output}/${engine}-${width}-${mode}-failure.png` })
            .catch(() => {})
          throw error
        } finally {
          await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
}
console.log(
  `Availability browser QA PASS: ${results.length} scenarios; no live provider or lead calls.`,
)
