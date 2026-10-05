import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1].trim()));

const serviceCatalog = JSON.parse(
  await readFile(new URL('../public/data/service-landings.json', import.meta.url), 'utf8'),
);

const serviceHeadings = Object.fromEntries(
  Object.entries(serviceCatalog).map(([path, page]) => [
    path,
    [page.title, page.titleAccent].filter(Boolean).join(' '),
  ]),
);

const guideLinks = [
  ['/poradniki/wordpress-nie-wysyla-maili/', 'WordPress nie wysyła maili'],
  ['/poradniki/blad-500-wordpress/', 'Błąd 500 WordPress'],
  ['/poradniki/wordpress-zepsul-sie-po-aktualizacji/', 'WordPress zepsuł się po aktualizacji'],
  ['/poradniki/wolny-wordpress-co-sprawdzic/', 'Wolny WordPress'],
  ['/poradniki/blad-krytyczny-wordpress/', 'Błąd krytyczny WordPress'],
  ['/poradniki/woocommerce-checkout-nie-dziala/', 'WooCommerce checkout nie działa'],
  ['/poradniki/ile-kosztuje-naprawa-wordpress/', 'Ile kosztuje naprawa WordPress'],
  ['/poradniki/ile-kosztuje-opieka-wordpress/', 'Ile kosztuje opieka WordPress'],
  ['/poradniki/ile-kosztuje-strona-wordpress-dla-firmy/', 'Ile kosztuje strona WordPress dla firmy'],
];

const quickFixGuideLinks = guideLinks.filter(([href]) =>
  [
    '/poradniki/wordpress-nie-wysyla-maili/',
    '/poradniki/blad-500-wordpress/',
    '/poradniki/wordpress-zepsul-sie-po-aktualizacji/',
    '/poradniki/blad-krytyczny-wordpress/',
    '/poradniki/woocommerce-checkout-nie-dziala/',
    '/poradniki/ile-kosztuje-naprawa-wordpress/',
  ].includes(href),
);

const careGuideLinks = guideLinks.filter(([href]) =>
  ['/poradniki/wolny-wordpress-co-sprawdzic/', '/poradniki/ile-kosztuje-opieka-wordpress/'].includes(href),
);

const businessSiteGuideLinks = guideLinks.filter(([href]) =>
  ['/poradniki/ile-kosztuje-strona-wordpress-dla-firmy/'].includes(href),
);

const guideServiceLinks = {
  '/poradniki/wordpress-nie-wysyla-maili': ['/naprawa-wordpress/', 'Naprawa WordPress — zobacz zakres usługi'],
  '/poradniki/blad-500-wordpress': ['/naprawa-wordpress/', 'Naprawa WordPress — zobacz zakres usługi'],
  '/poradniki/wordpress-zepsul-sie-po-aktualizacji': ['/naprawa-wordpress/', 'Naprawa WordPress — zobacz zakres usługi'],
  '/poradniki/wolny-wordpress-co-sprawdzic': ['/opieka-wordpress/', 'Opieka WordPress — zobacz zakres usługi'],
  '/poradniki/blad-krytyczny-wordpress': ['/naprawa-wordpress/', 'Naprawa WordPress — zobacz zakres usługi'],
  '/poradniki/woocommerce-checkout-nie-dziala': ['/naprawa-wordpress/', 'Naprawa WordPress — zobacz zakres usługi'],
  '/poradniki/ile-kosztuje-naprawa-wordpress': ['/naprawa-wordpress/', 'Naprawa WordPress — cena i zakres'],
  '/poradniki/ile-kosztuje-opieka-wordpress': ['/opieka-wordpress/', 'Opieka WordPress — abonament i zakres'],
  '/poradniki/ile-kosztuje-strona-wordpress-dla-firmy': ['/strony-wordpress/', 'Strony WordPress dla firm — wycena'],
};

