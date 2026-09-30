import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pages = [
  {
    slug: 'naprawa-wordpress',
    title: 'Naprawa WordPress Warszawa – błędy i WooCommerce | CodeFix.IT',
    description:
      'Naprawa WordPress w Warszawie i zdalnie w całej Polsce: błędy, formularze, WooCommerce, CSS i awarie po aktualizacjach. Quick Fix od 390 zł.',
    serviceName: 'WordPress Quick Fix',
    serviceType: 'Diagnostyka i naprawa WordPress',
    faq: [
      [
        'Czy 390 zł to stała cena każdej naprawy?',
        'Nie. To cena startowa dla małego, jasno zdefiniowanego problemu. Jeśli temat wymaga większej ingerencji, przed rozpoczęciem dostajesz osobny zakres i wycenę.',
      ],
      [
        'Czy potrzebujesz od razu loginu do WordPressa?',
        'Nie zawsze. Na początku wystarczy publiczny adres strony i opis problemu. Dostęp jest potrzebny dopiero do diagnozy lub wdrożenia, jeśli wymaga tego temat.',
      ],
      [
        'Czy naprawiasz Elementor i Contact Form 7?',
        'Tak. CodeFix.IT pracuje z WordPressem, Elementorem, ACF PRO, Contact Form 7, WooCommerce i niestandardowym front-endem.',
      ],
      [
        'Co jeśli problem okaże się większy?',
        'Zakres nie jest rozszerzany bez uzgodnienia. Po diagnozie otrzymujesz informację, co trzeba zrobić i ile będzie kosztował kolejny etap.',
      ],
      [
        'Czy naprawiasz WordPress tylko w Warszawie?',
        'Nie. Dla firm z Warszawy mogę działać lokalnie, a większość napraw WordPress realizuję zdalnie dla klientów z całej Polski, po bezpiecznym przekazaniu potrzebnych dostępów.',
      ],
    ],
  },
  {
    slug: 'opieka-wordpress',
    title: 'Opieka WordPress Warszawa – aktualizacje i backupy | CodeFix.IT',
    description:
      'Opieka WordPress w Warszawie i zdalnie w całej Polsce od 300 zł/mies.: aktualizacje, backupy, drobne poprawki i rozwój strony.',
    serviceName: 'Opieka i rozwój WordPress',
    serviceType: 'Stała opieka techniczna WordPress',
    faq: [
      [
        'Co dokładnie obejmuje abonament od 300 zł?',
        'Zakres jest ustalany indywidualnie. Przy prostym serwisie może obejmować aktualizacje, backup i niewielki miesięczny pakiet drobnych zmian.',
      ],
      [
        'Czy opieka obejmuje awarie hostingu?',
        'CodeFix.IT może diagnozować problemy po stronie WordPressa, DNS, SSL i hostingu oraz współpracować z supportem dostawcy, ale nie zastępuje SLA firmy hostingowej.',
      ],
      [
        'Czy mogę zlecać nowe sekcje i funkcje?',
        'Tak. Małe zmiany mogą mieścić się w uzgodnionym pakiecie, a większe funkcje są wyceniane osobno przed wdrożeniem.',
      ],
      [
        'Czy mogę zrezygnować ze stałej opieki?',
        'Tak. Warunki współpracy i okres rozliczeniowy są ustalane przed startem.',
      ],
      [
        'Czy opieka WordPress jest dostępna poza Warszawą?',
        'Tak. Stała opieka jest realizowana zdalnie, dlatego CodeFix.IT może obsługiwać firmy w Warszawie i w całej Polsce.',
      ],
    ],
  },
  {
    slug: 'strony-wordpress',
    title: 'Strony internetowe Warszawa – WordPress dla firm | CodeFix.IT',
    description:
      'Strony internetowe dla firm w Warszawie: WordPress + ACF PRO, szybki front-end, formularze, SEO techniczne i wygodna edycja treści. CodeFix.IT.',
    serviceName: 'Strony internetowe dla firm — WordPress + ACF PRO',
    serviceType: 'Projektowanie i wdrożenie stron internetowych WordPress',
    faq: [
      [
        'Czy dostanę gotowy motyw WordPress?',
        'Przy wdrożeniu customowym przygotowywany jest motyw i struktura dopasowana do ustalonego projektu. Zakres techniczny jest opisany przed rozpoczęciem prac.',
      ],
      [
        'Czy będę mógł sam zmieniać treści?',
        'Tak. ACF PRO służy do tego, żeby uzgodnione teksty, obrazy, listy usług czy realizacje dało się edytować z panelu.',
      ],
      [
        'Czy wykonujesz także wersję mobilną?',
        'Tak. Responsywność jest częścią wdrożenia i strona jest przygotowywana również dla telefonów i tabletów.',
      ],
      [
        'Ile kosztuje strona internetowa dla firmy?',
        'Cena zależy od liczby podstron, projektu, treści, integracji i zakresu WordPress/ACF PRO. Po krótkim briefie CodeFix.IT podaje zakres i wycenę przed rozpoczęciem prac.',
      ],
      [
        'Czy mogę zobaczyć przykład techniczny?',
        'Tak. Na demo.codefix.it działa własne demo WordPress + ACF PRO CodeFix.IT, oznaczone jako demo techniczne, a nie realizacja klienta.',
      ],
      [
        'Czy tworzysz strony tylko dla firm z Warszawy?',
        'Nie. Warszawa jest rynkiem lokalnym CodeFix.IT, ale projekt i wdrożenie mogą być prowadzone zdalnie dla firm z całej Polski.',
      ],
    ],
  },
];

const distDir = new URL('../dist/', import.meta.url);
const indexPath = new URL('index.html', distDir);
const baseHtml = await readFile(indexPath, 'utf8');

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Cannot prerender service page: missing ${label}`);
  }
  return html.replace(pattern, replacement);
}

for (const page of pages) {
  const canonical = `https://codefix.it/${page.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://codefix.it/#organization',
        name: 'CodeFix.IT',
        alternateName: ['CodeFix IT', 'CodeFixIT'],
        url: 'https://codefix.it/',
        logo: 'https://codefix.it/favicon.svg',
        slogan: 'Diabeł tkwi w kodzie',
        email: 'wwwcodefixit@gmail.com',
        sameAs: ['https://github.com/wwwCodeFixIT'],
      },
      {
        '@type': 'Service',
        name: page.serviceName,
        provider: { '@id': 'https://codefix.it/#organization' },
        url: canonical,
        serviceType: page.serviceType,
        description: page.description,
        areaServed: [
          { '@type': 'City', name: 'Warszawa' },
          { '@type': 'Country', name: 'Polska' },
        ],
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: canonical,
          availableLanguage: ['pl'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'CodeFix.IT', item: 'https://codefix.it/' },
          { '@type': 'ListItem', position: 2, name: page.serviceName, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  let html = baseHtml;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`, 'title');
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${page.description}" />`,
    'description',
  );
  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonical}" />`,
    'canonical',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonical}" />`,
    'og:url',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${page.title}" />`,
    'og:title',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${page.description}" />`,
    'og:description',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${page.title}" />`,
    'twitter:title',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${page.description}" />`,
    'twitter:description',
  );
  html = replaceTag(
    html,
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="codefix-service-schema" type="application/ld+json">${escapeJsonForHtml(schema)}</script>`,
    'JSON-LD',
  );

  const outputDir = join(distDir.pathname, page.slug);
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'index.html'), html, 'utf8');
  process.stdout.write(`Prerendered /${page.slug}\n`);
}
