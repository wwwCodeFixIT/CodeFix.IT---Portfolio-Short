export type ServiceKey =
  | 'WORDPRESS_QUICK_FIX'
  | 'WORDPRESS_CARE'
  | 'CODEFIX_BUSINESS_SITE'
  | 'AGENCY_WHITE_LABEL';

export type ServiceLandingConfig = {
  path: string;
  service: ServiceKey;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  price: string;
  pricingNote: string;
  cta: string;
  secondaryCta: string;
  heroPoints: string[];
  offerPoints?: string[];
  reassurance?: { title: string; description: string }[];
  ctaMicrocopy?: string;
  stickyCta?: string;
  problemHeading: string;
  problems: { title: string; description: string }[];
  scopeHeading: string;
  scopeIntro: string;
  scope: string[];
  process: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  contactHeading: string;
  contactCopy: string;
  messagePlaceholder: string;
  pageUrlRequired: boolean;
  demoUrl?: string;
  projectSlugs?: string[];
  companyFieldLabel?: string;
  successMessage?: string;
};

export const serviceLandings: Record<string, ServiceLandingConfig> = {
  '/naprawa-wordpress': {
    path: '/naprawa-wordpress',
    service: 'WORDPRESS_QUICK_FIX',
    eyebrow: 'WordPress Quick Fix',
    title: 'Naprawa WordPress. Jeden problem, konkretny zakres.',
    titleAccent: 'Od 390 zł — zdalnie w całej Polsce.',
    description:
      'Formularz nie wysyła? Aktualizacja zepsuła stronę? WooCommerce albo layout przestał działać? Podeślij URL i objaw. Na start bez loginu. Jeśli temat mieści się w Quick Fixie, dostaniesz zakres i cenę przed rozpoczęciem prac.',
    metaTitle: 'Naprawa WordPress – błędy, formularze, WooCommerce | CodeFix.IT',
    metaDescription:
      'Naprawa i pomoc WordPress zdalnie w całej Polsce: błędy, formularze, WooCommerce, CSS i awarie po aktualizacjach. Quick Fix od 390 zł.',
    price: 'Od 390 zł',
    pricingNote:
      'Cena orientacyjna dla jednego, jasno zdefiniowanego problemu. Po diagnozie potwierdzam zakres i kwotę przed rozpoczęciem prac.',
    cta: 'Zgłoś problem WordPress',
    secondaryCta: 'Zobacz przykładowy zakres',
    heroPoints: ['Bez loginu na start', 'Cena przed rozpoczęciem', 'Test po naprawie'],
    offerPoints: [
      'Diagnoza konkretnego objawu.',
      'Jedna uzgodniona naprawa lub mały zestaw ściśle powiązanych zmian.',
      'Test po wdrożeniu i krótka informacja, co zostało zmienione.',
    ],
    reassurance: [
      {
        title: 'Na start tylko URL + objaw',
        description: 'Nie potrzebuję hasła do WordPressa, żeby ocenić publicznie widoczny problem i ustalić następny krok.',
      },
      {
        title: 'Cena przed rozpoczęciem',
        description: 'Najpierw potwierdzam, czy temat mieści się w Quick Fixie. Dopiero po akceptacji zaczynam pracę.',
      },
      {
        title: 'Większy problem? Zatrzymuję zakres',
        description: 'Jeśli diagnoza pokaże większą awarię, nie rozszerzam zlecenia automatycznie — dostajesz osobną propozycję.',
      },
    ],
    ctaMicrocopy: 'Wysłanie zgłoszenia nie zobowiązuje do rozpoczęcia prac. Najpierw potwierdzam zakres i cenę.',
    stickyCta: 'Zgłoś problem • od 390 zł',
    problemHeading: 'Pomoc i naprawa WordPress przy typowych problemach technicznych.',
    problems: [
      {
        title: 'Błąd po aktualizacji',
        description:
          'Konflikt wtyczki, motywu, PHP lub zmiana zachowania strony po aktualizacji WordPressa.',
      },
      {
        title: 'Formularz nie wysyła',
        description:
          'Contact Form 7, SMTP, walidacja, komunikaty błędów, przekierowania i zachowanie formularza na mobile.',
      },
      {
        title: 'WooCommerce lub koszyk',
        description:
          'Drobne błędy widoku, checkoutu, przycisków, szablonów i integracji w istniejącym sklepie.',
      },
      {
        title: 'CSS / mobile / layout',
        description:
          'Rozjechane sekcje, elementy wychodzące poza ekran, błędy responsywności i wizualne regresje.',
      },
      {
        title: 'PHP / warning / 500',
        description:
          'Widoczne warningi, błędy serwera i problemy w motywie lub kodzie, które można odtworzyć i zdiagnozować.',
      },
      {
        title: 'Wydajność konkretnej podstrony',
        description:
          'Ciężkie obrazy, blokujące zasoby albo konkretny problem wpływający na Core Web Vitals.',
      },
    ],
    scopeHeading: 'Co obejmuje pojedyncza naprawa.',
    scopeIntro:
      'Quick Fix ma być małym, kontrolowanym zleceniem. Jeśli diagnoza pokaże większy problem, najpierw dostaniesz informację i osobną propozycję zakresu.',
    scope: [
      'Sprawdzenie objawu i próba odtworzenia problemu.',
      'Diagnoza najbardziej prawdopodobnej przyczyny.',
      'Jedna uzgodniona naprawa lub mały zestaw ściśle powiązanych zmian.',
      'Test działania po wdrożeniu na desktopie i telefonie, jeśli dotyczy.',
      'Krótka informacja, co zostało zmienione i czy widzę dalsze ryzyka.',
    ],
    process: [
      {
        title: '1. Podeślij URL i objaw',
        description: 'Najlepiej opisz, co nie działa, od kiedy i czy problem pojawił się po konkretnej zmianie.',
      },
      {
        title: '2. Ustalam zakres',
        description: 'Potwierdzam, czy temat mieści się w Quick Fixie, oraz podaję cenę przed rozpoczęciem.',
      },
      {
        title: '3. Naprawiam i testuję',
        description: 'Wprowadzam uzgodnioną zmianę i sprawdzam, czy problem został faktycznie rozwiązany.',
      },
    ],
    faq: [
      {
        question: 'Czy 390 zł to stała cena każdej naprawy?',
        answer:
          'Nie. To cena startowa dla małego, jasno zdefiniowanego problemu. Jeśli temat wymaga większej ingerencji, przed rozpoczęciem dostaniesz osobny zakres i wycenę.',
      },
      {
        question: 'Czy potrzebujesz od razu loginu do WordPressa?',
        answer:
          'Nie zawsze. Na początku wystarczy publiczny adres strony i opis problemu. Dostęp proszę dopiero wtedy, gdy jest potrzebny do diagnozy lub wdrożenia.',
      },
      {
        question: 'Czy naprawiasz Elementor i Contact Form 7?',
        answer:
          'Tak. Pracuję z WordPressem, Elementorem, ACF PRO, Contact Form 7, WooCommerce i niestandardowym front-endem.',
      },
      {
        question: 'Co jeśli problem okaże się większy?',
        answer:
          'Nie rozszerzam zakresu bez uzgodnienia. Zatrzymuję się po diagnozie i przedstawiam, co trzeba zrobić oraz ile będzie kosztował kolejny etap.',
      },
      {
        question: 'Czy realizujesz naprawy WordPress w całej Polsce?',
        answer:
          'Tak. Naprawy WordPress realizuję zdalnie dla firm z całej Polski, po bezpiecznym przekazaniu potrzebnych dostępów, jeśli są wymagane.',
      },
    ],
    contactHeading: 'Opisz jeden problem. Zacznijmy od diagnozy.',
    contactCopy:
      'Wklej adres strony i opisz objaw. Jeśli to temat na Quick Fix, dostaniesz konkretny zakres i cenę przed rozpoczęciem.',
    messagePlaceholder:
      'Np. po aktualizacji formularz przestał wysyłać wiadomości / na telefonie menu nachodzi na treść / na stronie produktu pojawia się błąd PHP.',
    pageUrlRequired: true,
  },
  '/opieka-wordpress': {
    path: '/opieka-wordpress',
    service: 'WORDPRESS_CARE',
    eyebrow: 'Opieka i rozwój WordPress',
    title: 'Opieka WordPress dla firm',
    titleAccent: 'zdalnie w całej Polsce.',
    description:
      'Aktualizacje, backupy, drobne poprawki i rozwój istniejącej strony w uzgodnionym miesięcznym zakresie. Obsługuję firmy zdalnie w całej Polsce jako stały techniczny punkt kontaktu.',
    metaTitle: 'Opieka WordPress – administracja, backupy i rozwój | CodeFix.IT',
    metaDescription:
      'Opieka i administracja WordPress od 300 zł/mies.: aktualizacje, backupy, wsparcie techniczne, drobne poprawki i rozwój strony.',
    price: 'Od 300 zł / mies.',
    pricingNote:
      'Zakres abonamentu zależy od liczby stron, częstotliwości zmian, hostingu i oczekiwanego czasu reakcji.',
    cta: 'Zapytaj o opiekę',
    secondaryCta: 'Zobacz zakres opieki',
    heroPoints: ['Zdalnie w całej Polsce', 'Backupy i aktualizacje', 'Drobne poprawki i rozwój'],
    problemHeading: 'Kiedy opieka, administracja i wsparcie techniczne WordPress mają sens.',
    problems: [
      {
        title: 'Strona wymaga regularnych aktualizacji',
        description:
          'WordPress, motyw i wtyczki trzeba aktualizować, ale chcesz robić to z kontrolą i możliwością reakcji po zmianie.',
      },
      {
        title: 'Co miesiąc pojawiają się drobne zmiany',
        description:
          'Nowa sekcja, podmiana treści, poprawka formularza, CSS, integracja albo niewielka zmiana funkcjonalna.',
      },
      {
        title: 'Nie chcesz szukać wykonawcy przy każdej awarii',
        description:
          'Stała współpraca skraca wejście w temat, bo znam już środowisko, hosting i sposób działania strony.',
      },
      {
        title: 'Potrzebujesz kontroli backupów',
        description:
          'Regularne kopie i jasna informacja, gdzie są przechowywane oraz jak wygląda odtwarzanie w razie problemu.',
      },
      {
        title: 'Strona ma się rozwijać etapami',
        description:
          'Nie trzeba od razu robić redesignu. Możemy poprawiać serwis małymi, mierzalnymi krokami.',
      },
      {
        title: 'Chcesz technicznego punktu kontaktu',
        description:
          'Jedna osoba do WordPressa, hostingu, DNS, SSL, wydajności i typowych problemów strony firmowej.',
      },
    ],
    scopeHeading: 'Przykładowy miesięczny zakres.',
    scopeIntro:
      'Nie sprzedaję fikcyjnego „nielimitowanego supportu”. Przed startem ustalamy, co mieści się w abonamencie i jak rozliczamy większe zadania.',
    scope: [
      'Kontrolowane aktualizacje WordPressa, motywu i uzgodnionych wtyczek.',
      'Backup przed większymi zmianami i kontrola możliwości odtworzenia.',
      'Drobne poprawki front-endu, formularzy i treści technicznych.',
      'Pomoc przy DNS, SSL, Cloudflare i typowych problemach hostingowych.',
      'Podstawowa kontrola błędów i wydajności po zmianach.',
      'Lista większych tematów do osobnej wyceny, jeśli wychodzą poza abonament.',
    ],
    process: [
      {
        title: '1. Krótki przegląd obecnej strony',
        description: 'Ustalamy hosting, WordPress, krytyczne wtyczki, backupy i najczęstszy rodzaj zadań.',
      },
      {
        title: '2. Uzgadniamy miesięczny zakres',
        description: 'Potwierdzamy, co wchodzi do opieki, limit prac i sposób zgłaszania zmian.',
      },
      {
        title: '3. Pracujemy w stałym rytmie',
        description: 'Zmiany są dokumentowane, a większe zadania nie wchodzą do abonamentu bez osobnej zgody.',
      },
    ],
    faq: [
      {
        question: 'Co dokładnie obejmuje abonament od 300 zł?',
        answer:
          'Zakres ustalam indywidualnie. Przy prostym serwisie może obejmować aktualizacje, backup i niewielki miesięczny pakiet drobnych zmian. Większe lub częstsze potrzeby wymagają szerszego pakietu.',
      },
      {
        question: 'Czy opieka obejmuje awarie hostingu?',
        answer:
          'Mogę diagnozować problemy po stronie WordPressa, DNS, SSL i hostingu oraz współpracować z supportem dostawcy. Nie zastępuje to jednak SLA samej firmy hostingowej.',
      },
      {
        question: 'Czy mogę zlecać nowe sekcje i funkcje?',
        answer:
          'Tak. Małe zmiany mogą mieścić się w uzgodnionym pakiecie, a większe funkcje wyceniam osobno przed wdrożeniem.',
      },
      {
        question: 'Czy mogę zrezygnować ze stałej opieki?',
        answer:
          'Tak. Warunki współpracy i okres rozliczeniowy ustalamy przed startem, bez ukrywania zakresu czy kosztów.',
      },
      {
        question: 'Czy opieka WordPress jest dostępna w całej Polsce?',
        answer:
          'Tak. Stała opieka jest realizowana zdalnie dla firm z całej Polski. Dostępy, zakres zmian i sposób zgłoszeń ustalamy przed rozpoczęciem współpracy.',
      },
    ],
    contactHeading: 'Pokaż obecną stronę i napisz, czego zwykle potrzebujesz.',
    contactCopy:
      'Na tej podstawie zaproponuję sensowny miesięczny zakres zamiast sprzedawać pakiet, którego nie wykorzystasz.',
    messagePlaceholder:
      'Np. zależy mi na aktualizacjach, backupach i 2–3 drobnych zmianach miesięcznie. Hosting: ..., WordPress: ...',
    pageUrlRequired: true,
  },
  '/strony-wordpress': {
    path: '/strony-wordpress',
    service: 'CODEFIX_BUSINESS_SITE',
    eyebrow: 'Strony internetowe dla firm • WordPress + ACF PRO',
    title: 'Strony internetowe dla firm',
    titleAccent: 'WordPress + ACF PRO, szybkie i edytowalne.',
    description:
      'Tworzę strony internetowe dla firm zdalnie w całej Polsce. Wdrażam je na WordPress + ACF PRO: responsywny front-end, formularze, techniczne SEO, Core Web Vitals i wygodna edycja treści bez grzebania w kodzie.',
    metaTitle: 'Strony WordPress dla firm – projekt i wdrożenie | CodeFix.IT',
    metaDescription:
      'Tworzenie stron WordPress dla firm w całej Polsce: ACF PRO, szybki front-end, formularze, SEO techniczne i wygodna edycja treści.',
    price: 'Wycena indywidualna',
    pricingNote:
      'Cena zależy od liczby podstron, zakresu projektu, treści, integracji i tego, czy startujemy od istniejącej strony.',
    cta: 'Wyceń stronę firmową',
    secondaryCta: 'Zobacz, co dostajesz',
    heroPoints: ['Zdalnie w całej Polsce', 'WordPress + ACF PRO', 'Mobile-first i Core Web Vitals'],
    problemHeading: 'Tworzenie stron WordPress dla firm, które mają generować kontakt — nie tylko wyglądać.',
    problems: [
      {
        title: 'Nowa strona od zera',
        description:
          'Przejrzysta prezentacja oferty, usług, realizacji i kontaktu dopasowana do realnego procesu sprzedażowego firmy.',
      },
      {
        title: 'Przebudowa starej strony',
        description:
          'Możemy zachować wartościową treść i domenę, a zmienić strukturę, wygląd, mobile i sposób edycji.',
      },
      {
        title: 'Edycja przez ACF PRO',
        description:
          'Pola i sekcje są przygotowane tak, żeby typowe aktualizacje treści dało się robić bez modyfikowania kodu.',
      },
      {
        title: 'Formularze i kontakt',
        description:
          'Formularze, SMTP i logiczne CTA przygotowane tak, żeby zapytanie faktycznie docierało do firmy.',
      },
      {
        title: 'SEO techniczne',
        description:
          'Semantyczna struktura, metadata, sitemap, indeksacja i techniczne podstawy pod dalsze pozycjonowanie.',
      },
      {
        title: 'Wydajność i mobile',
        description:
          'Responsywny layout, optymalizacja zasobów i kontrola Core Web Vitals jako część wdrożenia.',
      },
    ],
    scopeHeading: 'Co obejmuje profesjonalna strona internetowa dla firmy.',
    scopeIntro:
      'Zakres dopasowuję do firmy, ale poniższe elementy traktuję jako bazę dobrego wdrożenia, a nie płatne dodatki do każdej drobnej rzeczy.',
    scope: [
      'Struktura strony i uzgodniony zestaw podstron / sekcji.',
      'Responsywny front-end przygotowany pod desktop i urządzenia mobilne.',
      'WordPress + ACF PRO do edycji uzgodnionych treści.',
      'Formularz kontaktowy z konfiguracją poprawnej dostarczalności.',
      'Techniczne SEO i podstawowe dane strukturalne.',
      'Preview przed większą publikacją oraz test kontaktu po wdrożeniu.',
    ],
    process: [
      {
        title: '1. Brief i zakres',
        description: 'Ustalamy cel strony, ofertę firmy, podstrony, materiały i to, co ma prowadzić użytkownika do kontaktu.',
      },
      {
        title: '2. Projekt i wdrożenie',
        description: 'Buduję front-end oraz edytowalne pola WordPress/ACF zgodnie z zaakceptowanym zakresem.',
      },
      {
        title: '3. Preview i publikacja',
        description: 'Najpierw oglądasz działającą wersję, potem poprawki, testy i publikacja na produkcji.',
      },
    ],
    faq: [
      {
        question: 'Czy dostanę gotowy motyw WordPress?',
        answer:
          'Przy wdrożeniu customowym przygotowuję motyw i strukturę dopasowaną do ustalonego projektu. Zakres techniczny zawsze opisuję przed rozpoczęciem prac.',
      },
      {
        question: 'Czy będę mógł sam zmieniać treści?',
        answer:
          'Tak. ACF PRO wykorzystuję właśnie po to, żeby uzgodnione teksty, obrazy, listy usług czy realizacje dało się edytować z panelu.',
      },
      {
        question: 'Czy wykonujesz także wersję mobilną?',
        answer:
          'Tak. Responsywność nie jest dodatkiem — strona jest projektowana i testowana również dla telefonów i tabletów.',
      },
      {
        question: 'Ile kosztuje strona internetowa dla firmy?',
        answer:
          'Cena zależy od liczby podstron, projektu, treści, integracji i zakresu WordPress/ACF PRO. Po krótkim briefie podaję zakres i wycenę przed rozpoczęciem prac.',
      },
      {
        question: 'Czy mogę zobaczyć przykład techniczny?',
        answer:
          'Tak. Na demo.codefix.it działa moje własne demo WordPress + ACF PRO. Jest oznaczone jako demo techniczne, a nie realizacja klienta.',
      },
      {
        question: 'Czy tworzysz strony dla firm z całej Polski?',
        answer:
          'Tak. Projekt i wdrożenie mogą być prowadzone w pełni zdalnie dla firm z całej Polski. Kontakt, preview i akceptacja zmian odbywają się online.',
      },
    ],
    contactHeading: 'Opisz firmę i stronę, której potrzebujesz.',
    contactCopy:
      'Wystarczy krótki brief: czym zajmuje się firma, orientacyjna liczba podstron oraz informacja, czy masz już domenę, hosting, logo i teksty.',
    messagePlaceholder:
      'Np. firma instalacyjna, strona główna + usługi + realizacje + o nas + kontakt. Mam domenę i logo, teksty częściowo gotowe.',
    pageUrlRequired: false,
    demoUrl: 'https://demo.codefix.it/',
  },
  '/dla-agencji-wordpress': {
    path: '/dla-agencji-wordpress',
    service: 'AGENCY_WHITE_LABEL',
    eyebrow: 'WordPress white-label dla agencji',
    title: 'Wsparcie WordPress dla agencji.',
    titleAccent: 'Overflow, poprawki i mniejsze wdrożenia bez dokładania etatu.',
    description:
      'Przejmuję wybrane zadania WordPress, ACF PRO, WooCommerce i front-end. Pracuję na stagingu i Git, według Waszego workflow i bez kontaktu z klientem końcowym.',
    metaTitle: 'WordPress white-label dla agencji – wsparcie overflow | CodeFix.IT',
    metaDescription:
      'Wsparcie WordPress white-label dla agencji: ACF PRO, WooCommerce, front-end, Git i staging. Zacznij od jednego płatnego tasku.',
    price: 'Od 1 zadania testowego',
    pricingNote:
      'Na start możemy rozliczyć mały task projektowo, a stały model ustalić dopiero po wspólnej realizacji.',
    cta: 'Zapytaj o współpracę',
    secondaryCta: 'Zobacz zakres white-label',
    heroPoints: ['Bez kontaktu z klientem', 'Git / staging / preview', 'WordPress + ACF PRO'],
    offerPoints: [
      'Mniejsze wdrożenia i poprawki z kolejki.',
      'Praca według Waszego workflow i QA.',
      'Start od jednego płatnego tasku.',
    ],
    reassurance: [
      {
        title: 'White-label',
        description: 'Mogę działać całkowicie w tle, bez kontaktu z klientem końcowym.',
      },
      {
        title: 'Mały start',
        description: 'Najpierw jeden konkretny task, dopiero potem decyzja o stałej współpracy.',
      },
    ],
    ctaMicrocopy:
      'Wystarczy opis typowych zadań, stacku i workflow. Bez deklarowania stałej współpracy.',
    stickyCta: 'White-label • zacznij od tasku',
    problemHeading: 'Kiedy zewnętrzne wsparcie WordPress odciąża agencję.',
    problems: [
      {
        title: 'Overflow w zespole',
        description: 'Przejmuję część wdrożenia lub poprawki, gdy główny zespół ma pełny sprint.',
      },
      {
        title: 'Małe taski blokują kolejkę',
        description: 'ACF, WooCommerce, formularze, CSS i RWD nie muszą czekać na większy projekt.',
      },
      {
        title: 'Regresje i poprawki',
        description: 'Diagnozuję problemy po aktualizacjach, błędy layoutu i formularzy.',
      },
      {
        title: 'Deadline wymaga wsparcia',
        description: 'Dodatkowa para rąk do jasno opisanego zakresu bez przepinania całego projektu.',
      },
    ],
    scopeHeading: 'Co mogę przejąć white-label.',
    scopeIntro:
      'Mogę wejść tylko w te zadania, przy których brakuje przepustowości — bez przejmowania całego projektu.',
    scope: [
      'WordPress, ACF PRO i edytowalne komponenty.',
      'WooCommerce, checkout, hooki i template overrides.',
      'Front-end, RWD, CSS/JS i regresje po aktualizacjach.',
      'Formularze, SMTP i proste integracje API.',
      'Git, staging, preview i przekazanie do review.',
    ],
    process: [
      {
        title: '1. Task i kontekst',
        description: 'Dostaję expected result, repo/staging i zasady akceptacji.',
      },
      {
        title: '2. Potwierdzenie zakresu',
        description: 'Ustalam, co biorę, czego potrzebuję i jak rozliczamy zadanie.',
      },
      {
        title: '3. Wdrożenie do review',
        description: 'Oddaję przetestowaną zmianę na branchu lub stagingu do Waszej akceptacji.',
      },
    ],
    faq: [
      {
        question: 'Czy możesz pracować bez kontaktu z klientem?',
        answer: 'Tak. W modelu white-label kontakt może odbywać się wyłącznie z agencją.',
      },
      {
        question: 'Czy musimy od razu ustalać stałą liczbę godzin?',
        answer: 'Nie. Możemy zacząć od jednego małego, płatnego zadania.',
      },
      {
        question: 'Czy masz przykład pracy agencyjnej?',
        answer:
          'Tak. Case Kancelarii Adwokackiej Witkowskiej w portfolio został wykonany we współpracy z SyloSoftware.',
      },
    ],
    contactHeading: 'Masz task, który utknął w kolejce? Podeślij go.',
    contactCopy:
      'Napisz, co chcesz delegować, w jakim stacku pracujecie i jak wygląda workflow. Możemy zacząć od jednego małego tematu.',
    messagePlaceholder:
      'Np. overflow przy WordPress/ACF, poprawki front-endowe, Git + staging, taski w ...',
    pageUrlRequired: false,
    projectSlugs: ['kancelaria-adwokacka-witkowska', 'em-air-system'],
    companyFieldLabel: 'Nazwa agencji / firmy',
    successMessage:
      'Dzięki — zapytanie white-label dotarło. Odpowiem z kolejnym krokiem i możemy zacząć od jednego tasku.',
  }
};
