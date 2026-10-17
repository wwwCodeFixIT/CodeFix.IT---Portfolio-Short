/* global document, HTMLInputElement */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../.qa-tools/package.json', import.meta.url))
const { chromium, webkit } = require('playwright')
const production = process.env.CODEFIX_HOME_LAB_PRODUCTION === '1'
const origin = production ? 'https://codefix.it' : 'http://127.0.0.1:4173'
const output = `qa-results/home-laboratory${production ? '-production' : ''}`
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const runtime = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1]
assert.ok(runtime?.startsWith('/assets/index-'))
await mkdir(output, { recursive: true })
const results = []
const note = 'QA: zachowaj mój opis problemu i nie wysyłaj formularza.'
const report = {
  url: 'https://example.org/',
  finalUrl: 'https://example.org/',
  testedAt: '2026-10-17T09:00:00.000Z',
  source: 'Google PageSpeed Insights / Lighthouse',
  scores: { performance: 82, seo: 90, accessibility: 95 },
  checks: [],
  note: 'Testowy pomiar.',
  recommendations: ['Sprawdź wynik.'],
}

async function metadata(page) {
  return page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    description: document.querySelector('meta[name=description]')?.content,
  }))
}

async function assertPage(page, errors, forbidden) {
  assert.equal(await page.locator('main').count(), 1)
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('form form').count(), 0)
  assert.deepEqual(
    await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((node) => node.id)
      return ids.filter((id, index) => ids.indexOf(id) !== index)
    }),
    [],
    'Mounted tools and the diagnostic dialog must have unique IDs',
  )
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
    false,
  )
  assert.deepEqual(errors, [])
  assert.deepEqual(forbidden, [])
}

