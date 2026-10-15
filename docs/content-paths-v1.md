# CodeFix.IT — kontekst przejść do kontaktu

Data: 15 października 2026.

Zmiana zachowuje dotychczasowe parametry źródła wejścia także wtedy, gdy pierwszą odwiedzaną stroną jest poradnik lub portfolio. Formularz główny dołącza kontekst poradnika. Oba formularze odczytują aktualny kontekst przy wysyłce; po sukcesie kolejne zapytanie nie odziedziczy starego poradnika. Błąd zachowuje kontekst do ponownej próby.

Bez dodatkowych pól formularza, treści, zależności ani żądań pomiarowych.

## Weryfikacja lokalna

Typecheck, lint produkcyjny, formatowanie, measurement smoke, budowanie i limity zasobów: PASS. Statyczne SEO: 20 stron, 101 linków wewnętrznych i 6 kotwic.

Końcowy zasób wejściowy: `/assets/index-i63WaJfe.js` (202191 B). Łącznie JavaScript 311566 B, CSS 69711 B; wszystkie istniejące limity spełnione.

## Zakres testów przeglądarkowych

Chromium i WebKit: 52 scenariusze formularzy, w tym sukces, duplikat, honeypot, błędy sieci i odpowiedzi, opcjonalne SDK oraz ponowne zapytanie na tej samej stronie. Żądania leadów i pomiarów przechwytywane lokalnie. Dodatkowe 24 przejścia obejmują wszystkie 9 poradników i 3 realizacje w obu silnikach.

Testy nie wysyłają nowych zapytań do produkcyjnego CRM. Testy WebKit nie oznaczają testu na fizycznym iPhonie.

## Wynik i produkcja

CI #866 i Contact Submission Audit #8: PASS na `f2c7dcd6872d28767375c0012ec2adf87320c810`. Wszystkie 76 scenariuszy przeszło; 54 lokalnie przechwycone wysyłki, 0 rzeczywistych leadów. Dwa scenariusze sprawdziły kolejne zapytanie bez starego kontekstu.

PR #93 opublikowany przez merge `04992c562f3ec5d7dbc7fdc6503d181569539c3e`. CI i SEO Production Smoke po merge: PASS. Produkcja zwraca `/assets/index-i63WaJfe.js`. W przeglądarce potwierdzono nowy zasób, wybrany temat strony firmowej, fokus na imieniu i brak przewijania poziomego. Zrzut znajduje się w `docs/qa/codefix-content-paths-production-20261015.jpg`, wyniki w `docs/qa/content-paths-20261015.json`.
