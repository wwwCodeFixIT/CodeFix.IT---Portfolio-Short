# Spokojniejszy przykład automatyzacji i formularz — 15.10.2026

Wdrożono w PR #98: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/98

Produkcja: `3881a6266ae2dc167f4d47be8f520dbbbb065455`; drzewo `40a49b38b721a87b968a69fbb3661ba10300b88f`. Wersja testowana przed scaleniem: `e465cd54469f5af6fc71cb506f33e306e7bd12e4`, z identycznym drzewem. Runtime na codefix.it: `/assets/index-B1h3rdGq.js`.

## Zmiana

Sekcja aplikacji ma źródło i wynik obok siebie oraz trzy ręczne przykłady: podgląd szkicu odpowiedzi, wskazanie brakującego adresu dostawy i odwracalną akceptację projektu. Wybranie innego przykładu resetuje rozwinięcie. Usunięto odtwarzacz, automatyczne przełączanie, numerowane etapy i przyciski sterowania pokazem. Treści są oznaczone jako dane przykładowe. To lokalne interakcje ilustracyjne; nie uruchamiają AI ani zapisu do systemów zewnętrznych.

Pierwszy krok formularza ma własną listę wierszy, delikatne separatory, ikonę wyboru i jedną krótką wskazówkę przy zaznaczonym temacie. Pasek postępu pokazuje „Temat / Szczegóły / Kontakt”. Numer kroku jest dostępny dla czytników ekranu. Nazwy przycisków, aria-current, aria-pressed, opis zaznaczenia, walidacja, zachowanie danych, focus i dotychczasowy format zapytania pozostają obsługiwane przez istniejący formularz.

## Weryfikacja

- Lokalnie PASS: TypeScript, lint produkcyjny i skryptów QA, formatowanie, build, limity zasobów, measurement smoke oraz SEO statyczne: 20 stron, 101 linków, 6 kotwic.
- CI #904: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38788809065 — success.
- Contact Submission Audit #22: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38788809077 — success. 94 przypadki: 6 kombinacji formularza, 52 scenariusze wysyłki, 24 ścieżki treści i 12 kombinacji nowego przykładu.
- Nowy przykład sprawdzono w Chromium i WebKit, na szerokościach 320/390/1280 oraz dla obu preferencji ruchu. Kontrolowano klawiaturę, nazwy i stany przycisków, odwracalność akcji, reset po zmianie przykładu, minimalne cele dotykowe 44 px, przepełnienie i błędy strony.
- Wysłano 54 przechwycone żądania testowe; 0 rzeczywistych zapytań. Test przykładu wymagał 0 żądań zewnętrznych.
- Pierwszy audyt #21 zatrzymał się na błędnym selektorze testu: szukał nazwy „Podejrzyj odpowiedź” po prawidłowej zmianie przycisku na „Zwiń odpowiedź”. Poprawiono wyłącznie selektor rozwiniętego stanu; nowy pełny przebieg przeszedł.
- Po scaleniu: CI 38789612148, SEO Production Smoke 38789612253, Pages 38789610594 i Cloudflare Pages 116610619494 — success.
- Ręcznie na produkcji potwierdzono właściwy runtime, rozwinięcie szkicu odpowiedzi, nową listę tematów, etykiety postępu i brak przepełnienia poziomego w widoku desktopowym.

## Zasoby

JS 319105/320000 B; entry 202191/215000 B; HomepageV1 49359/50000 B. Moduł przykładu zmalał z ok. 3.75 do 2.69 KB. CSS wzrósł o 1764 B do 73437 B z powodu osobnych stylów przepływu pracy, listy tematów i postępu. Jawny limit całego CSS podniesiono z 72000 do 74000 B; pozostałe limity pozostały bez zmian. Największy arkusz ma 37610/40000 B.

## Potwierdzenie wyglądu

- https://codefix.it/#applications — `qa/codefix-workflow-refined-production-20261015.jpg`.
- https://codefix.it/#contact — `qa/codefix-brief-refined-production-20261015.jpg`.

Pełne wyniki: `qa/refined-interactions-20261015.json`. Raport i zdjęcia są archiwizowane w gałęzi `reports/refined-interactions-20261015`, bez dodatkowego wdrożenia na main.

Test przeglądarek wykonano na lokalnym buildzie produkcyjnym z przechwytywaniem wysyłek i pomiarów. WebKit nie zastępuje fizycznego iPhone'a. Nie wykonywano nowego Lighthouse ani rzeczywistej wysyłki do CRM.
