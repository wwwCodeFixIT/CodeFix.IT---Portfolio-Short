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
  {
    slug: 'blad-krytyczny-wordpress',
    title: 'Błąd krytyczny WordPress — Recovery Mode i diagnostyka | CodeFix.IT',
    description: 'WordPress pokazuje komunikat o błędzie krytycznym? Sprawdź Recovery Mode, logi PHP, wtyczki, motyw i ostatnie zmiany, zanim zaczniesz przywracać cały backup.',
    headline: 'W witrynie wystąpił błąd krytyczny — jak odzyskać WordPress',
    publishedOn: '2026-09-30',
    updatedOn: '2026-09-30',
    faq: [
      ['Czy błąd krytyczny oznacza, że strona została zhakowana?', 'Nie. Najczęściej oznacza fatalny błąd PHP lub konflikt kodu. Włamanie jest tylko jedną z wielu możliwych przyczyn i wymaga dodatkowych oznak oraz osobnej weryfikacji.'],
      ['Co zrobić, jeśli link Recovery Mode nie przychodzi?', 'Sprawdź log błędów i panel hostingu. Jeżeli panel WordPress jest niedostępny, diagnozę można prowadzić przez pliki, logi i narzędzia hostingu bez czekania na e-mail.'],
      ['Czy od razu przywracać cały backup?', 'Nie zawsze. Jeśli problem powoduje jeden komponent, bezpieczniejsze może być naprawienie lub cofnięcie tylko tego elementu. Pełny rollback może nadpisać nowsze dane.'],
    ],
  },
  {
    slug: 'woocommerce-checkout-nie-dziala',
    title: 'WooCommerce checkout nie działa? Diagnostyka krok po kroku | CodeFix.IT',
    description: 'Checkout WooCommerce nie ładuje płatności, kręci się bez końca albo nie przechodzi dalej? Sprawdź cache, JavaScript, AJAX, bramkę płatności i konflikty.',
    headline: 'WooCommerce checkout nie działa — jak znaleźć przyczynę',
    publishedOn: '2026-09-30',
    updatedOn: '2026-09-30',
    faq: [
      ['Dlaczego checkout WooCommerce kręci się bez końca?', 'Częstą przyczyną są błędy JavaScript, niedokończone żądania AJAX, konflikt wtyczki lub motywu, cache albo problem z konfiguracją URL i sesji.'],
      ['Czy można wyłączyć cache tylko dla checkoutu?', 'Tak. Koszyk i checkout powinny być traktowane jako dynamiczne. Dokładny sposób wykluczenia zależy od wtyczki, hostingu i CDN.'],
      ['Czy problem może powodować bramka płatności?', 'Tak. Jeśli awaria występuje tylko dla jednej metody, sprawdź jej logi, konfigurację, status integracji, SSL i błędy JavaScript związane z daną bramką.'],
    ],
  },,
  {
    slug: 'ile-kosztuje-naprawa-wordpress',
    title: 'Ile kosztuje naprawa WordPress? Cena i zakres | CodeFix.IT',
    description: 'Ile kosztuje naprawa WordPress? Zobacz, co wpływa na wycenę błędu, kiedy wystarczy Quick Fix od 390 zł i kiedy potrzebny jest większy zakres.',
    headline: 'Ile kosztuje naprawa WordPress i od czego zależy cena?',
    publishedOn: '2026-10-01',
    updatedOn: '2026-10-01',
    faq: [
      ['Czy każda naprawa WordPress kosztuje 390 zł?', 'Nie. 390 zł to cena startowa dla małego, jasno zdefiniowanego problemu. Większy zakres jest wyceniany osobno przed rozpoczęciem prac.'],
      ['Czy diagnoza może wykazać większy zakres?', 'Tak. W takim przypadku zakres nie jest rozszerzany automatycznie — najpierw dostajesz opis problemu i propozycję kolejnego etapu.'],
      ['Czy do wyceny potrzebny jest od razu dostęp do panelu?', 'Nie zawsze. Przy wielu problemach pierwszą ocenę można zrobić na podstawie publicznego URL i opisu objawu.'],
    ],
  },
  {
    slug: 'ile-kosztuje-opieka-wordpress',
    title: 'Ile kosztuje opieka WordPress? Abonament i zakres | CodeFix.IT',
    description: 'Opieka WordPress od 300 zł miesięcznie w CodeFix.IT. Zobacz, co wpływa na zakres abonamentu: aktualizacje, backupy, poprawki, rozwój i czas reakcji.',
    headline: 'Ile kosztuje opieka WordPress i co powinno być w abonamencie?',
    publishedOn: '2026-10-01',
    updatedOn: '2026-10-01',
    faq: [
      ['Czy opieka WordPress w CodeFix.IT zaczyna się od 300 zł miesięcznie?', 'Tak. To cena startowa dla prostego zakresu. Dokładny abonament zależy od środowiska strony i potrzebnej liczby prac.'],
      ['Czy większe funkcje mogą być w abonamencie?', 'Drobne zmiany mogą mieścić się w uzgodnionym pakiecie. Większe wdrożenia są wyceniane osobno.'],
      ['Czy trzeba podpisywać długą umowę?', 'Warunki i okres rozliczeniowy są ustalane przed startem. Najważniejsze jest jasne określenie zakresu, kosztu i zasad rezygnacji.'],
    ],
  },
  {
    slug: 'ile-kosztuje-strona-wordpress-dla-firmy',
    title: 'Ile kosztuje strona WordPress dla firmy? Wycena | CodeFix.IT',
    description: 'Cena strony WordPress dla firmy zależy od liczby podstron, projektu, treści i integracji. Zobacz, co obejmuje wycena CodeFix.IT i jak przygotować brief.',
    headline: 'Ile kosztuje strona WordPress dla firmy i co wpływa na wycenę?',
    publishedOn: '2026-10-01',
    updatedOn: '2026-10-01',
    faq: [
      ['Czy CodeFix.IT ma stały cennik stron firmowych?', 'Nie. Cena jest ustalana po zakresie, ponieważ liczba podstron, materiały i integracje potrafią znacząco zmienić ilość pracy.'],
      ['Czy WordPress i ACF PRO są częścią wdrożenia?', 'Tak, jeśli taki zakres został uzgodniony. ACF PRO służy do przygotowania edytowalnych sekcji i pól.'],
      ['Czy mogę najpierw dostać wycenę bez zobowiązania?', 'Tak. Krótki brief służy do ustalenia zakresu i ceny przed rozpoczęciem projektu.'],
    ],
  }
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
  alternateName: ['CodeFix IT', 'CodeFixIT'],
  url: 'https://codefix.it/',
  logo: 'https://codefix.it/brand/codefix-mark.png',
  slogan: 'Diabeł tkwi w kodzie',
};

