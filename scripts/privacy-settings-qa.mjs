import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const origin = 'http://127.0.0.1:4173'
const output = 'qa-results/privacy-settings'
await mkdir(output, { recursive: true })
const results = []
const cases = [
  { id: 'home', path: '/?service=development#contact', inline: true },
  { id: 'tools', path: '/narzedzia/?tool=automatyzacja', inline: true },
  { id: 'service', path: '/naprawa-wordpress/', inline: false },
]

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true })
  try {
    for (const width of [320, 390, 1280]) {
      for (const scenario of cases) {
        const context = await browser.newContext({
          viewport: { width, height: width === 320 ? 640 : 900 },
          locale: 'pl-PL',
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const errors = []
        const forbidden = []
        const result = { engine, width, route: scenario.id, status: 'running' }
        results.push(result)
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', (route) => {
          const request = route.request()
          if (
            new URL(request.url()).origin === origin &&
            ['GET', 'HEAD'].includes(request.method())
          )
            return route.continue()
          forbidden.push({ url: request.url(), method: request.method() })
          return route.abort('blockedbyclient')
        })

        try {
          await page.goto(origin + scenario.path, { waitUntil: 'networkidle' })
          const panel = page.getByRole('dialog', { name: 'Ty wybierasz, co mierzymy' })
          await panel.waitFor()
          assert.equal(await panel.getByRole('checkbox').count(), 2)
          for (const checkbox of await panel.getByRole('checkbox').all()) {
            assert.equal(await checkbox.isChecked(), false)
          }
          await panel.getByRole('button', { name: 'Odrzuć wszystkie', exact: true }).click()
          await panel.waitFor({ state: 'hidden' })

          const launcher = page.getByRole('button', {
            name: 'Ustawienia prywatności',
            exact: true,
          })
          assert.equal(await launcher.count(), 1, 'Keep exactly one settings entry')
          assert.equal(
            await page.locator('.cf-measurement-settings').count(),
            scenario.inline ? 0 : 1,
            'Inline settings must not leave a floating duplicate over the page',
          )
          if (scenario.inline) {
            assert.equal(
              await page
                .locator('footer')
                .getByRole('button')
                .filter({
                  hasText: 'Ustawienia prywatności',
                })
                .count(),
              1,
            )
            assert.equal(
              await launcher.evaluate((node) => globalThis.getComputedStyle(node).position),
              'static',
            )
          }

          if (scenario.id === 'tools') {
            const map = page.locator('.cf-automation-map')
            await map.waitFor()
            await map.getByRole('combobox', { name: /^Proces\b/ }).selectOption('documents')
            await map.locator('.cf-automation-note summary').click()
            await map.getByRole('textbox', { name: /^Co chcesz usprawnić/ }).fill('QA: mój proces')
            const box = await launcher.boundingBox()
            assert.ok(box.width >= 44 && box.height >= 44, 'Footer target must be at least 44px')
          } else if (scenario.id === 'home') {
            const form = page.locator('form.cf-lead-form')
            const next = form.getByRole('button', { name: 'Dalej', exact: true })
            await next.click()
            await form.locator('[name="pageUrl"]').fill('https://example.invalid/')
            await form.locator('[name="message"]').fill('QA: zachowany opis projektu')
            await next.click()
            await page.locator('input[name="name"]').fill('QA: zachowany kontakt')
          }

          // Pointer focus in Safari and keyboard focus must both return to the entry.
          await launcher.click()
          await panel.waitFor()
          await page.waitForFunction(() =>
            globalThis.document.activeElement?.classList.contains('cf-measurement-panel'),
          )
          for (const checkbox of await panel.getByRole('checkbox').all()) {
            assert.equal(await checkbox.isChecked(), false)
          }
          await panel.getByRole('button', { name: 'Zapisz wybór', exact: true }).click()
          await panel.waitFor({ state: 'hidden' })
          assert.equal(
            await launcher.evaluate((node) => node === node.ownerDocument.activeElement),
            true,
          )
          await launcher.press('Enter')
          await panel.waitFor()
          await panel.getByRole('button', { name: 'Odrzuć wszystkie', exact: true }).click()
          await panel.waitFor({ state: 'hidden' })
          assert.equal(
            await launcher.evaluate((node) => node === node.ownerDocument.activeElement),
            true,
          )

          if (scenario.id === 'tools') {
            const map = page.locator('.cf-automation-map')
            assert.equal(
              await map.getByRole('combobox', { name: /^Proces\b/ }).inputValue(),
              'documents',
            )
            assert.equal(
              await map.getByRole('textbox', { name: /^Co chcesz usprawnić/ }).inputValue(),
              'QA: mój proces',
            )
            await map.screenshot({ path: `${output}/${engine}-${width}-map.png` })
          } else if (scenario.id === 'home') {
            assert.equal(
              await page.locator('input[name="name"]').inputValue(),
              'QA: zachowany kontakt',
            )
            assert.equal(
              await page.locator('form.cf-lead-form [name="service"]').inputValue(),
              'development',
            )
            assert.equal(
              await page.locator('textarea[name="message"]').inputValue(),
              'QA: zachowany opis projektu',
            )
          }
          if (scenario.inline) {
            await page.locator('footer').screenshot({
              path: `${output}/${engine}-${width}-${scenario.id}-footer.png`,
            })
          }
          assert.equal(
            await page.evaluate(
              () =>
                globalThis.document.documentElement.scrollWidth >
                globalThis.document.documentElement.clientWidth,
            ),
            false,
            'Settings must not introduce horizontal overflow',
          )

          await page.reload({ waitUntil: 'networkidle' })
          await launcher.waitFor()
          assert.equal(await panel.count(), 0, 'Persist the rejected measurement choices')
          await launcher.click()
          await panel.waitFor()
          for (const checkbox of await panel.getByRole('checkbox').all()) {
            assert.equal(await checkbox.isChecked(), false)
          }
          await panel.getByRole('button', { name: 'Odrzuć wszystkie', exact: true }).click()
          assert.deepEqual(errors, [])
          assert.deepEqual(forbidden, [], 'No external measurement, provider or lead requests')
          result.status = 'passed'
          console.log(`PASS privacy ${engine} ${width}px ${scenario.id}`)
        } catch (error) {
          result.status = 'failed'
          result.error = error.message
          await page
            .screenshot({ path: `${output}/${engine}-${width}-${scenario.id}-failure.png` })
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

console.log(`Privacy settings: ${results.length} scenarios passed; no outbound or write requests.`)
