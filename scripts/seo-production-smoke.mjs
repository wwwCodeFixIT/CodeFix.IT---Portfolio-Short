import { readFile } from 'node:fs/promises';

const siteUrl = (process.env.SITE_URL || 'https://codefix.it').replace(/\/$/, '');
const userAgent = 'CodeFixIT-SEO-Smoke/1.0 (+https://codefix.it/)';

function fail(message) {
  throw new Error(message);
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${siteUrl}${path}`;
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': userAgent },
    ...options,
  });
  return { url, response, body: await response.text() };
}

function canonicalFromHtml(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] ?? null;
}

function robotsFromHtml(html) {
  return html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1] ?? '';
}

function normaliseUrl(url) {
  const parsed = new URL(url);
  const pathname = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, '');
  return `${parsed.origin}${pathname}`;
}

async function checkRobots() {
  const { response, body } = await request('/robots.txt');
  if (response.status !== 200) fail(`robots.txt returned ${response.status}`);
  if (!/User-agent:\s*\*/i.test(body)) fail('robots.txt is missing User-agent: *');
  if (!/Allow:\s*\//i.test(body)) fail('robots.txt is missing Allow: /');
  if (!body.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
    fail('robots.txt does not advertise the production sitemap');
  }
  console.log('✓ robots.txt');
}

async function sitemapUrls() {
  const localSitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  const expected = [...localSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  if (expected.length === 0) fail('Repository sitemap contains no URLs');

  let lastSeen = [];
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const { response, body } = await request('/sitemap.xml');
    if (response.status !== 200) fail(`sitemap.xml returned ${response.status}`);

    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
    lastSeen = urls;
    const missing = expected.filter((url) => !urls.includes(url));

    if (missing.length === 0) {
      console.log(`✓ sitemap.xml matches repository (${urls.length} URLs)`);
      return urls;
    }

    if (attempt < 12) {
      console.log(`Production sitemap is still behind deploy (attempt ${attempt}/12); missing: ${missing.join(', ')}`);
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  const missing = expected.filter((url) => !lastSeen.includes(url));
  fail(`Production sitemap did not catch up with repository. Missing: ${missing.join(', ')}`);
}

async function checkIndexableUrl(url) {
  const { response, body } = await request(url);
  if (response.status !== 200) fail(`${url} returned ${response.status}, expected 200`);

  const robots = robotsFromHtml(body).toLowerCase();
  if (robots.includes('noindex')) fail(`${url} contains noindex`);

  const canonical = canonicalFromHtml(body);
  if (!canonical) fail(`${url} has no canonical link`);
  if (normaliseUrl(canonical) !== normaliseUrl(url)) {
    fail(`${url} canonical points to ${canonical}`);
  }

  if (!/<title>[^<]+<\/title>/i.test(body)) fail(`${url} has no HTML title`);
  if (!/<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(body)) {
    fail(`${url} has no meta description`);
  }
  if (!/data-static-prerender=["']true["']/i.test(body)) {
    fail(`${url} has no static HTML body marker`);
  }
  if (!/<h1[^>]*>[^<]+<\/h1>/i.test(body)) {
    fail(`${url} has no H1 in the raw HTML response`);
  }
  const rawText = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (rawText.length < 180) fail(`${url} raw HTML content is too thin (${rawText.length} chars)`);

  console.log(`✓ 200 indexable + static HTML: ${url}`);
}

async function checkNotFound() {
  const path = `/__seo-smoke-not-found-${Date.now()}`;
  const { response, body } = await request(path);
  if (response.status !== 404) {
    fail(`${path} returned ${response.status}, expected a real 404`);
  }

  const robots = robotsFromHtml(body).toLowerCase();
  if (!robots.includes('noindex')) fail('404 page is missing noindex');
  console.log('✓ real 404 + noindex');
}

async function main() {
  console.log(`SEO production smoke: ${siteUrl}`);
  await checkRobots();
  const urls = await sitemapUrls();

  for (const url of urls) {
    await checkIndexableUrl(url);
  }

  await checkNotFound();
  console.log('SEO production smoke passed.');
}

main().catch((error) => {
  console.error('SEO production smoke failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
