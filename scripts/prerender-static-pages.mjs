import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectCases = [
  {
    path: 'realizacje/em-air-system',
    title: 'eM-aiR System — case study WordPress | CodeFix.IT',
    description:
      'Redesign strony firmy klimatyzacyjnej: responsywny WordPress, ACF PRO, oferta, realizacje, formularz kontaktowy i techniczne SEO.',
    schemaName: 'eM-aiR System — case study',
    demoUrl: 'https://em-airsystem.pl/',
    year: 2023,
    technologies: ['WordPress', 'HTML', 'CSS', 'JavaScript', 'PHP', 'ACF Pro'],
    scope: [
      'Przebudowa istniejącej strony',
      'Projekt responsywny',
      'Custom WordPress theme',
      'Integracja ACF Pro',
      'Optymalizacja SEO',
    ],
  },
  {
    path: 'realizacje/rzeczoznawca-marcin-dudek',
    title: 'Rzeczoznawca Marcin Dudek — case study WordPress | CodeFix.IT',
    description:
      'Strona wizytówka od zera dla rzeczoznawcy: WordPress, custom theme, ACF PRO, formularze, analityka i responsywny front-end.',
    schemaName: 'Rzeczoznawca Marcin Dudek — case study',
    demoUrl: 'https://rzeczoznawcamarcindudek.pl/',
    year: 2023,
    technologies: ['WordPress', 'HTML', 'CSS', 'JavaScript', 'PHP', 'ACF Pro', 'Google Analytics'],
    scope: [
      'Strona od podstaw',
      'Konwersja HTML → WordPress',
      'Custom PHP theme',
      'Integracja ACF Pro',
      'Google Analytics',
    ],
  },
  {
    path: 'realizacje/kancelaria-adwokacka-witkowska',
    title: 'Kancelaria Adwokacka Witkowska — case study WordPress | CodeFix.IT',
    description:
      'Realizacja WordPress dla kancelarii wykonana we współpracy z SyloSoftware: Elementor, ACF PRO, CPT i responsywny front-end.',
    schemaName: 'Kancelaria Adwokacka Witkowska — case study',
    demoUrl: 'https://adwokatwitkowska.com/',
    year: 2024,
    technologies: ['WordPress', 'Elementor', 'ACF Pro', 'PHP', 'CSS', 'JavaScript'],
    scope: [
      'Projekt we współpracy z SyloSoftware',
      'WordPress + Elementor',
      'Custom Post Types',
      'ACF Pro integration',
      'Responsywny design',
    ],
  },
];

const pages = [
  {
    path: 'polityka-prywatnosci',
    title: 'Polityka prywatności | CodeFix.IT',
    description:
      'Polityka prywatności CodeFix.IT: formularz kontaktowy, analityka, okres przechowywania danych oraz prawa użytkownika.',
    schemaType: 'WebPage',
    schemaName: 'Polityka prywatności CodeFix.IT',
    ogType: 'website',
  },
  {
    path: 'realizacje',
    title: 'Realizacje WordPress i strony dla firm | CodeFix.IT',
    description:
      'Realizacje CodeFix.IT: trzy publiczne wdrożenia WordPress z opisanym zakresem, technologiami i działającymi stronami. Zobacz projekty dla firm i case współpracy agencyjnej.',
    schemaType: 'CollectionPage',
    schemaName: 'Realizacje CodeFix.IT',
    ogType: 'website',
  },
  ...projectCases.map((project) => ({
    ...project,
    schemaType: 'CreativeWork',
    ogType: 'article',
  })),
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

function breadcrumbsFor(page, canonical) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'CodeFix.IT',
      item: 'https://codefix.it/',
    },
  ];

  if (page.path.startsWith('realizacje')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Realizacje',
      item: 'https://codefix.it/realizacje/',
    });
  }

  if (page.path.startsWith('realizacje/')) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: page.schemaName,
      item: canonical,
    });
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function primarySchema(page, canonical) {
  if (page.path === 'realizacje') {
    return {
      '@type': 'CollectionPage',
      '@id': canonical + '#page',
      name: page.schemaName,
      url: canonical,
      description: page.description,
      inLanguage: 'pl-PL',
      isPartOf: { '@id': 'https://codefix.it/#website' },
      about: { '@id': 'https://codefix.it/#organization' },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: projectCases.map((project, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: project.schemaName,
          url: `https://codefix.it/${project.path}/`,
        })),
      },
    };
  }

  if (page.schemaType === 'CreativeWork') {
    return {
      '@type': 'CreativeWork',
      '@id': canonical + '#case-study',
      name: page.schemaName,
      headline: page.schemaName,
      url: canonical,
      description: page.description,
      creator: { '@id': 'https://codefix.it/#organization' },
      publisher: { '@id': 'https://codefix.it/#organization' },
      inLanguage: 'pl-PL',
      dateCreated: String(page.year),
      keywords: page.technologies,
      about: page.scope,
      sameAs: [page.demoUrl],
      isPartOf: { '@id': 'https://codefix.it/#website' },
    };
  }

  return {
    '@type': page.schemaType,
    '@id': canonical + '#page',
    name: page.schemaName,
    url: canonical,
    description: page.description,
    creator: { '@id': 'https://codefix.it/#organization' },
    inLanguage: 'pl-PL',
    isPartOf: { '@id': 'https://codefix.it/#website' },
  };
}

for (const page of pages) {
  const canonical = `https://codefix.it/${page.path}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://codefix.it/#organization',
        name: 'CodeFix.IT',
        url: 'https://codefix.it/',
        logo: 'https://codefix.it/brand/codefix-mark.png',
        slogan: 'Diabeł tkwi w kodzie',
        email: 'wwwcodefixit@gmail.com',
        sameAs: ['https://github.com/wwwCodeFixIT'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://codefix.it/#website',
        url: 'https://codefix.it/',
        name: 'CodeFix.IT',
        publisher: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
      },
      primarySchema(page, canonical),
      breadcrumbsFor(page, canonical),
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
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="${page.ogType}" />`,
    'og:type',
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
