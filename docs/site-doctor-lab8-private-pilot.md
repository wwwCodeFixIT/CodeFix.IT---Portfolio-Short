# LAB-8 — prywatny pilotaż Site Doctor bez publicznego uruchamiania

**Stan: DRAFT / HOLD.** To separacja testów dostawcy od aktywacji publicznego skanera. Nie konfiguruje automatycznie Cloudflare, WAF, Google Cloud ani kosztów. Wszystkie flagi i sekrety pozostają niewprowadzone aż do ręcznego odbioru.

## Dlaczego ten etap?

Dotychczasowy canary wymagał publicznej flagi `SITE_DOCTOR_ENABLED=true`, więc podczas pierwszego testu inni goście mogliby już uruchamiać odpłatne pomiary. Ten etap wprowadza **niezależny, niewidoczny dla użytkowników tryb pilotażu**, zabezpieczony sekretem. `/api/tool-status` nadal zwraca `doctor:false`; UI nie udostępnia skanera klientom.

## 1. Tryby (wzajemnie wykluczające się)

| Tryb | `SITE_DOCTOR_ENABLED` | `SITE_DOCTOR_PILOT_ENABLED` | Publiczne skanowanie |
| --- | --- | --- | --- |
| Wyłączony | false | false | Niedostępne |
| Pilotaż prywatny | false | true | Niedostępne; dozwolony tylko autoryzowany kontrolny POST |
| Publiczny | true | false | Możliwe po sprawdzeniu WAF, klucza i limitu Google |
| Konflikt | true | true | **503 — fail-closed** |

W każdym trybie aktywacji muszą istnieć `PAGESPEED_API_KEY` oraz `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true`. Sam boolean **nie ustawia WAF**. Najpierw skonfiguruj prawdziwą regułę i zweryfikuj jej działanie bez korzystania z dostawcy. Reguły są uzależnione od planu Cloudflare; oficjalna tabela: https://developers.cloudflare.com/waf/rate-limiting-rules/

## 2. Token pilotażu

Do Pages **Production** dodaj `SITE_DOCTOR_PILOT_TOKEN` jako *Encrypt/Secret*; wartość musi być dokładnie 64-znakowym **losowym, małoliterowym hexem** (256 bitów). Generuj np. `openssl rand -hex 32` lokalnie, nie w repozytorium ani w rozmowie. Nie stosuj publicznych zmiennych `VITE_*`. Sekret po stronie osoby wykonującej canary musi być **identyczny**, ale nie powinien trafiać do GitHub Actions secrets lub logów, jeśli nie jest to potrzebne.

Token jest wysyłany tylko jako nagłówek `Authorization: Bearer <token>`, wraz z prawidłowym `Origin: https://codefix.it`; serwer odrzuca brak tokenu lub niepoprawną wartość odpowiedzią 503 (również gdy publiczna diagnostyka jest wyłączona). Token nie jest umieszczany w adresie URL.

**Ważne:** token jest wielorazowym sekretem, nie jednorazowym biletem. Skrypt klienta wysyła maksymalnie **jedno** żądanie POST na każde uruchomienie, ale to nie gwarantuje jednego skanu globalnie. Dlatego nadal wymagane są WAF, limit Google i natychmiastowe **wyłączenie `SITE_DOCTOR_PILOT_ENABLED` oraz usunięcie/rotacja tokenu po teście**. Nie należy wystawiać tego trybu na dłuższy czas.

## 3. Serwerowa blokada kosztów i danych w trybie pilotażu

Nawet po poprawnej autoryzacji można mierzyć **wyłącznie**:
- `url: https://codefix.it/` — dokładnie główną stronę, bez parametrów, podstron i fragmentów;
- `problem: seo`;
- `description: ""`;
- `includeAi: false` — żadnych wywołań OpenAI, niezależnie od flag generatywnych.

Nieprawidłowa kombinacja zwraca 403 **przed** wywołaniem Google. Skrypt testowy nie może skanować innych domen ani odczytywać danych kontaktowych lub wysyłać leadów.

## 4. Bezpieczna kolejność odbioru

1. Sprawdź faktyczny plan Cloudflare, aktywną regułę WAF na `codefix.it/api/site-doctor`, licznik per IP oraz zdarzenia blokowania. Sprawdź limit Google PSI i restrykcję klucza do właściwego API.
2. Zapisz `PAGESPEED_API_KEY` oraz `SITE_DOCTOR_PILOT_TOKEN` jako *dwa sekrety* w Cloudflare Pages Production. Pozostaw `SITE_DOCTOR_ENABLED=false`, `AI_TOOLS_ENABLED=false`.
3. Na krótki czas ustaw `SITE_DOCTOR_PILOT_ENABLED=true` i `SITE_DOCTOR_RATE_LIMIT_CONFIRMED=true`; wdróż konfigurację. **Jeżeli pojawiają się błędy: zatrzymaj procedurę, nie włączaj publicznego skanera.**
4. `npm run doctor:activation:preflight` powinien wciąż pokazywać `configuredActive:false`. To prawidłowe; oznacza publicznie wyłączone narzędzie. Nie potwierdza dostępności pilota.
5. Po osobnej zgodzie właściciela i ręcznym dostarczeniu tokenu do **lokalnego środowiska wykonawczego** uruchom pojedynczy canary (poniżej). Nie przechowuj sekretu w historii terminala, logach CI ani zmiennych jawnych w interfejsie.
6. Oceń status 200, realne oceny Lighthouse i licznik Google. W razie 429/5xx/timeout **nie ma automatycznej próby ponownej**; zgłoś problem bez kolejnego kosztu.
7. **Od razu wyłącz tryb pilota, usuń lub zrotuj sekret tokenu i opublikuj zaktualizowane zmienne.** Publiczne `SITE_DOCTOR_ENABLED` pozostaje false.
8. Dopiero po zaakceptowaniu wyniku pilota, dostępnych limitów i kosztów można osobno zatwierdzić publiczną aktywację `SITE_DOCTOR_ENABLED=true` przy `SITE_DOCTOR_PILOT_ENABLED=false`, stale aktywnym WAF i kluczu Google. Nie uruchamiaj tego z automatu.

### Komendy (lokalnie, po uzyskaniu zgód)

```bash
npm run doctor:pilot:smoke
npm run doctor:activation:preflight

# Dopiero po konfiguracji WAF, quota i sekretów Cloudflare.
# Token powinien być wprowadzony tajnie do bieżącej sesji terminala.
read -rs -p 'Site Doctor pilot token: ' SITE_DOCTOR_PILOT_TOKEN; echo
export SITE_DOCTOR_PILOT_TOKEN
SITE_DOCTOR_WAF_VERIFIED=true \
SITE_DOCTOR_QUOTA_VERIFIED=true \
SITE_DOCTOR_CANARY_APPROVAL=I_APPROVE_ONE_REAL_PAGESPEED_SCAN \
node scripts/site-doctor-activation-canary.mjs --one-live-site-doctor-scan
unset SITE_DOCTOR_PILOT_TOKEN
```

Nie dopisuj komendy z rzeczywistym tokenem do dokumentacji ani do logów. `doctor:pilot:smoke` działa na atrapach, a domyślny GitHub workflow wykonuje **wyłącznie GET i testy z atrapami**, bez realnego POST.

## 5. Stan aktualny

Sprawdzony produkcyjny `GET /api/tool-status` zwracał `doctor:false` i `ai:false` (17.10.2026). To nie dowodzi konfiguracji WAF, Google Cloud ani istnienia pilota. **Pilot nie został skonfigurowany ani uruchomiony na produkcji.**
