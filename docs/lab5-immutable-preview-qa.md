# LAB-5 — weryfikacja niemutowalnego podglądu Cloudflare Pages (17.10.2026)

## Kontekst
- Główna gałąź `main` ma już kod Laboratorium AI i Site Doctor wraz z przekazywaniem wyników do formularza (zbiorczy PR #113 został scalony).
- PR #109, #110 i #111 nadal istnieją jako stare, otwarte Drafty, **ale ich heady są przodkami `main`** (GitHub compare: ahead_by=0). Nie należy scalać ich ponownie ani przyjmować, że nadal reprezentują brakujące funkcje.
- PR #115 (LAB-4) zawiera dodatkową obsługę błędów i anulowania, ale bazuje na dawnej gałęzi #111 i **jest rozbieżny z aktualnym `main`**. Wszelkie dalsze poprawki należy portować selektywnie na `main`, bez zastępowania nowszych plików starszymi.
- LAB-5 powstał **bezpośrednio z najnowszego `main` (SHA `59b64e46b7d602ee76054d81f2033e216ce2ca77`)**. Nie publikuje żadnej nowej funkcji strony.

## Wykonane testy

### 1. Powiązanie deploymentu z SHA

`scripts/tools-immutable-preview-qa.mjs <SHA>` pobiera przez GET publiczne GitHub Check Runs dla wskazanego SHA. Zwraca tylko ten o nazwie Cloudflare Pages, stanie completed i conclusion success. Parsuje **dokładny niezmienny URL z podpisanego przez GitHub wyniku check run**, odrzucając alias branch, produkcję oraz dowolne obce hosty. Dodatkowo sprawdza, czy skrót commit SHA widoczny w tabeli wyniku jest zgodny.

### 2. Sześć bezpiecznych GET

Skrypt odczytuje:
- `/` — HTML, link do Laboratorium,
- `/narzedzia/` — statyczna treść Site Doctor, tytuł SEO,
- `/brand/codefix-devil-mark.webp` — właściwy format obrazu,
- `/api/tool-status` — HTTP 200, dwa booleany `ai` i `doctor`,
- `/api/ai-brief` — HTTP 405, `Allow: POST`, JSON, `Cache-Control: no-store`,
- `/api/site-doctor` — HTTP 405, `Allow: POST`, JSON, `Cache-Control: no-store`.

Przekierowania są **wyłączone**, czas żądania jest ograniczony, a domena musi mieć format ośmioznakowego niezmiennego Cloudflare Preview ID. Brak POST oznacza brak wywołania modeli Google/OpenAI i brak leadów.

`scripts/tools-immutable-preview-smoke.mjs` testuje kontrakt na mockach: SHA, zamianę adresu, niepowodzenie deploymentu, ochronę domeny, metodę GET i każdy z 6 endpointów.

### 3. Chromium/WebKit bez zapisów

Do `scripts/tools-production-qa.mjs` dodano opcjonalną `TOOLS_QA_ORIGIN`. Domyślnie skrypt nadal kieruje się do `https://codefix.it`; jeśli ustawiono inną domenę, musi to być **ośmioznakowy commit-addressed hostname** `*.codefix-it---portfolio-short.pages.dev`. Dodatkowo workflow przekazuje jedynie URL zweryfikowany w kroku 1.

Test buduje aplikację z tego samego punktu wyjścia co SHA preview, porównuje asset entry, uruchamia Chromium i WebKit po 320/390/1280 px i zapisuje zrzuty. Wszystkie żądania poza `GET/HEAD` do docelowego originu (lub wyjątkiem dla pasywnego skryptu telemetrycznego hostingu, który i tak jest blokowany) są blokowane. Nie korzysta z produkcyjnego CRM.

## Uruchamianie i ograniczenia

Workflow: `.github/workflows/immutable-pages-preview-qa.yml` — uruchamiany z gałęzi feature oraz ręcznie `workflow_dispatch` z pełnym SHA, na którym Cloudflare wystawiło pomyślne Check Run. SHA w workflow dla pierwszego przebiegu: `59b64e46b7d602ee76054d81f2033e216ce2ca77`.

**Nie oznacza to** sprawdzenia WAF, sekretów, produkcyjnej aktywacji PageSpeed/OpenAI ani rzeczywistego zlecenia w CRM. Te czynności pozostają za release gate właściciela.

Wszystkie zmiany LAB-5 to testy, workflow i dokumentacja — bez aktualizacji aplikacji na produkcji.
