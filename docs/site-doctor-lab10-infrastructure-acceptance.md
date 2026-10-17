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


## LAB-11 — aktualizacja z odbioru ręcznego 17.10.2026

Źródło poniższych ustaleń: **ekrany przedstawione przez właściciela w trakcie ręcznej konfiguracji**. Nie są to wyniki odczytu poświadczonego tokenem administracyjnym; żadnych wartości kluczy nie zapisano do repozytorium ani w dokumentacji. Poprzedni opis „nie utworzono bazy” odnosi się do stanu przed ręczną konfiguracją.

| Kontrola | Dowód z odbioru | Stan |
| --- | --- | --- |
| Projekt Pages i wdrożenie | Domena `codefix.it`, automatyczne publikacje z `main`; widoczny commit produkcyjny `59b64e4`. | **POTWIERDZONE NA EKRANIE** |
| Baza D1 | Wydzielona `codefix-site-doctor-pilot`; D1 Console pokazała 1 tabelę oraz `SELECT COUNT(*) AS used FROM site_doctor_pilot_claims;` = **0**. Wykonana ręcznie definicja `CREATE TABLE` odpowiada migracji repo. | **POTWIERDZONE NA EKRANIE** |
| Binding Pages | `SITE_DOCTOR_PILOT_DB` → `codefix-site-doctor-pilot`, widoczny w Settings → Bindings. | **ZAPISANY; ZAKRES PRODUCTION I DEPLOYMENT PO ZMIANIE DO SPRAWDZENIA** |
| WAF plan i reguła | Plan **Free**. Zapisana reguła `CF - Site Doctor - Rate Limit`, dokładny URI path `/api/site-doctor`, **2 żądania / 10 s / IP**, akcja Block na 10 s, Active. Panel pokazuje 1/1 — trójkąt tylko informuje o wykorzystaniu limitu reguł planu. | **ZAPISANA; REALNY EGZEKWOWANY BLOCK W SECURITY EVENTS NIEPOTWIERDZONY** |
| Google Cloud | Wydzielony projekt `codefixit-site-doctor`; `pagespeedonline.googleapis.com` włączony. Limit dzienny zmieniono z 25 000 na **5**, a minutowy z 30 na **2** — Google wyświetlił oba potwierdzenia aktualizacji. | **POTWIERDZONE NA EKRANIE** |
| Klucz Google | Klucz ograniczony do **PageSpeed Insights API**, aplikacja: Brak (serwer Cloudflare). W Pages `PAGESPEED_API_KEY` widoczny jako **Secret / Value encrypted**; nazwę potwierdził właściciel. | **ZAPISANY; ZAKRES PRODUCTION I DEPLOYMENT PO ZMIANIE DO SPRAWDZENIA** |
| Flagi | W widocznym środowisku w Pages nie ma `SITE_DOCTOR_ENABLED` ani `SITE_DOCTOR_PILOT_ENABLED`. Ich brak jest równoważny trybowi OFF w obecnym kodzie. | **PUBLICZNY SKANER NIEAKTYWOWANY (NA POZIOMIE KONFIGURACJI)** |
| Bezpieczeństwo kodu | CI `39031667346` PASS dla `9442d53b`; poprawność SQLite sprawdzona na 12 równoczesnych sesjach lokalnych. | **PASS W CI; D1 CLOUDFLARE NIE ZOSTAŁO PRZETESTOWANE ŻĄDANIEM POST** |

### Pozostałe blokady wdrożenia (wymagane, nie pomijaj)

