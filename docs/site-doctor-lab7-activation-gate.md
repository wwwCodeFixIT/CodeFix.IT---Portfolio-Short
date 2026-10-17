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

## 3. Aktywacja etapami

1. Odbierz faktyczną regułę WAF i limity dostawcy. Zapisz je prywatnie poza repo (ID reguły, plan, próg, okno, data sprawdzenia), **bez kluczy**.
2. Dodaj sekret `PAGESPEED_API_KEY` do właściwego projektu Pages. Początkowo pozostaw `SITE_DOCTOR_ENABLED=false`, `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=false`.
3. Po zatwierdzeniu właściciela ustaw `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true` i `SITE_DOCTOR_ENABLED=true`; wykonaj kontrolowany deployment Pages. Sprawdź `npm run doctor:activation:preflight`: `configuredActive: true` to **jedynie deklaracja konfiguracji, nie dowód WAF ani poprawności klucza**.
4. Jednorazowy canary: wyłącznie przy spełnieniu powyższych warunków i oddzielnej zgodzie na **jedno rzeczywiste żądanie PageSpeed**:

```bash
SITE_DOCTOR_WAF_VERIFIED=true \
SITE_DOCTOR_QUOTA_VERIFIED=true \
SITE_DOCTOR_CANARY_APPROVAL=I_APPROVE_ONE_REAL_PAGESPEED_SCAN \
node scripts/site-doctor-activation-canary.mjs --one-live-site-doctor-scan
```

Skrypt najpierw robi dwa GET, sprawdza publiczną flagę doctor, a potem **jeden POST** do produkcji z `url=https://codefix.it/`, `includeAi=false`, pustym opisem i stałą kategorią SEO. Waliduje realną strukturę wyników Lighthouse. **Nie ponawia żądania**, nawet po timeout/429/502. Zwraca oceny 0–100, nie loguje klucza, nie wykonuje OpenAI ani zgłoszenia CRM.

5. Jeśli test się nie powiódł, nie zgaduj przyczyn. Zweryfikuj WAF Events, ograniczenia klucza API, logi Cloudflare Pages i wynik `/api/tool-status`. Przy wzroście użycia natychmiast ustaw `SITE_DOCTOR_ENABLED=false` i wdroż zmianę.
6. Funkcję generatywnego komentarza AI aktywuj **osobno**, po dodatkowym WAF i limicie kosztów projektu OpenAI. Pierwszy canary nigdy nie optuje się na komentarz AI.

## 4. Bramka akceptacyjna

**GO dla jednego live canary dopiero, gdy właściciel potwierdzi:** plan Cloudflare, aktywną regułę/zdarzenie, dostępną kwotę Google API, restrykcję klucza do PageSpeed, poprawny sekret Pages Production, aktywne flagi i zatwierdzenie wykonania pojedynczego pomiaru.

**Wszystko inne = HOLD.** Testy automatyczne nie mają uprawnień do uruchomienia canary i nie są dowodem aktywnej ochrony w Cloudflare.
