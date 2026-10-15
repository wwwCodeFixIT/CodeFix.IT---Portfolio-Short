# CodeFix.IT — formularz krok po kroku

Data: 15 października 2026.

Formularz główny ma trzy etapy: potrzeba, opis oraz kontakt z podsumowaniem. Wybór usługi korzysta z kafelków; pytania i końcowy przycisk dostosowują się do usługi. Linki z realizacji i usług zachowują wstępny wybór. Zakres kalkulatora pozostaje dołączony, także po ponownym zaznaczeniu tej samej usługi.

Cofanie zachowuje wpisane odpowiedzi. Bieżący krok używa natywnych ograniczeń pól i jawnego sprawdzania minimalnej długości po usunięciu skrajnych spacji; przed rzeczywistą wysyłką ponownie sprawdzane są wszystkie etapy. Tylko ostatni krok może wysłać zapytanie. Sukces czyści dane i kontekst poradnika; błąd zachowuje dane do kolejnej próby. Kontrakt CRM i zgody na pomiar pozostają zachowane.

Przyciski działają klawiaturą, wybór ma `aria-pressed`, etap `aria-current`, a licznik kroku jest ogłaszany. Ukryte etapy pozostają zamontowane, ale nie są dostępne w nawigacji klawiaturą. Fokus przechodzi do nagłówka aktualnego etapu przed malowaniem, aby nie przerywać szybkiego wpisywania danych. Nie dodano animacji ani zależności.

Wysokości odroczonych sekcji są rozwiązywane przed dotarciem do formularza. Starszy opcjonalny pomiar kliknięć kontaktowych zabezpieczono przed wyjątkiem SDK.

## Kontrole

TypeScript, lint produkcyjny, formatowanie, build, statyczne SEO (20 stron, 101 linków, 6 kotwic) i measurement smoke: PASS lokalnie.

JavaScript: 313648 B / 320000 B. Największy odroczony moduł: 47598 B / 50000 B. CSS: 70922 B / 72000 B; limit całego CSS zwiększono z 70000 B dla około 1,2 KB stylów kreatora. Pozostałe limity zachowano. Końcowy zasób: `/assets/index-COBEk4Ey.js`.

Contact Submission Audit #15: PASS na `d51d7a67a351d96a9c0ed23e977989d16b2cd353`. Przeszły wszystkie 82 scenariusze: 6 kombinacji silnika i szerokości (Chromium/WebKit, 320/390/1280), 52 scenariusze formularzy i 24 przejścia z poradników i realizacji. Wysyłki i pomiary przechwytywano lokalnie: 54 testowe POST, 0 rzeczywistych leadów i wiadomości. Test WebKit nie zastępuje fizycznego iPhone’a. Szczegóły w `docs/qa/contact-wizard-20261015.json`.

CI #882: PASS. PR #94 połączono z main jako `e28b19ab9fabaaa8c8dc64704570ed3fde7fcc8f`.

## Produkcja

CI, SEO Production Smoke i pages build and deployment po merge: PASS. Pod główną domeną potwierdzono końcowy zasób `/assets/index-COBEk4Ey.js` i zabezpieczony pomiar kliknięć. W przeglądarce sprawdzono wybór „Nowa strona”, przejście do opisu, natychmiastowy fokus nagłówka, cofnięcie z zachowanym wyborem i brak poziomego przewijania.

Adres: https://codefix.it/#contact. Zrzut: `docs/qa/codefix-wizard-production-20261015.jpg`. Podczas kontroli produkcyjnej nie wysyłano formularza.
