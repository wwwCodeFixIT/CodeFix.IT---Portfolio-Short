import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const production = new URL('https://codefix.it/')
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]))
assert.ok(urls.length > 0, 'Sitemap must contain public pages')

function routeKey(url) {
  return url.pathname.replace(/\/$/, '') || '/'
}

const pages = new Map()
const titles = new Set()
for (const url of urls) {
  assert.equal(url.origin, production.origin, `Unexpected sitemap origin: ${url}`)
  const path = url.pathname.replace(/^\//, '').replace(/\/$/, '')
  const html = await readFile(new URL(path ? `${path}/index.html` : 'index.html', dist), 'utf8')
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]
  assert.ok(title, `${url}: missing title`)
  assert.ok(!titles.has(title), `${url}: duplicate title`)
  titles.add(title)
  assert.ok(
    /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(html),
    `${url}: missing description`,
  )
  assert.equal(
    html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1],
    url.href,
    `${url}: wrong canonical`,
  )
  assert.ok(
    !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html),
    `${url}: unexpected noindex`,
  )
  assert.ok(
    /data-static-prerender=["']true["']/i.test(html),
    `${url}: missing visible static content`,
  )

  const body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
  assert.equal([...body.matchAll(/<h1\b/gi)].length, 1, `${url}: expected one H1`)
  const ids = [...body.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1])
  assert.equal(new Set(ids).size, ids.length, `${url}: duplicate IDs`)
  const links = [...body.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((match) =>
    match[1].replace(/&amp;/g, '&'),
  )
  for (const schema of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    JSON.parse(schema[1])
  }
  pages.set(routeKey(url), { url, ids: new Set(ids), links })
}

let checkedLinks = 0
let checkedAnchors = 0
for (const page of pages.values()) {
  for (const href of page.links) {
    const target = new URL(href, page.url)
    if (target.origin !== production.origin) continue
    const destination = pages.get(routeKey(target))
    if (!destination && /\.[^/]+$/.test(target.pathname)) continue
    assert.ok(destination, `${page.url}: missing public route ${href}`)
    checkedLinks++
    if (target.hash) {
      assert.ok(
        destination.ids.has(decodeURIComponent(target.hash.slice(1))),
        `${page.url}: missing anchor ${href}`,
      )
      checkedAnchors++
    }
  }
}

const robots = await readFile(new URL('robots.txt', dist), 'utf8')
assert.ok(
  robots.includes(`Sitemap: ${production}sitemap.xml`),
  'robots.txt: missing production sitemap',
)
const notFound = await readFile(new URL('404.html', dist), 'utf8')
assert.ok(
  /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(notFound),
  '404.html: missing noindex',
)
console.log(
  `Static SEO passed: ${pages.size} pages, ${checkedLinks} internal links, ${checkedAnchors} anchors, metadata, JSON-LD and 404 content.`,
)
