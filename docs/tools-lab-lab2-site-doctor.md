# LAB-2: AI Site Doctor (CodeFix.IT, 2026-10-16)

## Co działa

Na `/narzedzia/` dodano zakładkę **AI Site Doctor**, z diabełkiem opartym o istniejący plik `/brand/codefix-devil-mark.webp`. Formularz zbiera adres publicznej strony HTTPS, kategorię problemu i opcjonalny opis. Badanie jest wykonywane przez Google **PageSpeed Insights API v5** (Lighthouse mobile, kategorie performance/seo/accessibility); nie przedstawia fałszywych rezultatów przy błędach.

Wynik: 3 oceny 0–100, dostępne audyty Lighthouse (title, description, lang, crawlability, canonical, viewport), metryki laboratoryjne LCP, CLS i TBT, podpowiedzi oparte o wyniki oraz raport możliwy do skopiowania. Opcjonalny tekst modelu AI jest oznaczony jako komentarz AI **wyłącznie jeśli model faktycznie odpowiedział**; w pozostałych przypadkach pokazujemy rekomendacje deterministyczne.

**Nie są sprawdzane:** zalogowany panel WordPress, wysyłka formularza, WooCommerce checkout, bezpieczeństwo, rzeczywista zgodność z WCAG, uptime SLA, PHP errors, Core Web Vitals z danych terenowych. W raportach należy nazywać oceny *laboratoryjnymi*, a nie audytem całej witryny. Każdy skan obejmuje podany publiczny URL (jedną podstronę).

## Model bezpieczeństwa

- Pages Function `/api/site-doctor` NIE pobiera samodzielnie adresów klientów. Wykonuje fetch **tylko** do `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` i opcjonalnie do `https://api.openai.com/v1/responses`. Dzięki temu wektor SSRF przez bezpośrednie odpytywanie localhost/RFC1918 z Cloudflare nie występuje w kodzie funkcji.
- Akceptowane są wyłącznie publiczne domeny HTTPS: bez IP literals, portów, userinfo, fragmentów, domen .local/.internal/.test/.onion itd. Przy zmiennej długości odpowiedź provider może być obszerna, ale frontend otrzymuje tylko wąskie, znormalizowane pola.
- Ochrona wymaga uruchomienia **Cloudflare WAF Rate Limiting** na ścieżce `/api/site-doctor`, np. 2 zapytania / 5 min / IP i blokada 15 min (wartość początkowa, dostosować do ruchu i planu). To nie jest limit implementowany w funkcji; bez potwierdzonej reguły endpoint ma odpowiadać **503**.
- Dwa niezależne przełączniki (wymagane): `SITE_DOCTOR_ENABLED=true`, `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true`. Ten drugi ustawić dopiero po ręcznym sprawdzeniu WAF. `PAGESPEED_API_KEY` musi być sekretem Pages, ograniczonym w Google Cloud do PageSpeed Insights API i monitorowanym limitem zapytań.
- Aby umożliwić dobrowolną generatywną interpretację, dodatkowo: `AI_TOOLS_ENABLED=true`, `AI_RATE_LIMIT_CONFIRMED=true`, `OPENAI_API_KEY` jako sekret i ograniczony budżet. Flaga `includeAi` pochodzi z domyślnie NIEzaznaczonego checkboxa. Nie wysyłamy do modelu pełnego HTML ani dostępu do CMS.
- Domyślne Pages env: wszystkie przełączniki wyłączone, więc endpoint jest inertny nawet gdy funkcja jest wdrożona. **Brak sekretów i limitów = brak pomiaru i brak kosztów providerów.**
- Uwaga: Google PageSpeed może wykonywać własne żądania do zewnętrznego hosta i przechowuje własne wyniki zgodnie ze swoją usługą; nie stosować do prywatnych/stagingowych adresów. Nie skanować stron wymagających logowania.

## Cloudflare deploy i QA

Plik `public/_routes.json` ustawia `include: ['/api/*']` — zwykłe statyczne odsłony nie wywołują Worker Functions. Funkcje Pages wymagają deploymentu Git-based lub Wrangler (nie direct upload z Dashboard).

```bash
npm ci
npm run doctor:typecheck
npm run doctor:smoke
npm run typecheck
npm run lint
npm run build
npm run seo:static
npm run build:budget
```

Sprawdzić w dwóch trybach:
1. Brak flag: frontend poprawnie pokazuje status niedostępny, a backend zwraca 503 bez outbound requestów.
2. Testowy environment z oddzielnym kluczem PageSpeed i realnym WAF: tylko produkcyjny origin `https://codefix.it`, skan publicznego URL, wyniki i błędy 429, 502, 504; sprawdzić koszty i logi bez prywatnych treści.

Browser QA: 320/375/390/768/1440, klawiatura/tab, obsługa błędów i anulowania, wybór checkboxa AI, screen reader, reduced-motion, kopiowanie raportu i CTA, no horizontal overflow. CI sprawdza typy, testy mockowane i SEO statyczne — **nie jest to dowód rzeczywistej diagnozy PageSpeed na produkcji**.

## Workflow release

Draft stacked PR względem `feat/tools-lab-ai-brief-20261016` (#109), zależny od #108 i #109. Nie scalaj ani nie publikuj bez osobnego zatwierdzenia i QA. Także nie aktywuj kluczy/modelu do czasu zakończenia testów WAF, kosztu oraz informowania o prywatności.
