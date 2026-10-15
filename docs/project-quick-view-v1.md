# Podgląd realizacji i odniesienie w briefie — 15.10.2026

Wdrożenie: PR #99, https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/99.

Produkcja: `785c0f665b11e492d6d3b787d25d38802d8d9a62`; drzewo `0c7ebf6c9ece0c0c98473505edb8c4ea2ee265e1`, identyczne z testowanym kandydatem `f79b3a9de399e3abfe2f930c0f859bc05a0f8963`. Runtime: `/assets/index-CboGs3lx.js`.

## Działanie

Miniatury trzech realizacji na stronie głównej otwierają jeden natywny dialog. Podgląd pokazuje prawdziwe, istniejące zrzuty komputerowe i mobilne oraz cel, zakres autora i efekt z katalogu projektów. Współpraca z SyloSoftware pozostaje jawnie opisana. Zachowano osobne linki do pełnych case studies i działających stron.

Okno obsługuje Escape, przycisk zamknięcia, kliknięcie tła oraz cykliczne Tab/Shift+Tab. Początkowy focus trafia na tytuł, a po zamknięciu wraca do miniatury. Przewijanie tła jest blokowane tylko w czasie otwarcia. Nagłówek z zamknięciem pozostaje widoczny podczas przewijania okna. Zawartość oraz CSS podglądu są pobierane dopiero po wyborze projektu; szybka zmiana wyboru podczas pobierania kończy się jednym oknem.

„Chcę podobną stronę” wybiera usługę nowej strony i otwiera krok szczegółów. Realizacja jest widocznym, usuwalnym punktem odniesienia w szczegółach i podsumowaniu. Do istniejącego pola message dołączany jest tytuł i adres case study. Nie nadpisuje się opisu, adresu strony ani danych kontaktowych. Dodatkowy tekst jest uwzględniony w limicie 4000 znaków; zbyt długi opis wymaga skrócenia przez użytkownika i nie jest obcinany. Zmiana usługi oraz prawidłowa wysyłka czyszczą odniesienie. Przy błędzie API pozostają zarówno treść, jak i wybrany projekt.

## Weryfikacja

- Lokalnie PASS: TypeScript, lint produkcyjny i nowego skryptu, formatowanie, build, limity zasobów, SEO statyczne (20 stron, 101 linków, 6 kotwic), measurement smoke.
- CI #911: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38806387842 — success.
- Contact Submission Audit #25: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38806387849 — success. 106 przypadków: 12 nowych kombinacji podglądu, 6 kombinacji kreatora, 52 scenariusze wysyłki, 24 ścieżki treści, 12 kombinacji przykładu automatyzacji.
- Chromium i WebKit; szerokości 320/390/1280; obie preferencje ruchu. Sprawdzono obrazy, granice okna i przepełnienie, cele dotykowe 44 px, klawiaturę, zamykanie, focus, szybkie wybory, zachowanie danych, walidację łącznej długości, usunięcie odniesienia, zmianę usługi, błąd API oraz ponowienie i sukces.
- Przechwycono 78 żądań testowych; 0 rzeczywistych leadów. Nowa ścieżka nie wykonuje zewnętrznych żądań poza przechwyconymi wysyłkami.
- Pierwszy audyt #23 przeszedł wcześniejsze 94 przypadki i wykrył wyjście fokusu z natywnego okna przy Tab z ostatniego linku. Dodano cykliczne granice Tab/Shift+Tab.
- Audyt #24 przeszedł 9 nowych kombinacji i wykrył w WebKit wyścig szybkiego „Wstecz” z opóźnionym przeniesieniem fokusu. Przeniesiono focus do useLayoutEffect, także dla ponownego wyboru tej samej realizacji. Zachowano szybkie interakcje i wszystkie asercje testów. Końcowy pełny przebieg #25 przeszedł.
- W aktualnym preview ręcznie potwierdzono wygląd, przełączanie zrzutu, przekazanie odniesienia, zamknięcie Escape, powrót fokusu, odblokowanie przewijania, zawijanie Tab oraz szybki powrót w formularzu.

## Wydajność

Bez nowych zależności. Entry 202191/215000 B; HomepageV1 49875/50000 B; JS 324483/326000 B; największy CSS 37610/40000 B; CSS 77195/78000 B. Moduł podglądu ma ok. 3.07 KB JS (gzip 1.29 KB) i 2.88 KB CSS (gzip 1.03 KB), ładowane po wyborze. Całkowite limity JS i CSS zwiększono jawnie z 320000 do 326000 B i z 74000 do 78000 B, odpowiednio do nowej funkcji. Entry i limity pojedynczych chunków pozostają bez zmian.

## Produkcja

CI 38807174306, SEO Production Smoke 38807175421, Pages 38807173576 oraz Cloudflare Pages 116671135602 zakończone sukcesem. Na codefix.it potwierdzono runtime, otwarcie okna, dołączenie projektu do szczegółów formularza, odblokowanie przewijania oraz brak przepełnienia poziomego. Podczas kontroli raz pojawił się tekst awaryjny wcześniejszego modułu automatyzacji; po ponownym załadowaniu strony moduł był dostępny. Przyczyny pojedynczego fallbacku nie potwierdzono.

- https://codefix.it/#work — `qa/codefix-project-quick-view-production-20261015.jpg`.
- https://codefix.it/#contact — `qa/codefix-project-reference-production-20261015.jpg`.

Szczegółowe dane: `qa/project-quick-view-20261015.json`. Raport i zdjęcia są archiwizowane w gałęzi `reports/project-quick-view-20261015`, bez dodatkowego wdrożenia na main.

Testy przeglądarek wykonano na buildzie produkcyjnym z przechwytywaniem wysyłek i pomiarów. WebKit nie zastępuje fizycznego iPhone'a. Nie wykonywano nowego Lighthouse ani rzeczywistej wysyłki do CRM.
