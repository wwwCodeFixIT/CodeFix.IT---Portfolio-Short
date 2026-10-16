/* LAB-3 real-browser E2E. All provider/CRM traffic is mocked; no live leads. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url));
const { chromium } = require('playwright');
const origin = 'http://127.0.0.1:4173';

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
};

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: 850 },
      locale: 'pl-PL',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const pageErrors = [];
    const leadPayloads = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await context.route('**/api/site-doctor', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sample) }),
    );
    await context.route('https://app.codefix.it/api/public/leads', async (route) => {
      leadPayloads.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ leadId: 'browser-qa', duplicate: false }),
        headers: { 'Access-Control-Allow-Origin': origin },
      });
    });
    // No network access to live CRM or other third-party endpoints during QA.
    await context.route('**/*', (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
    );

    async function dismissConsent() {
      const dismiss = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true });
      if (await dismiss.count()) {
        if (await dismiss.isVisible()) await dismiss.click();
      }
    }
    async function stepToDetails() {
      const chooser = page.locator('.cf-brief-choices');
      await chooser.getByRole('button', { name: 'Naprawa WordPress', exact: true }).click();
      await page.locator('.cf-lead-form').getByRole('button', { name: 'Dalej', exact: true }).click();
      await page.locator('[data-brief-step="1"]:not([hidden])').waitFor();
    }
    async function submitFromDetails() {
      await page.locator('form.cf-lead-form textarea[name="message"]').fill(
        'Potrzebuję naprawy strony WordPress. Proszę o kontakt i wycenę.',
      );
      await page.locator('.cf-lead-form').getByRole('button', { name: 'Dalej', exact: true }).click();
      await page.locator('[data-brief-step="2"]:not([hidden])').waitFor();
      await page.locator('input[name="name"]').fill('QA Browser Test');
      await page.locator('input[name="email"]').fill('qa@example.org');
      await page.locator('form.cf-lead-form').getByRole('button', { name: 'Wyślij zgłoszenie Quick Fix' }).click();
      await page.getByText('Wiadomość dotarła').waitFor();
      assert.ok(leadPayloads.length, 'No mocked CRM lead received');
      return leadPayloads.at(-1);
    }

    // Path A: take short evidence from the doctor's independent CTA to the lead form.
    await page.goto(origin + '/narzedzia/', { waitUntil: 'domcontentloaded' });
    await page.locator('.cf-doctor').waitFor();
    await page.locator('.cf-doctor-form input[type="url"]').fill('https://example.org/');
    await page.getByRole('button', { name: /Uruchom diagnozę/ }).click();
    await page.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor();
    await page.getByRole('button', { name: /Dołącz diagnozę do zapytania/ }).click();
    await page.waitForURL(/doctor=1/);
    await dismissConsent();
    await stepToDetails();
    const attach = page.locator('.cf-doctor-attachment');
    assert.equal(await attach.evaluate((node) => node.open), true, 'Attachment should open');
    const checkbox = attach.getByRole('checkbox', { name: /Dołącz ten raport/ });
    assert.equal(await checkbox.isChecked(), true, 'Explicit handoff should preselect report');
    const summary = await attach.locator('textarea').inputValue();
    assert.ok(summary.includes('Lighthouse mobile'));
    assert.ok(summary.includes('Meta description: problem'));
    assert.ok(!summary.includes('PRIVATE'));
    assert.equal(await page.locator('input[name="pageUrl"]').inputValue(), 'https://example.org/');
    const posted = await submitFromDetails();
    assert.ok(posted.message.includes('ZAŁĄCZONY RAPORT AI SITE DOCTOR'));
    assert.ok(posted.message.includes('Wydajność: 62/100'));
    assert.equal(posted.service, 'WORDPRESS_QUICK_FIX');
    const afterSuccess = await page.evaluate(() => sessionStorage.getItem('codefix_site_doctor_handoff_v1'));
    assert.equal(afterSuccess, null, 'Handoff should be deleted after sending');
    assert.deepEqual(pageErrors, [], 'Frontend errors in handoff flow');

    // Path B: explicit report removal must not leak into a later standard request.
    const secondPage = await context.newPage();
    secondPage.on('pageerror', (error) => pageErrors.push(error.message));
    await secondPage.goto(origin + '/?service=WORDPRESS_QUICK_FIX#contact', { waitUntil: 'domcontentloaded' });
    const choose = secondPage.locator('.cf-brief-choices');
    await choose.getByRole('button', { name: 'Naprawa WordPress', exact: true }).click();
    await secondPage.locator('.cf-lead-form').getByRole('button', { name: 'Dalej', exact: true }).click();
    await secondPage.locator('[data-brief-step="1"]:not([hidden])').waitFor();
    assert.equal(await secondPage.locator('.cf-doctor-attachment input[type=checkbox]').isChecked(), false);
    assert.equal(await secondPage.locator('.cf-doctor-attachment textarea').inputValue(), '');
    await secondPage.close();
    assert.deepEqual(pageErrors, [], 'Frontend errors in standard flow');

    console.log('Site Doctor browser QA PASS at ' + width + 'px (mocked PageSpeed and CRM).');
    await context.close();
  }
} finally {
  await browser.close();
}
