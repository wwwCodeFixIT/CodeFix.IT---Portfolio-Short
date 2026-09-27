export type GuideSection = {
  heading: string;
  paragraphs: string[];
  checklist?: string[];
};

export type WordPressGuide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  publishedOn: string;
  updatedOn: string;
  readMinutes: number;
  intent: string;
  serviceHref: '/naprawa-wordpress' | '/opieka-wordpress';
  serviceLabel: string;
  intro: string;
  sections: GuideSection[];
  faq: { question: string; answer: string }[];
};

export const wordpressGuides: WordPressGuide[] = [
  {
    slug: 'wordpress-nie-wysyla-maili',
    title: 'WordPress nie wysyła maili — co sprawdzić krok po kroku',
    metaTitle: 'WordPress nie wysyła maili? Diagnostyka krok po kroku | CodeFix.IT',
    description:
      'Formularz WordPress działa, ale wiadomości nie dochodzą? Sprawdź formularz, wp_mail, SMTP, logi i konfigurację DNS zanim zaczniesz wymieniać wtyczki.',
    publishedOn: '2026-09-27',
    updatedOn: '2026-09-27',
    readMinutes: 7,
    intent: 'Formularze / SMTP',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Zgłoś problem z pocztą WordPress',
    intro:
      'Brak maili z formularza nie zawsze oznacza, że sam formularz jest uszkodzony. Problem może leżeć w walidacji, funkcji wp_mail, konfiguracji serwera pocztowego, SMTP albo po stronie dostarczalności wiadomości. Najlepiej diagnozować te warstwy po kolei.',
    sections: [
      {
        heading: '1. Sprawdź, czy formularz naprawdę się wysyła',
        paragraphs: [
          'Najpierw odróżnij błąd formularza od błędu dostarczenia e-maila. Jeżeli formularz pokazuje błąd jeszcze w przeglądarce, problem może dotyczyć walidacji, JavaScriptu, endpointu AJAX lub konfiguracji wtyczki.',
          'Jeżeli użytkownik widzi komunikat sukcesu, ale wiadomość nie dociera, kolejnym krokiem jest sprawdzenie, czy WordPress faktycznie próbuje wysłać mail.',
        ],
        checklist: [
          'wyślij test z innym adresem odbiorcy',
          'sprawdź folder Spam i reguły skrzynki',
          'upewnij się, że adres odbiorcy w formularzu jest poprawny',
          'sprawdź, czy problem dotyczy jednego formularza czy wszystkich maili WordPress',
        ],
      },
      {
        heading: '2. Zweryfikuj wp_mail i logi',
        paragraphs: [
          'WordPress standardowo korzysta z funkcji wp_mail. Sama informacja o powodzeniu tej funkcji nie gwarantuje jednak dostarczenia wiadomości do skrzynki. Warto sprawdzić logi aplikacji i, jeśli hosting je udostępnia, logi poczty.',
          'Na stronie produkcyjnej nie należy włączać publicznego wyświetlania błędów PHP. Diagnostykę lepiej prowadzić przez bezpieczny log lub staging.',
        ],
      },
      {
        heading: '3. SMTP rozwiązuje część problemów, ale nie każdy',
        paragraphs: [
          'Autoryzowana wysyłka przez SMTP lub API dostawcy poczty jest zwykle bardziej przewidywalna niż anonimowa wysyłka z hostingu. Trzeba jednak poprawnie ustawić nadawcę, port, szyfrowanie i autoryzację.',
          'Jeżeli test połączenia SMTP nie działa, najpierw napraw połączenie. Jeżeli test działa, a konkretne formularze nadal nie wysyłają, wróć do konfiguracji samego formularza.',
        ],
      },
      {
        heading: '4. Sprawdź SPF, DKIM i domenę nadawcy',
        paragraphs: [
          'Wiadomość może zostać wysłana technicznie, ale odrzucona lub oznaczona jako spam z powodu konfiguracji domeny. SPF i DKIM powinny być zgodne z usługą, która faktycznie wysyła pocztę.',
          'Nie dodawaj rekordów DNS na ślepo. Ich prawidłowa treść zależy od konkretnego dostawcy poczty i obecnej konfiguracji domeny.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy instalacja wtyczki SMTP zawsze naprawi problem?',
        answer:
          'Nie. SMTP pomaga w warstwie wysyłki, ale nie naprawi błędnej konfiguracji formularza, JavaScriptu, nieprawidłowego odbiorcy ani problemu z domeną.',
      },
      {
        question: 'Czy komunikat „wysłano” oznacza, że e-mail dotarł?',
        answer:
          'Nie. Potwierdza co najwyżej, że aplikacja zaakceptowała próbę wysyłki. Dostarczenie do skrzynki jest osobnym etapem.',
      },
      {
        question: 'Czy można diagnozować bez dostępu do WordPressa?',
        answer:
          'Część problemu można ocenić z zewnątrz, ale do pełnej diagnozy formularza, logów lub SMTP zwykle potrzebny jest dostęp do panelu albo środowiska.',
      },
    ],
  },
  {
    slug: 'blad-500-wordpress',
    title: 'Błąd 500 w WordPress — jak znaleźć przyczynę bez zgadywania',
    metaTitle: 'Błąd 500 WordPress — przyczyny i bezpieczna diagnostyka | CodeFix.IT',
    description:
      'Błąd 500 w WordPress po aktualizacji lub zmianie wtyczki? Zobacz bezpieczną kolejność diagnostyki: logi, PHP, wtyczki, motyw i konfiguracja serwera.',
    publishedOn: '2026-09-27',
    updatedOn: '2026-09-27',
    readMinutes: 7,
    intent: 'Błąd HTTP 500',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Zgłoś błąd 500',
    intro:
      'HTTP 500 oznacza błąd po stronie serwera, ale sam kod nie mówi jeszcze, co go spowodowało. W WordPressie przyczyną może być PHP, wtyczka, motyw, konfiguracja serwera albo wyczerpanie zasobów. Najszybsza diagnostyka zaczyna się od logów, nie od losowego wyłączania wszystkiego.',
    sections: [
      {
        heading: '1. Ustal, kiedy pojawił się błąd',
        paragraphs: [
          'Najbardziej użyteczna informacja to ostatnia zmiana przed awarią: aktualizacja wtyczki, zmiana wersji PHP, wdrożenie kodu, migracja albo zmiana konfiguracji hostingu.',
          'Jeżeli błąd dotyczy tylko jednej podstrony lub funkcji, zawęża to obszar diagnostyki znacznie bardziej niż sam komunikat 500.',
        ],
      },
      {
        heading: '2. Sprawdź log błędów PHP i serwera',
        paragraphs: [
          'Log zwykle wskazuje plik, funkcję lub typ błędu, od którego warto zacząć. Fatal error, brak klasy, przekroczony limit pamięci i timeout wymagają innych napraw.',
          'Nie publikuj pełnych komunikatów błędów użytkownikom. Na produkcji lepiej logować szczegóły po stronie serwera niż wyświetlać ścieżki plików czy dane środowiska.',
        ],
      },
      {
        heading: '3. Wtyczki i motyw testuj kontrolowanie',
        paragraphs: [
          'Jeżeli log wskazuje konkretną wtyczkę, zacznij od niej. Masowe wyłączenie wszystkich wtyczek może przywrócić stronę, ale utrudnia ustalenie rzeczywistej przyczyny i może wyłączyć krytyczne funkcje sklepu.',
          'Przed większą ingerencją wykonaj kopię lub pracuj na stagingu, jeśli środowisko na to pozwala.',
        ],
      },
      {
        heading: '4. Sprawdź wersję PHP, pamięć i konfigurację',
        paragraphs: [
          'Po zmianie PHP starszy kod może przestać działać. Z kolei samo zwiększenie limitu pamięci nie rozwiązuje problemu, jeżeli źródłem jest pętla, wadliwa wtyczka albo ciężkie zapytanie.',
          'Celem diagnostyki jest usunięcie przyczyny, a nie tylko ukrycie objawu.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy błąd 500 oznacza włamanie?',
        answer:
          'Nie. Może mieć wiele zwykłych przyczyn technicznych. Jeżeli są dodatkowe oznaki kompromitacji, bezpieczeństwo trzeba sprawdzić osobno.',
      },
      {
        question: 'Czy wystarczy przywrócić backup?',
        answer:
          'Backup może szybko przywrócić działanie, ale warto ustalić, co wywołało awarię, aby problem nie wrócił przy kolejnej aktualizacji.',
      },
      {
        question: 'Czy można naprawić 500 bez panelu WordPress?',
        answer:
          'Tak, jeżeli masz dostęp do hostingu, plików i logów. Przy całkowicie niedostępnym WordPressie często właśnie te narzędzia są potrzebne.',
      },
    ],
  },
  {
    slug: 'wordpress-zepsul-sie-po-aktualizacji',
    title: 'WordPress zepsuł się po aktualizacji — co robić po kolei',
    metaTitle: 'WordPress zepsuł się po aktualizacji — co robić? | CodeFix.IT',
    description:
      'Strona WordPress przestała działać po aktualizacji wtyczki, motywu lub PHP? Sprawdź kolejność działań, backup, logi, cache i konflikty.',
    publishedOn: '2026-09-27',
    updatedOn: '2026-09-27',
    readMinutes: 6,
    intent: 'Awaria po aktualizacji',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Zgłoś awarię po aktualizacji',
    intro:
      'Po aktualizacji może wystąpić konflikt wersji, błąd PHP, zmiana CSS/JavaScriptu albo problem z cache. Najważniejsze jest zatrzymanie kolejnych przypadkowych zmian i ustalenie, co dokładnie zostało zaktualizowane.',
    sections: [
      {
        heading: '1. Nie aktualizuj kolejnych elementów „na próbę”',
        paragraphs: [
          'Jeżeli awaria wystąpiła bezpośrednio po jednej zmianie, kolejne aktualizacje mogą tylko powiększyć liczbę możliwych przyczyn. Zapisz wersję WordPressa, motywu, wtyczki i PHP.',
        ],
      },
      {
        heading: '2. Sprawdź, czy problem jest funkcjonalny czy wizualny',
        paragraphs: [
          'Biała strona, błąd 500 i brak możliwości logowania sugerują inną ścieżkę niż rozsypany CSS albo niedziałający pojedynczy widget. W drugim przypadku warto również wyczyścić warstwy cache po stronie WordPressa, CDN i przeglądarki.',
        ],
      },
      {
        heading: '3. Rollback tylko z planem',
        paragraphs: [
          'Przywrócenie poprzedniej wersji może być właściwym ruchem awaryjnym, ale powinno uwzględniać bazę danych i zmiany wykonane po backupie. W WooCommerce pochopne cofnięcie całej bazy może oznaczać utratę nowych zamówień.',
          'Jeżeli problem dotyczy pojedynczej wtyczki, kontrolowany rollback tej wtyczki może być bezpieczniejszy niż cofanie całego serwisu.',
        ],
      },
      {
        heading: '4. Po naprawie odtwórz aktualizację na stagingu',
        paragraphs: [
          'Jeżeli aktualizacja jest potrzebna ze względów bezpieczeństwa lub kompatybilności, trwałym rozwiązaniem nie jest pozostanie na starej wersji bez końca. Warto odtworzyć konflikt na stagingu i ustalić sposób bezpiecznego przejścia do nowszej wersji.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy zawsze trzeba przywracać backup?',
        answer:
          'Nie. Jeżeli przyczyna jest dobrze zidentyfikowana, często wystarczy naprawić lub cofnąć pojedynczy element.',
      },
      {
        question: 'Czy cache może wyglądać jak awaria po aktualizacji?',
        answer:
          'Tak. Stare pliki CSS lub JavaScript w cache mogą powodować niespójny wygląd mimo poprawnego kodu na serwerze.',
      },
      {
        question: 'Czy automatyczne aktualizacje są złe?',
        answer:
          'Nie z definicji. Ryzyko zależy od serwisu, krytyczności funkcji, jakości backupu i możliwości szybkiego rollbacku.',
      },
    ],
  },
  {
    slug: 'wolny-wordpress-co-sprawdzic',
    title: 'Wolny WordPress — co sprawdzić przed instalacją kolejnej wtyczki',
    metaTitle: 'Wolny WordPress — jak znaleźć wąskie gardło | CodeFix.IT',
    description:
      'WordPress ładuje się wolno? Zamiast instalować kolejną wtyczkę do cache, sprawdź TTFB, obrazy, JavaScript, zapytania, hosting i Core Web Vitals.',
    publishedOn: '2026-09-27',
    updatedOn: '2026-09-27',
    readMinutes: 8,
    intent: 'Wydajność / Core Web Vitals',
    serviceHref: '/opieka-wordpress',
    serviceLabel: 'Zapytaj o optymalizację i opiekę',
    intro:
      '„Wolna strona” może oznaczać długi czas odpowiedzi serwera, ciężkie obrazy, zbyt dużo JavaScriptu, problemy z bazą albo niestabilny hosting. Bez pomiaru łatwo zoptymalizować element, który wcale nie jest głównym problemem.',
    sections: [
      {
        heading: '1. Najpierw zmierz, gdzie tracisz czas',
        paragraphs: [
          'Sprawdź osobno czas odpowiedzi serwera i pracę przeglądarki. Jeżeli HTML zaczyna docierać późno, samo zmniejszenie obrazów nie usunie problemu backendu. Jeżeli serwer odpowiada szybko, a strona długo się renderuje, skup się na zasobach front-endu.',
          'Core Web Vitals pomagają opisać doświadczenie użytkownika, ale pojedynczy wynik laboratoryjny nie jest pełną diagnozą całego serwisu.',
        ],
      },
      {
        heading: '2. Obrazy, fonty i skrypty',
        paragraphs: [
          'Duże obrazy bez właściwych wymiarów, wiele wariantów fontów i zewnętrzne skrypty mogą znacząco obciążyć stronę. Warto ograniczać zasoby tam, gdzie faktycznie są używane.',
          'Lazy loading pomaga poniżej pierwszego ekranu, ale nie powinien opóźniać kluczowego obrazu widocznego od razu po wejściu.',
        ],
      },
      {
        heading: '3. Wtyczki i baza danych',
        paragraphs: [
          'Liczba wtyczek sama w sobie nie mówi, czy serwis jest szybki. Jedna źle napisana wtyczka może kosztować więcej niż kilka lekkich. Pomocne są pomiary zapytań i czasu wykonywania konkretnych hooków lub endpointów.',
        ],
      },
      {
        heading: '4. Cache i CDN nie zastępują naprawy backendu',
        paragraphs: [
          'Cache potrafi bardzo skutecznie odciążyć serwer dla powtarzalnych publicznych stron. Nie rozwiązuje jednak każdego problemu — szczególnie dynamicznych koszyków, panelu użytkownika czy ciężkich zapytań wykonywanych poza cache.',
          'Najlepszy efekt zwykle daje połączenie poprawnego kodu, rozsądnych zasobów, cache i środowiska hostingowego dopasowanego do ruchu.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy wtyczka cache przyspieszy każdy WordPress?',
        answer:
          'Nie. Może bardzo pomóc, ale nie usunie wszystkich problemów backendu, zewnętrznych skryptów ani ciężkich zasobów.',
      },
      {
        question: 'Czy dużo wtyczek zawsze oznacza wolną stronę?',
        answer:
          'Nie. Znaczenie ma koszt ich działania, a nie sama liczba.',
      },
      {
        question: 'Czy PageSpeed 100 jest konieczne?',
        answer:
          'Nie. Celem jest szybka i stabilna strona dla użytkowników. Wynik narzędzia jest pomocą diagnostyczną, a nie celem samym w sobie.',
      },
    ],
  },
];

export const guideByPath = Object.fromEntries(
  wordpressGuides.map((guide) => [`/poradniki/${guide.slug}`, guide]),
);
