/* global document, window */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const target = new URL('http://127.0.0.1:4173/')
const guides = JSON.parse(
  await readFile(new URL('../public/data/wordpress-guides.json', import.meta.url), 'utf8'),
)
const output = new URL('../qa-results/contact-submission/', import.meta.url)
const results = []
await mkdir(output, { recursive: true })

async function saveResult(result) {
  results.push(result)
  console.log(JSON.stringify(result))
  await writeFile(
    new URL('guide-search.json', output),
    JSON.stringify({ cases: results.length, results }, null, 2),
  )
}

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch()
  try {
    for (const width of [320, 390, 1280]) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion,
          locale: 'pl-PL',
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const errors = []
        const blockedRequests = []
        const requests = []
        const failedRequests = []
        page.on('requestfailed', (request) =>
          failedRequests.push({ url: request.url(), error: request.failure()?.errorText }),
        )
        await context.addInitScript(() => {
          window.__guideEvents = []
          for (const type of [
            'pointerdown',
            'pointerup',
            'mousedown',
            'mouseup',
            'click',
            'input',
            'change',
            'focusin',
            'search',
          ]) {
            document.addEventListener(
              type,
              (event) => {
                const target = event.target
                if (!target.closest?.('.guide-search, .guide-search-empty')) return
                window.__guideEvents.push({
                  type,
                  tag: target.tagName,
                  id: target.id,
                  text: target.textContent?.slice(0, 70),
                  value: document.querySelector('#guide-search')?.value,
                })
              },
              true,
            )
          }
        })
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', (route) => {
          const request = route.request()
          const url = new URL(request.url())
          if (url.origin !== target.origin || !['GET', 'HEAD'].includes(request.method())) {
            blockedRequests.push(`${request.method()} ${url.origin}${url.pathname}`)
            return route.abort('blockedbyclient')
          }
          requests.push(url.href)
          return route.continue()
        })
        try {
          await page.goto(new URL('/poradniki/?utm_source=guide_search_qa', target).href, {
            waitUntil: 'networkidle',
          })
          const input = page.getByRole('searchbox', { name: 'Znajdź poradnik', exact: true })
          await input.waitFor()
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          const requestCount = requests.length

          const expectSlugs = async (slugs) => {
            const paths = slugs.map((slug) => `/poradniki/${slug}/`).sort()
            await page.waitForFunction(
              (expected) =>
                JSON.stringify(
                  [...document.querySelectorAll('.guide-card > a')]
                    .map((link) => link.getAttribute('href'))
                    .sort(),
                ) === JSON.stringify(expected),
              paths,
            )
          }

          await expectSlugs(guides.map((guide) => guide.slug))
          assert.equal(await page.locator('.guide-index-nav a').count(), 3)
          assert.equal(await input.getAttribute('aria-controls'), 'guide-results')
          const box = await input.boundingBox()
          assert.ok(box && box.height >= 44 && box.width > 100)
          assert.equal(
            await input.evaluate((element) => window.getComputedStyle(element).fontSize),
            '16px',
          )

          await input.fill('  500,  BŁĄD  ')
          await expectSlugs(['blad-500-wordpress'])
          assert.equal(await page.getByRole('status').innerText(), 'Znaleziono: 1 z 9.')
          assert.equal(await page.locator('.guide-index-group').count(), 1)
          assert.equal(await page.locator('.guide-index-nav').count(), 0)
          await input.fill('blad 500')
          await expectSlugs(['blad-500-wordpress'])
          await input.fill('WOLNO LADUJE')
          await expectSlugs(['wolny-wordpress-co-sprawdzic'])
          await input.fill('koszt opieki')
          await expectSlugs(['ile-kosztuje-opieka-wordpress'])
          await input.fill('płatności checkout')
          await expectSlugs(['woocommerce-checkout-nie-dziala'])
          await input.fill('koszt')
          await expectSlugs([
            'ile-kosztuje-naprawa-wordpress',
            'ile-kosztuje-opieka-wordpress',
            'ile-kosztuje-strona-wordpress-dla-firmy',
          ])
          assert.equal(await page.locator('.guide-index-group').count(), 3)

          await input.fill('nieistniejący temat xyz')
          await expectSlugs([])
          assert.equal(await page.getByRole('status').innerText(), 'Znaleziono: 0 z 9.')
          assert.ok(
            await page.getByRole('heading', { name: 'Spróbuj krótszego hasła.' }).isVisible(),
          )
          assert.equal(await page.locator('.guide-index-group').count(), 0)
          await page
            .getByRole('button', { name: 'Zobacz wszystkie poradniki', exact: true })
            .click()
          await expectSlugs(guides.map((guide) => guide.slug))
          assert.ok(await input.evaluate((element) => document.activeElement === element))

          // Repeat a long-to-empty transition: WebKit must keep the reset button
          // under the pointer when the footer approaches the viewport.
          for (let repeat = 0; repeat < 2; repeat++) {
            await input.fill('wordpress')
            await expectSlugs(guides.map((guide) => guide.slug))
            await input.fill('nieistniejący temat xyz')
            await expectSlugs([])
            await page
              .getByRole('button', { name: 'Zobacz wszystkie poradniki', exact: true })
              .click()
            await expectSlugs(guides.map((guide) => guide.slug))
            assert.ok(await input.evaluate((element) => document.activeElement === element))
          }

          await input.fill('   ')
          await expectSlugs(guides.map((guide) => guide.slug))
          await input.press('Escape')
          assert.equal(await input.inputValue(), '')
          await input.fill('<script>alert(1)</script>')
          await expectSlugs([])
          await page.getByRole('button', { name: 'Wyczyść', exact: true }).click()
          await expectSlugs(guides.map((guide) => guide.slug))
          assert.ok(await input.evaluate((element) => document.activeElement === element))

          await input.fill('maile')
          await expectSlugs(['wordpress-nie-wysyla-maili'])
          await input.press('Enter')
          assert.equal(new URL(page.url()).pathname, '/poradniki/')
          assert.equal(new URL(page.url()).search, '?utm_source=guide_search_qa')
          await expectSlugs(['wordpress-nie-wysyla-maili'])
          assert.ok(await input.evaluate((element) => document.activeElement === element))
          assert.equal(requests.length, requestCount, 'Filtering must make no network requests')
          assert.equal(
            await page.locator('link[rel="canonical"]').getAttribute('href'),
            'https://codefix.it/poradniki/',
          )
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
            false,
          )
          const resultLink = page.locator('.guide-card > a')
          assert.equal(
            await resultLink.getAttribute('href'),
            '/poradniki/wordpress-nie-wysyla-maili/',
          )
          await resultLink.press('Enter')
          await page.waitForURL(new URL('/poradniki/wordpress-nie-wysyla-maili/', target).href)
          await page.locator('.guide-article-header h1').waitFor()
          await page.locator('.guide-page main a.cf-button-primary').click()
          await page.waitForURL(new URL('/naprawa-wordpress/', target).href)
          await page.locator('form.cf-lead-form').waitFor()
          const attribution = await page.evaluate(() =>
            JSON.parse(window.sessionStorage.getItem('codefix_attribution_v1')),
          )
          assert.equal(attribution.landingPath, '/poradniki/')
          assert.equal(attribution.utmSource, 'guide_search_qa')
          assert.deepEqual(blockedRequests, [])
          assert.deepEqual(errors, [])
          await saveResult({
            engine,
            kind: 'guide-search',
            width,
            reducedMotion,
            checks: [
              'unicode',
              'multiword',
              'description',
              'intent',
              'empty',
              'reset-focus',
              'escape',
              'enter',
              'native-navigation',
              'attribution',
              'no-overflow',
              'no-search-requests',
            ],
            status: 'pass',
            liveLeadRequests: 0,
          })
        } catch (error) {
          await writeFile(
            new URL(`guide-search-${engine}-${width}-${reducedMotion}-failure.json`, output),
            JSON.stringify(
              {
                error: error.stack,
                errors,
                blockedRequests,
                failedRequests,
                state: await page.evaluate(() => ({
                  value: document.querySelector('#guide-search')?.value,
                  active: document.activeElement?.outerHTML,
                  status: document.querySelector('.guide-search [role="status"]')?.textContent,
                  cards: [...document.querySelectorAll('.guide-card > a')].map((a) =>
                    a.getAttribute('href'),
                  ),
                  events: window.__guideEvents?.slice(-50),
                })),
              },
              null,
              2,
            ),
          )
          await page.screenshot({
            path: new URL(`guide-search-${engine}-${width}-${reducedMotion}-failure.jpg`, output)
              .pathname,
            fullPage: true,
          })
          throw error
        } finally {
          await context.close()
        }
      }
    }

    const context = await browser.newContext({ javaScriptEnabled: false })
    try {
      const page = await context.newPage()
      await context.route('**/*', (route) =>
        new URL(route.request().url()).origin === target.origin
          ? route.continue()
          : route.abort('blockedbyclient'),
      )
      await page.goto(new URL('/poradniki/', target).href)
      for (const guide of guides) {
        assert.ok(await page.locator(`main a[href="/poradniki/${guide.slug}/"]`).isVisible())
      }
      assert.equal(await page.getByRole('searchbox').count(), 0)
      await page.getByRole('link', { name: 'Błąd 500 WordPress', exact: true }).click()
      await page.waitForURL(new URL('/poradniki/blad-500-wordpress/', target).href)
      assert.equal(await page.locator('main h1').count(), 1)
      await saveResult({ engine, kind: 'guide-search-static', status: 'pass', liveLeadRequests: 0 })
    } finally {
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

assert.equal(results.length, 14)
console.log(
  `Guide search QA passed: ${results.length} scenarios. No live leads or search requests.`,
)
