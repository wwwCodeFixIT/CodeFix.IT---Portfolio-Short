/* global document, window */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL('http://127.0.0.1:4173/')
const { process: steps } = JSON.parse(
  await readFile(new URL('../src/data/homepage-content.json', import.meta.url), 'utf8'),
)
const output = new URL('../qa-results/contact-submission/', import.meta.url)
const results = []
await mkdir(output, { recursive: true })

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch()
  try {
    const cases = [
      ...[320, 390, 1280].flatMap((width) =>
        ['reduce', 'no-preference'].map((motion) => ({ width, motion, javaScriptEnabled: true })),
      ),
      { width: 390, motion: 'reduce', javaScriptEnabled: false },
    ]
    for (const { width, motion, javaScriptEnabled } of cases) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        reducedMotion: motion,
        javaScriptEnabled,
        locale: 'pl-PL',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      const errors = []
      let externalRequests = 0
      page.on('pageerror', (error) => errors.push(error.message))
      await context.route('**/*', (route) => {
        const request = route.request()
        if (
          new URL(request.url()).origin === target.origin &&
          ['GET', 'HEAD'].includes(request.method())
        )
          return route.continue()
        externalRequests++
        return route.abort('blockedbyclient')
      })
      try {
        await page.goto(new URL('#process', target).href, { waitUntil: 'networkidle' })
        if (javaScriptEnabled) {
          await page.waitForFunction(() => !document.querySelector('#root[data-static-prerender]'))
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
        } else {
          assert.equal(await page.locator('#root[data-static-prerender]').count(), 1)
        }
        const section = page.locator('#process')
        const cards = section.locator('details[name="codefix-process"]')
        assert.equal(await cards.count(), 4)
        assert.equal(await section.locator('details[open]').count(), 0)
        for (const [index, step] of steps.entries()) {
          const card = cards.nth(index)
          const control = card.locator('summary')
          assert.equal(await control.locator('h3').innerText(), step.title)
          assert.equal(await card.locator('dl').isVisible(), false)
          await control.press(index % 2 === 0 ? 'Enter' : 'Space')
          assert.notEqual(await card.getAttribute('open'), null)
          assert.equal(await section.locator('details[open]').count(), 1)
          assert.deepEqual(await card.locator('dd').allTextContents(), [step.receive, step.provide])
          assert.equal(await card.locator('dl').isVisible(), true)
          assert.ok(await control.evaluate((el) => el === document.activeElement))
          assert.ok(await control.evaluate((el) => el.matches(':focus-visible')))
          const box = await control.boundingBox()
          assert.ok(box.width >= 44 && box.height >= 44)
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
            false,
          )
        }
        const last = cards.last().locator('summary')
        await last.click()
        assert.equal(await section.locator('details[open]').count(), 0)
        await cards.first().locator('summary').click()
        assert.notEqual(await cards.first().getAttribute('open'), null)
        const before = await cards.first().locator('dl').innerText()
        await page.emulateMedia({ reducedMotion: motion === 'reduce' ? 'no-preference' : 'reduce' })
        assert.equal(await cards.first().locator('dl').innerText(), before)
        await cards.first().locator('summary').press('Enter')
        assert.equal(await section.locator('details[open]').count(), 0)
        assert.deepEqual(errors, [])
        assert.equal(externalRequests, 0)
        const result = {
          engine,
          width,
          motion,
          kind: javaScriptEnabled ? 'process-steps' : 'process-steps-static',
          status: 'pass',
          steps: 4,
          initiallyCollapsed: true,
          exclusiveDisclosure: true,
          keyboardAndPointer: true,
          focusVisible: true,
          contentParity: true,
          targetSize: true,
          noOverflow: true,
          externalRequests,
          liveLeadRequests: 0,
        }
        results.push(result)
        console.log(JSON.stringify(result))
        await writeFile(
          new URL('process-steps.json', output),
          JSON.stringify({ cases: results.length, results }, null, 2),
        )
      } catch (error) {
        const name = `process-${engine}-${width}-${motion}-${javaScriptEnabled}`
        await writeFile(
          new URL(name + '-failure.json', output),
          JSON.stringify(
            {
              engine,
              width,
              motion,
              javaScriptEnabled,
              error: error.stack,
              url: page.url(),
              errors,
              externalRequests,
              html: await page.locator('#process').evaluate((el) => el.outerHTML),
            },
            null,
            2,
          ),
        )
        await page.screenshot({ path: new URL(name + '-failure.jpg', output).pathname })
        throw error
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
}
assert.equal(results.length, 14)
console.log(
  'Process steps QA passed: 12 responsive/motion cases and 2 native no-JS cases. No live requests.',
)
