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
const guide = guides.find((item) => item.slug === 'wordpress-nie-wysyla-maili')
const output = new URL('../qa-results/contact-submission/', import.meta.url)
const results = []
await mkdir(output, { recursive: true })

async function record(result) {
  results.push(result)
  console.log(JSON.stringify(result))
  await writeFile(
    new URL('guide-navigation.json', output),
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
          requests = []
        page.on('pageerror', (error) => errors.push(error.message))
        await context.route('**/*', (route) => {
          const request = route.request()
          if (
            new URL(request.url()).origin !== target.origin ||
            !['GET', 'HEAD'].includes(request.method())
          ) {
            blockedRequests.push(request.url())
            return route.abort('blockedbyclient')
          }
          requests.push(request.url())
          return route.continue()
        })
        try {
          const entry = new URL(
            `/poradniki/${guide.slug}/?utm_source=guide_navigation_qa#sekcja-3`,
            target,
          )
          await page.goto(entry.href, { waitUntil: 'networkidle' })
          await page.waitForFunction(() => !document.querySelector('#root[data-static-prerender]'))
          const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
          if (await reject.isVisible()) await reject.click()
          // Reload the real deep link after choosing consent so a dialog does not
          // replace the browser's target focus during the fragment assertion.
          await page.reload({ waitUntil: 'networkidle' })
          await page.waitForFunction(() => !document.querySelector('#root[data-static-prerender]'))
          const toc = page.locator('details.guide-toc')
          const summary = toc.locator('summary')
          const navigation = toc.getByRole('navigation', {
            name: 'Spis treści poradnika',
            exact: true,
          })
          const expectActive = async (id) =>
            page.waitForFunction(
              (value) =>
                document
                  .querySelector(`.guide-toc a[href="#${value}"]`)
                  ?.getAttribute('aria-current') === 'location',
              id,
            )
          const expectTarget = async (id) =>
            page.waitForFunction((value) => {
              const heading = document.getElementById(value)
              const box = heading?.getBoundingClientRect()
              const header = document.querySelector('.cf-header')?.getBoundingClientRect()
              const contents = document
                .querySelector('.guide-toc > summary')
                ?.getBoundingClientRect()
              return (
                heading === document.activeElement &&
                box &&
                header &&
                contents &&
                contents.top >= header.bottom &&
                contents.bottom <= window.innerHeight &&
                box.top >= Math.max(header.bottom, contents.bottom) + 4 &&
                box.bottom <= window.innerHeight
              )
            }, id)
          await expectTarget('sekcja-3')
          await expectActive('sekcja-3')
          assert.equal(await toc.getAttribute('open'), null)
          assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
          const requestCount = requests.length

          await summary.press('Enter')
          assert.notEqual(await toc.getAttribute('open'), null)
          assert.equal(await navigation.getByRole('link').count(), guide.sections.length + 1)
          for (const link of await navigation.getByRole('link').all()) {
            const box = await link.boundingBox()
            assert.ok(box && box.height >= 44)
          }
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
            false,
          )
          await navigation
            .getByRole('link', { name: guide.sections[0].heading, exact: true })
            .press('Escape')
          assert.equal(await toc.getAttribute('open'), null)
          assert.ok(await summary.evaluate((element) => element === document.activeElement))
          await summary.press('Space')
          await navigation
            .getByRole('link', { name: guide.sections[0].heading, exact: true })
            .press('Enter')
          await page.waitForURL((url) => url.hash === '#sekcja-1')
          await expectTarget('sekcja-1')
          await expectActive('sekcja-1')
          assert.equal(await toc.getAttribute('open'), null)
          assert.equal(new URL(page.url()).search, '?utm_source=guide_navigation_qa')

          // Jump into a long section without changing history or moving focus.
          await page.evaluate(() => {
            const box = document.getElementById('sekcja-4').getBoundingClientRect()
            window.scrollTo({ top: window.scrollY + box.top - 120, behavior: 'instant' })
          })
          await expectActive('sekcja-4')
          assert.equal(new URL(page.url()).hash, '#sekcja-1')
          await page.goBack()
          await page.waitForURL((url) => url.hash === '#sekcja-3')
          await expectTarget('sekcja-3')
          await expectActive('sekcja-3')

          await summary.press('Enter')
          await navigation
            .getByRole('link', { name: 'Najczęstsze pytania', exact: true })
            .press('Enter')
          await page.waitForURL((url) => url.hash === '#pytania')
          await expectTarget('pytania')
          await expectActive('pytania')
          await page.locator('.guide-faq summary').first().press('Enter')
          assert.notEqual(
            await page.locator('.guide-faq details').first().getAttribute('open'),
            null,
          )
          assert.equal(
            await page.locator('link[rel="canonical"]').getAttribute('href'),
            `https://codefix.it/poradniki/${guide.slug}/`,
          )
          assert.equal(requests.length, requestCount, 'Contents interactions must not request data')
          const attribution = await page.evaluate(() =>
            JSON.parse(window.sessionStorage.getItem('codefix_attribution_v1')),
          )
          assert.equal(attribution.landingPath, `/poradniki/${guide.slug}/`)
          assert.equal(attribution.utmSource, 'guide_navigation_qa')
          assert.deepEqual(errors, [])
          assert.deepEqual(blockedRequests, [])
          await record({
            engine,
            kind: 'guide-navigation',
            width,
            reducedMotion,
            checks: [
              'deep-link-reload',
              'native-fragments',
              'focus-and-clearance',
              'current-section',
              'fast-scroll',
              'history-back',
              'escape',
              'keyboard',
              'faq',
              'attribution',
              'no-overflow',
              'no-navigation-requests',
            ],
            status: 'pass',
            liveLeadRequests: 0,
          })
        } catch (error) {
          await writeFile(
            new URL(`guide-navigation-${engine}-${width}-${reducedMotion}-failure.json`, output),
            JSON.stringify(
              {
                error: error.stack,
                errors,
                blockedRequests,
                url: page.url(),
                state: await page.evaluate(() => ({
                  active: document.activeElement?.outerHTML,
                  current: document
                    .querySelector('.guide-toc [aria-current]')
                    ?.getAttribute('href'),
                  disclosure: document.querySelector('.guide-toc')?.outerHTML,
                  headings: [...document.querySelectorAll('.guide-body h2, .guide-faq h2')].map(
                    (heading) => ({ id: heading.id, top: heading.getBoundingClientRect().top }),
                  ),
                  scrollY: window.scrollY,
                  scrollBehavior: window.getComputedStyle(document.documentElement).scrollBehavior,
                  controls: ['.cf-header', '.guide-toc > summary'].map((selector) => {
                    const box = document.querySelector(selector)?.getBoundingClientRect()
                    return { selector, top: box?.top, bottom: box?.bottom }
                  }),
                })),
              },
              null,
              2,
            ),
          )
          await page.screenshot({
            path: new URL(
              `guide-navigation-${engine}-${width}-${reducedMotion}-failure.jpg`,
              output,
            ).pathname,
          })
          throw error
        } finally {
          await context.close()
        }
      }
    }

    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 900 },
    })
    try {
      const page = await context.newPage()
      const blocked = []
      await context.route('**/*', (route) => {
        const request = route.request()
        if (
          new URL(request.url()).origin === target.origin &&
          ['GET', 'HEAD'].includes(request.method())
        )
          return route.continue()
        blocked.push(request.url())
        return route.abort('blockedbyclient')
      })
      for (const item of guides) {
        await page.goto(new URL(`/poradniki/${item.slug}/#sekcja-2`, target).href, {
          waitUntil: 'networkidle',
        })
        assert.ok(
          await page.getByRole('heading', { name: item.title, level: 1, exact: true }).isVisible(),
        )
        for (const [index, section] of item.sections.entries()) {
          assert.equal(await page.locator(`[id="sekcja-${index + 1}"]`).count(), 1)
          for (const paragraph of section.paragraphs)
            assert.ok(await page.getByText(paragraph, { exact: true }).isVisible())
          for (const text of section.checklist ?? [])
            assert.ok(await page.getByText(text, { exact: true }).isVisible())
        }
        assert.equal(await page.locator('[id="pytania"]').count(), 1)
        assert.equal(await page.locator('h1').count(), 1)
        const box = await page.locator('#sekcja-2').boundingBox()
        assert.ok(box && box.y >= 0 && box.y < 900)
        const toc = page.locator('details.guide-toc')
        await toc.locator('summary').press('Enter')
        const nav = toc.getByRole('navigation', { name: 'Spis treści poradnika', exact: true })
        assert.equal(await nav.getByRole('link').count(), item.sections.length + 1)
        await nav.getByRole('link', { name: 'Najczęstsze pytania', exact: true }).press('Enter')
        await page.waitForURL((url) => url.hash === '#pytania')
        await page.getByText(item.faq[0].question, { exact: true }).press('Enter')
        assert.ok(await page.getByText(item.faq[0].answer, { exact: true }).isVisible())
        assert.equal(
          await page.locator('link[rel="canonical"]').getAttribute('href'),
          `https://codefix.it/poradniki/${item.slug}/`,
        )
      }
      assert.deepEqual(blocked, [])
      await record({
        engine,
        kind: 'guide-navigation-static',
        articles: guides.length,
        status: 'pass',
        liveLeadRequests: 0,
      })
    } finally {
      await context.close()
    }
  } finally {
    await browser.close()
  }
}
assert.equal(results.length, 14)
console.log(
  `Guide navigation QA passed: ${results.length} scenarios including all ${guides.length} static articles. No live lead requests.`,
)
