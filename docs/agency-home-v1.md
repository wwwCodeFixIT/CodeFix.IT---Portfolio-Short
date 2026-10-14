# CodeFix.IT — treść wspólnej agencji i czytelność

Założenie robocze: CodeFix.IT tworzy strony i aplikacje z wykorzystaniem AI jako narzędzia projektowania i programowania. Użytkownik wskazał wspólną agencję jego i Marka. Wariant przedstawia zespół jako „Patryk i Marek”; nie dodaje niepotwierdzonych biografii, specjalizacji, referencji ani wyników projektów. Dokładny podział ról i ewentualne osobne usługi wdrażania AI wymagają ustalenia przed docelową publikacją.

Układ obecnej strony, czarno-czerwona identyfikacja, ilustracje, portfolio i hero 3D pozostają bazą. Pierwszy ekran przedstawia strony i aplikacje, narzędzia AI oraz trzy potrzeby: strona, aplikacja, naprawa WordPress. Ścieżka aplikacji używa już obsługiwanego przez CRM identyfikatora `development` i własnego opisu formularza. Dotychczasowy blok „Dla kogo” prezentuje aplikacje i integracje, a „Jak pracuję” staje się prezentacją zespołu i sposobu pracy. Są to zmiany istniejących sekcji.

Oferta WordPress, cennik, cztery scenariusze kalkulatora i przypisanie współpracy z SyloSoftware są zachowane. Kalkulator jest oznaczony jako WordPress, żeby nie sugerował wyceny aplikacji. Teksty strony głównej i kalkulatora są w liczbie mnogiej. Główne treści, FAQ i meta są wspólne dla React oraz statycznego prerenderu. Title, description, OG/Twitter, opis organizacji i link schematu aplikacji odpowiadają nowej treści; canonical pozostaje produkcyjny.

Czytelność: małe opisy powiększono, przygaszone kolory rozjaśniono, przyciski mają ciemniejszą czerwień. Zmiany dotyczą współdzielonego arkusza, więc poprawiają też używające go podstrony. Nie dodano zależności, fontów ani dodatkowych plików CSS. Ruch i jego sterowanie zachowują dotychczasowe ograniczenia.

## Walidacja lokalna

PASS: typecheck, lint, production lint, format, clean build/prerender, estimator smoke, hero motion smoke, measurement consent smoke, mobile CTA source smoke i build budgets. Sprawdzono zgodność title/description/canonical/FAQ/Organization schema z katalogiem treści, statyczne sekcje aplikacji i zespołu oraz identyczność bootstrapów pomiarowych z poprzednią wersją.

Aktualny domyślny kod backendu `wwwCodeFixIT/CodeFix.IT-App` przyjmuje `development` i originy podglądu Cloudflare. Sprawdzony produkcyjny preflight `OPTIONS https://app.codefix.it/api/public/leads` dla adresu gałęzi: HTTP 204, właściwy Access-Control-Allow-Origin, POST/OPTIONS i Content-Type.

| Zasób | Rozmiar | Limit |
| --- | ---: | ---: |
| Entry JS | 200739 B | 215000 B |
| Największy deferred JS | 43225 B | 50000 B |
| Łączny JS | 308701 B | 320000 B |
| Największy CSS | 34247 B | 40000 B |
| Łączny CSS | 69743 B | 70000 B |

## Podgląd i publikacja

Kontrola przeglądarkowa oraz końcowe CI zostaną dopisane po wdrożeniu. Próba rzeczywistego formularza i odczyt kontrolnego leada w CRM nie są jeszcze oznaczone jako PASS. Telefon, fizyczny Safari/iPhone, realne CWV/Lighthouse i pełny audyt WCAG wymagają osobnej kontroli. PR pozostaje szkicem; ta zmiana nie publikuje strony produkcyjnej.
