import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1].trim()));

const serviceHeadings = {
  '/naprawa-wordpress': 'Naprawa WordPress — jeden problem, konkretny zakres od 390 zł',
  '/opieka-wordpress': 'Opieka WordPress dla firm zdalnie w całej Polsce',
  '/strony-wordpress': 'Strony internetowe dla firm — WordPress + ACF PRO',
};

const guideLinks = [
  ['/poradniki/wordpress-nie-wysyla-maili', 'WordPress nie wysyła maili'],
  ['/poradniki/blad-500-wordpress', 'Błąd 500 WordPress'],
  ['/poradniki/wordpress-zepsul-sie-po-aktualizacji', 'WordPress zepsuł się po aktualizacji'],
  ['/poradniki/wolny-wordpress-co-sprawdzic', 'Wolny WordPress'],
  ['/poradniki/blad-krytyczny-wordpress', 'Błąd krytyczny WordPress'],
  ['/poradniki/woocommerce-checkout-nie-dziala', 'WooCommerce checkout nie działa'],
];

const serviceLinks = [
  ['/naprawa-wordpress', 'Naprawa WordPress'],
  ['/strony-wordpress', 'Strony internetowe dla firm — WordPress + ACF PRO'],
  ['/opieka-wordpress', 'Opieka WordPress'],
];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function metaContent(html, name) {
  const pattern = new RegExp('<meta\\s+name=["\\\']' + name + '["\\\']\\s+content=["\\\']([^"\\\']+)["\\\']', 'i');
  return html.match(pattern)?.[1] ?? '';
}

function titleContent(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? 'CodeFix.IT';
}

function links(items) {
  return items.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('');
}

function pageHeading(path, title) {
  if (path === '/') return 'CodeFix.IT — WordPress dla firm: naprawa, opieka i strony';
  if (serviceHeadings[path]) return serviceHeadings[path];
  if (path === '/poradniki') return 'Poradniki WordPress — diagnostyka i utrzymanie';
  return title.replace(/\s*[|–—-]\s*CodeFix\.IT.*$/i, '').trim() || 'CodeFix.IT';
}

function relatedBlock(path) {
  if (path === '/') {
    return `
      <section>
        <h2>Usługi WordPress CodeFix.IT</h2>
        <ul>${links(serviceLinks)}</ul>
      </section>
      <section>
        <h2>Poradniki techniczne WordPress</h2>
        <ul>${links(guideLinks)}</ul>
      </section>
      <section>
        <h2>Wybrane realizacje</h2>
        <ul>
          <li><a href="/realizacje/em-air-system">EM Air System — realizacja WordPress</a></li>
          <li><a href="/realizacje/rzeczoznawca-marcin-dudek">Rzeczoznawca Marcin Dudek — realizacja WordPress</a></li>
          <li><a href="/realizacje/kancelaria-adwokacka-witkowska">Kancelaria Adwokacka Witkowska — realizacja WordPress</a></li>
        </ul>
      </section>`;
  }

  if (path === '/naprawa-wordpress') {
    return `
      <section>
        <h2>Quick Fix od 390 zł — jak wygląda start</h2>
        <ul>
          <li>Na początek wystarczy publiczny URL i opis objawu — bez wysyłania hasła.</li>
          <li>Zakres i cena są potwierdzane przed rozpoczęciem pracy.</li>
          <li>Jeśli problem okaże się większy, zlecenie nie jest rozszerzane bez akceptacji.</li>
        </ul>
        <p><a href="/naprawa-wordpress#kontakt">Zgłoś problem WordPress</a></p>
      </section>
      <section><h2>Najczęstsze problemy WordPress</h2><ul>${links(guideLinks)}</ul></section>`;
  }

  if (path === '/opieka-wordpress' || path === '/strony-wordpress') {
    return `
      <section><h2>Powiązane materiały</h2><ul>${links(guideLinks.slice(0, 4))}</ul></section>
      <p><a href="/#contact">Skontaktuj się z CodeFix.IT</a></p>`;
  }

  if (path === '/poradniki') {
    return `<section><h2>Wszystkie poradniki</h2><ul>${links(guideLinks)}</ul></section>`;
  }

  if (path.startsWith('/poradniki/')) {
    return `
      <p><a href="/naprawa-wordpress">Naprawa WordPress — zobacz zakres usługi</a></p>
      <p><a href="/poradniki">Wszystkie poradniki WordPress</a></p>`;
  }

  if (path.startsWith('/realizacje/')) {
    return `
      <p><a href="/strony-wordpress">Strony internetowe dla firm — zobacz zakres wdrożenia</a></p>
      <p><a href="/">Wróć do CodeFix.IT</a></p>`;
  }

  return `<p><a href="/">Wróć do strony głównej CodeFix.IT</a></p>`;
}

function outputPath(pathname) {
  if (pathname === '/') return join(distDir.pathname, 'index.html');
  return join(distDir.pathname, pathname.replace(/^\//, ''), 'index.html');
}

const style = `
<style id="codefix-static-prerender-style">
  .cf-static-prerender{min-height:100vh;background:#060606;color:#e8e8eb;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:56px 24px}
  .cf-static-prerender-inner{max-width:1040px;margin:0 auto}
  .cf-static-prerender .brand{display:inline-flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.02em;color:#fff;text-decoration:none}
  .cf-static-prerender .brand img{width:42px;height:42px;object-fit:contain}
  .cf-static-prerender .brand-fix{color:#f12b3e}
  .cf-static-prerender .eyebrow{margin-top:48px;color:#ff686b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}
  .cf-static-prerender h1{max-width:880px;margin:14px 0 20px;font-size:clamp(38px,7vw,72px);line-height:1.02;letter-spacing:-.05em}
  .cf-static-prerender h2{margin-top:40px;font-size:22px}
  .cf-static-prerender p,.cf-static-prerender li{max-width:780px;color:#a5a5ad;line-height:1.65}
  .cf-static-prerender a{color:#f2f2f4}
  .cf-static-prerender ul{display:grid;gap:10px;padding-left:20px}
</style>`;

for (const url of urls) {
  const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
  const file = outputPath(path);
  let html = await readFile(file, 'utf8');
  const title = titleContent(html);
  const description = metaContent(html, 'description');
  const heading = pageHeading(path, title);

  const body = `<div id="root" data-static-prerender="true">
    <main class="cf-static-prerender" data-seo-static-content="true">
      <div class="cf-static-prerender-inner">
        <a class="brand" href="/" aria-label="CodeFix.IT — strona główna"><img src="/brand/codefix-mark.png" width="48" height="48" alt=""><span>Code<span class="brand-fix">Fix</span>.IT</span></a>
        <p class="eyebrow">WordPress • zdalnie • cała Polska</p>
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(description)}</p>
        ${relatedBlock(path)}
      </div>
    </main>
  </div>`;

  if (!html.includes('<div id="root"></div>')) {
    throw new Error(`Cannot inject static content into ${path}: root placeholder missing`);
  }

  html = html.replace('<div id="root"></div>', body);
  if (!html.includes('id="codefix-static-prerender-style"')) {
    html = html.replace('</head>', `${style}\n  </head>`);
  }

  await writeFile(file, html, 'utf8');
  process.stdout.write(`Static HTML body: ${path}\n`);
}
