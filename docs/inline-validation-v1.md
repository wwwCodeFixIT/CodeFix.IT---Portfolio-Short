# Błędy przy polach formularza — 16.10.2026

PR #101: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/101.

Kandydat: `7a0b8b03e02ec77fc74853ecf2d669d06298853e`; drzewo `299f97afb3172626d4642ad9ad51ff5c997beeca`. Runtime: `/assets/index-BQzuZQHJ.js`.

## Zachowanie

Wspólny komponent LeadField obsługuje pola kreatora na stronie głównej i formularzy podstron usług. Po nieudanej próbie przejścia lub wysłania pojawia się krótki błąd pod polem. Pusta wartość, same spacje w wymaganym polu, minimum/maksimum znaków oraz niepoprawny e-mail lub URL są wyjaśniane przy odpowiedniej kontrolce. Początkowo nie wyświetla się błędów. Puste, nietknięte pola zachowują natywne required bez własnego customError.

Po pierwszej walidacji komunikat aktualizuje się podczas pisania; poprawna wartość usuwa go. Zmiana zakresu, realizacji lub kalkulatora przelicza aktualny limit i istniejący błąd bez obcinania tekstu. Reset po poprawnej wysyłce usuwa własną walidację i widoczne błędy. Zachowano nazwy pól, ich wartości, autocomplete oraz kontrakt wysyłki.

Etykiety są połączone przez htmlFor/id. Błąd ma role=alert, aria-describedby i aria-invalid. Zastąpiono dymek przeglądarki trwałym komunikatem pod polem. Focus trafia do pierwszego błędnego pola synchronicznie; przy ujawnieniu wcześniejszego kroku jest przekazywany w useLayoutEffect. Nie ma opóźnionego reportValidity ani nowych animacji.

## Weryfikacja lokalna i wydajność

PASS: TypeScript, lint produkcyjny i obu skryptów QA, formatowanie, build, limity zasobów, statyczne SEO (20 stron, 101 linków, 6 kotwic), measurement smoke i diff check. React: wspólny komponent, stan lokalny dla pola, powiązane etykiety i błędy, synchroniczny focus, brak nowych zależności.

| Zasób                  |    Wynik |    Limit |
| ---------------------- | -------: | -------: |
| Entry JS               | 202191 B | 215000 B |
| Największy deferred JS |  49331 B |  50000 B |
| Cały JS                | 326145 B | 327000 B |
| Największy CSS         |  38178 B |  40000 B |
| Cały CSS               |  77763 B |  78000 B |

Wzrost sumy JS względem poprzedniej produkcji: 649 B. Wspólne pola zmniejszyły HomepageV1 z 49930 do 49331 B. Całkowity limit JS jawnie podniesiono z 326000 do 327000 B; limit entry, pojedynczego chunku i CSS bez zmian.

## Przeglądarki

- CI #919: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38833935426 — success.
- Contact Submission Audit #28: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38833935424 — success. 112 scenariuszy: 12 podglądu realizacji, 12 kreatora, 52 wysyłki, 24 ścieżki poradników i projektów oraz 12 przykładu automatyzacji.
- Chromium i WebKit, szerokości 320/390/1280 i obie preferencje ruchu. Dodatkowe asercje 12 kombinacji kreatora kontrolują początkowy stan, wymagany URL i format, minimum/maksimum, powiązanie błędu i focus, korektę, ponowne pojawienie się błędu oraz zmianę zakresu bez obcięcia opisu. Dwie ścieżki natywnego formularza usługi kontrolują wymagane dane, spacje, e-mail, focus, brak żądania przy błędzie i czyszczenie po sukcesie. Dotychczasowe asercje wysyłki, schowka i pozostałych interakcji zachowano.
- 78 przechwyconych żądań testowych, 0 rzeczywistych zgłoszeń.

W końcowym podglądzie Cloudflare `https://8a3d2b05.codefix-it---portfolio-short.pages.dev/#contact` ręcznie potwierdzono runtime, brak początkowych błędów i customError w pustych polach, wymagany adres, komunikat minimum opisu, focus, usuwanie błędu po korekcie oraz brak przepełnienia poziomego. Bez wysyłki formularza.

## Produkcja

Commit `c82964eaca81130ed24cd44859e152052642bc72`; drzewo identyczne z końcowym kandydatem. CI 38834497572, SEO Production Smoke 38834497557, Pages 38834497294 oraz Cloudflare Pages 116760562923 zakończone sukcesem.

Na https://codefix.it/#contact ręcznie potwierdzono runtime, stan początkowy, błąd wymaganego adresu, format URL, minimum opisu, powiązanie komunikatu z polem, focus oraz usunięcie błędów po korekcie. Brak poziomego przepełnienia. Pola kontaktowe pozostały puste, formularza nie wysyłano. Zrzut z przykładowym, celowo krótkim opisem: `qa/codefix-inline-validation-production-20261016.jpg`.

Szczegóły: `qa/inline-validation-20261016.json`. Raport i zrzut archiwizowane w gałęzi `reports/inline-validation-20261016`, bez kolejnego wdrożenia aplikacji.

Testy CI przechwytują zgłoszenia i pomiary. Nie wykonywano rzeczywistej wysyłki do CRM, nowego Lighthouse, testu na fizycznym iPhonie ani na rzeczywistym profilu autouzupełniania lub menedżerze haseł.
