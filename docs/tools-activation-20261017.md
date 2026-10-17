# Aktywacja narzędzi — konfiguracja i odbiór

## Stan etapu

Kod jest przygotowany do wdrożenia w projekcie Cloudflare Pages powiązanym z repozytorium `wwwCodeFixIT/CodeFix.IT---Portfolio-Short`. W sesji roboczej nie ma dostępu administracyjnego do Cloudflare ani kluczy dostawców. Ustawienia konta, działanie WAF i prawdziwe odpowiedzi usług nie zostały sprawdzone. Aktywacja nie została wykonana.

Backend odrzuca niepełne odpowiedzi Responses API zamiast przedstawiać urwany tekst jako gotowy brief. Niedostępne lub niepełne wyjaśnienie AI nie usuwa prawdziwego raportu Lighthouse. Żądania wymagają dokładnego originu `https://codefix.it` i typu `application/json`. Przekroczenie limitu danych zwraca 413; strumień jest anulowany. Site Doctor dopuszcza 2048 bajtów, aby prawidłowy adres i 400 znaków opisu UTF-8 mieściły się w limicie. Brief pozostaje ograniczony do 4096 bajtów. Zapytania do OpenAI mają limit czasu i nie śledzą przekierowań.

## 1. Wdrożenie z usługami wyłączonymi

W Cloudflare wybierz właściwy projekt Pages → Settings → Variables and Secrets. Production i Preview konfiguruj osobno. Klucze dodawaj jako zaszyfrowane sekrety bezpośrednio w panelu; nie wklejaj ich do chatu, GitHub ani zmiennych `VITE_*`.

| Nazwa | Typ | Początkowa wartość w Production |
| --- | --- | --- |
| `SITE_DOCTOR_ENABLED` | zmienna | `false` |
| `SITE_DOCTOR_RATE_LIMIT_CONFIRMED` | zmienna | `false` |
| `AI_TOOLS_ENABLED` | zmienna | `false` |
| `AI_RATE_LIMIT_CONFIRMED` | zmienna | `false` |
| `PAGESPEED_API_KEY` | sekret | klucz ograniczony do PageSpeed Insights API, przed aktywacją skanera |
| `OPENAI_API_KEY` | sekret | klucz projektu OpenAI, przed aktywacją AI |
| `OPENAI_MODEL` | zmienna opcjonalna | obsługiwany model z dostępem w projekcie; kod domyślnie używa `gpt-4.1-mini` |

W Preview pozostaw flagi wyłączone i nie kopiuj kluczy produkcyjnych. POST jest dodatkowo ograniczony w kodzie do domeny produkcyjnej. Testy przeglądarkowe działają na atrapach API.

Po scaleniu i zakończeniu wdrożenia aktualnej wersji:

```bash
npm run tools:deployment
```

To trzy żądania **GET**. `/api/ai-brief` i `/api/site-doctor` mają zwrócić 405, JSON i `Allow: POST`. `/api/tool-status` zwraca 200 oraz dwa booleany `ai`/`doctor`, bez kluczy i szczegółów konta. Wszystkie odpowiedzi wymagają `Cache-Control: no-store`. Test rozpoznaje m.in. błędny fallback SPA z HTTP 200. Nie wywołuje dostawców i nie wysyła zgłoszeń. Potwierdza obecność funkcji, nie poprawność kluczy, WAF ani aktywację usług.

W workflow SEO Production Smoke ten test działa po sprawdzeniu opublikowanego runtime'u nawigacji. Można uruchomić cały workflow ręcznie dla opublikowanego `main`. Harmonogram SEO pozostaje bez dodatkowych żądań do API narzędzi.

## 2. Ograniczenia przed włączeniem

W strefie `codefix.it` ustaw reguły rate limiting dla POST. Przykładowy warunek dla briefu:

```text
(http.host eq "codefix.it" and http.request.method eq "POST" and http.request.uri.path eq "/api/ai-brief")
```

Dla skanera zamień ścieżkę na `/api/site-doctor`. Ustaw licznik per IP, akcję Block oraz odpowiedź 429. Dobierz liczbę żądań, okres i czas blokady do faktycznie dostępnego planu oraz zaakceptowanej liczby analiz. Wcześniejsze propozycje 5/min dla briefu i 2/5 min dla skanera nie są potwierdzeniem dostępności tych ustawień na koncie. Jeśli plan ich nie zapewnia, ustal dostępny wariant ochrony przed włączeniem flag potwierdzających.

Sprawdź ograniczenia zapytań PageSpeed w Google Cloud oraz rozliczenia i limity projektu OpenAI. Sam boolean `*_RATE_LIMIT_CONFIRMED` nie implementuje limitera.

WAF można sprawdzić małymi, nieprawidłowymi POST z JSON `{}` przy flagach aktywacji nadal wyłączonych: normalnie API zwraca 503 i nie uruchamia dostawcy; po przekroczeniu ustawionego progu WAF ma zablokować żądania. Potwierdź regułę w zdarzeniach Cloudflare i zapisz rzeczywiste parametry. GET z testu wdrożenia nie powinien zużywać licznika POST.

## 3. Aktywacja i pojedyncze testy rzeczywistych usług

Najpierw skaner: po ustawieniu klucza i sprawdzeniu WAF zmień `SITE_DOCTOR_ENABLED` oraz `SITE_DOCTOR_RATE_LIMIT_CONFIRMED` na `true`, następnie wykonaj nowy deployment. Uruchom jeden pomiar własnego publicznego adresu `https://codefix.it/` z wyjaśnieniem AI wyłączonym. Sprawdź wynik, czas, brakujące dane i obsługę błędów.

Następnie opcjonalne AI: po skonfigurowaniu projektu/klucza i sprawdzeniu jego reguły WAF zmień `AI_TOOLS_ENABLED` i `AI_RATE_LIMIT_CONFIRMED` na `true`, ponownie wdroż. Wykonaj jeden brief z treścią testową i osobno pomiar z dobrowolnym wyjaśnieniem AI. Odbiór tej części obejmuje rzeczywiste odpowiedzi dostawców i kontrolę użycia. Testy z atrapami nie zastępują tego odbioru. Nie jest potrzebne wysyłanie zapytania do CRM.

## 4. Wyłączenie i kontrole kodu

Aby wyłączyć usługę, ustaw odpowiednie `*_ENABLED=false` i wdroż zmienioną konfigurację. Skaner i brief AI mają niezależne przełączniki. Przy wyłączonym AI nadal działa szkic lokalny, mapa, kontrast i podgląd SEO.

Kontrole bez wywoływania prawdziwych dostawców:

```bash
npm run brief:typecheck
npm run brief:smoke
npm run doctor:typecheck
npm run doctor:smoke
npm run tools:probe:smoke
```

Nowe pokrycie: 45 przypadków briefu, 19 dodatkowych przypadków Site Doctor oraz 11 wariantów testu wdrożenia. Scenariusze obejmują aktywację, origin, MIME, strumień, UTF-8, niepełne odpowiedzi, błędy i limity dostawców oraz ochronę przed fałszywym wynikiem GET. Wszystkie wywołania dostawców są przechwytywane. Dotychczasowe testy skanera i jego raportu pozostają w CI.

Źródła konfiguracji sprawdzone 17.10.2026: [Cloudflare Pages — sekrety](https://developers.cloudflare.com/pages/functions/bindings/#secrets), [parametry rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/), [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create).
