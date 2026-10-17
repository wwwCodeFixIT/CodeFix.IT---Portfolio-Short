# Laboratorium na stronie głównej — 17.10.2026

Laboratorium jest dostępne pod `/#laboratorium`, z menu desktopowego i mobilnego. Sekcja zawiera krótkie wprowadzenie, natywny panel rozwijany i link do `/narzedzia/` w nowej karcie.

## Zachowanie

- `HomeLaboratory` wczytuje wspólny `ToolsWorkspace` dopiero po otwarciu. Przed otwarciem strona nie pobiera modułu narzędzi ani ich konfiguracji.
- Brief, mapa, podgląd SEO i kontrast działają w miejscu. Zwijanie zachowuje stan narzędzi. Osobna trasa korzysta z tego samego komponentu.
- Przejście do zapytania wybiera odpowiednią usługę i przenosi fokus, zachowując formularz w DOM i wpisane dane. Brief można skopiować; przycisk przejścia nie dołącza go automatycznie. Raport Site Doctor jest dołączany po osobnym kliknięciu.
- Osadzony panel nie zmienia tytułu, canonicala ani opisu strony i nie dodaje kolejnego `main` ani `h1`. Instancje skanera mają unikalne identyfikatory również obok dialogu diagnostycznego.
- Dostępność usług online nadal wynika z backendu. Publikacja nie aktywuje kluczy, WAF ani dostawców.
- Statyczny HTML zawiera sekcję i link do narzędzi. Natywna nawigacja bez JavaScriptu ma również pozycję Laboratorium.

## Kontrole

Lokalnie: TypeScript, ESLint, formatowanie, build, SEO (21 stron, 156 linków, 56 kotwic), dotychczasowa logika estymatora, mapy i przekazania raportu.

GitHub Actions: dotychczasowy audyt kontaktu i narzędzi oraz `home-laboratory-qa.mjs`. Nowa kontrola obejmuje 12 kontekstów Chromium/WebKit: 320/390/981/1280 px, błędne ładowanie modułu, dwa raporty równocześnie, zachowanie danych i metadanych, leniwe ładowanie i lokalne narzędzia. Wszystkie wywołania dostawców oraz zgłoszenia są blokowane albo przechwytywane.

Po publikacji ten sam skrypt wykonuje sześć kontekstów na codefix.it, bez wysyłania formularza lub uruchamiania usług online. Wyniki i zrzuty zapisuje istniejący workflow SEO Production Smoke.

Budżety JS uwzględniają nową sekcję: największy odroczony plik do 59000 B, suma do 382000 B. Entry i limity CSS pozostają bez zmian. Build: entry 202793 B, homepage 58955 B, suma JS 381953 B, suma CSS 101793 B. Runtime: `/assets/index-DgxMWDtL.js`.
