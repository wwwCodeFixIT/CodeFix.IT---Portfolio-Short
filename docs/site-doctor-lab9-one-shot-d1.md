# LAB-9 — jednorazowy canary Google PageSpeed z blokadą D1

**Stan:** Draft / HOLD. Brak produkcyjnej aktywacji. Zmiany tego etapu wymagają wcześniejszego PR #118 (preflight) i #119 (prywatny pilotaż). Nie zastępują Cloudflare WAF ani ograniczeń konta Google Cloud.

## Cel

Token z LAB-8 jest wielorazowy. Skrypt pilota wykonuje najwyżej jeden POST *na uruchomienie*, ale skopiowany token można byłoby wykorzystać ponownie. LAB-9 dodaje **atomowe, serwerowe zużycie tylko jednego globalnego pomiaru**, oparte na Cloudflare D1 i unikalnym kluczu SQL.

## Kontrakt

- Strona produkcyjna pozostaje bez skanera publicznego (`SITE_DOCTOR_ENABLED=false`), działa tylko prywatny pilot z tokenem, bez AI, wyłącznie `https://codefix.it/`.
- Przed kontaktem z Google Pages Function musi wykonać zapis D1:
  `INSERT OR IGNORE INTO site_doctor_pilot_claims (id, claimed_at) VALUES (1, datetime('now'))`.
- **Tylko `success=true` i `meta.changes=1`** pozwala zrobić jeden Google PageSpeed request.
- Przy `changes=0`: HTTP 409 — canary zużyty. Przy brakującym D1, tabeli lub nieudanej operacji: HTTP 503. Żaden z tych przypadków nie wywołuje Google.
- Unikalny klucz `id=1` ogranicza globalną liczbę zużyć do **jednej próby** w podłączonej bazie, również gdy równolegle działa kilka instancji Pages. Nie wolno automatycznie czyścić tabeli.
- Jeśli Google zwróci 429/502 albo minie czas, zapis pozostaje zużyty. To celowa zasada **fail-closed / bez kosztownego retry**.
- Token nie jest logowany do bazy. Jedyny zapis obejmuje `id=1` i datę; nie ma adresów użytkowników ani danych kontaktowych.
- Po zakończeniu należy niezwłocznie dezaktywować `SITE_DOCTOR_PILOT_ENABLED`, zrotować sekret oraz potwierdzić `doctor:false` w `/api/tool-status`.

## Kroki infrastrukturalne — wymagają uprawnionego administratora

1. W **Cloudflare → D1** utwórz osobną bazę, np. `codefix-site-doctor-pilot`. Nie wykorzystuj produkcyjnego CRM ani istniejącej bazy klientów. Cloudflare udostępnia D1 jako binding do Pages Functions: https://developers.cloudflare.com/pages/functions/bindings/#d1-databases.
2. W konsoli SQL tej bazy uruchom migrację [0001_one_shot.sql](../migrations/site-doctor-pilot/0001_one_shot.sql). Nie wykonuje ona żadnego zapisu do tabel klientów.
3. W **Workers & Pages → projekt CodeFix.IT → Settings → Bindings → D1 database** dodaj binding dokładnie `SITE_DOCTOR_PILOT_DB` wskazujący na tę bazę **tylko w Production**. Zaktualizuj deployment. Nie nadaj temu bindingowi uprawnień do istniejących danych klientów.
4. Sprawdź w bazie, że tabela istnieje, a `SELECT * FROM site_doctor_pilot_claims` jest puste **przed pierwszym canary**. Nie kasuj wiersza po testach, nie resetuj bazy w celu „ponowienia” bez nowej, wyraźnej decyzji i planu kosztów.
5. Potwierdź Cloudflare WAF rule dla `codefix.it/api/site-doctor` w kontekście faktycznego planu oraz w **Security Events**. Sama zmienna `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true` nie jest dowodem prawdziwego WAF.
6. Potwierdź klucz PageSpeed Insights API i ograniczenie dostępnej kwoty w Google Cloud, następnie skonfiguruj sekrety i flagi pilota według [LAB-8](site-doctor-lab8-private-pilot.md). **Publiczna flaga pozostaje false**.
7. Wykonaj lokalnie tylko po osobnej zgodzie: `npm run doctor:activation:preflight`, a następnie jednorazowy canary zgodnie z LAB-8. Żadne GitHub Actions w tym PR nie uruchamia automatycznie produkcyjnego POST.
8. Potwierdź zapis jednego wiersza D1, obecność jednego Google PageSpeed request i brak wywołań OpenAI/CRM, niezależnie czy Google zwróciło pełny raport. Wyłącz pilota i zmień token.

## QA bez zewnętrznych kosztów

- `npm run doctor:pilot:smoke` — oryginalne zabezpieczenia, teraz z zamockowanym D1.
- `npm run doctor:one-shot:smoke` — brak D1 = 503, **12 równoległych autoryzowanych prób => dokładnie jedna wywołuje mock Google**; pozostałe 11 zwraca 409, replay blokowany, wyjątki/błędy SQL = 503, 429 Google zużywa jedyną próbę.
- `npm run doctor:smoke` — pozostałe ścieżki publicznego API niezmienione.
- `npm run doctor:typecheck`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run build:budget` — kontrola regresji.

**Ograniczenie:** test pamięciowy odwzorowuje semantykę unikalnego klucza SQL; przed rzeczywistym użyciem konieczny jest smoke D1 bindingu w Cloudflare, a nie tylko CI. Regułę WAF, istniejący D1 i kwotę Google może potwierdzić tylko autoryzowany odczyt kont.

Dokumentacja D1: https://developers.cloudflare.com/d1/worker-api/prepared-statements/.
