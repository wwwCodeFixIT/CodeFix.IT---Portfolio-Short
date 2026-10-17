# LAB-7 — aktywacja AI Site Doctor z kontrolą kosztów i zabezpieczeń (17.10.2026)

## 0. Aktualny status i ograniczenia

To **przygotowanie aktywacji**, nie jej uruchomienie. Brak dostępu do panelu administratora Cloudflare i Google Cloud w tym workflow oznacza, że reguła WAF, klucze i limity Google **nie zostały potwierdzone**. Sam parametr `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true` w kodzie nie aktywuje prawdziwego rate limitera.

- `npm run doctor:activation:preflight`: tylko GET `https://codefix.it/api/tool-status` (200) i GET `/api/site-doctor` (405). Wyświetla publiczne flagi `doctor` i `ai` bez sekretów. **Nie wykonuje pomiaru PageSpeed**.
- `npm run doctor:activation:smoke`: testy na atrapach, zero sieci/Google/CRM. CI wykonuje ten test automatycznie.
- `scripts/site-doctor-activation-canary.mjs` zawiera opcjonalny pojedynczy canary do wykonania **dopiero po wyraźnym zatwierdzeniu i sprawdzeniu wszystkich punktów poniżej**. Nigdy nie uruchamiaj go w automatycznym harmonogramie.

## 1. Cloudflare WAF: uwaga na plan

Według aktualnej dokumentacji Cloudflare (*rate limiting rules*, 25.08.2026), możliwości reguł istotnie różnią się między planami:

| Plan | Liczba reguł | Pola warunku | Okno licznika |
| --- | ---: | --- | --- |
| Free | 1 | ścieżka, verified bot | tylko 10 s |
| Pro | 2 | host, URI/ścieżka, query | wartości do 1 min |
| Business | 5 | także metoda HTTP | wartości do 10 min |

Źródło: https://developers.cloudflare.com/waf/rate-limiting-rules/

**Dlatego propozycja `2 POST / 5 min / IP` nie jest dostępna na wszystkich planach.** Nie ustawiaj fikcyjnej reguły ani nie zaznaczaj „WAF confirmed”, jeśli rzeczywista ochronna reguła nie istnieje.

- Free: warunek `(http.request.uri.path eq "/api/site-doctor")` — obejmuje **wszystkie metody**, bo metodę HTTP nie można tu użyć jako warunku. Podstawowy licznik per IP, próg/okno 10 sekund zgodne z planem. Taki krótki limit nie jest gwarancją rozsądnego kosztu dziennego przy złośliwym ruchu; rozważ silniejszą ochronę, limit dostawcy lub wyłączenie funkcji.
- Pro: można ograniczyć host i ścieżkę `(http.host eq "codefix.it" and http.request.uri.path eq "/api/site-doctor")`, ale `http.request.method` nie jest tu polem dostępnego warunku według tabeli. Maks. okno 1 min. Konkretny limit dobierz do rzeczywistej dostępności konfiguracji.
- Business: `(http.host eq "codefix.it" and http.request.method eq "POST" and http.request.uri.path eq "/api/site-doctor")` — można filtrować POST; plan obsługuje okna do 10 min. Przykład: niewielki limit na IP, z akcją Block, uzgodniony z właścicielem.
- *W każdym przypadku*: potwierdź aktywną regułę i jej identyfikator w Cloudflare, realne zatrzymanie nadmiarowego ruchu w Security Events i możliwość szybkiego wyłączenia. WAF na domenie `codefix.it` nie musi automatycznie chronić adresów preview `pages.dev` — nie włączaj tam sekretów.

**Nie wykonuj automatycznego burst-testu WAF na produkcji.** Odbiór reguły wykonaj kontrolowanie (kilka prób, zgodnie z zatwierdzonym progiem, bez uruchamiania providerów), z obserwacją zdarzeń Cloudflare. Wyłączenie skanera przed tym testem sprawia, że `POST /api/site-doctor` odpowiada 503 bez kontaktu z Google; WAF może odpowiedzieć wcześniej.

## 2. Google Cloud — sekrety i limity

- Wybierz projekt Google Cloud z włączonym **PageSpeed Insights API** i ustal dostępne limity zapytań/billing (wartości nie są zakodowane w repo ani automatycznie zakładane). Dokumentacja: https://developers.google.com/speed/docs/insights/v5/get-started
- Utwórz klucz API z restrykcją **PageSpeed Insights API**. Monitoruj użycie, błędy 429 i ewentualne rozliczenie.
- Ustaw klucz wyłącznie jako zaszyfrowany sekret Cloudflare Pages **Production → Settings → Variables and Secrets → `PAGESPEED_API_KEY` → Encrypt**. Nie wklejaj go do ChatGPT, GitHub, CI logs ani zmiennych `VITE_*`. Dokumentacja: https://developers.cloudflare.com/pages/functions/bindings/#secrets
- W Preview pozostaw **`SITE_DOCTOR_ENABLED=false`** i brak klucza produkcyjnego. Klucz OpenAI i `AI_TOOLS_ENABLED` pozostają wyłączone na pierwszym etapie.

## 3. Aktywacja etapami — aktualizacja LAB-8

**UWAGA: poprzedni wariant canary, który wymagał publicznego `SITE_DOCTOR_ENABLED=true`, został zastąpiony bezpieczniejszym trybem prywatnym.** Zobacz dokładny protokół [LAB-8 private pilot](site-doctor-lab8-private-pilot.md).

1. Potwierdź rzeczywistą regułę WAF, limity Google oraz ograniczony do PageSpeed sekret Google Cloud.
2. Dodaj *zaszyfrowany* `SITE_DOCTOR_PILOT_TOKEN` (64 znaki losowego hex) w Pages Production, oprócz `PAGESPEED_API_KEY`.
3. Ustaw `SITE_DOCTOR_PILOT_ENABLED=true`, `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true`, ale **pozostaw publiczne `SITE_DOCTOR_ENABLED=false`**. Konflikt obu flag aktywacyjnych blokuje wszystko (503).
4. Odczytowy `npm run doctor:activation:preflight` musi nadal zwracać `configuredActive:false` — to prawidłowe: użytkownicy nie mają dostępu. Po osobnej zgodzie uruchom lokalnie canary z tym samym tokenem i trzema potwierdzeniami. Skrypt sprawdza publicznie wyłączony skaner i wysyła najwyżej jeden POST z nagłówkiem Authorization do `https://codefix.it/`, bez AI i CRM.
5. **Wyłącz pilota natychmiast po teście i usuń/zmień token.** Ten sekret nie jest jednorazowy po stronie serwera. WAF nadal jest obowiązkowy.
6. Publiczną aktywację `SITE_DOCTOR_ENABLED=true` przy `SITE_DOCTOR_PILOT_ENABLED=false` rozważ wyłącznie po odbiorze pomiaru i osobnej zgodzie właściciela. AI generatywne pozostaje oddzielnym etapem.

## 4. Bramka akceptacyjna

**GO dla jednego live canary dopiero, gdy właściciel potwierdzi:** plan Cloudflare, aktywną regułę/zdarzenie, dostępną kwotę Google API, restrykcję klucza do PageSpeed, poprawny sekret Pages Production, oddzielny prywatny token pilota i zatwierdzenie wykonania pojedynczego pomiaru.

**Wszystko inne = HOLD.** Skrypt canary wymaga tajnego tokenu i trzech ręcznych potwierdzeń. Testy automatyczne nie mają uprawnień do uruchomienia canary i nie są dowodem aktywnej ochrony w Cloudflare.
