/* global document, window */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const production = process.env.CODEFIX_NAVIGATION_PRODUCTION === '1'
const target = new URL(production ? 'https://codefix.it/' : 'http://127.0.0.1:4173/')
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const expectedRuntime = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1]
assert.ok(expectedRuntime, 'Built runtime is missing')
const { navigation } = JSON.parse(
  await readFile(new URL('../src/data/homepage-content.json', import.meta.url), 'utf8'),
)
const output = new URL(
  production ? '../qa-results/mobile-navigation-production/' : '../qa-results/contact-submission/',
  import.meta.url,
)
const results = []
await mkdir(output, { recursive: true })

if (production) {
  let ready = false
  for (let attempt = 0; attempt < 24; attempt++) {
    const response = await fetch(target, { headers: { 'cache-control': 'no-cache' } })
    if (response.ok && (await response.text()).includes(`src="${expectedRuntime}"`)) {
      ready = true
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  assert.ok(ready, 'Production did not publish the expected runtime')
}

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch()
  try {
    const cases = [
      ...[320, 390, 768, 980, 981, 1280].flatMap((width) =>
        ['reduce', 'no-preference'].map((motion) => ({
          width,
          height: 844,
          motion,
          javaScriptEnabled: true,
        })),
      ),
      { width: 768, height: 360, motion: 'reduce', javaScriptEnabled: true },
      { width: 390, height: 844, motion: 'reduce', javaScriptEnabled: false },
    ]
    for (const { width, height, motion, javaScriptEnabled } of cases) {
      const context = await browser.newContext({
        viewport: { width, height },
        locale: 'pl-PL',
        reducedMotion: motion,
        javaScriptEnabled,
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
      const noOverflow = async () =>
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
          ),
          false,
        )
      const targetSize = async (locator) => {
        const box = await locator.boundingBox()
        assert.ok(box.width >= 44 && box.height >= 44, JSON.stringify(box))
      }
      try {
        await page.goto(target.href, { waitUntil: 'networkidle' })
        if (javaScriptEnabled) {
          await page.waitForFunction(() => !document.querySelector('#root[data-static-prerender]'))
          assert.equal(
            await page.locator('script[type="module"][src]').getAttribute('src'),
            expectedRuntime,
          )
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          const menu = page.getByRole('button', { name: 'Menu', exact: true })
          const panel = page.locator('#cf-mobile-navigation')
          const desktop = page.getByRole('navigation', { name: 'Główna nawigacja', exact: true })
          assert.equal(await panel.evaluate((el) => el.matches(':popover-open')), false)
          const mobile = width <= 980
          assert.equal(await menu.isVisible(), mobile)
          assert.equal(await desktop.isVisible(), !mobile)
          const initialOverflow = await page.evaluate(() => document.body.style.overflow)
          if (mobile) {
            await targetSize(menu)
            assert.equal(await menu.getAttribute('aria-controls'), 'cf-mobile-navigation')
            await menu.press('Enter')
            assert.equal(await panel.isVisible(), true)
            assert.equal(await panel.evaluate((el) => el.matches(':popover-open')), true)
            assert.deepEqual(
              await panel.locator('a').allTextContents(),
              navigation.map((item) => item.label),
            )
            assert.deepEqual(
              await panel
                .locator('a')
                .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
              navigation.map((item) => item.href),
            )
            for (const link of await panel.getByRole('link').all()) await targetSize(link)
            const box = await panel.boundingBox()
            assert.ok(
              box.x >= 0 &&
                box.y >= 0 &&
                box.x + box.width <= width + 1 &&
                box.y + box.height <= height + 1,
            )
            if (engine === 'chromium' && width === 390 && height === 844 && motion === 'reduce') {
              await page.screenshot({ path: new URL('mobile-menu-390.jpg', output).pathname })
            }
            await menu.press('Tab')
            assert.equal(
              await panel
                .getByRole('link')
                .first()
                .evaluate((el) => el === document.activeElement),
              true,
            )
            assert.equal(
              await panel
                .getByRole('link')
                .first()
                .evaluate((el) => el.matches(':focus-visible')),
              true,
            )
            await page.keyboard.press('Escape')
            assert.equal(await panel.isVisible(), false)
            assert.equal(await menu.evaluate((el) => el === document.activeElement), true)
            await menu.press('Space')
            assert.equal(await panel.isVisible(), true)
            await menu.press('Space')
            assert.equal(await panel.isVisible(), false)
            await menu.click()
            await page.locator('.cf-header .cf-brand').click()
            assert.equal(await panel.isVisible(), false)

            for (const [index, { href, label }] of navigation
              .filter((item) => item.href.startsWith('#') && item.href !== '#contact')
              .entries()) {
              await menu.press(index % 2 ? 'Space' : 'Enter')
              const link = panel.getByRole('link', { name: label, exact: true })
              if (index % 2) await link.click()
              else await link.press('Enter')
              await page.waitForFunction((hash) => {
                const heading = document.querySelector(`${hash} h2`)
                const box = heading?.getBoundingClientRect()
                const headerBottom = document
                  .querySelector('.cf-header')
                  ?.getBoundingClientRect().bottom
                return (
                  window.location.hash === hash &&
                  !document.querySelector('#cf-mobile-navigation').matches(':popover-open') &&
                  document.activeElement === heading &&
                  box.top >= headerBottom &&
                  box.bottom <= window.innerHeight
                )
              }, href)
              await noOverflow()
            }
            // The existing contact handler must still focus a visible form control.
            await menu.press('Enter')
            await panel.getByRole('link', { name: 'Kontakt', exact: true }).press('Enter')
            await page.waitForFunction(
              () =>
                document.activeElement?.closest('.cf-lead-form') &&
                !document.querySelector('#cf-mobile-navigation').matches(':popover-open'),
            )
            assert.equal(new URL(page.url()).hash, '#contact')
            assert.equal(
              await page.locator('[data-brief-step]:visible').getAttribute('data-brief-step'),
              '0',
            )
            assert.equal(await page.evaluate(() => document.body.style.overflow), initialOverflow)
            if (width === 390 && motion === 'reduce') {
              await menu.press('Enter')
              await page.setViewportSize({ width: 981, height: 844 })
              await page.waitForFunction(
                () => !document.querySelector('#cf-mobile-navigation').matches(':popover-open'),
              )
              assert.equal(await desktop.isVisible(), true)
              await page.setViewportSize({ width, height })
              assert.equal(await menu.isVisible(), true)
              assert.equal(await panel.isVisible(), false)
            }
            await menu.press('Enter')
            await panel.getByRole('link', { name: 'Poradniki', exact: true }).press('Enter')
            await page.waitForURL(new URL('/poradniki/', target).href)
            await page.getByRole('heading', { level: 1 }).waitFor()
          } else {
            assert.equal(await desktop.getByRole('link').count(), navigation.length)
            for (const link of await desktop.getByRole('link').all()) await targetSize(link)
          }
        } else {
          const disclosure = page.locator('.cf-static-navigation')
          const menu = disclosure.locator('summary')
          await targetSize(menu)
          await menu.press('Enter')
          assert.notEqual(await disclosure.getAttribute('open'), null)
          assert.deepEqual(
            await disclosure.locator('a').allTextContents(),
            navigation.map((item) => item.label),
          )
          for (const { href, label } of navigation) {
            const link = disclosure.getByRole('link', { name: label, exact: true })
            assert.equal(await link.getAttribute('href'), href === '#contact' ? '#kontakt' : href)
            await targetSize(link)
          }
          await disclosure.getByRole('link', { name: 'Proces', exact: true }).press('Enter')
          assert.equal(new URL(page.url()).hash, '#process')
          assert.equal(await page.locator('#process').count(), 1)
        }
        await noOverflow()
        assert.deepEqual(errors, [])
        assert.equal(externalRequests, 0)
        const result = {
          engine,
          width,
          height,
          motion,
          kind: `${javaScriptEnabled ? 'mobile-navigation' : 'mobile-navigation-static'}${production ? '-production' : ''}`,
          status: 'pass',
          target: target.origin,
          expectedRuntime,
          links: navigation.length,
          mobile: width <= 980,
          keyboard: true,
          targets44: true,
          noOverflow: true,
          contactFocus: javaScriptEnabled && width <= 980,
          nativeDismissal: javaScriptEnabled && width <= 980,
          externalRequests,
          liveLeadRequests: 0,
        }
        results.push(result)
        console.log(JSON.stringify(result))
      } catch (error) {
        await page.screenshot({
          path: new URL(`navigation-${engine}-${width}-${height}-${motion}-failure.jpg`, output)
            .pathname,
        })
        await writeFile(
          new URL('mobile-navigation-failure.json', output),
          JSON.stringify(
            {
              engine,
              width,
              height,
              motion,
              javaScriptEnabled,
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
  new URL('mobile-navigation.json', output),
  JSON.stringify({ cases: results.length, results }, null, 2),
)
console.log(
  `Mobile navigation QA passed: ${results.length} engine/viewport/motion/static combinations. No lead submissions.`,
)