1. W panelu Pages **jednoznacznie sprawdź Production** dla bindingu D1 i sekretu API oraz odnotuj, czy zaktualizowany deployment odczytuje zmiany. Sytuacji nie rozstrzyga sam widok `main` w sekcji Build.
2. Potwierdź przez Security Events albo inną autoryzowaną obserwację, że WAF **rzeczywiście** chroni ścieżkę na `codefix.it`; pamiętaj, że obecny warunek obejmuje też GET (brak filtra metody). Nie wykonuj testów obciążeniowych ani płatnych POST tylko dla takiej kontroli.
3. **Nie włączaj** `SITE_DOCTOR_ENABLED`, `SITE_DOCTOR_PILOT_ENABLED` ani `SITE_DOCTOR_RATE_LIMIT_CONFIRMED` przy tej dokumentacyjnej weryfikacji. Do prywatnego canary potrzeba ponadto osobnego tokenu 64 hex, jawnej zgody oraz kontrolowanego przełączenia flag *dopiero po wdrożeniu kodu*.
4. Łańcuch PR-ów **#118 → #119 → #120 → #122** jest Draft; Production ma automatyczne wdrożenia `main`. Scalenie wymaga odrębnego, wyraźnego zatwierdzenia właściciela. Nie utożsamiaj zielonego CI z zgodą na publikację.
5. Wykonaj dostępny preflight **tylko GET** w docelowym środowisku bez wywołania Google. Każdy prawdziwy POST PageSpeed wymaga osobnej zgody; nie ma automatycznych ponowień i D1 zużywa próbę również przy błędzie dostawcy.

**Decyzja po odbiorze infrastruktury: HOLD na merge, aktywację i live canary.** Wykonano konfigurację zasobów ręcznie, lecz nadal nie potwierdzono zakresu środowiskowego, wdrożenia bindingów/sekretu i skuteczności WAF w ruchu. Docelowy stan bezpieczny: publiczny i prywatny Site Doctor pozostają OFF.


## LAB-12 — przygotowany test działania WAF wyłącznie metodą GET (bez uruchomienia)

Zamiast wnioskować o egzekwowaniu reguły wyłącznie z ekranu „Active”, dodano
`scripts/site-doctor-waf-get-only-probe.mjs` oraz automatyczny **wyłącznie mockowany**
`scripts/site-doctor-waf-get-only-smoke.mjs`.

**Tryb domyślny: STOP; brak sieci.** Prawdziwy test wymaga osobnej, świadomej zgody
właściciela: argumentu `--one-waf-get-only-observation` oraz zmiennej
`SITE_DOCTOR_WAF_READONLY_APPROVAL=I_APPROVE_FOUR_WAF_READONLY_GETS`.
Nie dodawać tej zgody do sekretów GitHub Actions, workflow ani Cloudflare.
Skrypt nie wykonuje się w żadnym automatycznym workflow; CI testuje go przy
podstawionym `fetch`, bez wyjścia do Internetu.

Działanie po ręcznym zatwierdzeniu:
- Co najwyżej 4 kolejne **GET** na jeden, sztywny adres
  `https://codefix.it/api/site-doctor`, z wyłączonym cache i bez przekierowań.
  Żadnego POST, body, cookies, tokenu, AI, Google PageSpeed ani CRM.
- 405 oznacza typową odpowiedź funkcji dla GET. WAF na planie Free ma
  skonfigurowane 2 żądania na 10 s na IP, ale licznik może zadziałać z
  opóźnieniem i zależy od ruchu oraz lokalizacji. Test może tymczasowo
  zablokować IP wykonujące test na tym endpointcie (około 10 s).
- 403/429 po wcześniejszym 405 to **wyłącznie sygnał potencjalnej blokady**.
  Nie jest dowodem działania konkretnej reguły. Wymagane dopasowanie
  Security Events po czasie i WAF rule ID/expression/action. Brak sygnału
  lub brak eventu = **HOLD**, nie „PASS”.
- Test nie potwierdza poprawnego zakresu Production dla D1 ani sekretu
  `PAGESPEED_API_KEY`; te bramki pozostają odrębne.

**Stan LAB-12:** skrypt i smoke test przygotowane, test realny **NIEURUCHOMIONY**.
Brak zgody na live WAF probe, merge, publiczne skanowanie i płatny canary.
