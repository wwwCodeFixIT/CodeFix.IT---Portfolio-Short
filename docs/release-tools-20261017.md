# Wspólny kandydat wydania — 17.10.2026

Gałąź `feat/release-tools-20261017` zbiera zmiany z PR #108–#112 w jeden PR do `main`. Punktem wyjścia jest `742f1b6ffc73aa62921969994c0e9b90c9f09dae`; zawiera aktualny `main` (`d147f93fd6552d02655b8f8acb81645a9278126d`). Dotychczasowe gałęzie zachowują swoją historię. Tego kandydata należy przeglądać jako całość, a nie scalać równolegle ze stosem poprzednich PR.

## Zakres

- Nawigacja mobilna z obsługą klawiatury i zamykania.
- Laboratorium: brief projektu, podgląd SEO, kontrast oraz skaner Site Doctor.
- Diagnoza otwierana z formularza bez utraty wpisanych danych; dobrowolne dołączenie raportu do istniejącego zgłoszenia.
- Jawna obsługa niepełnego raportu i poprawny wybór usługi po wygenerowaniu briefu.
- Lokalna mapa automatyzacji z etapami, wyjątkami i zakresem do skopiowania.

Opis działania i ograniczeń poszczególnych narzędzi pozostaje w dokumentacji etapów. Ten kandydat nie zmienia konfiguracji usług zewnętrznych ani produkcji.

## Poprawki integracyjne

Na stronie głównej i `/narzedzia/` ustawienia prywatności są dostępne w stopce. Nie ma tam dodatkowego pływającego przycisku, który na telefonie zasłaniał opisy i kontrolki. Pierwszy wybór pomiarów nadal wyświetla się przy braku zapisanej decyzji. Na pozostałych trasach pozostaje dotychczasowy przycisk pływający.

Po zapisaniu wyboru fokus wraca do przycisku otwierającego panel, także po jego ponownym zamontowaniu na stronach usług. Kliknięcie ustawia fokus przed otwarciem również w Safari. Zmiana ustawień nie demontuje formularza ani mapy. Zasady niezależnej zgody na analitykę i reklamy pozostają takie same.

Produkcyjny test menu osobno raportuje zablokowany skrypt Cloudflare Insights wstrzyknięty przez hosting. Skrypt nadal jest blokowany; pozostałe żądania zewnętrzne i zapisy nadal powodują błąd testu. Dzięki temu pasywna wstawka hostingu nie jest mylona z żądaniem wykonanym przez nawigację.

## Kontrole wspólnej wersji

Lokalnie przechodzą: TypeScript aplikacji i API Site Doctor, ESLint, formatowanie, build, SEO statyczne, kontrakt pomiarów, estymator, ruch tła, API skanera, przekazanie raportu, mapa automatyzacji i regresja mobilnego CTA. Mapa obejmuje 144 prawidłowe konfiguracje; kontrola statyczna obejmuje 21 stron, 154 linki wewnętrzne i 54 kotwice.

Build bez zwiększania limitów:

| Zasób | Bajty | Limit |
| --- | ---: | ---: |
| Entry JS | 202793 | 215000 |
| Największy odroczony JS | 57199 | 58000 |
| Łączny JS | 379876 | 380000 |
| Największy CSS | 40641 | 41000 |
| Łączny CSS | 101351 | 102000 |

Runtime: `/assets/index-DigwM1qb.js`. Brak nowych zależności.

Uzupełnienie backendu i gotowa konfiguracja aktywacji są opisane w [tools-activation-20261017.md](tools-activation-20261017.md). Obejmują odrzucanie niepełnych odpowiedzi modeli, limity danych zgodne z UTF-8, testy API briefu i dodatkowe testy dostawców skanera oraz kontrolę wdrożenia przez GET. Bramka dostępności jest opisana poniżej.

Testy przeglądarkowe uruchamia GitHub Actions na statycznym buildzie z PR:

1. Istniejąca pełna regresja kontaktu, nawigacji i interakcji w Chromium/WebKit.
2. Site Doctor i brief z przechwyconymi odpowiedziami dostawców i CRM, mapa automatyzacji z blokadą żądań zewnętrznych.
3. Nowa regresja prywatności: Chromium/WebKit × 320/390/1280 px × strona główna/narzędzia/usługa (18 scenariuszy). Pierwszy wybór, dostęp do ustawień, brak pływającego duplikatu, mysz i klawiatura, powrót fokusu, zachowanie danych formularza i mapy, ponowne załadowanie, brak poziomego przewijania i brak żądań zewnętrznych lub zapisów.

Wyniki dla konkretnego SHA oraz zrzuty ekranu są w checkach i opisie zbiorczego PR. Testy nie wysyłają rzeczywistych zgłoszeń i nie korzystają z płatnych modeli.

## Publikacja

To kandydat do przeglądu, nie zapis wdrożenia. Przed scaleniem należy ocenić checki najnowszego SHA i zrzuty z testów wspólnej wersji. Po publikacji dotychczasowy workflow SEO sprawdza stronę produkcyjną i zgodność runtime'u menu. Aktywacja dostawców AI/PageSpeed oraz weryfikacja ich prawdziwych odpowiedzi stanowią osobny etap konfiguracji; test z atrapami nie potwierdza działania skonfigurowanej usługi na produkcji.

## Publikacja z integracjami wyłączonymi

Domyślnym narzędziem jest działający lokalnie asystent briefu. GET `/api/tool-status` ujawnia wyłącznie dwa booleany, zgodne z warunkami aktywacji endpointów. Poza produkcyjnym originem oba są wyłączone. Przycisk AI i formularz diagnozy są dostępne po potwierdzeniu konfiguracji. Niepowodzenie odczytu nie blokuje lokalnych narzędzi; ponowienie zachowuje pola i fokus. Enter w briefie zawsze uruchamia tryb lokalny.

Odczyt konfiguracji jest współdzielony między komponentami w karcie i ograniczony do 5 sekund. Test API porównuje 64 konfiguracje z rzeczywistymi bramkami POST oraz odrzuca 3 obce originy. Test przeglądarkowy obejmuje 32 warianty obu silników i trzech szerokości: integracje off/on, osobna dostępność skanera i AI, lokalny Enter, domyślne opt-in wyłączone, retry po błędzie i timeout.

Po publikacji workflow sprawdza aktualny runtime, trzy endpointy GET oraz lokalny brief i mapę na produkcji w Chromium/WebKit przy 320/390/1280 px. Cały etap produkcyjny blokuje POST i zewnętrzne żądania; nie uruchamia modeli, pomiaru PageSpeed ani CRM. Sekrety, WAF i przełączniki usług nie są zmieniane przez publikację kodu.
