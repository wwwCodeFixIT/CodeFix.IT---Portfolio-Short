/* global document, innerHeight, window */
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
assert.match(process.env.AUDIT_RUNTIME_COMMIT, /^[a-f0-9]{40}$/)
const output = new URL('../qa-results/contact-viewport/', import.meta.url)
await mkdir(output, { recursive: true })
const results = []

async function state(page, phase) {
  return page.evaluate((phase) => {
    const active = document.activeElement
    const viewport = window.visualViewport
    return {
      phase,
      active: active?.getAttribute('name'),
      box: active?.getBoundingClientRect().toJSON(),
      viewport: {
        height: viewport?.height ?? innerHeight,
        offsetTop: viewport?.offsetTop ?? 0,
        layoutHeight: innerHeight,
      },
      headerBottom: document.querySelector('.cf-header')?.getBoundingClientRect().bottom ?? 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  }, phase)
}

async function visibleField(page, name) {
  await page.waitForFunction((name) => {
    const active = document.activeElement
    if (active?.getAttribute('name') !== name) return false
    const box = active.getBoundingClientRect()
    const viewport = window.visualViewport
    const top = Math.max(
      viewport?.offsetTop ?? 0,
      document.querySelector('.cf-header')?.getBoundingClientRect().bottom ?? 0,
    )
    const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight)
    return box.top >= top && box.bottom <= bottom
  }, name)
}

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch(
    engine === 'chromium' ? { channel: 'chrome', chromiumSandbox: true } : {},
  )
  try {
    for (const width of [320, 390]) {
      for (const height of [360, 430]) {
        const context = await browser.newContext({
          viewport: { width, height: 844 },
          deviceScaleFactor: 1,
          isMobile: true,
          hasTouch: true,
          locale: 'pl-PL',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(5000)
        const pageErrors = []
        let leadRequests = 0
        page.on('pageerror', (error) => pageErrors.push(error.message))
        await context.route('https://app.codefix.it/api/public/leads', async (route) => {
          leadRequests++
          await route.abort('blockedbyclient')
        })
        const result = { engine, browserVersion: browser.version(), width, height, states: [] }
        try {
          const response = await page.goto(target.href, { waitUntil: 'networkidle' })
          assert.equal(response.status(), 200)
          await page.locator('.cf-hero-picker').waitFor()
          assert.equal(
            await page.locator('script[type="module"][src]').getAttribute('src'),
            process.env.AUDIT_EXPECTED_ENTRY,
          )
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          await page
            .locator('.cf-hero-copy')
            .getByRole('link', { name: 'Opisz temat', exact: true })
            .click()
          await visibleField(page, 'name')
          result.states.push(await state(page, 'before-resize'))
          // Resizes both viewports; this is not an on-device software-keyboard test.
          await page.setViewportSize({ width, height })
          result.states.push(await state(page, 'immediately-after-resize'))
          await visibleField(page, 'name')
          result.states.push(await state(page, 'name-after-resize'))
          for (const field of ['email', 'message']) {
            await page.locator('[name="' + field + '"]').click()
            await visibleField(page, field)
            result.states.push(await state(page, field + '-after-resize'))
          }
          await page.screenshot({
            path: new URL(engine + '-' + width + '-' + height + '.jpg', output).pathname,
            type: 'jpeg',
            quality: 80,
          })
          await page.setViewportSize({ width, height: 844 })
          await visibleField(page, 'message')
          result.states.push(await state(page, 'restored-height'))
          assert.ok(result.states.every((s) => s.overflow === 0))
          assert.deepEqual(pageErrors, [])
          assert.equal(leadRequests, 0)
          result.status = 'pass'
        } catch (error) {
          result.status = 'fail'
          result.error = error.stack
          result.states.push(await state(page, 'failure'))
          await page.screenshot({
            path: new URL(engine + '-' + width + '-' + height + '-failure.jpg', output).pathname,
            type: 'jpeg',
            quality: 80,
          })
        } finally {
          result.pageErrors = pageErrors
          result.leadRequests = leadRequests
          results.push(result)
          console.log(JSON.stringify(result))
          await context.close()
        }
      }
    }
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
      method: 'Resize both layout and visual viewports; no physical keyboard emulation',
      results,
    },
    null,
    2,
  ),
)
assert.ok(
  results.every((result) => result.status === 'pass'),
  'Contact viewport cases failed',
)
console.log('Contact viewport QA passed: ' + results.length + ' scenarios. No lead requests.')
