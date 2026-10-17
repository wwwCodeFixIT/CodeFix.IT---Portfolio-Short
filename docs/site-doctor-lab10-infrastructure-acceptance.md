# LAB-10 — odbiór infrastruktury D1, WAF i Google PageSpeed (17.10.2026)

**Status: HOLD / DRAFT.** Nie wykonano żadnej zmiany na koncie Cloudflare/Google Cloud, nie utworzono bazy, nie zmieniono limitów, nie wywołano PageSpeed i nie opublikowano kodu na produkcji.

## Co rzeczywiście da się zweryfikować bez dostępu administratora

W tym etapie dodano `scripts/site-doctor-d1-migration-qa.py` i automatyczny krok CI. Skrypt wykorzystuje standardowy moduł `sqlite3` Pythona i **prawdziwy plik SQLite na dysku** (nie zastępczy licznik w JavaScript). Uruchamia dokładnie migrację `migrations/site-doctor-pilot/0001_one_shot.sql` z repo, testuje:
- Istnienie tabeli i `PRIMARY KEY CHECK (id = 1)`, odrzucenie `id=2`.
- Jednoczesne połączenia **12 osobnych sesji SQLite** wykonujących `INSERT OR IGNORE`: dokładnie jedno `rowcount=1`, pozostałe `0`.
- Ponowne połączenie i ponowne wykonanie migracji **nie czyszczą** uprzednio zużytego klucza.
- Brak odczytu/zmiany jakiejkolwiek bazy Cloudflare; baza tworzona jest tylko w katalogu tymczasowym runnera GitHub Actions.

To potwierdza **semantykę SQLite i poprawność migracji**, ale nie weryfikuje prawdziwej konfiguracji Cloudflare D1 Binding, WAF ani quota. Osobny mock serwera pokrywa działanie `meta.changes=1` i `0` oraz brak kontaktu z Google po błędzie.

## Ręczna inspekcja, bez sekretnych danych w GitHub/ChatGPT

Poniższych punktów **nie oznaczaj jako PASS bez dowodów z właściwego konta**.

### A. Cloudflare — właściwy projekt i osobna baza

1. Sprawdź w Workers & Pages, czy projekt hostujący `codefix.it` rzeczywiście powiązany jest z repo `wwwCodeFixIT/CodeFix.IT---Portfolio-Short`. Nie zakładaj, że nazwa repo jest nazwą projektu Pages.
2. Sprawdź strefę `codefix.it` i rzeczywisty plan konta (Free/Pro/Business/Enterprise). Zanotuj samą nazwę planu, bez tokenów.
3. Zweryfikuj, czy istnieje **wydzielona baza** D1 na pilota. Jeśli nie: utworzenie dopiero po zatwierdzeniu, najlepiej `codefix-site-doctor-pilot` bez rekordów CRM.
4. Uruchom SQL migracji [0001_one_shot.sql](../migrations/site-doctor-pilot/0001_one_shot.sql) w tej bazie przed aktywacją pilota.
5. Sprawdź Pages → Settings → Bindings → D1 database i dokładną nazwę `SITE_DOCTOR_PILOT_DB`, poprawne ID wybranej bazy, zakres **Production** i ostatni deployment po zmianie bindingu.
6. W konsoli SQL D1 wykonaj tylko **odczyt**:
   ```sql
   SELECT id, claimed_at FROM site_doctor_pilot_claims;
   ```
   Wynik pusty = pilot niewykorzystany; wiersz z `id=1` = pilot wykorzystany. Nie kasuj wiersza, by ponawiać pomiar.
7. Dla Preview nie kopiuj produkcyjnego tokenu ani klucza Google; Cloudflare obsługuje odrębne bindingi Production/Preview. Dokumentacja: https://developers.cloudflare.com/pages/functions/bindings/#d1-databases.

### B. Cloudflare WAF — rzeczywista ochrona

1. Otwórz Security → WAF → Rate limiting rules i potwierdź **aktywną** regułę odnoszącą się do `/api/site-doctor`; zapisz ID (bez tokenów) i czy reguła działa dla domeny `codefix.it`.
2. Zweryfikuj warunek zgodny z rzeczywistym planem. Według aktualnej tabeli Cloudflare: Free ma warunek ścieżki i 10-sekundowe okno, Pro oferuje host/URI i do 1 min, Business m.in. metodę HTTP i do 10 min. Nie ustawiaj warunku `http.request.method` na planie, który go nie obsługuje.
3. Zweryfikuj charakterystykę limitu (np. IP), liczbę żądań, okno i akcję Block. Security Events powinny potwierdzić blokady na rzeczywistych żądaniach — bez testów na żywym Google przed uruchomieniem.
4. Limity WAF nie są idealnym licznikiem całkowitych kosztów: Cloudflare dopuszcza niewielkie opóźnienie liczników i osobne liczenie w lokalizacjach. Właśnie dlatego prywatny pilot ma dodatkowy twardy znacznik D1.

Dokumentacja: https://developers.cloudflare.com/waf/rate-limiting-rules/ oraz https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/.

### C. Google Cloud — quota, klucz i budżet

1. Sprawdź projekt i czy włączono PageSpeed Insights API.
2. Sprawdź dostępne limitowanie zapytań w Google Cloud, podstawę naliczania i rzeczywiste wykorzystanie, zanim włączysz skaner. Nie przyjmuj domyślnie, że usługa jest bez kosztów w każdej konfiguracji.
3. Klucz ogranicz do PageSpeed Insights API i zapisz wyłącznie jako zaszyfrowany sekret Cloudflare Pages Production `PAGESPEED_API_KEY`.
4. `AI_TOOLS_ENABLED=false`, `SITE_DOCTOR_ENABLED=false` do końca pilota. Oddzielny klucz OpenAI nie jest potrzebny.

### D. Przed pierwszym i po pierwszym canary

Przed: wszystkie powyższe punkty rzeczywiście sprawdzone, migracja zastosowana, stan D1 pusty, token 64-znakowy w sekretach, WAF realny, quota ustalona, osobna zgoda właściciela na jeden pomiar. Dopiero wtedy krótko `SITE_DOCTOR_PILOT_ENABLED=true` przy `SITE_DOCTOR_ENABLED=false` i `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true`. Test własnej strony odbywa się przez skrypt [LAB-8](site-doctor-lab8-private-pilot.md); `includeAi=false`, bez CRM.

Po: bez względu na sukces albo błąd, w D1 powinien być dokładnie **jeden** rekord, brak możliwości ponownego POST, publiczny `/api/tool-status` nadal `doctor:false`; natychmiast wyłącz `SITE_DOCTOR_PILOT_ENABLED` i zrotuj/usuń `SITE_DOCTOR_PILOT_TOKEN`. Zapisz wynik testu i stan zużycia kwoty Google.

**Go/no-go:** bez autoryzowanego potwierdzenia Cloudflare+Google Cloud = **HOLD**. Zielone CI nie znaczy, że realna baza została utworzona. Włączenie publicznego skanera to osobny release gate.
