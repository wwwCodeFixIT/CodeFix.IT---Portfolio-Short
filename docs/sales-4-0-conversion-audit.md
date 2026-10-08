# SALES 4.0 — audyt konwersji CodeFix.IT (8 października 2026)

## Okres i źródła
- Google Ads, GA4: 24.09–08.10.2026, Windsor.ai; konto kampanii CodeFix.IT.
- Search Console: 24.09–06.10.2026, Windsor.ai (ostatnie dni mogą się opóźniać).
- Gmail: powiadomienia „CodeFix.IT — nowe zapytanie ze strony”, 24.09–08.10.2026.
- Kod produkcyjny: src/pages/HomepageV1.tsx, src/pages/ServiceLanding.tsx, index.html, scripts/measurement-consent-smoke.mjs.
- GSC Wizard nie udostępnił raportu z powodu zakończonego trialu; podłączony Windsor.ai działa. Dane zagregowane; **nie wykonano bezpośredniego odczytu tabel leadów CRM**.

## Udokumentowane wyniki (nie mylić testów z prawdziwymi leadami)

Google Ads „CF | Search | Quick Fix WordPress | PL | 2026-10”: kampania ENABLED, 84 wyświetlenia, 6 kliknięć, koszt 98,78 PLN, raportowane konwersje 0. To zbyt mała próbka, aby wnioskować o rentowności lub zmieniać stawki.

GA4: `generate_lead` 2 zdarzenia / 1 aktywny użytkownik, konwersje przypisane do ruchu bezpośredniego, nie Google CPC. `lead_form_view` 27, `lead_form_start` 4, `lead_form_submit_attempt` 2 (liczniki zdarzeń, **nie lejka unikalnych użytkowników**). Dla `google / cpc` GA4 zarejestrował 5 sesji i 0 zdarzeń konwersji; pomiary zależą od dobrowolnej zgody i nie obejmują całego ruchu.

Powiadomienia CRM: 4 e-maile o nowych zapytaniach we wskazanym okresie, z czego wszystkie wyglądają na **wewnętrzne testy** (25.09 test #1; 27.09 test kolejki; 01.10 „TEST GA4” i „TEST PIXEL”). Dwa testy z 01.10 są zgodne z liczbą `generate_lead` 2 w GA4. Wśród przejrzanych powiadomień **nie potwierdzono zewnętrznego leada**. Nie dowodzi to, że w CRM nie ma innych rekordów: baza CRM nie była wprost odczytana.

Search Console: strona główna 6 kliknięć / 66 wyświetleń, `/naprawa-wordpress/` 1 kliknięcie / 21 wyświetleń. Mała próba i opóźnienie raportowania.

## Odkryta niespójność implementacyjna

- Formularz usług `ServiceLanding.tsx` emituje `generate_lead` po **zaakceptowanym i niezdublowanym** zgłoszeniu, kiedy jest zgoda na Analytics **lub** Google Ads.
- Formularz `HomepageV1.tsx` emituje `generate_lead` po zaakceptowaniu zgłoszenia wyłącznie z `codefixAnalyticsAllowed`. Przy zgodzie tylko na pomiar reklam zdarzenie może nie dotrzeć do konwersji Google Ads.
- Fix: dopasowanie warunku homepage do już działającego warunku service landing. Niezmienione: Google tag, zgody, CRM API, funkcje `generate_lead` dla duplikatów, stawki, budżety i treść strony.
- Test: `scripts/measurement-consent-smoke.mjs` egzekwuje obecność warunku OR, etap sukcesu API i wykluczenie duplikatów.

## Ograniczenia i dalsze decyzje

- **Bez wysyłania sztucznego leada** na produkcję i bez udawania, że API przyjęło zapytanie.
- **Nie zmieniać teraz budżetu ani stawek reklam**; 6 kliknięć nie jest próbą wystarczającą do optymalizacji kampanii. Zapytania wyszukiwania zawierają zarówno polskie problemy WordPress, jak i anglojęzyczne zapytania informacyjne — obserwować ich koszt i jakość, nie blokować masowo bez dowodu strat.
- Po zielonym CI i QA dla ads-only/analytics-only/both/none można scalić wąski PR; monitorować rzeczywiste, zewnętrzne leady z CRM, a nie surowe liczniki GA4.
- Przestrzegać wyboru prywatności. Nie dodawać trackers bez zgody.

## QA przeglądarkowe przed wdrożeniem

[GitHub Actions — SALES 4 consent verification, run #37850793080](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/37850793080): **PASS**. Chromium **6/6** i WebKit **6/6** scenariuszy:
- brak zgód → 0 `generate_lead`;
- tylko analityka → 1;
- tylko reklamy → 1;
- obie zgody → 1;
- duplikat → 0;
- odrzucone przez API → 0.

Każdy scenariusz wywołał **wyłącznie lokalnie przechwycony POST**. Ruch do produkcyjnego CRM został zablokowany, Google tag/Ads destinations przechwycono; test nie zaśmiecał CRM i nie wyemitował rzeczywistych konwersji. Kod testu i tymczasowy workflow usunięto przed scaleniem, raport zostaje w GitHub Actions. Dodatkowo zwykły `measurement:smoke` na stałe egzekwuje tę regułę.
