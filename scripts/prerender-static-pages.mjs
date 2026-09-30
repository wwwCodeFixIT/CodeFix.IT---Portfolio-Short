import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pages = [
  {
    path: 'polityka-prywatnosci',
    title: 'Polityka prywatności | CodeFix.IT',
    description:
      'Polityka prywatności CodeFix.IT: formularz kontaktowy, analityka, okres przechowywania danych oraz prawa użytkownika.',
    schemaType: 'WebPage',
    schemaName: 'Polityka prywatności CodeFix.IT',
  },
  {
    path: 'realizacje/em-air-system',
    title: 'eM-aiR System — case study WordPress | CodeFix.IT',
    description:
      'Redesign strony firmy klimatyzacyjnej: responsywny WordPress, ACF PRO, oferta, realizacje, formularz kontaktowy i techniczne SEO.',
    schemaType: 'CreativeWork',
    schemaName: 'eM-aiR System — case study',
  },
  {
    path: 'realizacje/rzeczoznawca-marcin-dudek',
    title: 'Rzeczoznawca Marcin Dudek — case study | CodeFix.IT',
    description:
      'Strona wizytówka od zera dla rzeczoznawcy: WordPress, custom theme, ACF PRO, formularze, analityka i responsywny front-end.',
    schemaType: 'CreativeWork',
    schemaName: 'Rzeczoznawca Marcin Dudek — case study',
  },
  {
    path: 'realizacje/kancelaria-adwokacka-witkowska',
    title: 'Kancelaria Adwokacka Witkowska — case study | CodeFix.IT',
    description:
      'Realizacja WordPress dla kancelarii wykonana we współpracy z SyloSoftware: Elementor, ACF PRO, CPT i responsywny front-end.',
    schemaType: 'CreativeWork',
    schemaName: 'Kancelaria Adwokacka Witkowska — case study',
  },
];

const distDir = new URL('../dist/', import.meta.url);
const baseHtml = await readFile(new URL('index.html', distDir), 'utf8');

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Cannot prerender static page: missing ${label}`);
  }
  return html.replace(pattern, replacement);
}

for (const page of pages) {
  const canonical = `https://codefix.it/${page.path}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://codefix.it/#organization',
        name: 'CodeFix.IT',
        url: 'https://codefix.it/',
        logo: 'https://codefix.it/favicon.svg',
        slogan: 'Diabeł tkwi w kodzie',
        email: 'wwwcodefixit@gmail.com',
        sameAs: ['https://github.com/wwwCodeFixIT'],
      },
      {
        '@type': page.schemaType,
        name: page.schemaName,
        url: canonical,
        description: page.description,
        creator: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
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
    /<script\s+(?:id="[^"]*"\s+)?type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="codefix-static-schema" type="application/ld+json">${escapeJsonForHtml(schema)}</script>`,
    'JSON-LD',
  );

  const outputDir = join(distDir.pathname, ...page.path.split('/'));
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'index.html'), html, 'utf8');
  process.stdout.write(`Prerendered /${page.path}\n`);
}
