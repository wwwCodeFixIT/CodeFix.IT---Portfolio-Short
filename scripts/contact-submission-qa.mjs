/* global window, document */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL(process.env.CONTACT_QA_URL || 'http://127.0.0.1:4173/')
assert.ok(
  (target.origin === 'http://127.0.0.1:4173' ||
    (target.protocol === 'https:' &&
      (target.hostname === 'codefix.it' ||
        target.hostname.endsWith('.codefix-it---portfolio-short.pages.dev')))) &&
    !target.username &&
    !target.password &&
    !target.search &&
    !target.hash,
)
const output = new URL('../qa-results/contact-submission/', import.meta.url)
await mkdir(output, { recursive: true })
const results = []
const cases = [
  { name: 'none', analytics: false, ads: false, result: 'accepted', conversions: 0 },
  { name: 'analytics', analytics: true, ads: false, result: 'accepted', conversions: 1 },
  { name: 'ads', analytics: false, ads: true, result: 'accepted', conversions: 1 },
  { name: 'both', analytics: true, ads: true, result: 'accepted', conversions: 1 },
  { name: 'duplicate', analytics: true, ads: true, result: 'duplicate', conversions: 0 },
  { name: 'rejected', analytics: true, ads: true, result: 'rejected', conversions: 0 },
  { name: 'invalid-json', analytics: true, ads: true, result: 'invalid-json', conversions: 0 },
  { name: 'network-error', analytics: true, ads: true, result: 'network-error', conversions: 0 },
  {
    name: 'sdk-throws-before-submit',
    analytics: true,
    ads: true,
    result: 'accepted',
    fault: 'all',
    conversions: 0,
  },
  {
    name: 'sdk-throws-after-accept',
    analytics: true,
    ads: true,
    result: 'accepted',
    fault: 'conversion',
    conversions: 0,
  },
  {
    name: 'ad-sdk-throws',
    analytics: true,
    ads: true,
    result: 'accepted',
    fault: 'ads',
    conversions: 1,
  },
  {
    name: 'sdk-missing',
    analytics: true,
    ads: true,
    result: 'accepted',
    fault: 'missing',
    conversions: 0,
  },
]

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch()
  try {
    for (const [pageKind, path] of [
      ['homepage', '/'],
      ['service', '/naprawa-wordpress/'],
    ]) {
      for (const test of cases) {
        const context = await browser.newContext({
          viewport: { width: 390, height: 844 },
          locale: 'pl-PL',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const pageErrors = []
        const payloads = []
        let blockedExternalRequests = 0
        let funnelRequests = 0
        page.on('pageerror', (error) => pageErrors.push(error.message))
        await context.route('**/*', async (route) => {
          const request = route.request()
          const url = new URL(request.url())
          if (url.origin === target.origin) return route.continue()
          // Never forward a lead, mail notification, pixel, or Analytics request.
          if (url.href === 'https://app.codefix.it/api/public/leads') {
            if (request.method() === 'OPTIONS')
              return route.fulfill({
                status: 204,
                headers: {
                  'Access-Control-Allow-Origin': target.origin,
                  'Access-Control-Allow-Methods': 'POST, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type',
                },
              })
            assert.equal(request.method(), 'POST')
            payloads.push(request.postDataJSON())
            if (test.result === 'network-error') return route.abort('failed')
            return route.fulfill({
              status:
                test.result === 'rejected' || test.result === 'invalid-json'
                  ? 500
                  : test.result === 'duplicate'
                    ? 200
                    : 201,
              contentType: test.result === 'invalid-json' ? 'text/html' : 'application/json',
              headers: { 'Access-Control-Allow-Origin': target.origin },
              body:
                test.result === 'invalid-json'
                  ? '<html>Upstream unavailable</html>'
                  : JSON.stringify(
                      test.result === 'rejected'
                        ? {
                            error:
                              'Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub napisz e-mail.',
                          }
                        : {
                            ok: true,
                            leadId: '00000000-0000-4000-8000-000000000001',
                            ...(test.result === 'duplicate' ? { duplicate: true } : {}),
                          },
                    ),
            })
          }
          if (url.href === 'https://app.codefix.it/api/public/funnel-events') {
            funnelRequests++
            return route.fulfill({
              status: 204,
              headers: { 'Access-Control-Allow-Origin': target.origin },
            })
          }
          blockedExternalRequests++
          return route.abort('blockedbyclient')
        })
        try {
          await page.goto(new URL(path, target).href, { waitUntil: 'networkidle' })
          await page.locator('form.cf-lead-form').waitFor()
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          // Isolated SDK fixtures exercise each consent state; no live SDK is loaded.
          await page.evaluate(({ analytics, ads, fault }) => {
            window.codefixAnalyticsAllowed = analytics
            window.codefixAdConsentChoice = ads ? 'accepted' : 'rejected'
            window.codefixAdMeasurementAllowed = ads
            window.__contactQaEvents = []
            window.gtag =
              fault === 'missing'
                ? undefined
                : (...args) => {
                    if (fault === 'all' || (fault === 'conversion' && args[1] === 'generate_lead'))
                      throw new Error('SDK_BLOCKED_FOR_QA')
                    window.__contactQaEvents.push(args)
                  }
            window.oaiq =
              fault === 'missing'
                ? undefined
                : (...args) => {
                    if (fault === 'all' || fault === 'ads') throw new Error('AD_SDK_BLOCKED_FOR_QA')
                    window.__contactQaEvents.push(['ad-sdk', ...args])
                  }
          }, test)
          const form = page.locator('form.cf-lead-form')
          const note = 'TEST QA — isolated request, no production lead is created.'
          await form.locator('[name="name"]').fill('Contact QA')
          await form.locator('[name="email"]').fill('contact-qa@example.invalid')
          if (pageKind === 'homepage')
            await form.locator('[name="service"]').selectOption('development')
          await form.locator('[name="message"]').fill(note)
          await form.locator('button[type="submit"]').click()
          const feedback = form.locator('.cf-form-feedback')
          await feedback.waitFor()
          const success = test.result === 'accepted' || test.result === 'duplicate'
          assert.equal(await feedback.getAttribute('role'), success ? 'status' : 'alert')
          assert.ok(
            (await feedback.getAttribute('class')).includes(success ? 'is-success' : 'is-error'),
          )
          await page.waitForFunction(() =>
            document.activeElement?.classList.contains('cf-form-feedback'),
          )
          assert.equal(await form.locator('[name="message"]').inputValue(), success ? '' : note)
          assert.equal(
            await form.locator('[name="email"]').inputValue(),
            success ? '' : 'contact-qa@example.invalid',
          )
          assert.equal(payloads.length, 1)
          assert.equal(
            payloads[0].service,
            pageKind === 'homepage' ? 'development' : 'WORDPRESS_QUICK_FIX',
          )
          assert.equal(payloads[0].message, note)
          const conversions = await page.evaluate(
            () =>
              window.__contactQaEvents.filter(
                (args) => args[0] === 'event' && args[1] === 'generate_lead',
              ).length,
          )
          assert.equal(conversions, test.conversions)
          if (!success && test.result !== 'rejected')
            assert.ok((await feedback.innerText()).includes('Spróbuj ponownie'))
          if (!test.analytics) assert.equal(funnelRequests, 0)
          assert.deepEqual(pageErrors, [])
          const result = {
            engine,
            pageKind,
            case: test.name,
            mockLeadRequests: payloads.length,
            conversions,
            focus: 'feedback',
            data: success ? 'cleared' : 'preserved',
            blockedExternalRequests,
            liveLeadRequests: 0,
          }
          results.push(result)
          console.log(JSON.stringify(result))
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
  new URL('results.json', output),
  JSON.stringify({ target: target.href, cases: results.length, results }, null, 2),
)
console.log(
  `Contact submission QA passed: ${results.length} scenarios. All leads and measurement requests were intercepted.`,
)
