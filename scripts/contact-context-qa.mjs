/* global document, window */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL('http://127.0.0.1:4173/')
const leadApi = 'https://app.codefix.it/api/public/leads'
const guides = JSON.parse(
  await readFile(new URL('../public/data/wordpress-guides.json', import.meta.url), 'utf8'),
)
const { freeProject } = JSON.parse(
  await readFile(new URL('../src/data/homepage-content.json', import.meta.url), 'utf8'),
)
const guide = guides.find((item) => item.slug === 'wordpress-nie-wysyla-maili')
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
      for (const reducedMotion of ['reduce', 'no-preference']) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion,
          locale: 'pl-PL',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const errors = [],
          blockedRequests = [],
          payloads = []
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', (route) => {
          const request = route.request()
          if (request.url() === leadApi) {
            if (request.method() === 'OPTIONS')
              return route.fulfill({
                status: 204,
                headers: {
                  'Access-Control-Allow-Origin': target.origin,
                  'Access-Control-Allow-Headers': 'Content-Type',
                  'Access-Control-Allow-Methods': 'POST',
                },
              })
            assert.equal(request.method(), 'POST')
            payloads.push(request.postDataJSON())
            return route.fulfill({
              status: payloads.length === 1 ? 503 : 201,
              contentType: 'application/json',
              headers: { 'Access-Control-Allow-Origin': target.origin },
              body: JSON.stringify(
                payloads.length === 1
                  ? { error: 'Testowa przerwa. Spróbuj ponownie.' }
                  : { ok: true, leadId: '00000000-0000-4000-8000-000000000001' },
              ),
            })
          }
          if (
            new URL(request.url()).origin === target.origin &&
            ['GET', 'HEAD'].includes(request.method())
          )
            return route.continue()
          blockedRequests.push(request.url())
          return route.abort('blockedbyclient')
        })
        try {
          await page.goto(new URL(`/poradniki/${guide.slug}/?utm_source=context_qa`, target).href, {
            waitUntil: 'networkidle',
          })
          await page.waitForFunction(() => !document.querySelector('#root[data-static-prerender]'))
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          await page.locator('.guide-page main a.cf-button-primary').click()
          await page.waitForURL(new URL(guide.serviceHref + '/', target).href)
          const serviceForm = page.locator('form.cf-lead-form')
          await serviceForm.waitFor()
          await page.locator('.service-hero-copy .cf-actions > a.cf-button-primary').click()
          await page.waitForFunction(
            (intent) => document.querySelector('.service-form-topic strong')?.innerText === intent,
            guide.intent,
          )
          assert.equal(await page.locator('.service-form-topic strong').innerText(), guide.intent)
          const message = serviceForm.locator('[name="message"]')
          assert.equal(await message.inputValue(), '')
          assert.ok(await page.getByText(guide.contactHint, { exact: true }).isVisible())
          await serviceForm.locator('[name="name"]').fill('Test kontekstu')
          await serviceForm.locator('[name="email"]').fill('context-qa@example.invalid')
          await serviceForm.locator('[name="pageUrl"]').fill('https://example.invalid')
          await message.fill('Krótko')
          await serviceForm.locator('button[type="submit"]').click()
          await serviceForm.locator('.cf-field-error').waitFor()
          const describedBy = (await message.getAttribute('aria-describedby')).split(' ')
          assert.ok(describedBy.includes(await page.locator('.cf-field-hint').getAttribute('id')))
          assert.ok(
            describedBy.includes(await serviceForm.locator('.cf-field-error').getAttribute('id')),
          )
          assert.equal(payloads.length, 0)
          const note = 'Formularz potwierdza wysłanie, ale wiadomość nie dociera od wczoraj.'
          await message.fill(note)
          await serviceForm.locator('button[type="submit"]').click()
          await serviceForm.locator('.cf-form-feedback').waitFor()
          assert.equal(payloads.length, 1)
          assert.equal(payloads[0].journeyGuide, guide.slug)
          assert.equal(payloads[0].message, note)
          assert.equal(await message.inputValue(), note)
          assert.ok(await page.getByText(guide.contactHint, { exact: true }).isVisible())
          await page
            .getByRole('button', { name: 'Usuń temat poradnika', exact: true })
            .press('Enter')
          assert.ok(await message.evaluate((element) => element === document.activeElement))
          assert.equal(await message.inputValue(), note)
          assert.equal(await page.locator('.cf-field-hint').count(), 0)
          await serviceForm.locator('button[type="submit"]').click()
          await page.waitForFunction(
            () => document.querySelector('form [name="message"]')?.value === '',
          )
          assert.equal(payloads.length, 2)
          assert.equal(payloads[1].journeyGuide, guide.slug)
          assert.equal(payloads[1].message, note)
          assert.equal(payloads[1].utmSource, 'context_qa')

          await page.goto(target.href, { waitUntil: 'networkidle' })
          await page.waitForFunction(() => !document.querySelector('#root[data-static-prerender]'))
          const offer = page.locator('#free-project')
          assert.ok(await offer.getByText(freeProject.description, { exact: true }).isVisible())
          await offer.getByRole('link', { name: freeProject.cta, exact: true }).press('Enter')
          const form = page.locator('#contact form')
          await page.waitForFunction(() => !document.querySelector('[data-brief-step="1"]')?.hidden)
          assert.equal(await form.locator('[name="service"]').inputValue(), 'other')
          const choice = form.getByRole('checkbox', {
            name: freeProject.checkboxLabel,
            exact: true,
          })
          assert.ok(await choice.isChecked())
          const choiceBox = await form.locator('.cf-free-project-choice').boundingBox()
          assert.ok(choiceBox && choiceBox.height >= 44)
          const idea = 'Pomysł: prosta strona informacyjna dla lokalnej inicjatywy.'
          await form.locator('[name="message"]').fill(idea)
          await choice.uncheck()
          await form.getByRole('button', { name: 'Dalej', exact: true }).click()
          assert.equal(await form.getByText(freeProject.requestLabel, { exact: true }).count(), 0)
          await form.getByRole('button', { name: 'Popraw opis', exact: true }).click()
          assert.equal(await form.locator('[name="message"]').inputValue(), idea)
          await choice.check()
          await form.getByRole('button', { name: 'Dalej', exact: true }).press('Enter')
          assert.ok(await form.getByText(freeProject.requestLabel, { exact: true }).isVisible())
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
            false,
          )
          await form.locator('[name="name"]').fill('Test projektu')
          await form.locator('[name="email"]').fill('project-qa@example.invalid')
          await form.locator('button[type="submit"]').press('Enter')
          await form.locator('.cf-form-feedback.is-success').waitFor()
          assert.equal(payloads.length, 3)
          assert.equal(payloads[2].service, 'other')
          assert.equal(payloads[2].message, idea + '\n\n' + freeProject.requestLabel)
          assert.ok(payloads[2].message.length <= 4000)
          assert.equal(payloads[2].utmSource, 'context_qa')
          await form.getByRole('button', { name: 'Inny temat', exact: true }).press('Enter')
          await form.getByRole('button', { name: 'Dalej', exact: true }).press('Enter')
          assert.equal(await choice.isChecked(), false)
          assert.equal(await form.locator('[name="message"]').inputValue(), '')
          assert.equal(
            await page.locator('link[rel="canonical"]').getAttribute('href'),
            'https://codefix.it/',
          )
          assert.deepEqual(errors, [])
          assert.deepEqual(blockedRequests, [])
          const result = {
            engine,
            kind: 'contact-context',
            width,
            reducedMotion,
            checks: [
              'guide-topic',
              'hint-and-error-description',
              'no-message-overwrite',
              'error-preserves-data',
              'dismiss-topic-focus',
              'request-context',
              'free-project-optional',
              'summary',
              'accepted-reset',
              'attribution',
              'keyboard',
              'no-overflow',
            ],
            mockLeadRequests: payloads.length,
            liveLeadRequests: 0,
            status: 'pass',
          }
          results.push(result)
          console.log(JSON.stringify(result))
          await writeFile(
            new URL('contact-context.json', output),
            JSON.stringify({ cases: results.length, results }, null, 2),
          )
        } catch (error) {
          await writeFile(
            new URL(`contact-context-${engine}-${width}-${reducedMotion}-failure.json`, output),
            JSON.stringify(
              {
                error: error.stack,
                url: page.url(),
                errors,
                blockedRequests,
                payloads,
                html: await page
                  .locator('form')
                  .first()
                  .evaluate((element) => element.outerHTML),
              },
              null,
              2,
            ),
          )
          await page.screenshot({
            path: new URL(`contact-context-${engine}-${width}-${reducedMotion}-failure.jpg`, output)
              .pathname,
          })
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
assert.equal(results.length, 12)
console.log('Contact context QA passed: 12 scenarios, 36 intercepted requests, no live leads.')
