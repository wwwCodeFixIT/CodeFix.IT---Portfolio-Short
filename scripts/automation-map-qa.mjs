import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const origin = 'http://127.0.0.1:4173'
const output = 'qa-results/automation-map'
await mkdir(output, { recursive: true })
const results = []

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true })
  try {
    for (const width of [320, 390, 1280]) {
      for (const motion of ['reduce', 'no-preference']) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          locale: 'pl-PL',
          reducedMotion: motion,
        })
        await context.addInitScript(() => {
          Object.defineProperty(globalThis.navigator, 'clipboard', {
            configurable: true,
            value: {
              async writeText(text) {
                if (globalThis.qaRejectClipboard) throw Error('Clipboard denied for QA')
                globalThis.qaCopiedText = text
              },
            },
          })
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)
        const errors = []
        const forbidden = []
        const assetRequests = []
        page.on('pageerror', (error) => errors.push(error.message))
        page.on('request', (request) => {
          if (request.url().includes('/assets/')) assetRequests.push(request.url())
        })
        await context.route('**/*', (route) => {
          const request = route.request()
          if (
            new URL(request.url()).origin === origin &&
            ['GET', 'HEAD'].includes(request.method())
          )
            return route.continue()
          forbidden.push({ url: request.url(), method: request.method() })
          return route.abort()
        })

        await page.goto(origin + '/narzedzia/', { waitUntil: 'networkidle' })
        await page.locator('#brief-title').waitFor()
        const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
        if (await reject.isVisible()) await reject.click()
        assert.ok(
          !assetRequests.some((url) => url.includes('/AutomationMap-')),
          'Map must load only on demand',
        )
        const tab = page.getByRole('button', { name: 'Mapa automatyzacji', exact: true })
        await tab.focus()
        await tab.press('Enter')
        const map = page.locator('.cf-automation-map')
        await map.waitFor()
        if (width === 320 && motion === 'reduce') {
          await map.screenshot({ path: `${output}/${engine}-${width}-initial.png` })
        }
        assert.equal(await tab.getAttribute('aria-pressed'), 'true')
        assert.equal(
          await tab.evaluate((node) => globalThis.getComputedStyle(node).outlineStyle !== 'none'),
          true,
        )
        assert.equal(await map.locator('.cf-automation-flow > li').count(), 5)
        assert.equal(await map.getByRole('checkbox', { name: /Roboczy szkic/ }).isChecked(), false)
        assert.equal(await map.getByRole('checkbox', { name: /Moja akceptacja/ }).isChecked(), true)

        const process = map.getByRole('combobox', { name: /^Proces\b/ })
        const source = map.getByRole('combobox', { name: /^Źródło danych\b/ })
        const destination = map.getByRole('combobox', { name: /^Miejsce wyniku\b/ })
        for (const [id, label, expectedSource] of [
          ['inquiries', 'Obsługa zapytań', 'form'],
          ['orders', 'Obsługa zamówień', 'store'],
          ['documents', 'Porządkowanie dokumentów', 'files'],
          ['support', 'Obsługa zgłoszeń', 'email'],
        ]) {
          await process.selectOption(id)
          assert.equal(await source.inputValue(), expectedSource)
          await map.getByRole('button', { name: 'Skopiuj plan', exact: true }).click()
          assert.ok(
            (await page.evaluate(() => globalThis.qaCopiedText)).includes('Proces: ' + label),
          )
          await map.getByRole('button', { name: /Braki lub błąd/ }).click()
          assert.equal(
            await map.locator('.cf-automation-detail h3').textContent(),
            'Gdy proces wymaga pomocy',
          )
          assert.ok((await map.locator('.cf-automation-detail p').textContent()).length > 30)
        }

        await source.selectOption('form')
        await destination.selectOption('sheet')
        assert.equal(
          await map.locator('.cf-automation-flow strong').first().textContent(),
          'Formularz WWW',
        )
        assert.equal(
          await map.locator('.cf-automation-flow strong').last().textContent(),
          'Arkusz kalkulacyjny',
        )
        await map.getByRole('checkbox', { name: /Roboczy szkic/ }).check()
        await map.getByRole('button', { name: /Przygotuj szkic z AI/ }).click()
        assert.ok((await map.locator('.cf-automation-detail p').textContent()).includes('robocze'))
        await map.getByRole('button', { name: /Sprawdź i zaakceptuj/ }).press('Space')
        assert.equal(
          await map.locator('.cf-automation-detail h3').textContent(),
          'Sprawdź i zaakceptuj',
        )
        await map.getByRole('checkbox', { name: /Moja akceptacja/ }).uncheck()
        assert.equal(await map.locator('.cf-automation-flow > li').count(), 4)
        assert.equal(await map.locator('.cf-automation-flow button[aria-pressed=true]').count(), 1)
        assert.equal(await map.locator('.cf-automation-detail h3').textContent(), 'Formularz WWW')

        await map.locator('.cf-automation-note summary').click()
        const note =
          'QA_WLASNY_PROCES: <img src=x onerror="globalThis.qaInjected=1"> — sprawdzam zgłoszenia raz dziennie.'
        await map.getByRole('textbox', { name: /^Co chcesz usprawnić/ }).fill(note)
        await page.getByRole('button', { name: 'Podgląd SEO', exact: true }).click()
        assert.equal(await map.isVisible(), false)
        await tab.click()
        assert.equal(await process.inputValue(), 'support', 'Changing tools must preserve the plan')
        assert.equal(await source.inputValue(), 'form')
        assert.equal(await destination.inputValue(), 'sheet')
        assert.equal(
          await map.getByRole('textbox', { name: /^Co chcesz usprawnić/ }).inputValue(),
          note,
        )
        assert.equal(
          await map.getByRole('checkbox', { name: /Moja akceptacja/ }).isChecked(),
          false,
        )
        assert.equal(await map.getByRole('checkbox', { name: /Roboczy szkic/ }).isChecked(), true)
        assert.equal(await map.locator('img[src=x]').count(), 0)
        assert.equal(await page.evaluate(() => globalThis.qaInjected), undefined)

        await map.getByRole('button', { name: 'Skopiuj plan', exact: true }).click()
        const copied = await page.evaluate(() => globalThis.qaCopiedText)
        assert.ok(copied.includes(note))
        assert.ok(copied.includes('AI: przygotowanie roboczego szkicu'))
        assert.ok(copied.includes('bez osobnego etapu akceptacji'))
        assert.ok(copied.includes('Miejsce wyniku: Arkusz kalkulacyjny'))
        assert.equal(await map.locator('#automation-scope').inputValue(), copied)
        assert.ok(
          !(
            await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))
          ).includes('QA_WLASNY_PROCES'),
        )

        await page.evaluate(() => {
          globalThis.qaRejectClipboard = true
        })
        await map.getByRole('button', { name: 'Skopiuj plan', exact: true }).click()
        await map.getByText('Zaznaczony plan możesz skopiować ręcznie.', { exact: true }).waitFor()
        assert.equal(await map.locator('.cf-automation-scope').evaluate((node) => node.open), true)
        assert.equal(
          await map
            .locator('#automation-scope')
            .evaluate(
              (node) =>
                node === node.ownerDocument.activeElement &&
                node.selectionStart === 0 &&
                node.selectionEnd === node.value.length,
            ),
          true,
        )

        await map.getByRole('button', { name: 'Zacznij od nowa', exact: true }).click()
        assert.equal(await process.inputValue(), 'inquiries')
        assert.equal(await source.inputValue(), 'form')
        assert.equal(await destination.inputValue(), 'crm')
        assert.equal(
          await map.getByRole('textbox', { name: /^Co chcesz usprawnić/ }).inputValue(),
          '',
        )
        assert.equal(await map.locator('.cf-automation-flow > li').count(), 5)
        for (const button of await map.getByRole('button').all()) {
          const box = await button.boundingBox()
          assert.ok(box.width >= 44 && box.height >= 44, 'Controls need a 44px target')
        }
        assert.equal(
          await page.evaluate(
            () =>
              globalThis.document.documentElement.scrollWidth >
              globalThis.document.documentElement.clientWidth,
          ),
          false,
        )
        assert.equal(
          await map.getByRole('link', { name: /Omów automatyzację/ }).getAttribute('href'),
          '/?service=development#contact',
        )
        if (motion === 'reduce' && width !== 320) {
          await map.locator('.cf-automation-note').evaluate((node) => {
            node.open = false
          })
          await map.locator('.cf-automation-scope').evaluate((node) => {
            node.open = false
          })
          await map.screenshot({ path: `${output}/${engine}-${width}-map.png` })
        }

        const assetCount = assetRequests.length
        await page.goto(origin + '/narzedzia/?tool=automatyzacja', { waitUntil: 'networkidle' })
        await page.locator('.cf-automation-map').waitFor()
        assert.equal(
          await page
            .getByRole('button', { name: 'Mapa automatyzacji', exact: true })
            .getAttribute('aria-pressed'),
          'true',
        )
        assert.ok(
          !assetRequests.slice(assetCount).some((url) => url.includes('/SiteDoctor-')),
          'Direct map entry must not load the scanner',
        )
        assert.equal(await page.title(), 'Narzędzia AI, SEO i automatyzacji | CodeFix.IT')
        assert.deepEqual(errors, [])
        assert.deepEqual(forbidden, [], 'Planner must not call external providers or write APIs')
        results.push({
          engine,
          width,
          motion,
          status: 'pass',
          processes: 4,
          statePreserved: true,
          manualCopy: true,
          outboundRequests: forbidden.length,
        })
        await context.close()
      }
    }

    const staticContext = await browser.newContext({ javaScriptEnabled: false })
    const staticPage = await staticContext.newPage()
    await staticPage.goto(origin + '/narzedzia/')
    assert.ok((await staticPage.locator('body').textContent()).includes('Mapa automatyzacji'))
    assert.ok((await staticPage.locator('body').textContent()).includes('włączonego JavaScript'))
    assert.equal(await staticPage.locator('h1').count(), 1)
    assert.equal(
      await staticPage.locator('link[rel=canonical]').getAttribute('href'),
      'https://codefix.it/narzedzia/',
    )
    await staticContext.close()
  } finally {
    await browser.close()
  }
}
await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + '\n')
console.log(
  `Automation map browser QA PASS: ${results.length} engine/viewport/motion configurations, 4 processes, local plan, preserved state, clipboard fallback, lazy loading and 0 outbound requests.`,
)
