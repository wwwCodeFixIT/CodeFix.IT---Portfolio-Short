/* global document, window */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL('http://127.0.0.1:4173/')
const output = new URL('../qa-results/contact-submission/', import.meta.url)
const projects = [
  ['kancelaria-adwokacka-witkowska', 'Kancelaria Adwokacka Witkowska'],
  ['rzeczoznawca-marcin-dudek', 'Rzeczoznawca Marcin Dudek'],
  ['em-air-system', 'eM-aiR System'],
]
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
          locale: 'pl-PL',
          reducedMotion: motion,
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const errors = []
        const payloads = []
        let outcome = 'error'
        let externalRequests = 0
        let quickViewRequests = 0
        await context.addInitScript(() => {
          window.__referenceCopies = []
          Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
              writeText(text) {
                window.__referenceCopies.push(text)
                return Promise.resolve()
              },
            },
          })
        })
        let releaseQuickView
        const quickViewGate = new Promise((resolve) => {
          releaseQuickView = resolve
        })
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', async (route) => {
          const request = route.request()
          const url = new URL(request.url())
          if (url.href === 'https://app.codefix.it/api/public/leads') {
            const headers = {
              'access-control-allow-origin': target.origin,
              'access-control-allow-methods': 'POST, OPTIONS',
              'access-control-allow-headers': 'Content-Type',
            }
            if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
            payloads.push(request.postDataJSON())
            return route.fulfill({
              status: outcome === 'error' ? 503 : 201,
              headers,
              contentType: 'application/json',
              body: JSON.stringify(
                outcome === 'error'
                  ? { error: 'Test chwilowej niedostępności.' }
                  : { leadId: 'qa-project-reference' },
              ),
            })
          }
          if (url.origin === target.origin) {
            if (/\/ProjectQuickView-.*\.js$/.test(url.pathname)) {
              quickViewRequests++
              await quickViewGate
            }
            return route.continue()
          }
          externalRequests++
          return route.abort('blockedbyclient')
        })

        const trigger = (title) =>
          page.getByRole('button', { name: `Podgląd realizacji: ${title}`, exact: true })
        const dialog = () => page.getByRole('dialog')
        const open = async (title) => {
          await trigger(title).press('Enter')
          await page.getByRole('dialog', { name: title, exact: true }).waitFor({ state: 'visible' })
        }
        const closed = async (title) => {
          await page.locator('dialog.project-quick-view').waitFor({ state: 'detached' })
          await page.waitForFunction(
            (label) => document.activeElement?.getAttribute('aria-label') === label,
            `Podgląd realizacji: ${title}`,
          )
        }

        try {
          await page.goto(new URL('#work', target).href, { waitUntil: 'networkidle' })
          await trigger(projects[0][1]).waitFor()
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          assert.equal(quickViewRequests, 0)
          const initialOverflow = await page.evaluate(() => document.body.style.overflow)

          // Rapid choices while the optional chunk loads must create only one dialog.
          await trigger(projects[0][1]).press('Enter')
          await trigger(projects[1][1]).press('Enter')
          releaseQuickView()
          await page
            .getByRole('dialog', { name: projects[1][1], exact: true })
            .waitFor({ state: 'visible' })
          assert.equal(await dialog().count(), 1)
          await dialog()
            .getByRole('button', { name: 'Zamknij podgląd realizacji', exact: true })
            .press('Enter')
          await closed(projects[1][1])
          assert.equal(quickViewRequests, 1)

          for (const [index, [slug, title]] of projects.entries()) {
            await open(title)
            assert.equal(await dialog().evaluate((el) => el.matches(':modal')), true)
            assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
            await page.waitForFunction(() => document.activeElement?.id === 'project-quick-title')
            assert.match(await dialog().innerText(), /Cel[\s\S]*Mój zakres[\s\S]*Efekt/)
            if (index === 0) assert.match(await dialog().innerText(), /Współpraca z SyloSoftware/)
            assert.equal(
              await dialog()
                .getByRole('link', { name: 'Pełny opis realizacji', exact: false })
                .getAttribute('href'),
              `/realizacje/${slug}/`,
            )
            const image = dialog().getByRole('img')
            await page.waitForFunction(() => {
              const img = document.querySelector('dialog img')
              return img?.complete && img.naturalWidth > 0
            })
            assert.match(await image.getAttribute('src'), new RegExp(`${slug}-desktop-1200`))
            const toggle = dialog().getByRole('button', {
              name: 'Co tutaj zrobiłem?',
              exact: false,
            })
            const points = dialog().locator('.project-insight-point')
            const explanation = dialog().locator('.project-insight-description')
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
            assert.equal(await points.count(), 0)
            assert.equal(await explanation.isVisible(), false)
            await toggle.press('Enter')
            assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
            assert.equal(await points.count(), 2)
            assert.equal(await explanation.getAttribute('aria-live'), 'polite')
            const checkPoints = async () => {
              const canvas = await dialog().locator('.project-quick-canvas').boundingBox()
              for (const point of await points.all()) {
                const box = await point.boundingBox()
                assert.ok(box.width >= 44 && box.height >= 44)
                assert.ok(box.x >= canvas.x - 1 && box.y >= canvas.y - 1)
                assert.ok(box.x + box.width <= canvas.x + canvas.width + 1)
                assert.ok(box.y + box.height <= canvas.y + canvas.height + 1)
                assert.equal(
                  await point.getAttribute('aria-controls'),
                  await explanation.getAttribute('id'),
                )
              }
            }
            await checkPoints()
            for (let pointIndex = 0; pointIndex < 2; pointIndex++) {
              await points.nth(pointIndex).press('Enter')
              const label = await points.nth(pointIndex).getAttribute('aria-label')
              assert.equal(await explanation.locator('h3').innerText(), label)
              assert.ok((await explanation.locator('p').last().innerText()).length > 40)
              assert.equal(await points.nth(pointIndex).getAttribute('aria-pressed'), 'true')
              assert.equal(await points.nth(1 - pointIndex).getAttribute('aria-pressed'), 'false')
              if (index === 0) assert.match(await explanation.innerText(), /SyloSoftware/)
            }
            await dialog().getByRole('button', { name: 'Telefon', exact: true }).press('Enter')
            await page.waitForFunction(() => {
              const img = document.querySelector('dialog img')
              return img?.src.includes('mobile-375') && img.complete && img.naturalWidth > 0
            })
            assert.equal(
              await dialog()
                .getByRole('button', { name: 'Telefon', exact: true })
                .getAttribute('aria-pressed'),
              'true',
            )
            await checkPoints()
            assert.equal(await points.nth(1).getAttribute('aria-pressed'), 'true')
            await points.nth(0).click()
            assert.equal(await points.nth(0).getAttribute('aria-pressed'), 'true')
            assert.equal(
              await explanation.locator('h3').innerText(),
              await points.nth(0).getAttribute('aria-label'),
            )
            await toggle.press('Enter')
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
            assert.equal(await points.count(), 0)
            assert.equal(await explanation.isVisible(), false)
            assert.ok(await toggle.evaluate((el) => el === document.activeElement))
            await toggle.press('Enter')
            assert.equal(await points.nth(0).getAttribute('aria-pressed'), 'true')
            await toggle.press('Enter')
            await dialog().getByRole('button', { name: 'Komputer', exact: true }).press('Enter')
            assert.equal(
              await dialog()
                .getByRole('button', { name: 'Komputer', exact: true })
                .getAttribute('aria-pressed'),
              'true',
            )
            for (const button of await dialog().getByRole('button').all()) {
              const box = await button.boundingBox()
              assert.ok(box.width >= 44 && box.height >= 44, JSON.stringify(box))
            }
            const size = await dialog().evaluate((el) => ({
              overflow: el.scrollWidth - el.clientWidth,
              width: el.getBoundingClientRect().width,
              height: el.getBoundingClientRect().height,
            }))
            assert.equal(size.overflow, 0)
            assert.ok(size.width <= width && size.height <= 844)
            await dialog()
              .getByRole('link', { name: 'Pełny opis realizacji', exact: false })
              .press('Tab')
            assert.equal(
              await page.evaluate(() => Boolean(document.activeElement?.closest('dialog'))),
              true,
            )
            await dialog()
              .getByRole('button', { name: 'Zamknij podgląd realizacji', exact: true })
              .press('Shift+Tab')
            assert.equal(
              await page.evaluate(() => Boolean(document.activeElement?.closest('dialog'))),
              true,
            )
            if (index === 0) await page.keyboard.press('Escape')
            else if (index === 1)
              await dialog()
                .getByRole('button', { name: 'Zamknij podgląd realizacji', exact: true })
                .press('Enter')
            else await page.mouse.click(1, 1)
            await closed(title)
            assert.equal(await page.evaluate(() => document.body.style.overflow), initialOverflow)
          }

          const form = page.locator('form.cf-lead-form')
          const next = form.getByRole('button', { name: 'Dalej', exact: true })
          const step = () =>
            form.locator('[data-brief-step]:visible').getAttribute('data-brief-step')
          const note = 'Potrzebuję strony dla firmy z czytelną ofertą i formularzem kontaktowym.'
          await form.getByRole('button', { name: 'Nowa strona', exact: true }).press('Enter')
          await next.press('Enter')
          await form.locator('[name="pageUrl"]').fill('https://example.invalid/')
          await form.locator('[name="message"]').fill(note)
          await next.press('Enter')
          await form.locator('[name="name"]').fill('Test podglądu')
          await form.locator('[name="email"]').fill('qa-project@example.invalid')
          await form.getByRole('button', { name: 'Popraw opis', exact: true }).press('Enter')
          await form.locator('[name="message"]').fill('x'.repeat(3990))
          await open(projects[0][1])
          await dialog()
            .getByRole('button', { name: 'Chcę podobną stronę', exact: false })
            .press('Enter')
          await page.locator('dialog.project-quick-view').waitFor({ state: 'detached' })
          await page.waitForFunction(() =>
            document.activeElement?.matches('[data-brief-step="1"] [data-step-heading]'),
          )
          assert.equal(await step(), '1')
          assert.equal(await form.locator('[name="service"]').inputValue(), 'CODEFIX_BUSINESS_SITE')
          assert.equal((await form.locator('[name="message"]').inputValue()).length, 3990)
          assert.ok(Number(await form.locator('[name="message"]').getAttribute('maxlength')) < 3990)
          await next.press('Enter')
          assert.equal(await step(), '1')
          await page.waitForFunction(
            () => document.activeElement?.getAttribute('name') === 'message',
          )
          assert.match(
            await form.locator('[name="message"]').evaluate((el) => el.validationMessage),
            /Maksymalna/,
          )
          await form.locator('[name="message"]').fill(note)
          await next.press('Enter')
          assert.equal(await form.locator('[name="name"]').inputValue(), 'Test podglądu')
          assert.equal(
            await form.locator('[name="email"]').inputValue(),
            'qa-project@example.invalid',
          )
          assert.equal(
            await form.locator('[name="pageUrl"]').inputValue(),
            'https://example.invalid/',
          )
          assert.match(
            await form
              .getByRole('group', { name: 'Podsumowanie zapytania', exact: true })
              .innerText(),
            /Kancelaria Adwokacka Witkowska/,
          )
          await form.getByRole('button', { name: 'Skopiuj brief', exact: true }).press('Enter')
          await form.getByRole('button', { name: 'Skopiowano', exact: true }).waitFor()
          assert.match(
            await page.evaluate(() => window.__referenceCopies.at(-1)),
            /Punkt odniesienia: Kancelaria Adwokacka Witkowska/,
          )
          await form
            .getByRole('button', { name: 'Usuń wybraną realizację', exact: true })
            .press('Enter')
          assert.equal(
            await form.getByRole('group', { name: 'Wybrana realizacja', exact: true }).count(),
            0,
          )
          assert.equal(
            await page.evaluate(() => document.activeElement?.textContent),
            'Kontakt i podsumowanie',
          )
          assert.equal(await form.locator('[name="message"]').inputValue(), note)
          await form.getByRole('button', { name: 'Skopiuj brief', exact: true }).waitFor()
          assert.equal(
            await form.getByRole('button', { name: 'Skopiowano', exact: true }).count(),
            0,
          )

          await open(projects[2][1])
          await dialog()
            .getByRole('button', { name: 'Chcę podobną stronę', exact: false })
            .press('Enter')
          await page.waitForFunction(() =>
            document.activeElement?.matches('[data-brief-step="1"] [data-step-heading]'),
          )
          await form.getByRole('button', { name: 'Wstecz', exact: true }).press('Enter')
          await form.getByRole('button', { name: 'Naprawa WordPress', exact: true }).press('Enter')
          await next.press('Enter')
          assert.equal(
            await form.getByRole('group', { name: 'Wybrana realizacja', exact: true }).count(),
            0,
          )
          assert.equal(await form.locator('[name="message"]').inputValue(), note)

          await open(projects[1][1])
          await dialog()
            .getByRole('button', { name: 'Chcę podobną stronę', exact: false })
            .press('Enter')
          await page.waitForFunction(() =>
            document.activeElement?.matches('[data-brief-step="1"] [data-step-heading]'),
          )
          await next.press('Enter')
          const submit = form.getByRole('button', { name: 'Wyślij brief do wyceny', exact: true })
          await form.getByRole('button', { name: 'Skopiuj brief', exact: true }).press('Enter')
          await form.getByRole('button', { name: 'Skopiowano', exact: true }).waitFor()
          await submit.press('Enter')
          await form.getByRole('alert').filter({ hasText: 'Nie udało się wysłać' }).waitFor()
          assert.equal(payloads.length, 1)
          assert.equal(payloads[0].service, 'CODEFIX_BUSINESS_SITE')
          assert.equal(
            payloads[0].message,
            `${note}\n\nPunkt odniesienia: ${projects[1][1]} — https://codefix.it/realizacje/${projects[1][0]}/`,
          )
          assert.ok(payloads[0].message.length <= 4000)
          assert.equal(
            await page.evaluate(() => window.__referenceCopies.at(-1)),
            `Temat: Nowa strona\n\nAdres strony: https://example.invalid/\n\n${payloads[0].message}`,
          )
          assert.match(
            await form.getByRole('group', { name: 'Wybrana realizacja', exact: true }).innerText(),
            /Rzeczoznawca Marcin Dudek/,
          )
          outcome = 'accepted'
          await submit.press('Enter')
          await form.getByRole('status').filter({ hasText: 'Wiadomość dotarła' }).waitFor()
          assert.equal(payloads.length, 2)
          assert.equal(await step(), '0')
          assert.equal(
            await form.getByRole('group', { name: 'Wybrana realizacja', exact: true }).count(),
            0,
          )
          assert.equal(await form.locator('[name="message"]').inputValue(), '')
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
            ),
            0,
          )
          assert.deepEqual(errors, [])
          assert.equal(externalRequests, 0)
          const result = {
            engine,
            width,
            motion,
            kind: 'project-quick-view',
            status: 'pass',
            projects: 3,
            closes: ['escape', 'button', 'backdrop'],
            lazyChunkRequests: quickViewRequests,
            focusRestored: true,
            preservesBrief: true,
            referencePayload: true,
            referenceClipboard: true,
            insights: {
              points: 6,
              lazyWithDialog: true,
              initiallyHidden: true,
              keyboardAndPointer: true,
              devicePositionsWithinImage: true,
              selectionPersistsAcrossDevices: true,
              toggleAndProjectReset: true,
              collaborationCreditPreserved: true,
            },
            mockLeadRequests: payloads.length,
            liveLeadRequests: 0,
          }
          results.push(result)
          console.log(JSON.stringify(result))
        } catch (error) {
          await page.screenshot({
            path: new URL(`project-${engine}-${width}-${motion}-failure.jpg`, output).pathname,
          })
          await writeFile(
            new URL('project-quick-view-failure.json', output),
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
          releaseQuickView()
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
}
await writeFile(
  new URL('project-quick-view.json', output),
  JSON.stringify({ cases: results.length, results }, null, 2),
)
console.log(
  `Project quick view QA passed: ${results.length} engine/viewport/motion combinations. All leads intercepted.`,
)
