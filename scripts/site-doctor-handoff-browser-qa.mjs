/* LAB-3 real-browser E2E. All provider/CRM traffic is mocked; no live leads. */
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const origin = 'http://127.0.0.1:4173'
await mkdir('qa-results/site-doctor', { recursive: true })

const sample = {
  url: 'https://example.org/',
  finalUrl: 'https://example.org/',
  testedAt: '2026-10-16T12:00:00.000Z',
  source: 'Google PageSpeed Insights / Lighthouse',
  scores: { performance: 62, seo: 86, accessibility: 95 },
  checks: [
    { id: 'meta-description', label: 'Meta description', status: 'fail', detail: 'Brak opisu.' },
    { id: 'lcp', label: 'LCP', status: 'warning', detail: '3.12 s' },
    { id: 'lang', label: 'Język HTML', status: 'pass', detail: 'Poprawny.' },
  ],
  note: 'Wykryto dwa sygnały.',
  recommendations: ['Sprawdź opis i LCP.'],
}

for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
  const browser = await browserType.launch({ headless: true })
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({
        viewport: { width, height: 850 },
        locale: 'pl-PL',
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(20000)
      const pageErrors = []
      const leadPayloads = []
      page.on('pageerror', (error) => pageErrors.push(error.message))

      // Catch-all registered first: later mock handlers take precedence over it.
      await context.route('**/*', (route) =>
        new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
      )
      await context.route('**/api/site-doctor', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sample),
        }),
      )
      await context.route('**/api/ai-brief', (route) =>
        route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
      )
      await context.route('https://app.codefix.it/api/public/leads', async (route) => {
        const cors = {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
        if (route.request().method() === 'OPTIONS') {
          await route.fulfill({ status: 204, headers: cors })
          return
        }
        leadPayloads.push(route.request().postDataJSON())
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ leadId: 'browser-qa', duplicate: false }),
          headers: cors,
        })
      })
      // No network access to live CRM or other third-party endpoints during QA.

      async function dismissConsent() {
        const dismiss = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
        if (await dismiss.count()) {
          if (await dismiss.isVisible()) await dismiss.click()
        }
      }
      async function stepToDetails() {
        const chooser = page.locator('.cf-brief-choices')
        await chooser.getByRole('button', { name: 'Naprawa WordPress', exact: true }).click()
        await page
          .locator('.cf-lead-form')
          .getByRole('button', { name: 'Dalej', exact: true })
          .click()
        await page.locator('[data-brief-step="1"]:not([hidden])').waitFor()
      }
      async function submitFromDetails({
        preserveFields = false,
        label = 'Wyślij zgłoszenie Quick Fix',
      } = {}) {
        if (!preserveFields)
          await page
            .locator('form.cf-lead-form textarea[name="message"]')
            .fill('Potrzebuję naprawy strony WordPress. Proszę o kontakt i wycenę.')
        await page
          .locator('.cf-lead-form')
          .getByRole('button', { name: 'Dalej', exact: true })
          .click()
        await page.locator('[data-brief-step="2"]:not([hidden])').waitFor()
        if (!preserveFields) {
          await page.locator('input[name="name"]').fill('QA Browser Test')
          await page.locator('input[name="email"]').fill('qa@example.org')
        }
        await page.locator('form.cf-lead-form').getByRole('button', { name: label }).click()
        await page.getByText('Wiadomość dotarła').waitFor()
        assert.ok(leadPayloads.length, 'No mocked CRM lead received')
        return leadPayloads.at(-1)
      }

      // Path A: take short evidence from the doctor's independent CTA to the lead form.
      await page.goto(origin + '/narzedzia/', { waitUntil: 'domcontentloaded' })
      await page.locator('.cf-doctor').waitFor()
      await dismissConsent()
      await page.locator('.cf-doctor-form input[type="url"]').fill('https://example.org/')
      await page.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await page.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor()
      await page
        .locator('.cf-doctor-results')
        .screenshot({ path: `qa-results/site-doctor/${engine}-${width}-diagnosis.png` })
      await page.getByRole('button', { name: /Dołącz diagnozę do zapytania/ }).click()
      await page.waitForURL(/doctor=1/)
      await dismissConsent()
      await stepToDetails()
      const attach = page.locator('.cf-doctor-attachment')
      assert.equal(await attach.evaluate((node) => node.open), true, 'Attachment should open')
      await attach.screenshot({
        path: `qa-results/site-doctor/${engine}-${width}-handoff-form.png`,
      })
      const checkbox = attach.getByRole('checkbox', { name: /Dołącz ten raport/ })
      assert.equal(await checkbox.isChecked(), true, 'Explicit handoff should preselect report')
      const summary = await attach.locator('textarea').inputValue()
      assert.ok(summary.includes('Lighthouse mobile'))
      assert.ok(summary.includes('Meta description: problem'))
      assert.ok(!summary.includes('PRIVATE'))
      assert.equal(await page.locator('input[name="pageUrl"]').inputValue(), 'https://example.org/')
      const posted = await submitFromDetails()
      assert.ok(posted.message.includes('ZAŁĄCZONY RAPORT AI SITE DOCTOR'))
      assert.ok(posted.message.includes('Wydajność: 62/100'))
      assert.equal(posted.service, 'WORDPRESS_QUICK_FIX')
      const afterSuccess = await page.evaluate(() =>
        sessionStorage.getItem('codefix_site_doctor_handoff_v1'),
      )
      assert.equal(afterSuccess, null, 'Handoff should be deleted after sending')
      assert.deepEqual(pageErrors, [], 'Frontend errors in handoff flow')

      // Path B: transfer a second report, then remove it before submitting.
      await page.goto(origin + '/narzedzia/', { waitUntil: 'domcontentloaded' })
      await page.locator('.cf-doctor-form input[type="url"]').fill('https://example.org/')
      await page.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await page.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor()
      await page.getByRole('button', { name: /Dołącz diagnozę do zapytania/ }).click()
      await page.waitForURL(/doctor=1/)
      await stepToDetails()
      const removable = page.locator('.cf-doctor-attachment')
      assert.equal(
        await removable.getByRole('checkbox', { name: /Dołącz ten raport/ }).isChecked(),
        true,
      )
      await removable.getByRole('button', { name: 'Usuń raport' }).click()
      assert.equal(await removable.locator('textarea').inputValue(), '')
      assert.equal(
        await removable.getByRole('checkbox', { name: /Dołącz ten raport/ }).isChecked(),
        false,
      )
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem('codefix_site_doctor_handoff_v1')),
        null,
      )
      const withoutReport = await submitFromDetails()
      assert.ok(!withoutReport.message.includes('ZAŁĄCZONY RAPORT AI SITE DOCTOR'))
      assert.deepEqual(pageErrors, [], 'Frontend errors after removal')

      // Path C: standard visitor never enables or sends a diagnostic attachment.
      await page.goto(origin + '/?service=WORDPRESS_QUICK_FIX#contact', {
        waitUntil: 'domcontentloaded',
      })
      await stepToDetails()
      assert.equal(
        await page.locator('.cf-doctor-attachment input[type=checkbox]').isChecked(),
        false,
      )
      assert.equal(await page.locator('.cf-doctor-attachment textarea').inputValue(), '')
      const standard = await submitFromDetails()
      assert.ok(!standard.message.includes('ZAŁĄCZONY RAPORT AI SITE DOCTOR'))
      assert.equal(leadPayloads.length, 3, 'Expected only mocked CRM submissions')
      assert.deepEqual(pageErrors, [], 'Frontend errors in standard flow')

      // Path D: scan from an existing brief without losing any entered fields.
      await page.goto(origin + '/?service=CODEFIX_BUSINESS_SITE#contact', {
        waitUntil: 'domcontentloaded',
      })
      await page
        .locator('.cf-brief-choices')
        .getByRole('button', { name: 'Nowa strona', exact: true })
        .click()
      await page
        .locator('.cf-lead-form')
        .getByRole('button', { name: 'Dalej', exact: true })
        .click()
      const ownMessage = 'QA_PRIVATE_FORM_TEXT: Potrzebuję nowej strony z ofertą i formularzem.'
      const ownUrl = 'https://existing.example.org/already'
      await page.locator('input[name="pageUrl"]').fill(ownUrl)
      await page.locator('textarea[name="message"]').fill(ownMessage)
      await page
        .locator('.cf-lead-form')
        .getByRole('button', { name: 'Dalej', exact: true })
        .click()
      await page.locator('input[name="name"]').fill('QA Preserved Name')
      await page.locator('input[name="email"]').fill('qa-preserved@example.org')
      await page.locator('input[name="company"]').fill('QA Preserved Company')
      await page
        .locator('.cf-lead-form')
        .getByRole('button', { name: 'Wstecz', exact: true })
        .click()
      await page.locator('.cf-doctor-attachment summary').click()
      const launch = page.getByRole('button', { name: 'Uruchom Site Doctor →', exact: true })
      await page.evaluate(() => {
        globalThis.qaFormDocument = 'preserved'
      })
      const formUrl = page.url()
      await launch.click()
      const dialog = page.getByRole('dialog', { name: 'Diagnoza strony', exact: true })
      await dialog.waitFor()
      await dialog.locator('.cf-doctor').waitFor()
      assert.equal(await dialog.locator('input[type="url"]').inputValue(), ownUrl)
      assert.equal(
        await page.locator('form form').count(),
        0,
        'Diagnostic form must be outside the lead form',
      )
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(
        await launch.evaluate((node) => node === node.ownerDocument.activeElement),
        true,
        'Escape restores the trigger focus',
      )
      assert.equal(await page.locator('textarea[name="message"]').inputValue(), ownMessage)

      await launch.click()
      await dialog.locator('.cf-doctor').waitFor()
      await dialog.locator('input[type="url"]').fill('https://example.org/')
      await dialog.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await dialog.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor()
      await dialog.screenshot({
        path: `qa-results/site-doctor/${engine}-${width}-inline-dialog.png`,
      })
      assert.ok(
        await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
        'Dialog should not overflow horizontally',
      )
      await dialog.getByRole('button', { name: /Dołącz diagnozę do zapytania/ }).click()
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(page.url(), formUrl, 'In-form attachment must not navigate')
      assert.equal(
        await page.evaluate(() => globalThis.qaFormDocument),
        'preserved',
        'Original document must stay mounted',
      )
      assert.equal(await page.locator('textarea[name="message"]').inputValue(), ownMessage)
      assert.equal(
        await page.locator('input[name="pageUrl"]').inputValue(),
        ownUrl,
        'Report URL must not overwrite an entered URL',
      )
      assert.equal(await page.locator('input[name="name"]').inputValue(), 'QA Preserved Name')
      assert.equal(
        await page.locator('input[name="email"]').inputValue(),
        'qa-preserved@example.org',
      )
      assert.equal(await page.locator('input[name="company"]').inputValue(), 'QA Preserved Company')
      assert.equal(
        await page.locator('.cf-doctor-attachment input[type="checkbox"]').isChecked(),
        true,
      )
      const storedValues = await page.evaluate(() =>
        JSON.stringify({ ...sessionStorage, ...localStorage }),
      )
      for (const privateText of [
        ownMessage,
        'QA Preserved Name',
        'qa-preserved@example.org',
        'QA Preserved Company',
      ]) {
        assert.ok(!storedValues.includes(privateText), 'Typed contact data must not be persisted')
      }
      const preserved = await submitFromDetails({
        preserveFields: true,
        label: 'Wyślij brief do wyceny',
      })
      assert.equal(preserved.service, 'CODEFIX_BUSINESS_SITE')
      assert.equal(preserved.pageUrl, ownUrl)
      assert.equal(preserved.company, 'QA Preserved Company')
      assert.ok(preserved.message.includes(ownMessage))
      assert.ok(preserved.message.includes('ZAŁĄCZONY RAPORT AI SITE DOCTOR'))
      assert.equal(leadPayloads.length, 4, 'Only intercepted CRM submissions are permitted')

      // Brief CTA follows the generated brief, including edits while AI is in flight.
      await page.goto(origin + '/narzedzia/', { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: 'Asystent briefu AI', exact: true }).click()
      const brief = page.locator('[aria-labelledby="brief-title"]')
      await brief
        .getByLabel(/Cel lub problem/)
        .fill('Potrzebuję prostej strony z prezentacją usług i kontaktem.')
      const cta = brief.getByRole('link', { name: /Omów projekt/ })
      const mappings = {
        strona: 'CODEFIX_BUSINESS_SITE',
        aplikacja: 'development',
        naprawa: 'WORDPRESS_QUICK_FIX',
        opieka: 'WORDPRESS_CARE',
      }
      for (const [kind, service] of Object.entries(mappings)) {
        await brief.getByLabel('Rodzaj projektu').selectOption(kind)
        await brief.getByRole('button', { name: 'Szkic bez AI', exact: true }).click()
        assert.equal(await cta.getAttribute('href'), '/?service=' + service + '#contact')
      }
      await brief.getByLabel('Rodzaj projektu').selectOption('naprawa')
      assert.equal(
        await cta.getAttribute('href'),
        '/?service=WORDPRESS_CARE#contact',
        'Changing the selection must not relabel an old brief',
      )
      await brief.getByRole('button', { name: 'Generuj z AI', exact: true }).click()
      await brief.getByText('AI nie jest jeszcze aktywne.', { exact: false }).waitFor()
      assert.equal(
        await cta.getAttribute('href'),
        '/?service=WORDPRESS_QUICK_FIX#contact',
        'Local fallback must preserve the requested topic',
      )

      let releaseAi
      const aiGate = new Promise((resolve) => {
        releaseAi = resolve
      })
      await page.route('**/api/ai-brief', async (route) => {
        await aiGate
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ brief: 'Mockowany brief naprawy WordPress.' }),
        })
      })
      const requested = page.waitForRequest((request) => request.url().endsWith('/api/ai-brief'))
      await brief.getByRole('button', { name: 'Generuj z AI', exact: true }).click()
      assert.equal((await requested).postDataJSON().kind, 'naprawa')
      await brief.getByLabel('Rodzaj projektu').selectOption('opieka')
      releaseAi()
      await brief.getByText('Brief przygotowany przez model AI.', { exact: false }).waitFor()
      assert.equal(
        await cta.getAttribute('href'),
        '/?service=WORDPRESS_QUICK_FIX#contact',
        'AI response must keep its original topic',
      )
      assert.ok(
        (await brief.locator('textarea[readOnly]').inputValue()).includes(
          'Mockowany brief naprawy',
        ),
      )
      assert.deepEqual(pageErrors, [], 'Frontend errors after form preservation and brief mapping')

      // RC: provider disabled. An honest manual-contact CTA must be available.
      await page.route('**/api/site-doctor', (route) =>
        route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
      )
      await page.goto(origin + '/narzedzia/', { waitUntil: 'domcontentloaded' })
      await page.locator('.cf-doctor-form input[type="url"]').fill('https://example.org/')
      await page.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await page.getByText('Skaner nie został jeszcze aktywowany.', { exact: false }).waitFor()
      const manualLink = page.getByRole('link', { name: 'Opisz problem bez diagnozy →' })
      await manualLink.waitFor()
      assert.equal(await manualLink.getAttribute('href'), '/?service=WORDPRESS_QUICK_FIX#contact')
      assert.equal(await page.locator('.cf-doctor-results').count(), 0)
      await page.locator('.cf-doctor-manual-help').screenshot({
        path: `qa-results/site-doctor/${engine}-${width}-api-fallback.png`,
      })

      // RC: HTTP 429 must not be misrepresented as a Lighthouse finding.
      await page.unroute('**/api/site-doctor')
      await page.route('**/api/site-doctor', (route) =>
        route.fulfill({ status: 429, contentType: 'application/json', body: '{}' }),
      )
      await page.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await page.getByText('Limit analiz został osiągnięty.', { exact: false }).waitFor()
      assert.equal(await page.locator('.cf-doctor-results').count(), 0)
      await manualLink.waitFor()

      // RC: cancellation must be announced as cancellation, not a timeout.
      await page.unroute('**/api/site-doctor')
      await page.route('**/api/site-doctor', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        try {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(sample),
          })
        } catch {
          // Browser aborted the in-flight fetch.
        }
      })
      const pendingRequest = page.waitForRequest((req) => req.url().endsWith('/api/site-doctor'))
      await page.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await pendingRequest
      await page.getByRole('button', { name: 'Anuluj', exact: true }).click()
      await page.getByText('Pomiar został anulowany.', { exact: false }).waitFor()
      await manualLink.waitFor()
      assert.equal(await page.locator('.cf-doctor-results').count(), 0)

      // RC: failed scan inside the lead wizard must return to the same form.
      await page.unroute('**/api/site-doctor')
      await page.route('**/api/site-doctor', (route) =>
        route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
      )
      await page.goto(origin + '/?service=WORDPRESS_QUICK_FIX#contact', {
        waitUntil: 'domcontentloaded',
      })
      await stepToDetails()
      const originalMessage = 'Błąd formularza po ostatniej aktualizacji WordPress.'
      await page.locator('textarea[name="message"]').fill(originalMessage)
      await page.locator('.cf-doctor-attachment summary').click()
      await page.getByRole('button', { name: 'Uruchom Site Doctor →', exact: true }).click()
      const fallbackDialog = page.getByRole('dialog', { name: 'Diagnoza strony', exact: true })
      await fallbackDialog.waitFor()
      await fallbackDialog.locator('input[type="url"]').fill('https://example.org/')
      await fallbackDialog.getByRole('button', { name: /Uruchom diagnozę/ }).click()
      await fallbackDialog.getByRole('button', { name: 'Wróć do zgłoszenia bez raportu →' }).click()
      await fallbackDialog.waitFor({ state: 'hidden' })
      assert.equal(await page.locator('textarea[name="message"]').inputValue(), originalMessage)
      assert.equal(
        await page.locator('.cf-doctor-attachment input[type="checkbox"]').isChecked(),
        false,
      )
      assert.deepEqual(pageErrors, [], 'RC error and cancellation flows must not throw')

      console.log(
        `Tools browser QA PASS: ${engine} ${width}px; 4 mocked lead paths, preserved form, 4 brief topics, fallback and in-flight edits. No live provider or CRM calls.`,
      )
      await context.close()
    }
  } finally {
    await browser.close()
  }
}
