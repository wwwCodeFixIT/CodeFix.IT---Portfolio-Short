import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const catalog = JSON.parse(
  await readFile(new URL('../public/data/service-landings.json', import.meta.url), 'utf8'),
);
const pages = Object.values(catalog);

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
  const slug = page.path.replace(/^\//, '');
  const canonical = `https://codefix.it/${slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://codefix.it/#organization',
        name: 'CodeFix.IT',
        alternateName: ['CodeFix IT', 'CodeFixIT'],
        url: 'https://codefix.it/',
        logo: 'https://codefix.it/brand/codefix-mark.png',
        slogan: 'Diabeł tkwi w kodzie',
        email: 'wwwcodefixit@gmail.com',
        sameAs: ['https://github.com/wwwCodeFixIT'],
      },
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: page.title,
        provider: { '@id': 'https://codefix.it/#organization' },
        url: canonical,
        serviceType: page.eyebrow,
        description: page.metaDescription,
        mainEntityOfPage: canonical,
        areaServed: [{ '@type': 'Country', name: 'Polska' }],
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
          { '@type': 'ListItem', position: 2, name: page.title, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  let html = baseHtml;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${page.metaTitle}</title>`, 'title');
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${page.metaDescription}" />`,
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
    `<meta property="og:title" content="${page.metaTitle}" />`,
    'og:title',
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${page.metaDescription}" />`,
    'og:description',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${page.metaTitle}" />`,
    'twitter:title',
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${page.metaDescription}" />`,
    'twitter:description',
  );
  html = replaceTag(
    html,
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="codefix-service-schema" type="application/ld+json">${escapeJsonForHtml(schema)}</script>`,
    'JSON-LD',
  );

  const outputDir = join(distDir.pathname, slug);
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'index.html'), html, 'utf8');
  process.stdout.write(`Prerendered /${slug}\n`);
}
