# SALES 4.1 — Quick Fix landing: dopasowanie przekazu do zapytań

Data przeglądu: 9 października 2026 (pierwsze dostępne dane do 8 października).

## Co wiemy
- Google Ads: kampania `CF | Search | Quick Fix WordPress | PL | 2026-10`, 6 kliknięć, 98,78 PLN kosztu, 0 raportowanych konwersji, od 6 do 8 października.
- Google Ads jako final URL reklam rzeczywiście zwraca `https://codefix.it/naprawa-wordpress/`. Nie wykryto błędnego przekierowania w konfiguracji reklam.
- Widoczne zapytanie o wysokiej intencji: `błąd krytyczny wordpress` — 1 kliknięcie za 17,92 PLN. Reszta widocznych zapytań to przede wszystkim liczne, nieopłacone (0 kliknięć) wyświetlenia; nie należy na ich podstawie masowo dodawać wykluczeń.
- GA4 od 6 do 8 października: `google / cpc` 5 sesji, 0 sesji zaangażowanych i 0 konwersji; nie wykazuje odsłon `/naprawa-wordpress/` w zestawieniu `page_path`. GA4 jest zależne od dobrowolnej zgody; z tych danych nie wynika, że rzeczywiste odwiedziny na landingu nie nastąpiły, ani że strona na pewno nie angażuje. Rozbieżność wymaga monitorowania, nie automatycznego podnoszenia budżetu.
- Na stronie już są: konkretna oferta, cena od 390 zł, wyjaśnienie zakresu, CTA do formularza, adres strony, wiadomość, testy po naprawie i zasada bez loginu na start. Żadnej z tych funkcji nie usuwamy i nie duplikujemy.

## Jedna zmiana w tym etapie

Plik: `public/data/service-landings.json`, wyłącznie `/naprawa-wordpress.description`.

Zmieniono opis Hero z wyliczenia objawów na krótszy komunikat rozpoczynający się od „Błąd krytyczny WordPress?”. Pozostaje transparentne wezwanie do przesłania URL + jednego objawu, brak konieczności podawania loginu oraz potwierdzenie ceny przed rozpoczęciem pracy.

Bez zmian w cenniku, formularzu, API, tracking/consent, SEO meta, kampanii, stawkach i budżecie. W wyniku zmiany danych publicznych nie dokładamy zależności do JS.

## Weryfikacja / dalsza decyzja
1. CI: lint, build/prerender, accessibility/content smoke, SEO, limity CSS/JS.
2. Cloudflare branch preview: przekaz jest widoczny na `/naprawa-wordpress/` oraz nie zmienił się layout/CTA/formularz ani zgody.
3. Nie wysyłać leadów testowych na produkcję.
4. Po wdrożeniu analizować przez kolejnych 7–14 dni **rzeczywiste zewnętrzne leady**, kliknięcia Google Ads, wyszukiwane hasła i zdarzenia `generate_lead` z rozróżnieniem testów. Dane z kilku kliknięć nie uprawniają do stwierdzenia poprawy konwersji.
5. Nie dodawać kolejnych funkcji ani wykluczeń przed zebraniem danych.

W tym etapie nie udajemy, że wykonano A/B test lub że zmiana zwiększy sprzedaż. To niewielkie, odwracalne dopasowanie treści do znanej intencji wyszukiwania.

## Wynik kontroli podglądu
- [GitHub Actions — SALES 4.1 landing preview QA, run 37861678259](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/37861678259): **PASS 8/8** porównań Chromium i WebKit (baseline vs preview, 390 oraz 1440 px).
- Rzeczywisty React Hero w podglądzie pokazuje nowy opis; produkcja w chwili testu pokazuje poprzedni. Cena `Od 390 zł`, CTA `#kontakt`, wymagalność URL, SEO canonical, brak horizontal overflow i brak pageerror: PASS.
- Testy przeglądarkowe nie wysłały żadnych leadów ani pomiarów do CRM/Analytics. Tymczasowe narzędzia QA usuwamy z finalnego PR, a raport i artefakty są dostępne w powyższym Actions run.
- Nie wykonano pomiaru wpływu na rzeczywiste konwersje; przy 6 kliknięciach nie ma podstaw do takich roszczeń.
