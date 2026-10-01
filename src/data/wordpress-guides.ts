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
  serviceHref: '/naprawa-wordpress' | '/opieka-wordpress' | '/strony-wordpress';
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
  {
    slug: 'blad-krytyczny-wordpress',
    title: 'W witrynie wystąpił błąd krytyczny — jak odzyskać WordPress',
    metaTitle: 'Błąd krytyczny WordPress — Recovery Mode i diagnostyka | CodeFix.IT',
    description:
      'WordPress pokazuje komunikat o błędzie krytycznym? Sprawdź Recovery Mode, logi PHP, wtyczki, motyw i ostatnie zmiany, zanim zaczniesz przywracać cały backup.',
    publishedOn: '2026-09-30',
    updatedOn: '2026-09-30',
    readMinutes: 7,
    intent: 'Błąd krytyczny / Recovery Mode',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Zgłoś błąd krytyczny WordPress',
    intro:
      'Komunikat „W witrynie wystąpił błąd krytyczny” zwykle oznacza, że WordPress przechwycił fatalny błąd PHP. Źródłem może być wtyczka, motyw, własny kod albo środowisko serwera. WordPress może uruchomić Recovery Mode, ale nawet wtedy warto ustalić przyczynę w logach zamiast ograniczyć się do przypadkowego wyłączania elementów.',
    sections: [
      {
        heading: '1. Sprawdź wiadomość o Recovery Mode',
        paragraphs: [
          'WordPress może wysłać na adres administratora specjalny link do trybu odzyskiwania. W tej sesji wadliwa wtyczka lub motyw może zostać wstrzymany, dzięki czemu panel znów będzie dostępny.',
          'Jeżeli wiadomość nie dotarła, sprawdź spam, ale nie zakładaj, że samo jej wysłanie zadziałało. Awaria może wystąpić zanim mechanizm poczty zostanie poprawnie załadowany.',
        ],
        checklist: [
          'sprawdź skrzynkę administratora i Spam',
          'nie publikuj linku Recovery Mode ani nie przesyłaj go osobom postronnym',
          'zapisz nazwę komponentu wskazanego w komunikacie, jeśli WordPress ją podaje',
        ],
      },
      {
        heading: '2. Odczytaj log błędów zamiast zgadywać',
        paragraphs: [
          'Najbardziej przydatna informacja to typ błędu, plik i numer linii. Fatal error, TypeError, brak klasy lub funkcji i przekroczony limit pamięci wymagają innych działań.',
          'Na produkcji nie wyświetlaj pełnych błędów PHP odwiedzającym. Używaj logów hostingu albo bezpiecznego debug.log i wyłącz publiczne wyświetlanie komunikatów.',
        ],
      },
      {
        heading: '3. Powiąż awarię z ostatnią zmianą',
        paragraphs: [
          'Jeżeli błąd pojawił się po aktualizacji wtyczki, motywu, PHP lub wdrożeniu kodu, zacznij od tego obszaru. To znacznie bezpieczniejsze niż wyłączanie wszystkich rozszerzeń bez planu.',
          'Gdy panel nie działa, dostęp do plików lub hostingu pozwala tymczasowo odizolować wadliwy komponent. Najpierw jednak wykonaj kopię i zanotuj stan wyjściowy.',
        ],
      },
      {
        heading: '4. Po przywróceniu strony usuń przyczynę, nie tylko objaw',
        paragraphs: [
          'Samo wejście przez Recovery Mode albo cofnięcie jednej wersji może przywrócić serwis, ale trwała naprawa wymaga sprawdzenia kompatybilności i odtworzenia problemu w bezpiecznym środowisku.',
          'Jeżeli awaria dotyczy sklepu lub formularzy, po naprawie wykonaj również test procesu biznesowego, a nie tylko test strony głównej.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy błąd krytyczny oznacza, że strona została zhakowana?',
        answer:
          'Nie. Najczęściej oznacza fatalny błąd PHP lub konflikt kodu. Włamanie jest tylko jedną z wielu możliwych przyczyn i wymaga dodatkowych oznak oraz osobnej weryfikacji.',
      },
      {
        question: 'Co zrobić, jeśli link Recovery Mode nie przychodzi?',
        answer:
          'Sprawdź log błędów i panel hostingu. Jeżeli panel WordPress jest niedostępny, diagnozę można prowadzić przez pliki, logi i narzędzia hostingu bez czekania na e-mail.',
      },
      {
        question: 'Czy od razu przywracać cały backup?',
        answer:
          'Nie zawsze. Jeśli problem powoduje jeden komponent, bezpieczniejsze może być naprawienie lub cofnięcie tylko tego elementu. Pełny rollback może nadpisać nowsze dane.',
      },
    ],
  },
  {
    slug: 'woocommerce-checkout-nie-dziala',
    title: 'WooCommerce checkout nie działa — jak znaleźć przyczynę',
    metaTitle: 'WooCommerce checkout nie działa? Diagnostyka krok po kroku | CodeFix.IT',
    description:
      'Checkout WooCommerce nie ładuje płatności, kręci się bez końca albo nie przechodzi dalej? Sprawdź cache, JavaScript, AJAX, bramkę płatności i konflikty.',
    publishedOn: '2026-09-30',
    updatedOn: '2026-09-30',
    readMinutes: 8,
    intent: 'WooCommerce / checkout',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Zgłoś problem z checkoutem WooCommerce',
    intro:
      'Awaria checkoutu bezpośrednio blokuje sprzedaż, dlatego diagnoza powinna być szybka, ale kontrolowana. Przyczyną może być JavaScript, AJAX, cache, bramka płatności, nieaktualny override szablonu, konflikt wtyczki albo błędna konfiguracja stron WooCommerce.',
    sections: [
      {
        heading: '1. Ustal dokładny moment awarii checkoutu',
        paragraphs: [
          'Sprawdź, czy problem występuje przed załadowaniem formularza, po wyborze dostawy, po wyborze płatności czy dopiero po kliknięciu przycisku złożenia zamówienia. Każdy z tych momentów angażuje inny fragment procesu.',
          'Przetestuj też tryb prywatny i drugą przeglądarkę. Jeżeli problem dotyczy tylko części użytkowników, cenna jest informacja o urządzeniu, metodzie płatności i komunikacie w konsoli.',
        ],
        checklist: [
          'sprawdź checkout jako niezalogowany klient',
          'przetestuj co najmniej jedną aktywną metodę płatności',
          'sprawdź konsolę JavaScript i zakładkę Network',
          'zanotuj błędy 4xx/5xx oraz niedokończone żądania AJAX',
        ],
      },
      {
        heading: '2. Wyklucz cache na koszyku i checkout',
        paragraphs: [
          'Koszyk i checkout zawierają dane zależne od sesji. Cache całej strony może podawać nieaktualny stan, błędne nonce albo dane innego etapu procesu.',
          'Jeżeli korzystasz z wtyczki cache, cache serwerowego lub CDN, upewnij się, że dynamiczne ścieżki WooCommerce są wyłączone z cache zgodnie z konfiguracją używanej infrastruktury.',
        ],
      },
      {
        heading: '3. Sprawdź JavaScript, AJAX i zgodność motywu',
        paragraphs: [
          'Niekończący się spinner albo brak odświeżenia podsumowania często oznacza, że żądanie AJAX nie kończy się prawidłowo albo JavaScript przerwał działanie przez błąd.',
          'Motyw i rozszerzenia mogą nadpisywać checkout lub ładować własne skrypty. Na stagingu warto przeprowadzić kontrolowany test konfliktu zamiast wyłączać wszystko na działającym sklepie.',
        ],
      },
      {
        heading: '4. Zweryfikuj bramkę płatności i logi WooCommerce',
        paragraphs: [
          'Jeżeli checkout działa do momentu wyboru konkretnej płatności, sprawdź logi tej bramki, webhooki, klucze API, tryb testowy/produkcyjny i wymagania SSL.',
          'Po naprawie wykonaj pełne zamówienie testowe od produktu do potwierdzenia, a następnie sprawdź status zamówienia, e-mail i ewentualny webhook operatora płatności.',
        ],
      },
    ],
    faq: [
      {
        question: 'Dlaczego checkout WooCommerce kręci się bez końca?',
        answer:
          'Częstą przyczyną są błędy JavaScript, niedokończone żądania AJAX, konflikt wtyczki lub motywu, cache albo problem z konfiguracją URL i sesji.',
      },
      {
        question: 'Czy można wyłączyć cache tylko dla checkoutu?',
        answer:
          'Tak. Koszyk i checkout powinny być traktowane jako dynamiczne. Dokładny sposób wykluczenia zależy od wtyczki, hostingu i CDN.',
      },
      {
        question: 'Czy problem może powodować bramka płatności?',
        answer:
          'Tak. Jeśli awaria występuje tylko dla jednej metody, sprawdź jej logi, konfigurację, status integracji, SSL i błędy JavaScript związane z daną bramką.',
      },
    ],
  },,
  {
    slug: 'ile-kosztuje-naprawa-wordpress',
    title: 'Ile kosztuje naprawa WordPress i od czego zależy cena?',
    metaTitle: 'Ile kosztuje naprawa WordPress? Cena i zakres | CodeFix.IT',
    description:
      'Ile kosztuje naprawa WordPress? Zobacz, co wpływa na wycenę błędu, kiedy wystarczy Quick Fix od 390 zł i kiedy potrzebny jest większy zakres.',
    publishedOn: '2026-10-01',
    updatedOn: '2026-10-01',
    readMinutes: 6,
    intent: 'Cena naprawy WordPress',
    serviceHref: '/naprawa-wordpress',
    serviceLabel: 'Sprawdź zakres naprawy WordPress',
    intro:
      'Cena naprawy WordPress zależy przede wszystkim od tego, czy problem jest pojedynczy i możliwy do odtworzenia, czy dotyczy większej części serwisu. W CodeFix.IT mały, jasno zdefiniowany problem może wejść w Quick Fix od 390 zł. Jeśli diagnoza pokazuje szerszy zakres, najpierw dostajesz informację i osobną wycenę.',
    sections: [
      {
        heading: 'Co najczęściej mieści się w małej naprawie WordPress',
        paragraphs: [
          'Do małego zakresu zwykle kwalifikuje się jeden konkretny objaw: niedziałający formularz, błąd po aktualizacji, problem z CSS na telefonie, pojedynczy warning PHP albo drobny błąd WooCommerce.',
          'Najważniejsze jest to, żeby problem dało się jasno opisać i przetestować po wdrożeniu. Dzięki temu zakres nie rozlewa się na przypadkowy remont całej strony.',
        ],
      },
      {
        heading: 'Co podnosi koszt naprawy',
        paragraphs: [
          'Cena rośnie, gdy błąd występuje tylko losowo, wymaga analizy wielu integracji, dotyczy niestandardowego kodu albo trzeba odtwarzać bezpieczne środowisko testowe.',
          'Większy koszt może też wynikać z konieczności migracji, pracy na wielu wersjach językowych, naprawy po włamaniu lub zmian wpływających na proces sprzedaży i dane klientów.',
        ],
      },
      {
        heading: 'Jak przygotować zgłoszenie, żeby szybciej dostać wycenę',
        paragraphs: [
          'Najlepsze zgłoszenie zawiera publiczny URL, opis objawu, informację od kiedy występuje problem i co zmieniło się tuż przed awarią. Na początku nie musisz wysyłać loginu.',
        ],
        checklist: [
          'adres strony lub konkretnej podstrony',
          'dokładny objaw i komunikat błędu',
          'informacja, czy problem pojawił się po aktualizacji lub wdrożeniu',
          'urządzenie lub przeglądarka, jeśli błąd nie występuje wszędzie',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy każda naprawa WordPress kosztuje 390 zł?',
        answer:
          'Nie. 390 zł to cena startowa dla małego, jasno zdefiniowanego problemu. Większy zakres jest wyceniany osobno przed rozpoczęciem prac.',
      },
      {
        question: 'Czy diagnoza może wykazać, że potrzebna jest większa przebudowa?',
        answer:
          'Tak. W takim przypadku zakres nie jest rozszerzany automatycznie. Najpierw dostajesz opis problemu i propozycję kolejnego etapu.',
      },
      {
        question: 'Czy do wyceny potrzebny jest od razu dostęp do panelu?',
        answer:
          'Nie zawsze. Przy wielu problemach pierwszą ocenę można zrobić na podstawie publicznego URL i opisu objawu.',
      },
    ],
  },
  {
    slug: 'ile-kosztuje-opieka-wordpress',
    title: 'Ile kosztuje opieka WordPress i co powinno być w abonamencie?',
    metaTitle: 'Ile kosztuje opieka WordPress? Abonament i zakres | CodeFix.IT',
    description:
      'Opieka WordPress od 300 zł miesięcznie w CodeFix.IT. Zobacz, co wpływa na zakres abonamentu: aktualizacje, backupy, poprawki, rozwój i czas reakcji.',
    publishedOn: '2026-10-01',
    updatedOn: '2026-10-01',
    readMinutes: 6,
    intent: 'Cena opieki WordPress',
    serviceHref: '/opieka-wordpress',
    serviceLabel: 'Zobacz opiekę WordPress od 300 zł/mies.',
    intro:
      'Opieka WordPress nie powinna być pustym abonamentem za samo kliknięcie aktualizacji. W CodeFix.IT prosty zakres zaczyna się od 300 zł miesięcznie, a ostateczna cena zależy od liczby stron, częstotliwości zmian, hostingu, oczekiwanego czasu reakcji i tego, ile pracy rozwojowej ma mieścić się w pakiecie.',
    sections: [
      {
        heading: 'Co powinno być ustalone przed startem opieki',
        paragraphs: [
          'Najpierw warto ustalić, kto odpowiada za hosting, backup, aktualizacje, monitoring i drobne zmiany. Jeżeli te granice nie są zapisane, trudno później ocenić, co faktycznie obejmuje abonament.',
        ],
      },
      {
        heading: 'Co wpływa na miesięczną cenę',
        paragraphs: [
          'Prosta strona firmowa z kilkoma wtyczkami wymaga innego poziomu opieki niż WooCommerce z płatnościami, integracjami i codziennymi zamówieniami. Znaczenie ma także to, czy pakiet obejmuje tylko utrzymanie, czy również regularny rozwój.',
        ],
        checklist: [
          'liczba obsługiwanych stron',
          'WordPress, WooCommerce i krytyczne integracje',
          'częstotliwość backupów i aktualizacji',
          'liczba drobnych zmian w miesiącu',
          'oczekiwany czas reakcji na zgłoszenie',
        ],
      },
      {
        heading: 'Abonament czy pojedyncze zlecenia',
        paragraphs: [
          'Jeżeli strona przez większość miesięcy nie wymaga żadnej pracy, pojedyncze zlecenia mogą mieć więcej sensu. Stała opieka zaczyna być wygodna wtedy, gdy aktualizacje, poprawki i pytania techniczne pojawiają się regularnie.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy opieka WordPress w CodeFix.IT zaczyna się od 300 zł miesięcznie?',
        answer:
          'Tak. To cena startowa dla prostego zakresu. Dokładny abonament zależy od środowiska strony i potrzebnej liczby prac.',
      },
      {
        question: 'Czy większe funkcje mogą być w abonamencie?',
        answer:
          'Drobne zmiany mogą mieścić się w uzgodnionym pakiecie. Większe wdrożenia są wyceniane osobno, zanim rozpocznie się praca.',
      },
      {
        question: 'Czy trzeba podpisywać długą umowę?',
        answer:
          'Warunki i okres rozliczeniowy są ustalane przed startem. Najważniejsze jest jasne określenie zakresu, kosztu i zasad rezygnacji.',
      },
    ],
  },
  {
    slug: 'ile-kosztuje-strona-wordpress-dla-firmy',
    title: 'Ile kosztuje strona WordPress dla firmy i co wpływa na wycenę?',
    metaTitle: 'Ile kosztuje strona WordPress dla firmy? Wycena | CodeFix.IT',
    description:
      'Cena strony WordPress dla firmy zależy od liczby podstron, projektu, treści i integracji. Zobacz, co obejmuje wycena CodeFix.IT i jak przygotować brief.',
    publishedOn: '2026-10-01',
    updatedOn: '2026-10-01',
    readMinutes: 7,
    intent: 'Cena strony WordPress',
    serviceHref: '/strony-wordpress',
    serviceLabel: 'Wyceń stronę WordPress dla firmy',
    intro:
      'Nie podaję jednej ceny dla każdej strony firmowej, bo pięciosekcyjna wizytówka i rozbudowany serwis z integracjami to dwa różne projekty. W CodeFix.IT wycena powstaje po krótkim briefie i obejmuje uzgodniony zakres, WordPress + ACF PRO, wersję mobilną, formularz oraz techniczne podstawy SEO.',
    sections: [
      {
        heading: 'Co najbardziej wpływa na cenę strony WordPress',
        paragraphs: [
          'Największe znaczenie ma liczba unikalnych widoków i podstron, stan materiałów, stopień indywidualizacji projektu oraz integracje. Liczy się także to, czy przebudowujemy istniejącą stronę, czy zaczynamy od zera.',
        ],
        checklist: [
          'liczba podstron i różnych typów sekcji',
          'gotowość tekstów, zdjęć i identyfikacji wizualnej',
          'formularze, mapy, CRM, newsletter i inne integracje',
          'migracja treści ze starej strony',
          'wersje językowe lub dodatkowe funkcje',
        ],
      },
      {
        heading: 'Co traktuję jako podstawę dobrego wdrożenia',
        paragraphs: [
          'Responsywność, formularz kontaktowy, techniczne SEO i możliwość edycji uzgodnionych treści nie powinny być niespodzianką dopisywaną na końcu projektu. Te elementy ustalamy w zakresie przed startem.',
          'Przy większych zmianach pokazuję wersję preview przed publikacją, dzięki czemu produkcja nie jest miejscem do eksperymentów.',
        ],
      },
      {
        heading: 'Jak przygotować brief do wyceny',
        paragraphs: [
          'Wystarczy opisać czym zajmuje się firma, jaki jest główny cel strony, jakie podstrony są potrzebne oraz czy masz już domenę, hosting, logo i treści. Na tej podstawie można ustalić sensowny pierwszy zakres.',
        ],
      },
    ],
    faq: [
      {
        question: 'Czy CodeFix.IT ma stały cennik stron firmowych?',
        answer:
          'Nie. Cena jest ustalana po zakresie, ponieważ liczba podstron, materiały i integracje potrafią znacząco zmienić ilość pracy.',
      },
      {
        question: 'Czy WordPress i ACF PRO są częścią wdrożenia?',
        answer:
          'Tak, jeśli taki zakres został uzgodniony. ACF PRO wykorzystuję do przygotowania edytowalnych sekcji i pól dla typowych treści strony.',
      },
      {
        question: 'Czy mogę najpierw dostać wycenę bez zobowiązania?',
        answer:
          'Tak. Krótki brief służy do ustalenia zakresu i ceny przed rozpoczęciem projektu.',
      },
    ],
  }
];

export const guideByPath = Object.fromEntries(
  wordpressGuides.map((guide) => [`/poradniki/${guide.slug}`, guide]),
);
