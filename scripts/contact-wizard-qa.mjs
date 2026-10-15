/* global document, window */
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
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        reducedMotion: 'reduce',
        locale: 'pl-PL',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      const errors = []
      let externalRequests = 0
      let scopeChunkRequests = 0
      page.on('request', (request) => {
        if (new URL(request.url()).pathname.includes('/BriefScopePicker-')) scopeChunkRequests++
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
        const next = form.getByRole('button', { name: 'Dalej', exact: true })
        const step = () => form.locator('[data-brief-step]:visible').getAttribute('data-brief-step')
        await next.click()
        assert.equal(await step(), '0')
        assert.match(await form.getByRole('alert').innerText(), /Wybierz temat/)
        await form.getByRole('button', { name: 'Mini-ocena strony', exact: true }).press('Enter')
        await next.click()
        assert.equal(await step(), '1')
        await form.locator('[name="message"]').fill('Krótki opis problemu na stronie.')
        await next.click()
        assert.equal(await step(), '1')
        await form.locator('[name="pageUrl"]').fill('https://example.invalid/')
        await form.locator('[name="message"]').fill('Krótko')
        await next.click()
        assert.equal(await step(), '1')
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
        const note = 'Formularz nie wysyła wiadomości po aktualizacji.'
        await form.locator('[name="message"]').fill(note)
        await next.click()
        assert.equal(await step(), '2')
        assert.match(await form.locator('.cf-brief-summary').innerText(), /example.invalid/)
        assert.match(await form.locator('.cf-brief-summary').innerText(), /Formularz nie wysyła/)
        assert.equal(
          await form.locator('.cf-brief-scope').innerText(),
          'Wybrany zakres: Szybkość działania, Formularz kontaktowy.',
        )
        await form.locator('[name="name"]').fill('Wizard QA')
        await form.locator('[name="email"]').fill('invalid')
        await form.locator('button[type="submit"]').click()
        assert.equal(await step(), '2')
        assert.equal(
          await form.locator('[name="email"]').evaluate((el) => el.validity.valid),
          false,
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
        await changeTopic.press('Enter')
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
          status: 'pass',
          validation: true,
          backPreservesData: true,
          keyboard: true,
          reviewEdit: true,
          estimator: true,
          liveLeadRequests: 0,
        }
        results.push(result)
        console.log(JSON.stringify(result))
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
