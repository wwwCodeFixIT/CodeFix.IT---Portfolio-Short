# H6 — selektywne wykorzystanie projektu Lovable w CodeFix.IT

## Architektura i decyzja

Produkcję `codefix.it` zasila repozytorium **CodeFix.IT---Portfolio-Short** (React/Vite), a nie izolowany Lovable "Projekt Fixator" i nie motyw WordPress `codefix-business`. Ten etap dotyczy tylko istniejącego Hero strony głównej.

**Lovable H5 jest inspiracją wizualną, nie kodem do importu 1:1.** Jego konfigurator zawiera niezatwierdzone kwoty DEMO, a przejście QuickPath -> kalkulator duplikuje istniejącą ścieżkę sprzedaży na `codefix.it`.

Na obecnej stronie są już trzy kompletne ścieżki:
- WordPress Quick Fix -> `WORDPRESS_QUICK_FIX` -> formularz / CRM;
- nowa strona -> `CODEFIX_BUSINESS_SITE` -> formularz / CRM;
- opieka WordPress -> `WORDPRESS_CARE` -> formularz / CRM.

Istniejące linki white-label i mini-audytu pozostają zachowane. Nie zmieniamy `chooseService()`, mapowania usług, CRM API, treści cen, śledzenia zgód, Google Ads i metryk `generate_lead`.

## Zakres wdrożony w H6

- **Tylko CSS** w `src/pages/HomepageV1.v3.css`: subtelna siatka sygnałowa na panelu wyboru drogi, animowana wyłącznie przez `opacity` (bez scroll listeners, Canvas, WebGL lub obrazów).
- Korekta kontrastu przyciemnionego członu H1 oraz tekstu pomocniczego panelu.
- `prefers-reduced-motion`: animacja wyłączona.
- Żadnych nowych plików JS, bibliotek, śledzenia ani nowych sekcji. Nie ruszać PR #87 (osobny mobile CTA QA).

## Czego celowo NIE przenosimy z Lovable

- Nie integrujemy szacunkowych stawek z prototypu (`pricing.ts` Lovable, cennik **DEMO**).
- Nie uruchamiamy drugiego wizardu/QuickPath ani udostępniania kosztorysu na produkcji.
- Nie twierdzimy, że diagnozujemy stronę automatycznie lub że AI wykonało audyt.
- Nie zmieniamy działającego formularza ani pomiaru konwersji.

## QA H6 — porównanie rzeczywistych stron (8.10.2026)

Źródło: [GitHub Actions H6 visual comparison #37838796649](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/37838796649). Zrzuty i wyniki: [artifact h6-visual-comparison](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/37838796649), zachowane w Actions.

- CI PASS: typecheck, lint, production lint, format, build/prerender, measurement contract i budżety bez podnoszenia limitów.
- Cloudflare Pages branch preview PASS: https://feat-h6-hero-ambient-polish.codefix-it---portfolio-short.pages.dev/.
- Chromium headless i WebKit headless PASS: produkcja kontra preview, 360, 390, 768, 1024, 1440 px. Brak horizontal overflow i JavaScript pageerror. Trzy hero linki nadal wskazują na kontakt; kliknięcie ścieżki Quick Fix ustawia `WORDPRESS_QUICK_FIX`. `#contact` działa. `prefers-reduced-motion` wyłącza CSS animation.
- Bez zgłoszeń próbnych do produkcyjnego CRM (nie wysyłano testowych leadów); istniejące endpointy, formularze i tracking niezmienione.
- Lighthouse: pojedynczy pomiar syntetyczny na zdalnym runnerze, porównanie poniżej. Różnice między uruchomieniami są możliwe; nie przedstawiać ich jako udowodnionego wzrostu Core Web Vitals.

| Lighthouse | Produkcja | H6 preview |
| --- | ---: | ---: |
| Performance mobile | 95 | 100 |
| Performance desktop | 100 | 100 |
| Accessibility mobile/desktop | 97/97 | 97/97 |
| LCP mobile (ms) | 2156 | 1414 |
| LCP desktop (ms) | 729 | 470 |
| CLS mobile | 0 | 0 |

- Build budget w pierwotnym PR: JS 319988/320000 B, CSS 69314/70000 B. Dodana warstwa wizualna to CSS-only; nie zmieniono JS.
- NOT RUN: fizyczny iPhone / Safari; pełny ręczny audyt WCAG. WebKit Playwright nie zastępuje testu na fizycznym urządzeniu.
- PR #87 to osobna poprawka mobilnego CTA, nie scalamy jej w tym etapie.

Testowy workflow oraz skrypt screenshotów uruchomiono tymczasowo na branchu, a potem usunięto z drzewa zmian H6. Wyniki pozostają w GitHub Actions. W docelowym PR są tylko pliki stylów i ten raport.

## Decyzja
- **GO dla wąskiej poprawki H6 Hero** po zielonym CI na końcowym branchu: zakres to nieinwazyjne CSS i brak regresji funkcjonalnej w Chromium/WebKit, a użytkownik zatwierdził wdrożenie.
- Nie publikować demonstracyjnego kalkulatora Lovable ani jego niezatwierdzonych cen. Nie zmieniać CRM/Ads.
- Po merge sprawdzić Cloudflare Pages status i rzeczywiste `codefix.it`. Pozostałe ręczne testy Safari/iPhone oraz pełnego WCAG ująć w dalszej kontroli, nie oznaczać ich jako PASS.
