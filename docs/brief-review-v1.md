# Kopiowanie briefu i przejścia formularza — 16.10.2026

PR #100: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/100.

Kandydat: `3f8e452e7ca48fb8f2a810daaf91e33b1bc7eb65`; drzewo `e80eb757f67b3525e84750222ae8db355a20817e`. Runtime: `/assets/index-PW41QdIF.js`.

## Zachowanie

W ostatnim kroku formularza „Skopiuj brief” kopiuje temat, podany adres strony i pełną wiadomość: opis, zaznaczony zakres, odniesienie do realizacji oraz zakres z kalkulatora. Kopia i wysyłka korzystają ze wspólnej funkcji składania wiadomości. Pola imienia, e-maila i firmy nie są dołączane do kopii.

Przycisk pobiera osobny moduł dopiero przy podsumowaniu. Zarezerwowano dla niego miejsce podczas ładowania. Potwierdzenie „Skopiowano” pojawia się dopiero po zakończeniu zapisu; komunikat dla czytnika ekranu korzysta z role=status. Odmowa dostępu albo brak Clipboard API pokazuje pole tylko do odczytu z pełną, zaznaczoną treścią do ręcznego kopiowania. Ponowienie błędu ponownie przenosi focus do tego pola. Oczekiwanie na schowek nie blokuje edycji kroków. Zmiana treści lub usunięcie załącznika usuwa nieaktualne potwierdzenie.

Kroki przechodzą przez delikatne przenikanie 140 ms, bez animowania położenia pól i bez oczekiwania na zakończenie animacji. Efekt i przejście obramowania postępu działają tylko przy prefers-reduced-motion: no-preference. Zachowano synchroniczny focus, wszystkie pola i dotychczasową walidację. Skrócono wskazówki i placeholdery.

## Kontrole lokalne

PASS: TypeScript, lint produkcyjny i obu skryptów QA, formatowanie, build, limity zasobów, statyczne SEO (20 stron, 101 linków, 6 kotwic), measurement smoke i diff check. Przegląd React: moduł na żądanie, mały stan lokalny, feedback powiązany ze skopiowaną wersją, synchroniczny focus ręcznego fallbacku, brak nowych zależności.

| Zasób                  |    Wynik | Dotychczasowy limit |
| ---------------------- | -------: | ------------------: |
| Entry JS               | 202191 B |            215000 B |
| Największy deferred JS |  49930 B |             50000 B |
| Cały JS                | 325496 B |            326000 B |
| Największy CSS         |  37991 B |             40000 B |
| Cały CSS               |  77576 B |             78000 B |

Moduł kopiowania: ok. 0.96 KB JS, gzip 0.60 KB. Limitów nie zwiększano.

## Przeglądarki i wdrożenie

- CI #914: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38821678644 — success.
- Contact Submission Audit #26: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38821678693 — success. 112 przypadków: 12 podglądu realizacji, 12 kreatora, 52 wysyłki, 24 ścieżki poradników i projektów, 12 przykładu automatyzacji.
- Chromium i WebKit, szerokości 320/390/1280, obie preferencje ruchu. Sprawdzono szybką nawigację bez oczekiwania na efekt, klawiaturę, zachowanie pól i limity opisu. Schowek: sukces, odmowa, brak API, oczekująca operacja i powrót do edycji, odświeżenie opisu, zmiana usługi, zakres z kalkulatora oraz odniesienie do realizacji. Kopia odniesienia jest zgodna z przechwyconym payloadem; usunięcie projektu usuwa stare potwierdzenie.
- 78 przechwyconych żądań testowych, 0 rzeczywistych zgłoszeń. Wszystkie asercje pełnego zestawu zachowano.

W niezmiennym podglądzie Cloudflare `https://83507fd4.codefix-it---portfolio-short.pages.dev/#contact` ręcznie potwierdzono runtime, krótszą wskazówkę, przejścia, widoczny focus, brak przepełnienia poziomego i prawdziwy zapis do schowka. Wpisano wyłącznie przykładowy opis, bez danych kontaktowych i bez wysyłki.

Produkcja: `c0d29abe3a41ce3969bf002ce8b0f78bafdf2b0f`, drzewo identyczne z kandydatem. CI 38822507697, SEO Production Smoke 38822507672, Pages 38822506429 i Cloudflare Pages 116722271856 zakończyły się sukcesem. Na https://codefix.it/#contact ręcznie potwierdzono runtime, przejście do podsumowania, zapis do prawdziwego schowka oraz brak poziomego przepełnienia. Pola kontaktowe pozostały puste, formularza nie wysyłano. Zrzut: `qa/codefix-brief-review-production-20261016.jpg`.

Szczegóły: `qa/brief-review-20261016.json`. Raport i zrzut archiwizowane w gałęzi `reports/brief-review-20261016`, bez kolejnego wdrożenia aplikacji.

Testy CI używają przechwyconych wysyłek i pomiarów. Nie wykonywano rzeczywistej wysyłki do CRM, nowego Lighthouse ani testu na fizycznym iPhonie.
