# CodeFix.IT — obecny układ z dodatkami interaktywnymi

Bazą jest strona produkcyjna `https://codefix.it/`, obejrzana 14.10.2026, i odpowiadający jej `main` na `780420a`. Wersja w PR #91 zachowuje pełne menu, panel wyboru usługi w hero, ilustracje usług, podglądy realizacji, sekcje dla agencji i firm, proces, FAQ, kontakt oraz stopkę.

Wprowadzono krótszy nagłówek, opisy usług i pozostałych sekcji. Usunięto powtarzającą ofertę linię nad H1. Treści hero, usług, procesu i ośmiu pytań FAQ są wspólne dla React i statycznego HTML; FAQ schema odzwierciedla widoczne odpowiedzi. Nie zmieniono treści usług i case studies na ich własnych podstronach.

Znak 3D pozostaje dodatkiem do istniejącego panelu. Unosi się i delikatnie reaguje na mysz; siatka tła porusza się powoli, a światło podąża za wskaźnikiem. Przycisk zatrzymuje ruch. Dotyk i ograniczenie ruchu mają wariant statyczny; hero poza ekranem i ukryta karta wyłączają animacje.

Kalkulator rozwija się jednym przyciskiem pod kartami usług. Kod, CSS i cennik są ładowane na żądanie, odpowiedzi pozostają po zwinięciu. Zakres trafia do dotychczasowego formularza bez utraty własnych uwag. Nie dodano zależności ani nowych zdarzeń konwersji. Obecne stawki, identyfikatory usług, CRM, zgody i atrybucja zachowują swoją logikę.

## Walidacja lokalna

PASS: typecheck, lint, production lint, format, czysty build i prerender, estimator smoke, hero motion smoke, measurement-consent smoke, mobile CTA source smoke, build budgets i diff check. Porównanie AST potwierdza niezmienioną strukturę handlerów CRM, wyboru usługi, przekazania i usunięcia briefu oraz startu formularza. Statyczny H1, canonical i osiem odpowiedzi FAQ sprawdzono względem katalogu treści.

| Zasób | Rozmiar | Limit |
| --- | ---: | ---: |
| Entry JS | 200739 B | 215000 B |
| Największy deferred JS | 42183 B | 50000 B |
| Łączny JS | 307658 B | 320000 B |
| Największy CSS | 34311 B | 40000 B |
| Łączny CSS | 69807 B | 70000 B |

## Kontrola podglądu

Kontrola aktualnego wdrożenia w przeglądarce i status CI zostaną zapisane po wdrożeniu tej zmiany. Poprzednie raporty i zrzuty opisują własne SHA, a dokument `homepage-minimal-v1.md` jest historyczny.

Telefon, dotyk, fizyczny Safari/iPhone, systemowa zmiana ograniczenia ruchu, ukrycie karty, Lighthouse i pełny audyt WCAG wymagają osobnej kontroli. PR pozostaje szkicem; nie wykonano merge ani publikacji na produkcji.
