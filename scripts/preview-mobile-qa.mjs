/* global document, getComputedStyle, innerHeight */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL(process.env.AUDIT_SITE_URL)
assert.ok(
  target.protocol === 'https:' &&
    target.hostname.endsWith('.codefix-it---portfolio-short.pages.dev'),
)
assert.ok(!target.username && !target.password && !target.search && !target.hash)
const output = new URL('../qa-results/mobile/', import.meta.url)
await mkdir(output, { recursive: true })
const results = []

async function ready(page, path = '/') {
  await page.goto(new URL(path, target).href, { waitUntil: 'networkidle' })
  await page.locator('.cf-hero-picker').waitFor()
  assert.equal(
    await page.locator('script[type="module"][src]').getAttribute('src'),
    process.env.AUDIT_EXPECTED_ENTRY,
  )
  const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
  if (await reject.isVisible()) await reject.click()
}

async function contactReady(page, service) {
  await page.waitForFunction(
    (expected) =>
      document.querySelector('select[name="service"]')?.value === expected &&
      document.activeElement?.getAttribute('name') === 'name',
    service,
  )
  await page.waitForFunction(() => {
    const box = document.querySelector('input[name="name"]')?.getBoundingClientRect()
    return box && box.top > 0 && box.bottom < innerHeight
  })
}

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch(
    engine === 'chromium' ? { channel: 'chrome', chromiumSandbox: true } : {},
  )
  try {
    for (const width of [320, 375, 390, 430, 768]) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
        locale: 'pl-PL',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      const errors = []
      let blockedLeads = 0
      page.on('pageerror', (error) => errors.push(error.message))
      await context.route('https://app.codefix.it/api/public/leads', async (route) => {
        blockedLeads++
        await route.abort('blockedbyclient')
      })
      try {
        await ready(page)
        const layout = await page.evaluate(() => {
          const card = document.querySelector('.cf-hero-paths')
          const heading = document.querySelector('#cf-hero-paths-title')
          const chooser = document.querySelector('.cf-hero-path-list')
          return {
            width: document.documentElement.clientWidth,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            cardScroll: card.scrollTop,
            headingTop: heading.getBoundingClientRect().top,
            pickerTop: chooser.getBoundingClientRect().top,
            motion: document.querySelector('.cf-hero').dataset.motion,
          }
        })
        assert.equal(layout.width, width)
        assert.equal(layout.overflow, 0)
        assert.equal(layout.cardScroll, 0)
        assert.equal(layout.motion, 'off')
        await page.screenshot({
          path: new URL(`${engine}-${width}.jpg`, output).pathname,
          type: 'jpeg',
          quality: 80,
        })
        await page
          .locator('.cf-hero-copy')
          .getByRole('link', { name: 'Opisz temat', exact: true })
          .click()
        await contactReady(page, '')
        const picker = page.locator('.cf-hero-picker')
        for (const label of ['Strona', 'Naprawa', 'Aplikacja']) {
          await picker.getByRole('button', { name: label, exact: true }).click()
          assert.equal(
            await picker
              .getByRole('button', { name: label, exact: true })
              .getAttribute('aria-pressed'),
            'true',
          )
        }
        await picker.getByRole('link', { name: 'Omów aplikację', exact: true }).click()
        await contactReady(page, 'development')
        const form = await page.evaluate(() => ({
          fontSize: getComputedStyle(document.querySelector('input[name="name"]')).fontSize,
          focus: document.activeElement?.getAttribute('name'),
        }))
        form.stickyVisible = await page.locator('.cf-mobile-sticky-cta').isVisible()
        if (width <= 720) {
          assert.ok(parseFloat(form.fontSize) >= 16)
          assert.equal(form.stickyVisible, false)
        }
        await page.screenshot({
          path: new URL(`${engine}-${width}-contact.jpg`, output).pathname,
          type: 'jpeg',
          quality: 80,
        })
        if (width === 375) {
          const note = 'Notatka QA — test interfejsu bez wysyłki.'
          await page.locator('textarea[name="message"]').fill(note)
          await page.getByRole('button', { name: 'Kalkulator WordPress', exact: true }).click()
          await page.getByRole('radio', { name: 'Stała opieka', exact: true }).check()
          await page
            .getByLabel('Dla jakiego okresu chcesz policzyć budżet?')
            .selectOption('quarter')
          await page.waitForFunction(() =>
            document.querySelector('.cf-estimator-price')?.textContent.includes('900'),
          )
          await page
            .getByRole('button', { name: 'Przenieś zakres do formularza', exact: true })
            .click()
          await contactReady(page, 'WORDPRESS_CARE')
          assert.ok((await page.locator('textarea[name="message"]').inputValue()).includes(note))
          await page.getByRole('button', { name: 'Usuń dołączony zakres', exact: true }).click()
          assert.equal(await page.locator('textarea[name="message"]').inputValue(), note)
          await page
            .locator('footer')
            .getByRole('button', { name: 'Ustawienia prywatności', exact: true })
            .click()
          await page
            .getByRole('dialog', { name: 'Ty wybierasz, co mierzymy' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true }).click()
          await page.waitForFunction(
            () => document.querySelector('footer .cf-consent-settings') === document.activeElement,
          )
          await page.goto(new URL('/realizacje/kancelaria-adwokacka-witkowska/', target).href, {
            waitUntil: 'networkidle',
          })
          await page
            .getByRole('link', { name: 'Zapytaj o podobne wdrożenie →', exact: true })
            .click()
          await contactReady(page, 'CODEFIX_BUSINESS_SITE')
        }
        assert.deepEqual(errors, [])
        assert.equal(blockedLeads, 0, 'Unexpected attempt to submit a lead')
        const result = {
          engine,
          browserVersion: browser.version(),
          width,
          layout,
          form,
          extendedFlows: width === 375,
          pageErrors: errors,
          leadRequests: blockedLeads,
          status: 'pass',
        }
        results.push(result)
        console.log(JSON.stringify(result))
      } catch (error) {
        await page.screenshot({
          path: new URL(`${engine}-${width}-failure.jpg`, output).pathname,
          type: 'jpeg',
          quality: 80,
        })
        const state = await page.evaluate(() => ({
          active: document.activeElement?.getAttribute('name'),
          service: document.querySelector('select[name="service"]')?.value,
          nameBox: document.querySelector('input[name="name"]')?.getBoundingClientRect().toJSON(),
          contactBox: document.querySelector('#contact')?.getBoundingClientRect().toJSON(),
          viewport: innerHeight,
        }))
        results.push({ engine, width, status: 'fail', error: error.stack, state })
        await writeFile(
          new URL('summary.json', output),
          JSON.stringify({ runtimeCommit: process.env.AUDIT_RUNTIME_COMMIT, results }, null, 2),
        )
        throw error
      } finally {
        await context.close()
      }
    }
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await ready(page)
    assert.equal(await page.locator('.cf-hero').getAttribute('data-motion'), 'off')
    const animation = await page
      .locator('.cf-hero-cube')
      .evaluate((el) => getComputedStyle(el).animationName)
    assert.equal(animation, 'none')
    results.push({ engine, width: 1440, reducedMotion: true, status: 'pass' })
    await context.close()
  } finally {
    await browser.close()
  }
}
await writeFile(
  new URL('summary.json', output),
  JSON.stringify(
    {
      runtimeCommit: process.env.AUDIT_RUNTIME_COMMIT,
      workflowCommit: process.env.GITHUB_SHA,
      target: target.href,
      results,
    },
    null,
    2,
  ),
)
console.log(`Mobile QA passed: ${results.length} scenarios. No lead requests.`)
