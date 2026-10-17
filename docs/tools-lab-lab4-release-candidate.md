# CodeFix.IT — LAB-4 / release candidate (17.10.2026)

## Stan bazowy potwierdzony 17.10.2026

- PR #108 / natywne menu mobilne: **MERGED** do `main`.
- PR #109 / Laboratorium AI, SEO i WCAG: **DRAFT**, baza `feat/mobile-navigation-20261016` (po sca­leniu #108 skierować bazę na `main` i zweryfikować diff).
- PR #110 / Site Doctor Lighthouse: **DRAFT**, baza PR #109.
- PR #111 / diagnoza → formularz: **DRAFT**, baza PR #110; commit `0310d124d2ee85668b87de1b42057dad24a68e3c` ma zielone CI i Cloudflare Pages build; pełna regresja 194 scenariuszy + narzędzia Chromium/WebKit 390/1280 px.
- LAB-4 (ten etap) pozostaje osobnym Draft PR zależnym od #111. **NO MERGE, NO LIVE DEPLOY, NO API ENABLE**.

## Korekty RC

1. Site Doctor w razie błędu (Google API, 429, brak aktywacji 503, timeout, błąd połączenia) pokazuje uczciwy komunikat i alternatywę **„Opisz problem bez diagnozy”**. Nie pokazuje fikcyjnego wyniku.
2. W oknie skanera uruchomionym z formularza dostępne jest **„Wróć do zgłoszenia bez raportu”**; wpisany tekst i adres w formularzu pozostają bez zmian.
3. Kliknięcie **Anuluj** wyświetla osobny status anulowania, a nie „przekroczono czas”. Zamknięcie modalu nadal anuluje aktywny request.
4. Test regresji używa atrap API i CRM; osobno pokrywa 503, 429, anulowanie oraz ścieżkę modalną. Nie tworzy prawdziwych leadów i nie pobiera Google PageSpeed.

## Release gate — 4 fazy

### R1 — Automatyczne CI
- `npm ci`, `npm run typecheck`, `npm run lint`, `npm run lint:production`, `npm run format:check`.
- `npm run doctor:typecheck`, `npm run doctor:smoke`, `npm run doctor:handoff:smoke`.
- `npm run build`, `npm run seo:static`, `npm run build:budget`.
- Przeglądarki: Chromium i WebKit, szerokości 390 / 1280 px; brak poziomego scrolla, błędów JS i wysyłek do zewnętrznych usług.
- **To są testy ze sztucznym PageSpeed i mockiem CRM.** Nie dowodzą działania produkcyjnych providerów.

### R2 — Weryfikacja niemutowalnego Cloudflare Pages preview
- Sprawdź w [GitHub checks dla konkretnego commitu](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/111/checks) udany deployment Cloudflare Pages, wejdź w jego szczegóły i odczytaj **dokładny adres immutable preview** oraz SHA.
- Nie zgaduj URL. Nie testuj `codefix.it` ani aliasu głównego Pages.
- Uruchom wyłącznie odczytowy smoke na podanym adresie (komenda poniżej). Sprawdza stronę główną, trasę Laboratorium, metadane, znak diabełka i bezpieczne GET /api/site-doctor (405). **Nie wykonuje POST i nie uruchamia Google/OpenAI**.
- Jeśli preview jest za Cloudflare Access albo wymaga tokenu, nie obchodź dostępu automatycznie; ten test wymaga osobnego autoryzowanego sposobu.
- Wykonaj wizualne QA 320/375/390/768/1440, focus, modal, reduced motion i screenshoty. Zwróć szczególną uwagę na wygląd sekcji z ręcznym zgłoszeniem.

```bash
npm run doctor:preview:smoke -- https://<verified-immutable-preview>.codefix-it---portfolio-short.pages.dev/
```

### R3 — Integracje produkcyjne (wymagają osobnej zgody)
- Sprawdź uprawnienia w Cloudflare Pages: sekret `PAGESPEED_API_KEY`, restrykcja API w Google Cloud, limity i monitorowanie kosztu.
- Skonfiguruj i przetestuj *prawdziwą* regułę **Cloudflare WAF Rate Limiting** na `/api/site-doctor` (wstępny budżet 2 zapytania / 5 min / IP; dostosuj do planu Cloudflare). Dopiero potem wolno ustawić `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true` i `SITE_DOCTOR_ENABLED=true`.
- Origin backendu jest celowo na sztywno ograniczony do `https://codefix.it`: **samo preview nie potwierdza produkcyjnej diagnozy**. Nie otwieraj endpointu dla dowolnych originów tylko po to, żeby zaliczyć test.
- Z osobną zgodą i budżetem można opcjonalnie ustawić `AI_TOOLS_ENABLED`, `AI_RATE_LIMIT_CONFIRMED` oraz sekret `OPENAI_API_KEY`. Domyślnie AI wyłączone i wyraźnie opisane.
- Zweryfikuj w CRM *jedno kontrolowane zgłoszenie* oraz brak duplikacji konwersji/zgody na pomiar, ale dopiero po akceptacji użytkownika. Testy CI nie wysyłają prawdziwych zgłoszeń.

### R4 — Dopiero po akceptacji release
- Zaktualizuj bazę #109 na `main`, potwierdź czyste diffy i mergeability. Następnie #109 → #110 → #111 → LAB-4, każde z zielonym CI i bez konfliktów.
- Przed prod: manual Lighthouse, WCAG klawiatura, iOS Safari/Chrome, 404, formularze i obserwacja logów.
- **Bez wyraźnej zgody nie przełączaj statusu Draft, nie wykonuj merge, nie publikuj, nie ustawiaj flag ani sekretów.**

## Granice testowania

Brak `PAGESPEED_API_KEY` albo niepotwierdzony WAF to **prawidłowy stan nieaktywnej usługi**, a nie incydent. Fallback pozwala nadal pozyskiwać zapytania bez analizy automatycznej.

Zielony CI i Cloudflare Pages build nie są równoznaczne z E2E realnego Google PageSpeed/OpenAI oraz wysyłką do CRM na produkcji.
