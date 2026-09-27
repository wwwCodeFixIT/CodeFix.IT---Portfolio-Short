import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const guides = [
  {
    slug: 'wordpress-nie-wysyla-maili',
    title: 'WordPress nie wysyła maili? Diagnostyka krok po kroku | CodeFix.IT',
    description: 'Formularz WordPress działa, ale wiadomości nie dochodzą? Sprawdź formularz, wp_mail, SMTP, logi i konfigurację DNS zanim zaczniesz wymieniać wtyczki.',
    headline: 'WordPress nie wysyła maili — co sprawdzić krok po kroku',
    faq: [
      ['Czy instalacja wtyczki SMTP zawsze naprawi problem?', 'Nie. SMTP pomaga w warstwie wysyłki, ale nie naprawi błędnej konfiguracji formularza, JavaScriptu, nieprawidłowego odbiorcy ani problemu z domeną.'],
      ['Czy komunikat „wysłano” oznacza, że e-mail dotarł?', 'Nie. Potwierdza co najwyżej, że aplikacja zaakceptowała próbę wysyłki. Dostarczenie do skrzynki jest osobnym etapem.'],
      ['Czy można diagnozować bez dostępu do WordPressa?', 'Część problemu można ocenić z zewnątrz, ale do pełnej diagnozy formularza, logów lub SMTP zwykle potrzebny jest dostęp do panelu albo środowiska.'],
    ],
  },
  {
    slug: 'blad-500-wordpress',
    title: 'Błąd 500 WordPress — przyczyny i bezpieczna diagnostyka | CodeFix.IT',
    description: 'Błąd 500 w WordPress po aktualizacji lub zmianie wtyczki? Zobacz bezpieczną kolejność diagnostyki: logi, PHP, wtyczki, motyw i konfiguracja serwera.',
    headline: 'Błąd 500 w WordPress — jak znaleźć przyczynę bez zgadywania',
    faq: [
      ['Czy błąd 500 oznacza włamanie?', 'Nie. Może mieć wiele zwykłych przyczyn technicznych. Jeżeli są dodatkowe oznaki kompromitacji, bezpieczeństwo trzeba sprawdzić osobno.'],
      ['Czy wystarczy przywrócić backup?', 'Backup może szybko przywrócić działanie, ale warto ustalić, co wywołało awarię, aby problem nie wrócił przy kolejnej aktualizacji.'],
      ['Czy można naprawić 500 bez panelu WordPress?', 'Tak, jeżeli masz dostęp do hostingu, plików i logów. Przy całkowicie niedostępnym WordPressie często właśnie te narzędzia są potrzebne.'],
    ],
  },
  {
    slug: 'wordpress-zepsul-sie-po-aktualizacji',
    title: 'WordPress zepsuł się po aktualizacji — co robić? | CodeFix.IT',
    description: 'Strona WordPress przestała działać po aktualizacji wtyczki, motywu lub PHP? Sprawdź kolejność działań, backup, logi, cache i konflikty.',
    headline: 'WordPress zepsuł się po aktualizacji — co robić po kolei',
    faq: [
      ['Czy zawsze trzeba przywracać backup?', 'Nie. Jeżeli przyczyna jest dobrze zidentyfikowana, często wystarczy naprawić lub cofnąć pojedynczy element.'],
      ['Czy cache może wyglądać jak awaria po aktualizacji?', 'Tak. Stare pliki CSS lub JavaScript w cache mogą powodować niespójny wygląd mimo poprawnego kodu na serwerze.'],
      ['Czy automatyczne aktualizacje są złe?', 'Nie z definicji. Ryzyko zależy od serwisu, krytyczności funkcji, jakości backupu i możliwości szybkiego rollbacku.'],
    ],
  },
  {
    slug: 'wolny-wordpress-co-sprawdzic',
    title: 'Wolny WordPress — jak znaleźć wąskie gardło | CodeFix.IT',
    description: 'WordPress ładuje się wolno? Zamiast instalować kolejną wtyczkę do cache, sprawdź TTFB, obrazy, JavaScript, zapytania, hosting i Core Web Vitals.',
    headline: 'Wolny WordPress — co sprawdzić przed instalacją kolejnej wtyczki',
    faq: [
      ['Czy wtyczka cache przyspieszy każdy WordPress?', 'Nie. Może bardzo pomóc, ale nie usunie wszystkich problemów backendu, zewnętrznych skryptów ani ciężkich zasobów.'],
      ['Czy dużo wtyczek zawsze oznacza wolną stronę?', 'Nie. Znaczenie ma koszt ich działania, a nie sama liczba.'],
      ['Czy PageSpeed 100 jest konieczne?', 'Nie. Celem jest szybka i stabilna strona dla użytkowników. Wynik narzędzia jest pomocą diagnostyczną, a nie celem samym w sobie.'],
    ],
  },
];

const distDir = new URL('../dist/', import.meta.url);
const baseHtml = await readFile(new URL('index.html', distDir), 'utf8');

function escapeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function replace(html, pattern, value, label) {
  if (!pattern.test(html)) throw new Error('Missing ' + label + ' in base HTML');
  return html.replace(pattern, value);
}

function withMeta(html, { title, description, canonical, schema }) {
  html = replace(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, 'title');
  html = replace(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`, 'description');
  html = replace(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`, 'canonical');
  html = replace(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`, 'og:url');
  html = replace(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`, 'og:title');
  html = replace(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`, 'og:description');
  html = replace(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title');
  html = replace(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description');
  html = replace(html, /<script\s+(?:id="[^"]*"\s+)?type="application\/ld\+json">[\s\S]*?<\/script>/, `<script id="codefix-guide-schema" type="application/ld+json">${escapeJson(schema)}</script>`, 'JSON-LD');
  return html;
}

const organization = {
  '@type': 'Organization',
  '@id': 'https://codefix.it/#organization',
  name: 'CodeFix.IT',
  url: 'https://codefix.it/',
};

const indexCanonical = 'https://codefix.it/poradniki';
const indexDescription = 'Praktyczne poradniki CodeFix.IT o WordPress: błędy 500, poczta i SMTP, awarie po aktualizacji oraz wydajność.';
let indexHtml = withMeta(baseHtml, {
  title: 'Poradniki WordPress — diagnostyka i utrzymanie | CodeFix.IT',
  description: indexDescription,
  canonical: indexCanonical,
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'CollectionPage',
        name: 'Poradniki WordPress',
        url: indexCanonical,
        description: indexDescription,
        inLanguage: 'pl-PL',
      },
    ],
  },
});
await mkdir(join(distDir.pathname, 'poradniki'), { recursive: true });
await writeFile(join(distDir.pathname, 'poradniki', 'index.html'), indexHtml, 'utf8');
process.stdout.write('Prerendered /poradniki\n');

for (const guide of guides) {
  const canonical = `https://codefix.it/poradniki/${guide.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'Article',
        headline: guide.headline,
        description: guide.description,
        datePublished: '2026-09-27',
        dateModified: '2026-09-27',
        mainEntityOfPage: canonical,
        url: canonical,
        author: { '@id': 'https://codefix.it/#organization' },
        publisher: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
  const html = withMeta(baseHtml, {
    title: guide.title,
    description: guide.description,
    canonical,
    schema,
  });
  const dir = join(distDir.pathname, 'poradniki', guide.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html, 'utf8');
  process.stdout.write(`Prerendered /poradniki/${guide.slug}\n`);
}
