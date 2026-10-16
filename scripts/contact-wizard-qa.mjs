/* global document, window, getComputedStyle */
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
    for (const { width, motion } of [320, 390, 1280].flatMap((width) =>
      ['reduce', 'no-preference'].map((motion) => ({ width, motion })),
    )) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        reducedMotion: motion,
        locale: 'pl-PL',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      const errors = []
      let externalRequests = 0
      let scopeChunkRequests = 0
      let copyChunkRequests = 0
      page.on('request', (request) => {
        if (new URL(request.url()).pathname.includes('/BriefScopePicker-')) scopeChunkRequests++
        if (new URL(request.url()).pathname.includes('/BriefCopy-')) copyChunkRequests++
      })
      await context.addInitScript(() => {
        window.__briefCopyMode = 'success'
        window.__briefCopies = []
        window.__briefClipboard = {
          writeText(text) {
            window.__briefCopies.push(text)
            if (window.__briefCopyMode === 'denied')
              return Promise.reject(new DOMException('Clipboard denied', 'NotAllowedError'))
            if (window.__briefCopyMode === 'hold')
              return new Promise((resolve) => {
                window.__finishBriefCopy = resolve
              })
            return Promise.resolve()
          },
        }
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: window.__briefClipboard,
        })
      })
      page.on('pageerror', (e) => errors.push(e.message))
      await context.route('**/*', (route) => {
        if (new URL(route.request().url()).origin === target.origin) return route.continue()
        externalRequests++
        return route.abort('blockedbyclient')
      })
      try {
        await page.goto(target.href, { waitUntil: 'networkidle' })
        await page.locator('.cf-brief-choices').waitFor()
        const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
        if (await reject.isVisible()) await reject.click()
        {
          await page
            .locator('.cf-hero-copy')
            .getByRole('link', { name: 'Opisz temat', exact: true })
            .click()
          await page.waitForFunction(() => {
            const active = document.activeElement
            const box = active?.getBoundingClientRect()
            return (
              active?.closest('.cf-brief-choices') &&
              box.top >= 0 &&
              box.bottom <= window.innerHeight
            )
          })
        }
        const form = page.locator('form.cf-lead-form')
        const field = (name) => form.locator(`[name="${name}"]`)
        const inlineError = async (name, pattern) => {
          assert.equal(await field(name).getAttribute('aria-invalid'), 'true')
          const message = await field(name).evaluate((el) => {
            const error = document.getElementById(el.getAttribute('aria-describedby'))
            return { text: error?.textContent, role: error?.getAttribute('role') }
          })
          assert.match(message.text, pattern)
          assert.equal(message.role, 'alert')
        }
        const next = form.getByRole('button', { name: 'Dalej', exact: true })
        const copy = () => form.getByRole('button', { name: 'Skopiuj brief', exact: true })
        const copied = () => form.getByRole('button', { name: 'Skopiowano', exact: true })
        const step = () => form.locator('[data-brief-step]:visible').getAttribute('data-brief-step')
        assert.deepEqual(await form.locator('.cf-brief-progress li').allTextContents(), [
          'Temat',
          'Szczegóły',
          'Kontakt',
        ])
        assert.equal(await form.locator('.cf-brief-progress [aria-current]').innerText(), 'Temat')
        assert.equal(await form.locator('[aria-invalid="true"]').count(), 0)
        for (const choice of await form
          .getByRole('group', { name: 'Wybierz temat', exact: true })
          .getByRole('button')
          .all()) {
          const box = await choice.boundingBox()
          assert.ok(box.width >= 44 && box.height >= 44)
        }
        await next.click()
        assert.equal(await step(), '0')
        assert.match(await form.getByRole('alert').innerText(), /Wybierz temat/)
        await form.getByRole('button', { name: 'Mini-ocena strony', exact: true }).press('Enter')
        assert.match(await form.locator('#cf-topic-hint').innerText(), /Pierwsze wskazówki/)
        await next.click()
        assert.equal(await step(), '1')
        assert.equal(copyChunkRequests, 0)
        const animation = await form.locator('[data-brief-step="1"]').evaluate((el) => ({
          name: getComputedStyle(el).animationName,
          transform: getComputedStyle(el).transform,
        }))
        assert.equal(animation.name, motion === 'reduce' ? 'none' : 'cf-brief-enter')
        assert.equal(animation.transform, 'none')
        // Fast keyboard navigation must work before the 140 ms fade completes.
        await form.getByRole('button', { name: 'Wstecz', exact: true }).press('Enter')
        assert.equal(await step(), '0')
        assert.equal(
          await form.locator('[data-step-heading]:focus').innerText(),
          'Czego potrzebujesz?',
        )
        await next.press('Enter')
        assert.equal(await step(), '1')
        assert.equal(
          await form.locator('[data-step-heading]:focus').innerText(),
          'Co trzeba zrobić?',
        )
        assert.equal(
          await form.locator('.cf-brief-progress [aria-current]').innerText(),
          'Szczegóły',
        )
        await form.locator('[name="message"]').fill('Krótki opis problemu na stronie.')
        await next.click()
        assert.equal(await step(), '1')
        await inlineError('pageUrl', /Uzupełnij/)
        assert.equal(await field('pageUrl').evaluate((el) => el === document.activeElement), true)
        await field('pageUrl').fill('not-an-address')
        await inlineError('pageUrl', /https:\/\/twojastrona/)
        await form.locator('[name="pageUrl"]').fill('https://example.invalid/')
        assert.equal(await field('pageUrl').getAttribute('aria-invalid'), null)
        assert.equal(await field('pageUrl').getAttribute('aria-describedby'), null)
        await form.locator('[name="message"]').fill('Krótko')
        await next.click()
        assert.equal(await step(), '1')
        await inlineError('message', /Minimalna.*10/)
        // Adding scope must preserve long text and enforce the combined CRM limit.
        await form.locator('[name="message"]').fill('x'.repeat(3999))
        assert.equal(scopeChunkRequests, 0)
        await form.locator('.cf-brief-help summary').click()
        await form.getByRole('button', { name: 'Szybkość działania', exact: true }).click()
        assert.equal(scopeChunkRequests, 1)
        await form.getByRole('button', { name: 'Formularz kontaktowy', exact: true }).click()
        await form.getByRole('button', { name: 'Formularz kontaktowy', exact: true }).click()
        assert.equal(
          await form
            .getByRole('button', { name: 'Formularz kontaktowy', exact: true })
            .getAttribute('aria-pressed'),
          'false',
        )
        await form.getByRole('button', { name: 'Formularz kontaktowy', exact: true }).click()
        await next.click()
        assert.equal(await step(), '1')
        assert.equal((await form.locator('[name="message"]').inputValue()).length, 3999)
        assert.match(
          await form.locator('[name="message"]').evaluate((el) => el.validationMessage),
          /Maksymalna/,
        )
        await inlineError('message', /Maksymalna/)
        // Removing scope updates validity and feedback without truncating existing text.
        for (const name of ['Szybkość działania', 'Formularz kontaktowy'])
          await form.getByRole('button', { name, exact: true }).press('Enter')
        assert.equal(await field('message').getAttribute('aria-invalid'), null)
        assert.equal(await field('message').inputValue(), 'x'.repeat(3999))
        assert.equal(await field('message').evaluate((el) => el.maxLength), 4000)
        for (const name of ['Szybkość działania', 'Formularz kontaktowy'])
          await form.getByRole('button', { name, exact: true }).press('Enter')
        await inlineError('message', /Maksymalna/)
        const note = 'Formularz nie wysyła wiadomości po aktualizacji.'
        await form.locator('[name="message"]').fill(note)
        assert.equal(await field('message').getAttribute('aria-invalid'), null)
        await next.click()
        assert.equal(await step(), '2')
        assert.match(await form.locator('.cf-brief-summary').innerText(), /example.invalid/)
        assert.match(await form.locator('.cf-brief-summary').innerText(), /Formularz nie wysyła/)
        assert.equal(
          await form.locator('.cf-brief-scope').innerText(),
          'Wybrany zakres: Szybkość działania, Formularz kontaktowy.',
        )
        const changeTopic = form.getByRole('button', { name: 'Zmień temat', exact: true })
        const editDescription = form.getByRole('button', { name: 'Popraw opis', exact: true })
        await changeTopic.press('Tab')
        assert.equal(await editDescription.evaluate((el) => el === document.activeElement), true)
        await editDescription.press('Tab')
        assert.equal(
          await form.locator('[name="name"]').evaluate((el) => el === document.activeElement),
          true,
        )
        await form.locator('[name="name"]').fill('Wizard QA')
        await form.locator('[name="email"]').fill('invalid')
        await form.locator('button[type="submit"]').click()
        assert.equal(await step(), '2')
        assert.equal(
          await form.locator('[name="email"]').evaluate((el) => el.validity.valid),
          false,
        )
        // Inline validation focuses synchronously, without an animation-frame race.
        await inlineError('email', /Podaj poprawny e-mail/)
        assert.equal(await field('email').evaluate((el) => el === document.activeElement), true)
        await field('email').fill('wizard@example.invalid')
        assert.equal(await field('email').getAttribute('aria-invalid'), null)
        await field('email').fill('invalid')
        await inlineError('email', /Podaj poprawny e-mail/)
        await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'email')
        const expectedBrief = `Temat: Mini-ocena strony\n\nAdres strony: https://example.invalid/\n\n${note}\n\nWybrany zakres: Szybkość działania, Formularz kontaktowy.`
        await copy().press('Enter')
        await copied().waitFor()
        assert.equal(copyChunkRequests, 1)
        assert.deepEqual(await page.evaluate(() => window.__briefCopies), [expectedBrief])
        assert.equal(await step(), '2')
        await copied().press('Tab')
        assert.equal(await changeTopic.evaluate((el) => el === document.activeElement), true)

        // Clipboard denial and a missing API provide a selected read-only fallback.
        await page.evaluate(() => {
          window.__briefCopyMode = 'denied'
        })
        await copied().press('Enter')
        const manual = form.getByRole('textbox', {
          name: 'Skopiuj poniższy brief ręcznie',
          exact: true,
        })
        await manual.waitFor()
        assert.equal(await manual.inputValue(), expectedBrief)
        assert.deepEqual(
          await manual.evaluate((el) => [
            el === document.activeElement,
            el.readOnly,
            el.selectionStart,
            el.selectionEnd,
          ]),
          [true, true, 0, expectedBrief.length],
        )
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
        })
        await copy().press('Enter')
        await page.waitForFunction(() => document.activeElement?.readOnly === true)
        assert.equal(await manual.inputValue(), expectedBrief)
        assert.equal(await form.locator('[name="name"]').inputValue(), 'Wizard QA')
        assert.equal(await form.locator('[name="email"]').inputValue(), 'invalid')

        // A pending clipboard promise must not block editing or announce success after remount.
        await page.evaluate(() => {
          Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: window.__briefClipboard,
          })
          window.__briefCopyMode = 'hold'
        })
        await copy().press('Enter')
        assert.equal(
          await form.getByRole('button', { name: 'Kopiuję…', exact: true }).isDisabled(),
          true,
        )
        await changeTopic.press('Enter')
        await page.evaluate(() => {
          window.__finishBriefCopy()
          window.__briefCopyMode = 'success'
        })
        assert.equal(await step(), '0')
        assert.equal(
          await form
            .locator('[data-brief-step="0"] [data-step-heading]')
            .evaluate((el) => el === document.activeElement),
          true,
        )
        await form.getByRole('button', { name: 'Mini-ocena strony', exact: true }).click()
        await next.click()
        assert.equal(await form.locator('[name="message"]').inputValue(), note)
        assert.equal(
          await form
            .getByRole('button', { name: 'Szybkość działania', exact: true })
            .getAttribute('aria-pressed'),
          'true',
        )
        await next.click()
        await copy().waitFor()
        assert.equal(await copied().count(), 0)
        assert.equal(await form.locator('[name="name"]').inputValue(), 'Wizard QA')
        assert.equal(await form.locator('[name="email"]').inputValue(), 'invalid')
        await editDescription.press('Enter')
        assert.equal(await step(), '1')
        assert.equal(
          await form
            .locator('[data-brief-step="1"] [data-step-heading]')
            .evaluate((el) => el === document.activeElement),
          true,
        )
        const editedNote = 'Poprawiony opis: formularz nie wysyła potwierdzenia.'
        await form.locator('[name="message"]').fill(editedNote)
        await next.click()
        assert.match(await form.locator('.cf-brief-summary').innerText(), /Poprawiony opis/)
        assert.equal((await form.locator('.cf-brief-summary').innerText()).includes(note), false)
        await copy().press('Enter')
        await copied().waitFor()
        assert.equal(
          await page.evaluate(() => window.__briefCopies.at(-1)),
          expectedBrief.replace(note, editedNote),
        )
        await changeTopic.press('Enter')
        await form.getByRole('button', { name: 'Aplikacja / integracja', exact: true }).click()
        await next.click()
        assert.equal(await form.locator('[name="message"]').inputValue(), editedNote)
        await next.click()
        assert.equal(await form.locator('[name="name"]').inputValue(), 'Wizard QA')
        assert.equal(await form.locator('[name="email"]').inputValue(), 'invalid')
        assert.match(await form.locator('.cf-brief-summary').innerText(), /Aplikacja \/ integracja/)
        assert.match(await form.locator('.cf-brief-summary').innerText(), /Poprawiony opis/)
        assert.equal(await form.locator('.cf-brief-scope').count(), 0)
        await copy().press('Enter')
        await copied().waitFor()
        assert.equal(
          await page.evaluate(() => window.__briefCopies.at(-1)),
          `Temat: Aplikacja / integracja\n\nAdres strony: https://example.invalid/\n\n${editedNote}`,
        )
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
          0,
        )
        // Calculator brief is transferred through the real public UI.
        await page.getByRole('button', { name: 'Kalkulator WordPress', exact: true }).click()
        await page
          .getByRole('button', { name: 'Przenieś zakres do formularza', exact: true })
          .click()
        assert.equal(await step(), '0')
        const attached = await form.locator('.cf-estimator-attachment pre').textContent()
        assert.ok(attached.length > 10)
        await form.getByRole('button', { name: 'Nowa strona', exact: true }).click()
        assert.equal(await form.locator('.cf-estimator-attachment pre').textContent(), attached)
        await next.click()
        await form.locator('[name="message"]').fill('')
        await next.click()
        assert.equal(await step(), '2')
        assert.match(
          await form.locator('.cf-brief-summary').innerText(),
          /Zakres z kalkulatora dołączony/,
        )
        await copy().press('Enter')
        await copied().waitFor()
        assert.equal(
          await page.evaluate(() => window.__briefCopies.at(-1)),
          `Temat: Nowa strona\n\nAdres strony: https://example.invalid/\n\n${attached}`,
        )
        assert.equal(
          await page.evaluate(() =>
            window.__briefCopies.some(
              (text) => text.includes('Wizard QA') || text.includes('\nE-mail:'),
            ),
          ),
          false,
        )
        await changeTopic.press('Enter')
        await form.getByRole('button', { name: 'Nowa strona', exact: true }).click()
        await next.click()
        assert.equal(await form.locator('.cf-estimator-attachment pre').textContent(), attached)
        await next.click()
        await changeTopic.press('Enter')
        await form.getByRole('button', { name: 'Aplikacja / integracja', exact: true }).click()
        await next.click()
        assert.equal(await form.locator('.cf-estimator-attachment').count(), 0)
        await next.click()
        assert.equal(await step(), '1')
        assert.equal(await form.locator('[name="message"]').evaluate((el) => el.required), true)
        assert.deepEqual(errors, [])
        assert.equal(externalRequests, 0)
        const result = {
          engine,
          width,
          motion,
          kind: 'contact-wizard',
          status: 'pass',
          validation: true,
          backPreservesData: true,
          keyboard: true,
          reviewEdit: true,
          estimator: true,
          clipboard: ['success', 'denied', 'unavailable', 'pending', 'edited', 'calculator'],
          copyLazyChunkRequests: copyChunkRequests,
          motionPreference: true,
          inlineValidation: [
            'required',
            'url',
            'min-length',
            'email',
            'max-length',
            'scope-change',
            'clear-on-input',
          ],
          liveLeadRequests: 0,
        }
        results.push(result)
        console.log(JSON.stringify(result))
      } catch (error) {
        await page.screenshot({
          path: new URL(`wizard-${engine}-${width}-${motion}-failure.jpg`, output).pathname,
        })
        await writeFile(
          new URL('wizard-failure.json', output),
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
  } finally {
    await browser.close()
  }
}
await writeFile(
  new URL('wizard.json', output),
  JSON.stringify({ cases: results.length, results }, null, 2),
)
console.log(`Contact wizard QA passed: ${results.length} engine/viewport combinations.`)
