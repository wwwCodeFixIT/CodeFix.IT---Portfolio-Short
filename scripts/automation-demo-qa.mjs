/* global document */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL('http://127.0.0.1:4173/')
const output = new URL('../qa-results/contact-submission/', import.meta.url)
const results = []
await mkdir(output, { recursive: true })

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch()
  try {
    for (const width of [320, 390, 1280]) {
      for (const motion of ['reduce', 'no-preference']) {
        const context = await browser.newContext({
          viewport: { width, height: 844 },
          reducedMotion: motion,
          locale: 'pl-PL',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const errors = []
        let externalRequests = 0
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', (route) => {
          if (new URL(route.request().url()).origin === target.origin) return route.continue()
          externalRequests++
          return route.abort('blockedbyclient')
        })
        try {
          await page.goto(new URL('#applications', target).href, { waitUntil: 'networkidle' })
          const demo = page.getByRole('group', { name: 'Przykład automatyzacji', exact: true })
          await demo.waitFor()
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          await demo.scrollIntoViewIfNeeded()
          const scenarios = demo.getByRole('group', { name: 'Wybierz scenariusz', exact: true })
          const detail = demo.locator('#cf-demo-detail')
          assert.match(await demo.innerText(), /Dane przykładowe/)
          assert.equal(
            await demo
              .getByRole('button', { name: /Uruchom pokaz|Następny krok|Powtórz pokaz/ })
              .count(),
            0,
          )
          await scenarios.getByRole('button', { name: 'Zapytania', exact: true }).press('Tab')
          assert.equal(
            await scenarios
              .getByRole('button', { name: 'Dokumenty', exact: true })
              .evaluate((el) => el === document.activeElement),
            true,
          )

          for (const [label, action, close, expected] of [
            ['Zapytania', 'Podejrzyj odpowiedź', 'Zwiń odpowiedź', /szkic do sprawdzenia/],
            ['Dokumenty', 'Sprawdź kompletność', 'Zwiń uwagę', /brakuje adresu dostawy/],
            ['Panel klienta', 'Zaakceptuj podgląd', 'Cofnij akceptację', /Kolejny etap: wdrożenie/],
          ]) {
            const choice = scenarios.getByRole('button', { name: label, exact: true })
            await choice.press('Enter')
            assert.equal(await scenarios.locator('[aria-pressed="true"]').count(), 1)
            assert.equal(await choice.getAttribute('aria-pressed'), 'true')
            assert.equal(await detail.textContent(), '')
            const control = demo.getByRole('button', { name: action, exact: true })
            await control.press('Enter')
            assert.equal(
              await demo
                .getByRole('button', { name: close, exact: true })
                .getAttribute('aria-expanded'),
              'true',
            )
            assert.match(await detail.innerText(), expected)
            assert.equal(
              await demo
                .getByRole('button', { name: close, exact: true })
                .evaluate((el) => el === document.activeElement),
              true,
            )
            if (label === 'Panel klienta')
              assert.match(await demo.locator('dl').innerText(), /Zaakceptowany/)
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
              ),
              0,
            )
            await demo.getByRole('button', { name: close, exact: true }).press('Enter')
            assert.equal(await detail.textContent(), '')
            assert.equal(await control.getAttribute('aria-expanded'), 'false')
            if (label === 'Panel klienta')
              assert.match(await demo.locator('dl').innerText(), /Do sprawdzenia/)
          }
          await demo.getByRole('button', { name: 'Zaakceptuj podgląd', exact: true }).click()
          await scenarios.getByRole('button', { name: 'Dokumenty', exact: true }).click()
          assert.equal(await detail.textContent(), '')
          assert.match(await demo.locator('dl').innerText(), /Maty do ćwiczeń/)
          for (const button of await demo.getByRole('button').all()) {
            const box = await button.boundingBox()
            assert.ok(box.width >= 44 && box.height >= 44, JSON.stringify(box))
          }
          const stable = await demo.innerText()
          await page.emulateMedia({
            reducedMotion: motion === 'reduce' ? 'no-preference' : 'reduce',
          })
          assert.equal(await demo.innerText(), stable)
          assert.deepEqual(errors, [])
          assert.equal(externalRequests, 0)
          const result = {
            engine,
            width,
            motion,
            kind: 'automation-example',
            status: 'pass',
            scenarios: 3,
            reversibleActions: 3,
            scenarioReset: true,
            externalRequests,
            liveLeadRequests: 0,
          }
          results.push(result)
          console.log(JSON.stringify(result))
        } catch (error) {
          await page.screenshot({
            path: new URL('example-' + engine + '-' + width + '-' + motion + '-failure.jpg', output)
              .pathname,
          })
          await writeFile(
            new URL('example-failure.json', output),
            JSON.stringify(
              {
                engine,
                width,
                motion,
                error: error.stack,
                active: await page.evaluate(() => document.activeElement?.outerHTML),
              },
              null,
              2,
            ),
          )
          throw error
        } finally {
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
}
await writeFile(
  new URL('automation-example.json', output),
  JSON.stringify({ cases: results.length, results }, null, 2),
)
console.log(
  'Automation example QA passed: ' + results.length + ' engine/viewport/motion combinations.',
)