const serviceLinks = [
  ['/naprawa-wordpress/', 'Naprawa WordPress — błędy, formularze i WooCommerce'],
  ['/strony-wordpress/', 'Strony internetowe dla firm — WordPress + ACF PRO'],
  ['/opieka-wordpress/', 'Opieka WordPress — aktualizacje, backupy i rozwój'],
  ['/dla-agencji-wordpress/', 'WordPress white-label dla agencji — wsparcie overflow'],
];

const projectLinks = [
  ['/realizacje/kancelaria-adwokacka-witkowska/', 'Kancelaria Adwokacka Witkowska — case współpracy agencyjnej'],
  ['/realizacje/rzeczoznawca-marcin-dudek/', 'Rzeczoznawca Marcin Dudek — strona WordPress od zera'],
  ['/realizacje/em-air-system/', 'eM-aiR System — redesign WordPress + ACF PRO'],
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
  if (path === '/poradniki') return 'Poradniki WordPress. Naprawa, opieka i wyceny.';
  if (path === '/realizacje') return 'Realizacje WordPress, które możesz sprawdzić przed kontaktem.';
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
        <h2>Dla agencji — wsparcie WordPress white-label</h2>
        <p>Wsparcie overflow przy WordPress, ACF PRO, WooCommerce, front-endzie i mniejszych integracjach. Praca na stagingu i Git, także bez kontaktu z klientem końcowym.</p>
        <p><a href="/dla-agencji-wordpress/">Zobacz współpracę WordPress white-label dla agencji</a></p>
      </section>
      <section>
        <h2>Weryfikowalne realizacje i sposób pracy</h2>
        <p>Trzy opisane realizacje mają publiczne adresy stron. Case Kancelarii Adwokackiej Witkowskiej dokumentuje współpracę agencyjną z SyloSoftware. Zakres i cena są potwierdzane przed rozpoczęciem prac.</p>
        <p><a href="/realizacje/kancelaria-adwokacka-witkowska/">Sprawdź case współpracy agencyjnej</a></p>
      </section>
      <section>
        <h2>Wybrane realizacje</h2>
        <ul>
          <li><a href="/realizacje/kancelaria-adwokacka-witkowska/">Kancelaria Adwokacka Witkowska — realizacja WordPress</a></li>
          <li><a href="/realizacje/rzeczoznawca-marcin-dudek/">Rzeczoznawca Marcin Dudek — realizacja WordPress</a></li>
          <li><a href="/realizacje/em-air-system/">EM Air System — realizacja WordPress</a></li>
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
        <p><a href="/naprawa-wordpress/#kontakt">Zgłoś problem WordPress</a></p>
      </section>
      <section>
        <h2>Sprawdź realizacje przed zgłoszeniem.</h2>
        <p>To publiczne, opisane wdrożenia CodeFix.IT. Możesz sprawdzić zakres prac przed wysłaniem swojego problemu.</p>
        <ul>
          <li><a href="/realizacje/kancelaria-adwokacka-witkowska/">Kancelaria Adwokacka Witkowska — case study</a></li>
          <li><a href="/realizacje/rzeczoznawca-marcin-dudek/">Rzeczoznawca Marcin Dudek — case study</a></li>
        </ul>
        <p><a href="/naprawa-wordpress/#realizacje">Sprawdź realizacje</a></p>
      </section>
      <section><h2>Najczęstsze problemy WordPress</h2><ul>${links(quickFixGuideLinks)}</ul></section>`;
  }

  if (path === '/opieka-wordpress') {
    return `
      <section>
        <h2>Opieka WordPress od 300 zł/mies. — jasny zakres przed startem</h2>
        <ul>
          <li>Kontrolowane aktualizacje WordPressa i uzgodnionych wtyczek.</li>
          <li>Backup przed większymi zmianami i kontrola możliwości odtworzenia.</li>
          <li>Uzgodniony limit drobnych zmian w miesiącu.</li>
          <li>Większe zadania są wyceniane osobno przed rozpoczęciem.</li>
        </ul>
        <p><a href="/opieka-wordpress/#kontakt">Zapytaj o opiekę</a></p>
      </section>
      <section><h2>Powiązane materiały o opiece WordPress</h2><ul>${links(careGuideLinks)}</ul></section>`;
  }

  if (path === '/strony-wordpress') {
    return `
      <section>
        <h2>Strona WordPress, którą później edytujesz sam</h2>
        <ul>
          <li>Uzgodnione teksty, zdjęcia, usługi i realizacje edytujesz z panelu WordPress.</li>
          <li>Przed publikacją dostajesz działające preview do sprawdzenia.</li>
          <li>Zakres i wycenę potwierdzamy przed rozpoczęciem prac.</li>
        </ul>
        <p><a href="/realizacje/">Sprawdź 3 publiczne realizacje</a></p>
        <p><a href="/strony-wordpress/#kontakt">Wyceń stronę firmową</a></p>
      </section>
      <section><h2>Poradniki o stronach WordPress dla firm</h2><ul>${links(businessSiteGuideLinks)}</ul></section>`;
  }

  if (path === '/dla-agencji-wordpress') {
    return `
      <section>
        <h2>White-label dla agencji — 120 zł/h i start od jednego płatnego tasku</h2>
        <ul>
          <li>WordPress, ACF PRO, WooCommerce i poprawki front-endowe.</li>
          <li>Git, staging, preview i praca według standardów zespołu.</li>
          <li>Możliwość pracy bez kontaktu z klientem końcowym.</li>
          <li>Estymacja czasu i zakres przed rozpoczęciem.</li>
        </ul>
        <p><a href="/realizacje/kancelaria-adwokacka-witkowska/">Sprawdź udokumentowany case współpracy agencyjnej z SyloSoftware</a></p>
      </section>
      <p><a href="/dla-agencji-wordpress/#kontakt">Zapytaj o współpracę</a></p>`;
  }

  if (path === '/realizacje') {
    return `
      <section>
        <h2>Publiczne realizacje WordPress</h2>
        <p>Każdy opisany case ma publiczny adres strony, konkretny zakres prac i użyty stack.</p>
        <ul>${links(projectLinks)}</ul>
      </section>
      <section>
        <h2>Potrzebujesz podobnego wdrożenia?</h2>
        <p><a href="/strony-wordpress/">Strony WordPress dla firm — zakres i wycena</a></p>
        <p><a href="/dla-agencji-wordpress/">Wsparcie WordPress white-label dla agencji</a></p>
      </section>`;
  }

  if (path === '/poradniki') {
    return `
      <section>
        <h2>Naprawa i awarie WordPress</h2>
        <ul>${links(quickFixGuideLinks)}</ul>
        <p><a href="/naprawa-wordpress/">Naprawa WordPress od 390 zł</a></p>
      </section>
      <section>
        <h2>Opieka i wydajność WordPress</h2>
        <ul>${links(careGuideLinks)}</ul>
        <p><a href="/opieka-wordpress/">Opieka WordPress od 300 zł/mies.</a></p>
      </section>
      <section>
        <h2>Strony WordPress dla firm</h2>
        <ul>${links(businessSiteGuideLinks)}</ul>
        <p><a href="/strony-wordpress/">Strony WordPress — wycena</a></p>
      </section>`;
  }

  if (path.startsWith('/poradniki/')) {
    const [serviceHref, serviceLabel] =
      guideServiceLinks[path] ?? ['/naprawa-wordpress/', 'Naprawa WordPress — zobacz zakres usługi'];
    return `
      <p><a href="${serviceHref}">${escapeHtml(serviceLabel)}</a></p>
      <p><a href="/poradniki/">Wszystkie poradniki WordPress</a></p>`;
  }

  if (path.startsWith('/realizacje/')) {
    return `
      <p><a href="/realizacje/">Zobacz wszystkie realizacje CodeFix.IT</a></p>
      <p><a href="/strony-wordpress/">Strony internetowe dla firm — zobacz zakres wdrożenia</a></p>
      <p><a href="/dla-agencji-wordpress/">Wsparcie WordPress white-label dla agencji</a></p>`;
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
