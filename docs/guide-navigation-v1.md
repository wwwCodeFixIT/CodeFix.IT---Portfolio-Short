# Nawigacja w poradnikach — 16.10.2026

PR [#103](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/103). Opublikowany commit: `cfbf21048be5bcc7c973e8bbf4648c69e0198748`; drzewo `bcc04b3ad4f3a4a3b7ad83d75b074ac498f351d9`, identyczne z przetestowanym kandydatem `34fd8e6f004091a1203da5c3c4fad679d085177a`. Runtime: `/assets/index-CP1My2iW.js`.

## Zachowanie

Dziewięć poradników ma zwijany spis treści z sekcjami artykułu i FAQ. Pasek pozostaje pod nagłówkiem strony. Menu otwiera się nad tekstem z nieprzezroczystym tłem; nie zmienia wysokości artykułu. Bieżąca sekcja ma wyróżnienie i `aria-current="location"`, a zwinięty pasek pokazuje jej numer.

Linki mają natywne fragmenty `#sekcja-1` itd. oraz `#pytania`. Po wyborze spis się zamyka, nagłówek otrzymuje fokus i pozostaje pod paskiem. Działają bezpośrednie adresy, odświeżenie, historia i klawisze Enter, Spacja oraz Escape. Escape zamyka menu i przywraca fokus jego podsumowaniu. Przewijanie nie zmienia adresu ani historii.

W poradnikach przejścia do kotwic są bezpośrednie: globalna animacja przewijania nie konkuruje z przenoszeniem fokusu. Oznaczenie sekcji uwzględnia pozycję czytania i koniec dokumentu, gdzie ostatniego nagłówka nie zawsze da się dosunąć do góry. Pasywny nasłuch scala pomiary w requestAnimationFrame; nasłuchy i oczekująca klatka są czyszczone przy usunięciu komponentu.

Pełne teksty, listy kontrolne, FAQ i spis treści wszystkich dziewięciu artykułów są również w wygenerowanym HTML. Bez JavaScriptu całość można przeczytać i używać natywnych odnośników. Treści pochodzą z istniejącego katalogu i są escapowane. Canonical pozostaje czystym adresem artykułu.

## Weryfikacja

- CI [#945](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38877188315): PASS — TypeScript, ESLint, format, build, audit zależności produkcyjnych, SEO i dotychczasowe smoke testy.
- [Contact Submission Audit #40](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38877188327): PASS, 140/140 scenariuszy.
- 140 scenariuszy: 12 nawigacji i 2 przebiegi bez JS po wszystkich 9 artykułach, 14 wyszukiwania, 12 podglądu realizacji, 12 kreatora, 52 wysyłki, 24 ścieżki poradników/projektów i 12 przykładu automatyzacji.
- Nowa nawigacja: Chromium i WebKit; 320, 390 i 1280 px; obie preferencje ruchu. Kontrola głębokiego linku, fokusu i widoczności nagłówka, otwierania bez skoku, tła menu, 44 px obszarów klikania, oznaczenia sekcji, szybkiego przewinięcia, Wstecz, klawiatury, FAQ, canonical, atrybucji, przepełnienia i braku nowych żądań.
- 78 przechwyconych żądań testowych, 0 rzeczywistych zgłoszeń.
- Statyczne SEO: 20 stron, 143 linki wewnętrzne, 48 kotwic, metadane i JSON-LD — PASS.

| Zasób                  |    Wynik |    Limit |
| ---------------------- | -------: | -------: |
| Wejście JS             | 202191 B | 215000 B |
| Największy deferred JS |  49331 B |  50000 B |
| Cały JS                | 329780 B | 330000 B |
| Największy CSS         |  38178 B |  40000 B |
| Cały CSS               |  79759 B |  80000 B |

Wzrost względem produkcji e071a77: 2122 B JS i 1058 B CSS na trasach poradników. Limity sum jawnie zmieniono z 328000/79000 B do 330000/80000 B; limity wejścia i największych plików pozostają takie same. Nie dodano zależności ani usług. Produkcyjny npm audit: 0 podatności; zakres nie obejmuje istniejących zależności developerskich.

## Podgląd i produkcja

Końcowy podgląd: https://9dda83af.codefix-it---portfolio-short.pages.dev/poradniki/wordpress-nie-wysyla-maili/#sekcja-3. Ręcznie sprawdzono runtime, głęboki link, fokus, odstęp pod paskiem, otwieranie menu zwykłym kliknięciem bez przesunięcia sekcji, wyróżnienie, nieprzezroczyste tło oraz przejście do pierwszej sekcji. Nie wysyłano formularzy.

Po wdrożeniu: [CI 38878239427](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38878239427), [SEO Production Smoke 38878239568](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38878239568), [Pages 38878238508](https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38878238508) i Cloudflare Pages 116898566741 — success. Smoke produkcyjny potwierdził robots.txt, sitemapę, 20 indeksowalnych stron z HTML oraz prawdziwe 404 z noindex.

Na https://codefix.it/poradniki/wordpress-nie-wysyla-maili/#sekcja-3 potwierdzono zgodny runtime i canonical, odświeżenie fragmentu, fokus i oznaczenie sekcji, otwieranie bez przesunięcia tekstu, nieprzezroczyste tło menu, natywne przejście do sekcji 1 i powrót do sekcji 3 przyciskiem Wstecz, przejście do FAQ oraz otwarcie odpowiedzi, Escape z przywróceniem fokusu, Enter i brak poziomego przepełnienia. Nie wysyłano formularzy.

Zrzut opublikowanej strony: `qa/codefix-guide-navigation-production-20261016.jpg`. Pełne wyniki: `qa/guide-navigation-20261016.json`. Archiwum w gałęzi `reports/guide-navigation-20261016`, bez dodatkowego wdrożenia aplikacji.

Nie wykonywano rzeczywistej wysyłki do CRM, testu na fizycznym iPhonie, audytu czytnikiem ekranu ani nowego Lighthouse.
