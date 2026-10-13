# Hero CodeFix.IT — interakcja i scena przestrzenna

Pierwsza sekcja zawiera przestrzenny znak marki z sześciu płaszczyzn CSS, unoszenie, siatkę w tle i światło reagujące na położenie myszy. Scena używa obecnego znaku WebP, z ustalonymi wymiarami i niskim priorytetem dodatkowego obrazu. Nie dodaje bibliotek ani nowego śledzenia.

## Sterowanie i dostępność

- Ruch działa przy myszy i możliwości hover. Znak reaguje w zakresie ±5° w osi X i ±7° w osi Y; dekoracje nie zasłaniają linków.
- Przycisk z `aria-pressed` pozwala zatrzymać i ponownie włączyć ruch znaku oraz tła.
- Urządzenia dotykowe i `prefers-reduced-motion` otrzymują statyczny wariant. Dekoracyjna geometria jest ukryta przed czytnikami ekranu; sterowanie pozostaje poza nią.
- Ukryta karta i hero poza viewportem wyłączają animacje. Słuchacze, obserwator i oczekująca klatka są sprzątane przy odmontowaniu.
- Aktualizacje wskaźnika są łączone w jedną klatkę. Ruch myszy nie powoduje ponownego renderowania formularzy lub kart usług.

Sześć ścianek jest opisanych jako geometria komponentu. Położenia powierzchni nie są kopiowane do globalnych arkuszy strony. Dotychczasowe linki, H1, oferta, kalkulator i formularz zachowują swoje funkcje.

## Budżety

Poniższe porównanie opisuje pierwszą wersję hero i kalkulatora. Bieżący, krótszy układ strony oraz jego walidację opisuje [dokument uproszczenia](homepage-minimal-v1.md) i aktualny opis PR #91.

Usunięto nieużywane style wcześniejszego bannera zgód, fragmentów portfolio i stopki oraz dwie identyczne wcześniejsze deklaracje. Nie podniesiono limitów paczek.

| Zasób               | Kalkulator | Kalkulator + hero |    Limit |
| ------------------- | ---------: | ----------------: | -------: |
| Entry JS            |   200702 B |          200739 B | 215000 B |
| Największy chunk JS |    40754 B |           44690 B |  50000 B |
| Łączny JS           |   306192 B |          310165 B | 320000 B |
| Łączny CSS          |    69685 B |           69988 B |  70000 B |

## Walidacja

PASS: typecheck, lint, production lint, format, czysty build/prerender, build budgets, hero smoke, estimator smoke, measurement-consent smoke i mobile CTA source smoke.

`hero:smoke` sprawdza ograniczenie kąta i światła, nieprawidłową geometrię, łączenie wielu zdarzeń w jedną klatkę (także ID 0), użycie ostatniej pozycji myszy, anulowanie i brak dostępu do odmontowanego DOM. Test jest uruchamiany w CI.

PASS w Chrome przy 1348 × 936 px: kontrola wizualna hero, reakcja na mysz, pauza i wznowienie klawiaturą, wyłączenie ruchu po przewinięciu poza ekran oraz linki wszystkich usług. Wyniki i zakres walidacji zapisano w [raporcie kontroli podglądu](interactive-preview-qa-v1.md).

NOT RUN: widoki 390/1440 px, dotyk, rzeczywista zmiana preferencji ograniczenia ruchu, ukrycie karty, fizyczny iPhone/Safari, Lighthouse i pełny audyt WCAG. Dostępna kontrola przeglądarki nie udostępnia emulacji viewportu ani preferencji. Nie wysyłano próbnych zgłoszeń do produkcyjnego CRM.
