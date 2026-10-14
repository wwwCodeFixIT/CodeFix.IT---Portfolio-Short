# CodeFix.IT — kontrola mobilnego pierwszego ekranu

Celem jest wcześniejsza widoczność przycisków Strona / Aplikacja / Naprawa i wygodny dostęp do kalkulatora przy zachowaniu bieżącej oferty, jednoosobowej treści i identyfikacji CodeFix.IT.

## Zmiany

- Informacje o standardzie pracy są za panelem wyboru w kolejności DOM. Desktop układa te same elementy w dotychczasowych dwóch kolumnach.
- Znak 3D znajduje się pod wyborem i CTA; na małym ekranie ma mniejszy rozmiar.
- Nagłówek mobilny jest odrobinę mniejszy, a dwa przyciski mieszczą się w jednym rzędzie. Pełna nazwa kalkulatora pozostaje nazwą dostępną.
- Focus obu głównych przycisków ma ten sam widoczny obrys. Usunięto nadpisane i zbędne deklaracje CSS, aby zachować limity.

## Metoda

Kontrola odbywa się w Chrome na samodzielnym dokumencie QA uruchamiającym te same skompilowane moduły i arkusze co podgląd. Jego obszar strony ma zadaną szerokość. Nie jest to emulator sprzętu, dotyku ani Safari. Wysyłka formularza i opcjonalne pomiary są wyłączone w dokumencie QA. Nagłówki bezpieczeństwa strony nie są zmieniane. Tymczasowy plik QA zostanie usunięty przed końcową wersją PR.

Początkowy widok nominalnie 390 px miał 388 px obszaru dokumentu z powodu obramowania ramki. Wybór usług zaczynał się na 899 px. W nominalnym widoku 320 px dokument miał 318 px: 2 px przewijania wynikały z minimalnej szerokości strony 320 px, a nie z elementu wychodzącego poza prawidłowy viewport 320 px. Obramowanie ramki zastąpiono obrysem, żeby dalsze pomiary miały dokładną szerokość.

## Sprawdzenia lokalne

PASS: typecheck, lint, production lint, format, czysty build/prerender, budżety, estimator, hero motion, measurement consent, mobile CTA source smoke i diff check. Teksty, SEO, ceny, formularz CRM i dziewięć poradników zachowują wcześniejszą logikę.

Rozmiary: entry JS 200739 B, największy deferred JS 43999 B, łączny JS 309474 B, największy CSS 33720 B, łączny CSS 69547 B. Limity nie są zmieniane.

Wyniki kontroli podglądu zostaną uzupełnione po wdrożeniu zmian. PR #91 pozostaje szkicem bez merge i publikacji produkcyjnej.
