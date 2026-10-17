# LAB-10 — odczytowy audyt infrastruktury Cloudflare Site Doctor

**Status: HOLD.** Kod i testy nie włączają usług, nie wykonują płatnego pomiaru PageSpeed, nie modyfikują WAF, D1 ani Pages. Realna sesja administratora Cloudflare i Google Cloud **nie została potwierdzona**; dopóki brak takiego dostępu, narzędzie bada jedynie fixture w CI, a nie ustawienia konta.

## Cel i zakres

Skrypt `scripts/site-doctor-infra-readiness.mjs` pobiera wyłącznie **3 GET** z publicznie udokumentowanego Cloudflare REST API za pomocą osobnego, ograniczonego tokenu Read:

1. `GET /zones/{zone_id}`: sprawdza nazwę, aktywność strefy i plan.
2. `GET /accounts/{account_id}/pages/projects/{project_name}`: sprawdza domenę Pages, binding D1 `SITE_DOCTOR_PILOT_DB`, typy szyfrowania sekretów `PAGESPEED_API_KEY` i `SITE_DOCTOR_PILOT_TOKEN` w Production oraz ich brak w Preview. Sprawdza również flagi aktywacji, bez ujawniania wartości kluczy.
3. `GET /zones/{zone_id}/rulesets/phases/http_ratelimit/entrypoint`: szuka włączonej reguły Block z zakresem `/api/site-doctor`, licznikiem IP (`ip.src` albo `cf.unique_visitor_id`) i dodatnim progiem/oknem. Brak ruleset (404) jest sygnałem blokującym.

Dokumentacja Cloudflare: [Pages project](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/), [WAF Rulesets](https://developers.cloudflare.com/api/resources/rulesets/), [D1](https://developers.cloudflare.com/api/resources/d1/).

**Ważne:** znalezienie definicji reguły nie potwierdza jej faktycznego egzekwowania dla ruchu użytkowników. Konieczna jest manualna kontrola w Cloudflare Security Events. D1 binding nie potwierdza istnienia tabeli. D1 REST Query korzysta z metody POST nawet przy SQL SELECT, więc celowo nie występuje w tym audycie GET-only. Limit Google Cloud też wymaga odrębnej kontroli w Google Cloud.

## Instrukcja użycia (tylko lokalny terminal administratora)

Potrzebny jest token Cloudflare **z uprawnieniami odczytu**, nie Global API Key; zakres ograniczony do właściwego konta/strefy, w szczególności `Pages Read`, `Zone Read` / `Zone Settings Read` oraz `Zone WAF Read` / `Zone Rulesets Read` zależnie od rzeczywiście dostępnych uprawnień panelu. Nie twórz tokenu dającego Write tylko na potrzeby audytu.

```bash
# Uruchomienie samych lokalnych testów; nie wymaga kont.
npm run doctor:infra:smoke

# Po uzyskaniu dostępu Read do właściwego Cloudflare:
# Podaj ID strefy, konta i nazwę projektu w terminalu.
# Token wprowadź bez echa i nie zapisuj w historii poleceń.
read -rs -p 'Cloudflare read-only API token: ' CLOUDFLARE_API_TOKEN; echo
export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID='<account-id>'
export CLOUDFLARE_ZONE_ID='<zone-id>'
export CLOUDFLARE_PAGES_PROJECT='<project-name>'
npm run doctor:infra:inspect
unset CLOUDFLARE_API_TOKEN
```

**Nie wklejaj tokenów, identyfikatorów konta ani zawartości konfiguracji zawierającej sekrety do rozmowy.** Skrypt drukuje tylko statusy i przyczyny HOLD, bez wartości sekretów, tokenu API, D1 database ID i pełnych wyrażeń reguł WAF.

## Ocena wyników

`status` pozostaje **HOLD niezależnie od liczby pasujących reguł** — wymagana jest osobna ręczna akceptacja. Warunki zablokowania obejmują:

- Zła/nieaktywna strefa lub domena Pages.
- Brak aktywnej reguły WAF rate limiting obejmującej `/api/site-doctor`, z blokadą i charakterystyką per IP.
- Brak wiązania D1, błąd typu identyfikatora lub brak ręcznego potwierdzenia wyodrębnionej bazy.
- Brak sekretów produkcyjnych lub umieszczenie ich w Preview.
- Publiczny skaner lub prywatny pilot już włączony przed zatwierdzeniem.
- Niepotwierdzona liczba udostępnionych zapytań PageSpeed, restrykcja klucza API lub schemat D1.

**Kolejne czynności po raporcie:** w Cloudflare D1 sprawdź strukturę tabeli i pusty stan roszczenia pilota; potwierdź WAF Events i faktyczne limity/plan. Następnie potwierdź limity PageSpeed w Google Cloud. Jeśli potrzebne są zmiany konfiguracji, należy je osobno zaakceptować. Dopiero po potwierdzeniu całej bramki można planować pierwszy live canary z LAB-8/9.

## Wycofanie pilota

Zachowaj `SITE_DOCTOR_ENABLED=false` przez wszystkie testy; prywatny pilot uruchamiaj tylko na krótko po zatwierdzeniu, a potem natychmiast `SITE_DOCTOR_PILOT_ENABLED=false`, zrotuj lub usuń jego sekret i zweryfikuj ponownie `doctor:false`.

*Nie traktuj zielonego CI ani 3 udanych GET jako dowodu aktywnego WAF, gotowości rozliczeń lub zezwolenia na płatne zapytanie.*
