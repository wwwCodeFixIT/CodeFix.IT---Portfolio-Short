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

## Bramka QA przed merge

1. Zielone **CI**: typecheck, lint, production lint, format, build/prerender, measurement smoke oraz **niezmienione** budżety JS/CSS.
2. Preview branch na Cloudflare: desktop 1440/1024, mobile 390/360, kontrast H1/pomocy, widoczność przycisków, brak CLS/horizontal overflow.
3. Test klawiatury (Tab/focus-visible) i `prefers-reduced-motion: reduce`; animacja ma być nieaktywna.
4. Potwierdzenie, że wybór jednej z 3 ścieżek nadal ustawia właściwy temat i działa `#contact`; żadnych syntetycznych leadów produkcyjnych.
5. Lighthouse desktop/mobile i Safari/iOS przed wdrożeniem. Nie ogłaszać WCAG AA bez pełnego audytu.

## Status
- H6 **Draft PR only**, bez merge, bez deploymentu na `codefix.it`.
- Gotowość do scalenia: zależy od QA na rzeczywistym preview.