const indexCanonical = 'https://codefix.it/poradniki/';
const indexDescription = 'Praktyczne poradniki CodeFix.IT o WordPress: błędy krytyczne i 500, WooCommerce checkout, poczta SMTP, awarie po aktualizacji i wydajność.';
let indexHtml = withMeta(baseHtml, {
  title: 'Poradniki WordPress — diagnostyka i utrzymanie | CodeFix.IT',
  description: indexDescription,
  canonical: indexCanonical,
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'CodeFix.IT', item: 'https://codefix.it/' },
          { '@type': 'ListItem', position: 2, name: 'Poradniki WordPress', item: indexCanonical },
        ],
      },
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
  const canonical = `https://codefix.it/poradniki/${guide.slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'Article',
        headline: guide.headline,
        description: guide.description,
        datePublished: guide.publishedOn ?? '2026-09-27',
        dateModified: guide.updatedOn ?? guide.publishedOn ?? '2026-09-27',
        mainEntityOfPage: canonical,
        url: canonical,
        author: { '@id': 'https://codefix.it/#organization' },
        publisher: { '@id': 'https://codefix.it/#organization' },
        inLanguage: 'pl-PL',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'CodeFix.IT', item: 'https://codefix.it/' },
          { '@type': 'ListItem', position: 2, name: 'Poradniki WordPress', item: 'https://codefix.it/poradniki/' },
          { '@type': 'ListItem', position: 3, name: guide.headline, item: canonical },
        ],
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