for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true })
  try {
    const cases = (production ? [320, 390, 1280] : [320, 390, 981, 1280]).map((width) => ({
      width,
      mode: production ? 'live' : 'local',
    }))
    if (!production) cases.push({ width: 390, mode: 'report' }, { width: 320, mode: 'chunk-error' })
    for (const { width, mode } of cases) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: 'pl-PL',
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(20000)
      const errors = [],
        forbidden = []
      let workspaceRequests = 0,
        statusReads = 0,
        mockedReports = 0
      page.on('pageerror', (error) => errors.push(error.message))
      await context.route('**/*', (route) => {
        const request = route.request(),
          url = new URL(request.url())
        if (url.origin === origin && /\/assets\/ToolsLab-[^/]+\.js$/.test(url.pathname)) {
          workspaceRequests++
          if (mode === 'chunk-error') return route.abort()
        }
        if (url.origin === origin && url.pathname === '/api/tool-status') {
          statusReads++
          if (!production)
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ ai: mode === 'report', doctor: mode === 'report' }),
            })
        }
        if (
          !production &&
          mode === 'report' &&
          url.origin === origin &&
          url.pathname === '/api/site-doctor' &&
          request.method() === 'POST'
        ) {
          mockedReports++
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(report),
          })
        }
        if (url.origin === origin && ['GET', 'HEAD'].includes(request.method()))
          return route.continue()
        if (!(
          production &&
          request.method() === 'GET' &&
          url.hostname === 'static.cloudflareinsights.com' &&
          url.pathname.startsWith('/beacon.min.js/')
        ))
          forbidden.push({ url: request.url(), method: request.method() })
        return route.abort('blockedbyclient')
      })
      const result = { engine, width, mode, status: 'running' }
      results.push(result)
      try {
        await page.goto(origin + '/', { waitUntil: 'networkidle' })
        assert.equal(
          await page.locator('script[type=module][src^="/assets/index-"]').getAttribute('src'),
          runtime,
        )
        const reject = page.getByRole('button', { name: 'Odrzuć wszystkie', exact: true })
        if (await reject.isVisible()) await reject.click()
        const before = await metadata(page)
        const lead = page.locator('.cf-lead-form')
        await lead.getByRole('button', { name: 'Naprawa WordPress', exact: true }).click()
        await lead.getByRole('button', { name: 'Dalej', exact: true }).click()
        await lead.locator('textarea[name=message]').fill(note)
        await lead.locator('input[name=pageUrl]').fill('https://example.org/')
        await lead.evaluate((node) => {
          node.dataset.qaPreserved = 'yes'
        })
        const lab = page.locator('#laboratorium')
        const disclosure = lab.locator('details.cf-laboratory')
        const toggle = disclosure.locator(':scope > summary')
        assert.equal(await disclosure.getAttribute('open'), null)
        assert.equal(workspaceRequests, 0, 'The workspace must not load before visitor intent')
        assert.equal(
          statusReads,
          0,
          'The homepage must not probe integrations before opening the lab',
        )
        if (width <= 980) {
          await page.getByRole('button', { name: 'Menu', exact: true }).click()
          await page
            .getByRole('navigation', { name: 'Nawigacja mobilna', exact: true })
            .getByRole('link', { name: 'Laboratorium', exact: true })
            .click()
          await page.waitForFunction(() => document.activeElement?.id === 'cf-laboratory-title')
        } else {
          await page
            .getByRole('navigation', { name: 'Główna nawigacja', exact: true })
            .getByRole('link', { name: 'Laboratorium', exact: true })
            .click()
          await page
            .locator('.cf-header')
            .screenshot({ path: `${output}/${engine}-${width}-header.png` })
        }
        if (mode === 'local' || mode === 'live')
          await lab.screenshot({ path: `${output}/${engine}-${width}-closed.png` })
        const available =
          mode === 'chunk-error'
            ? null
            : page.waitForResponse((response) => response.url() === origin + '/api/tool-status')
        await toggle.press('Enter')
        if (mode === 'chunk-error') {
          await lab.getByRole('alert').waitFor()
          assert.equal(
            await lab
              .getByRole('link', { name: 'Otwórz narzędzia osobno w nowej karcie', exact: true })
              .getAttribute('href'),
            '/narzedzia/',
          )
          assert.equal(statusReads, 0)
          await toggle.press('Space')
          assert.equal(await disclosure.getAttribute('open'), null)
        } else {
          await lab.locator('#brief-title').waitFor()
          const response = await available
          assert.equal(response.status(), 200)
          const availability = await response.json()
          assert.equal(typeof availability.ai, 'boolean')
          assert.equal(typeof availability.doctor, 'boolean')
          result.availability = availability
          const brief = lab.locator('[aria-labelledby=brief-title]')
          const goal = brief.getByLabel(/Cel lub problem/)
          await goal.fill('Potrzebuję czytelnej strony usługowej z kontaktem.')
          await brief.getByLabel('Do kogo kierujesz stronę lub aplikację?').fill('Małe firmy')
          await brief.getByLabel('Do kogo kierujesz stronę lub aplikację?').press('Enter')
          assert.match(await brief.locator('textarea[readOnly]').inputValue(), /WERSJA LOKALNA/)
          await toggle.press('Space')
          assert.equal(await disclosure.getAttribute('open'), null)
          await toggle.press('Enter')
          assert.equal(
            await goal.inputValue(),
            'Potrzebuję czytelnej strony usługowej z kontaktem.',
          )
          if (mode === 'report') {
            await lab.getByRole('button', { name: 'AI Site Doctor 😈', exact: true }).click()
            const doctor = lab.locator('.cf-doctor')
            await doctor.locator('input[type=url]').fill('https://example.org/')
            await doctor.getByRole('button', { name: /Uruchom diagnozę/ }).click()
            await doctor.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor()
            await page.locator('.cf-doctor-attachment > summary').click()
            await page.getByRole('button', { name: 'Uruchom Site Doctor →', exact: true }).click()
            const dialog = page.getByRole('dialog', { name: 'Diagnoza strony', exact: true })
            await dialog.locator('input[type=url]').fill('https://example.org/')
            await dialog.getByRole('button', { name: /Uruchom diagnozę/ }).click()
            await dialog.getByRole('heading', { name: 'Raport diagnostyczny' }).waitFor()
            await assertPage(page, errors, forbidden)
            await page.keyboard.press('Escape')
            await dialog.waitFor({ state: 'hidden' })
            await doctor
              .getByRole('button', { name: 'Dołącz diagnozę do zapytania →', exact: true })
              .click()
            await lead.getByRole('button', { name: 'Naprawa WordPress', exact: true }).waitFor()
            await lead.getByRole('button', { name: 'Dalej', exact: true }).click()
            assert.equal(await lead.locator('textarea[name=message]').inputValue(), note)
            assert.match(
              await lead.locator('.cf-doctor-attachment textarea').inputValue(),
              /Lighthouse/,
            )
            assert.equal(mockedReports, 2)
          } else {
            await lab.getByRole('button', { name: 'Mapa automatyzacji', exact: true }).click()
            const map = lab.locator('.cf-automation-map')
            await map.getByRole('combobox', { name: /^Proces\b/ }).selectOption('documents')
            await map.getByRole('button', { name: /Braki lub błąd/ }).click()
            await map.getByRole('heading', { name: 'Gdy proces wymaga pomocy' }).waitFor()
            await lab.getByRole('button', { name: 'Podgląd SEO', exact: true }).click()
            await lab.getByLabel(/Meta title/).fill('Czytelna oferta | CodeFix.IT')
            assert.equal(
              await lab.locator('.cf-seo-preview strong').innerText(),
              'Czytelna oferta | CodeFix.IT',
            )
            await lab.getByRole('button', { name: 'Kontrast WCAG', exact: true }).click()
            for (const [label, value] of [
              ['Wybierz kolor tekstu', '#ffffff'],
              ['Wybierz kolor tła', '#000000'],
            ]) {
              await lab.getByLabel(label).evaluate((input, color) => {
                Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
                  input,
                  color,
                )
                input.dispatchEvent(new Event('input', { bubbles: true }))
                input.dispatchEvent(new Event('change', { bubbles: true }))
              }, value)
            }
            await lab.getByText('Kontrast 21.00:1', { exact: true }).waitFor()
            await lab.getByRole('button', { name: 'Asystent briefu', exact: true }).click()
            if (width <= 390) {
              await brief.getByLabel('Rodzaj projektu').selectOption('aplikacja')
              await brief.getByRole('button', { name: 'Szkic bez AI', exact: true }).click()
              await brief
                .getByRole('button', { name: 'Przejdź do zapytania →', exact: true })
                .click()
            } else {
              await lab.getByRole('button', { name: 'Mapa automatyzacji', exact: true }).click()
              assert.equal(
                await map.getByRole('combobox', { name: /^Proces\b/ }).inputValue(),
                'documents',
              )
              await map.locator('.cf-automation-note > summary').click()
              await map.getByRole('button', { name: 'Omów automatyzację →', exact: true }).click()
            }
            assert.equal(
              await lead
                .getByRole('button', { name: 'Aplikacja / integracja', exact: true })
                .getAttribute('aria-pressed'),
              'true',
            )
            await page.waitForFunction(() => document.activeElement?.closest('.cf-lead-form'))
            await lead.getByRole('button', { name: 'Dalej', exact: true }).click()
            assert.equal(await lead.locator('textarea[name=message]').inputValue(), note)
            assert.equal(mockedReports, 0)
            await lab.getByRole('button', { name: 'Asystent briefu', exact: true }).click()
            await lab.screenshot({ path: `${output}/${engine}-${width}-workspace.png` })
          }
          assert.equal(statusReads, 1, 'Workspace and dialog share the configuration read')
        }
        assert.equal(new URL(page.url()).pathname, '/')
        assert.equal(
          await lead.getAttribute('data-qa-preserved'),
          'yes',
          'Contact must stay mounted',
        )
        assert.equal(await lead.locator('textarea[name=message]').inputValue(), note)
        assert.deepEqual(await metadata(page), before)
        await assertPage(page, errors, forbidden)
        result.status = 'passed'
        result.workspaceRequests = workspaceRequests
        result.providerCalls = 0
        result.leadSubmissions = 0
        console.log(`PASS home lab ${engine} ${width}px ${mode}`)
      } catch (error) {
        result.status = 'failed'
        result.error = error.message
        await page
          .screenshot({ path: `${output}/${engine}-${width}-${mode}-failure.png` })
          .catch(() => {})
        throw error
      } finally {
        await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
}
console.log(
  `Home laboratory QA passed: ${results.length} contexts. No live provider or lead calls.`,
)
