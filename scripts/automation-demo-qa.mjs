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
          const demo = page.getByRole('group', { name: 'Demo automatyzacji', exact: true })
          await demo.waitFor()
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          await demo.scrollIntoViewIfNeeded()
          const status = demo.getByRole('status')
          const scenarios = demo.getByRole('group', { name: 'Wybierz scenariusz', exact: true })
          const steps = demo.getByRole('group', { name: 'Kroki demonstracji', exact: true })
          assert.match(await demo.innerText(), /Symulacja na fikcyjnych danych/)
          await scenarios.getByRole('button', { name: 'Zapytania', exact: true }).press('Tab')
          assert.equal(
            await scenarios
              .getByRole('button', { name: 'Dokumenty', exact: true })
              .evaluate((el) => el === document.activeElement),
            true,
          )
          for (const [label, lastTitle] of [
            ['Zapytania', 'Szkic odpowiedzi'],
            ['Dokumenty', 'Zestawienie'],
            ['Panel klienta', 'Akceptacja'],
          ]) {
            await scenarios.getByRole('button', { name: label, exact: true }).press('Enter')
            assert.equal(await scenarios.locator('[aria-pressed="true"]').count(), 1)
            assert.ok((await status.innerText()).includes('Krok 1 z 4'))
            for (let step = 1; step <= 4; step++) {
              await steps.getByRole('button', { name: new RegExp(`^Krok ${step}:`) }).press('Enter')
              assert.ok((await status.innerText()).includes(`Krok ${step} z 4`))
              assert.equal(await steps.locator('[aria-pressed="true"]').count(), 1)
              assert.equal(
                await page.evaluate(
                  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
                ),
                0,
              )
            }
            assert.equal(await status.locator('h3').innerText(), lastTitle)
            await demo.getByRole('button', { name: 'Od początku', exact: true }).click()
            assert.ok((await status.innerText()).includes('Krok 1 z 4'))
          }
          for (const button of await demo.getByRole('button').all()) {
            const box = await button.boundingBox()
            assert.ok(box.width >= 44 && box.height >= 44, JSON.stringify(box))
          }
          if (motion === 'reduce') {
            assert.equal(
              await demo.getByRole('button', { name: 'Uruchom pokaz', exact: true }).count(),
              0,
            )
            assert.match(await demo.innerText(), /Tryb ręczny/)
            await page.waitForTimeout(2800)
            assert.ok((await status.innerText()).includes('Krok 1 z 4'))
          } else if (width === 390) {
            await scenarios.getByRole('button', { name: 'Zapytania', exact: true }).click()
            await demo.getByRole('button', { name: 'Uruchom pokaz', exact: true }).click()
            await status.filter({ hasText: 'Krok 2 z 4' }).waitFor()
            await demo.getByRole('button', { name: 'Zatrzymaj', exact: true }).click()
            const paused = await status.innerText()
            await page.waitForTimeout(2800)
            assert.equal(await status.innerText(), paused)
            await demo.getByRole('button', { name: 'Uruchom pokaz', exact: true }).click()
            await status.filter({ hasText: 'Krok 4 z 4' }).waitFor()
            await demo.getByRole('button', { name: 'Powtórz pokaz', exact: true }).waitFor()
            await demo.getByRole('button', { name: 'Powtórz pokaz', exact: true }).click()
            await status.filter({ hasText: 'Krok 1 z 4' }).waitFor()
            await scenarios.getByRole('button', { name: 'Dokumenty', exact: true }).click()
            await page.waitForTimeout(2800)
            assert.ok((await status.innerText()).includes('Krok 1 z 4'))
            await demo.getByRole('button', { name: 'Uruchom pokaz', exact: true }).click()
            await page.locator('#top').scrollIntoViewIfNeeded()
            await demo.getByRole('button', { name: 'Uruchom pokaz', exact: true }).waitFor()
            const outside = await status.innerText()
            await page.waitForTimeout(2800)
            assert.equal(await status.innerText(), outside)
            await demo.scrollIntoViewIfNeeded()
            await demo.getByRole('button', { name: 'Uruchom pokaz', exact: true }).click()
            await page.emulateMedia({ reducedMotion: 'reduce' })
            await demo.getByText('Tryb ręczny', { exact: false }).waitFor()
            const reduced = await status.innerText()
            await page.waitForTimeout(2800)
            assert.equal(await status.innerText(), reduced)
            assert.equal(
              await demo.getByRole('button', { name: 'Zatrzymaj', exact: true }).count(),
              0,
            )
          }
          assert.deepEqual(errors, [])
          assert.equal(externalRequests, 0)
          const result = {
            engine,
            width,
            motion,
            kind: 'automation-demo',
            status: 'pass',
            scenarios: 3,
            steps: 12,
            playback: motion === 'no-preference' && width === 390,
            externalRequests,
            liveLeadRequests: 0,
          }
          results.push(result)
          console.log(JSON.stringify(result))
        } catch (error) {
          await page.screenshot({
            path: new URL(`demo-${engine}-${width}-${motion}-failure.jpg`, output).pathname,
          })
          await writeFile(
            new URL('demo-failure.json', output),
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
  new URL('automation-demo.json', output),
  JSON.stringify({ cases: results.length, results }, null, 2),
)
console.log(`Automation demo QA passed: ${results.length} engine/viewport/motion combinations.`)
