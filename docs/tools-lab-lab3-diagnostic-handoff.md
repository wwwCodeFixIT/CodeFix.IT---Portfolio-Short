# LAB-3 — osobna funkcja „Przekaż diagnozę” i dodatek do formularza

## Zakres

**Wejście nr 1 — osobna funkcja w Site Doctor**

Po zakończeniu prawdziwego testu Lighthouse odwiedzający widzi odrębny panel **„Z wyniku do zgłoszenia”** (nie zwykły link). Może jednym kliknięciem przenieść *skrócone dane techniczne* do formularza Quick Fix: adres publicznej strony **bez parametrów query**, datę pomiaru, trzy oceny i maksymalnie sześć ostrzeżeń. Pełny raport i komentarz AI **nie** są automatycznie dołączane. Link „Napisz bez diagnozy” zachowuje standardowy przepływ.

**Wejście nr 2 — funkcja wewnątrz formularza**

Krok „Szczegóły” zawiera osobny, opcjonalny panel Site Doctor: uruchom test, wstaw ostatni raport albo wklej go ręcznie, **zaznacz checkbox dołączenia**, usuń wynik przed wysłaniem. Pole na adres witryny można wstępnie wypełnić z raportu, ale nie nadpisuje ręcznie wpisanego URL. Krok „Kontakt i podsumowanie” informuje o obecności raportu; istniejące „Skopiuj brief” zawiera dokładnie tę samą treść, co payload wysyłany do CRM.

Nie dodajemy nowych pól w kontrakcie backendu /api/public/leads. Raport jest **jawnie dołączany do istniejącego pola `message`** (maks. 4000 znaków łącznie, jak wcześniej); limit pola opisu dostosowuje się do obecności raportu. Formularz bez raportu wysyła dokładnie jak wcześniej.

## Prywatność i bezpieczeństwo

- Dane krótkiego raportu są zapisywane w `sessionStorage` **wyłącznie po kliknięciu „Dołącz diagnozę do zapytania”**. Nie zapisujemy imienia, e-maila, wpisanego opisu problemu, komentarza AI ani pełnego URL z query/fragmentem.
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

## Kolejność PR

Ten Draft PR ma bazę `feat/site-doctor-lab2-20261016` (#110), który jest zależny od #109, a ten od #108. Zachować kolejność, nie scalać ani nie publikować do czasu zatwierdzenia release gate.
