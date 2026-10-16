# LAB-3 — osobna funkcja „Przekaż diagnozę” i dodatek do formularza

## Zakres

**Wejście nr 1 — osobna funkcja w Site Doctor**

Po zakończeniu prawdziwego testu Lighthouse odwiedzający widzi odrębny panel **„Z wyniku do zgłoszenia”** (nie zwykły link). Może jednym kliknięciem przenieść *skrócone dane techniczne* do formularza Quick Fix: adres publicznej strony **bez parametrów query**, datę pomiaru, trzy oceny i maksymalnie sześć ostrzeżeń. Pełny raport i komentarz AI **nie** są automatycznie dołączane. Link „Napisz bez diagnozy” zachowuje standardowy przepływ.

**Wejście nr 2 — funkcja wewnątrz formularza**

Krok „Szczegóły” zawiera osobny, opcjonalny panel Site Doctor: uruchom test, wstaw ostatni raport albo wklej go ręcznie, **zaznacz checkbox dołączenia**, usuń wynik przed wysłaniem. Pole na adres witryny można wstępnie wypełnić z raportu, ale nie nadpisuje ręcznie wpisanego URL. Krok „Kontakt i podsumowanie” informuje o obecności raportu; istniejące „Skopiuj brief” zawiera dokładnie tę samą treść, co payload wysyłany do CRM.

Uruchomienie diagnozy z formularza otwiera natywne okno modalne. Formularz zgłoszenia pozostaje zamontowany; temat, opis, adres i dane kontaktowe zachowują wartości. Skaner ładuje się na żądanie, poza formularzem zgłoszenia (bez zagnieżdżania formularzy). Dołączenie wyniku wraca do tego samego zgłoszenia bez nawigacji. Escape, przycisk zamknięcia i kliknięcie tła zamykają okno; aktywny pomiar jest anulowany przy jego usunięciu.

Nie dodajemy nowych pól w kontrakcie backendu /api/public/leads. Raport jest **jawnie dołączany do istniejącego pola `message`** (maks. 4000 znaków łącznie, jak wcześniej); limit pola opisu dostosowuje się do obecności raportu. Formularz bez raportu wysyła dokładnie jak wcześniej.

## Prywatność i bezpieczeństwo

- Na osobnej stronie narzędzi dane krótkiego raportu są zapisywane w `sessionStorage` **wyłącznie po kliknięciu „Dołącz diagnozę do zapytania”**. W oknie otwartym z formularza raport trafia bezpośrednio do stanu tego formularza, bez zapisu w pamięci przeglądarki. Nie zapisujemy imienia, e-maila, wpisanego opisu problemu, komentarza AI ani pełnego URL z query/fragmentem.
- Format z wersją `1`, datą utworzenia i **TTL 15 minut**; odczyt odrzuca wersje niezgodne/uszkodzone/przeterminowane oraz czyści taki wpis, gdy magazyn danych jest dostępny. Usunięcie raportu i poprawne wysłanie formularza również kasują wpis.
- Nieudany zapis nie przenosi użytkownika z fałszywą obietnicą dołączenia; pokazujemy instrukcję kopiowania ręcznie.
- Przekazanie do CRM wymaga również zaznaczenia checkboxa, choć kliknięcie dedykowanej akcji Site Doctor ustawia go jako wybrany (zawsze możliwość odznaczenia/usunięcia).
- Treści raportu, nawet jeśli zmienione ręcznie, pozostają zwykłym tekstem: React renderuje bez `dangerouslySetInnerHTML`; długość ograniczona i walidowana razem z wiadomością.
- Żadnego nowego API i żadnych dodatkowych kosztów AI/Google przy samym przekazaniu raportu.

## Kontrola jakości

```bash
npm ci
npm run typecheck
npm run lint
npm run lint:production
npm run format:check
npm run doctor:smoke
npm run doctor:handoff:smoke
npm run build
npm run seo:static
npm run build:budget
```

Manual QA: mobile 320/375/390 px i desktop; klawiatura/screen reader; odrzucone i przeterminowane sessionStorage; checkbox wyłączony = brak raportu w wysyłce; tekst własny = wymaga włączenia; usunięcie = brak w podsumowaniu; limit 4000 znaków; powrót do poprzedniego kroku; nieudany CRM request zachowuje treść; udana wysyłka czyści wpis. **Żadna aktywacja Site Doctor API ani deployment produkcyjny nie jest częścią tego PR.**

## Poprawki po przeglądzie draftów

- Całkowicie pusty pomiar Lighthouse kończy się błędem 502. Częściowy wynik zawiera informację o brakujących danych również w skróconym raporcie. Komunikat o braku ostrzeżeń wymaga kompletnych wyników podstawowych kontroli i trzech ocen.
- CTA asystenta briefu wybiera usługę zgodną z wygenerowanym wynikiem: strona → `CODEFIX_BUSINESS_SITE`, aplikacja → `development`, naprawa → `WORDPRESS_QUICK_FIX`, opieka → `WORDPRESS_CARE`. Edycja selektora po generowaniu lub podczas oczekiwania na AI nie zmienia tematu wcześniejszego wyniku.
- Regresje API i handoffu obejmują pusty, częściowy, poprawny i mieszany raport. Testy przeglądarkowe obejmują Chromium i WebKit, szerokości 390/1280 px, cztery ścieżki zgłoszenia, zachowanie pól formularza, zamykanie Escape, brak zapisu prywatnych danych oraz cztery tematy briefu, fallback 503 i zmianę selektora podczas odpowiedzi AI.
- Dostawcy Google/OpenAI i CRM są przechwytywani przez mocki. Testy nie potwierdzają aktywnej integracji produkcyjnej z tymi usługami.
- Oba workflow przeglądarkowe uruchamiają się także dla bazy obecnego stosu draftów (`feat/site-doctor-lab2-20261016`). Pełna regresja formularza działa przed scaleniem stosu do `main`.
- Pomiar builda: 368260 B JS łącznie, 202522 B entry, 57162 B największej odroczonej trasy, 97295 B CSS. Limit tej trasy podniesiono z 56 do 58 kB dla natywnego okna i jego wyzwalacza; limity entry i sumy JS/CSS pozostają dotychczasowe. Brak nowych zależności.

## Kolejność PR

Ten Draft PR ma bazę `feat/site-doctor-lab2-20261016` (#110), który jest zależny od #109, a ten od #108. Zachować kolejność, nie scalać ani nie publikować do czasu zatwierdzenia release gate.
