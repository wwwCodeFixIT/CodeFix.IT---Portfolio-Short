# Etap LAB-1 — narzędzia CodeFix.IT (2026-10-16)

## Zakres

- `/narzedzia/`: oddzielny, ładowany na żądanie widok React, bez nowych bibliotek.
- Asystent briefu: **dwa jawne tryby**. „Szkic bez AI” działa całkowicie w przeglądarce. „Generuj z AI” wywołuje własny Cloudflare Pages Function i zwraca autentyczną odpowiedź modelu **tylko po włączeniu backendu**.
- Podgląd SEO: title/description i orientacyjna liczba znaków. Nie podszywa się pod podgląd rzeczywistego wyniku Google.
- Kontrast WCAG: obliczenia względnej luminancji sRGB i współczynnika 4.5/3/7. Nie jest pełnym audytem dostępności.
- Dodatkowe wejście ze strony głównej i stopki, statyczny fallback bez JS, canonical, OG, JSON-LD, sitemap.

## Bezpieczeństwo i koszty AI

**Nie włączać API na produkcji przed spełnieniem wszystkich warunków**:

1. W Cloudflare **Security → WAF → Rate limiting rules** utworzyć regułę obejmującą URI Path `/api/ai-brief` dla domeny `codefix.it`. Zalecany próg startowy: 5 żądań na minutę na IP, akcja Block na 10 min (dostępność opcji zależy od planu). Przetestować skuteczność ograniczenia.
2. Po stronie OpenAI utworzyć oddzielny projekt i klucz API z możliwie ograniczonym budżetem. Klucz skonfigurować jako **sekret** Cloudflare Pages (`OPENAI_API_KEY`). Nigdy jako `VITE_*`, nie wkładać do GitHub ani kodu klienta.
3. W produkcyjnym Pages Environment skonfigurować `AI_RATE_LIMIT_CONFIRMED=true` **dopiero gdy reguła faktycznie działa**, oraz `AI_TOOLS_ENABLED=true`. Opcjonalnie `OPENAI_MODEL=gpt-4.1-mini`. Zmiany sekretów i bindings wymagają kolejnego deploymentu Pages.
4. Osobno potwierdzić rozliczenia i politykę przetwarzania danych. Formularz celowo nie zbiera imienia ani adresu e-mail. Dla AI kieruje dane do OpenAI przez funkcję; `store:false`, brak własnego zapisu briefu w bazie. Nie logować treści żądań.
5. Dodać monitoring statusów 429/5xx i kosztu modelu, a następnie uruchomić próbę E2E, także przy zablokowaniu przez WAF.

Bez tych warunków endpoint zwraca 503, a interfejs automatycznie pokazuje szkic **bez AI**. Jest to świadomy fail-closed, nie awaria.

## QA przed publikacją

```bash
npm ci
npm run typecheck
npm run lint
npm run lint:production
npm run format:check
npm run build
npm run seo:static
npm run build:budget
git diff --check
```

Manual QA: 320/375/390/768/1440 px; fokus, klawiatura i reduced-motion; zmiana narzędzi; brak overflow; SEO title/description na `/narzedzia/`; kopiowanie briefu (także fallback bez uprawnień schowka); 503/offline; invalid/too-large JSON; brak dostępu do OpenAI klucza w bundle. Sprawdź, że `/api/ai-brief` nie udostępnia nic przez GET oraz że endpoint nie uruchamia się bez potwierdzonej ochrony.

## Release

Gałąź jest oparta na `feat/mobile-navigation-20261016` (PR #108). Otworzyć stacked PR przeciwko tej gałęzi, poczekać na wymagane QA i osobną autoryzację dla produkcji. Nie scalać ani nie publikować automatycznie z tej instrukcji.
