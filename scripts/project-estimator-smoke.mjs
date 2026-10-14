import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

async function loadTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}

const { initialEstimatorAnswers, readEstimatorRates, estimateProject, mergeProjectBrief } =
  await loadTypeScript('../src/lib/project-estimator.ts')
const catalog = JSON.parse(
  await readFile(new URL('../public/data/service-landings.json', import.meta.url), 'utf8'),
)
const rates = readEstimatorRates(catalog)
assert.deepEqual(rates, { quickFix: 390, care: 300, agency: 120 })

const normalize = (value) => value.replace(/\s/g, '')
let answers = initialEstimatorAnswers('AGENCY_WHITE_LABEL')
assert.equal(normalize(estimateProject(answers, rates).price), '240zł–480zł')
answers.hours = 'ongoing'
assert.equal(normalize(estimateProject(answers, rates).price), '1920zł–4800zł')
assert.equal(
  estimateProject(answers, { ...rates, agency: 150 }).price.replace(/\s/g, ''),
  '2400zł–6000zł',
)

answers = initialEstimatorAnswers('WORDPRESS_CARE')
answers.period = 'quarter'
assert.equal(normalize(estimateProject(answers, rates).price), 'Od900zł/3mies.')
answers.period = 'year'
assert.equal(normalize(estimateProject(answers, rates).price), 'Od3600zł/12mies.')

answers = initialEstimatorAnswers('WORDPRESS_QUICK_FIX')
assert.equal(estimateProject(answers, rates).price, 'Od 390 zł')
answers.issue = 'multiple'
assert.equal(estimateProject(answers, rates).price, 'Wycena indywidualna')
assert.equal(
  estimateProject(initialEstimatorAnswers('AGENCY_WHITE_LABEL'), null).price,
  'Wycena indywidualna',
)
const broken = structuredClone(catalog)
broken['/dla-agencji-wordpress'].price = '120–200 zł/h'
assert.equal(readEstimatorRates(broken).agency, null)

answers = initialEstimatorAnswers('unknown-service')
answers.siteType = 'shop'
answers.features = ['languages', 'crm']
const project = estimateProject(answers, rates)
assert.equal(project.service, 'CODEFIX_BUSINESS_SITE')
assert.equal(project.price, 'Wycena indywidualna')
assert.match(project.brief, /Sklep WooCommerce/)
assert.match(project.brief, /Dodatkowy język, Integracja z CRM/)
assert.equal(
  mergeProjectBrief(' Moje własne uwagi. ', project),
  'Moje własne uwagi.\n\n' + project.brief,
)
assert.equal(mergeProjectBrief('', project), project.brief)
assert.equal(mergeProjectBrief('Moje własne uwagi.', null), 'Moje własne uwagi.')
assert.ok(project.brief.length < 1000)

const { wordpressGuides } = await loadTypeScript('../src/data/wordpress-guides.ts')
const generated = JSON.parse(
  await readFile(new URL('../dist/data/wordpress-guides.json', import.meta.url), 'utf8'),
)
assert.deepEqual(generated, wordpressGuides, 'Guide catalog must preserve all editorial content.')
const { guideSummaries } = await loadTypeScript('../src/data/guide-summaries.ts')
assert.deepEqual(
  guideSummaries,
  wordpressGuides.map(({ slug, title, serviceHref, description, intent }) => ({
    slug,
    title,
    serviceHref,
    description,
    intent,
  })),
)
for (const guide of generated) {
  const html = await readFile(
    new URL(`../dist/poradniki/${guide.slug}/index.html`, import.meta.url),
    'utf8',
  )
  assert.ok(html.includes(`https://codefix.it/poradniki/${guide.slug}/`))
  assert.ok(html.includes(guide.title), `Static content missing for ${guide.slug}`)
}
console.log(
  'PASS: published rates, quote scenarios, brief handoff, manual quote fallbacks and all 9 prerendered guides.',
)
