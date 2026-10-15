# CodeFix.IT — opcjonalny wybór zakresu

Data: 15 października 2026.

W drugim kroku kreatora można rozwinąć „Pomóż mi wybrać zakres”. Podpowiedzi zależą od wybranej usługi: strony, aplikacji, naprawy, opieki, współpracy agencyjnej, mini-oceny lub innego tematu. Kafelki można zaznaczać i odznaczać. Ich treść pojawia się w podsumowaniu oraz w wiadomości kierowanej do dotychczasowego endpointu CRM.

Cofanie zachowuje zaznaczenia, zmiana usługi usuwa niepasujący zakres, a sukces czyści go przed następnym zapytaniem. Błąd zachowuje dane. Ręczny opis pozostaje wymagany, chyba że dołączono zakres kalkulatora. Limit 4000 znaków obejmuje wszystkie części; dodanie zaznaczeń nie ucina wcześniej wpisanej treści. Przekroczenie limitu wymaga poprawy.

Komponent jest pobierany dopiero po rozwinięciu podpowiedzi. Kafelki są natywnymi przyciskami z `aria-pressed`; rozwijanie korzysta z `details` i `summary`. Bez nowych zależności, animacji, obowiązkowych pól i zmian API.

## Kontrole lokalne

TypeScript, lint, formatowanie, build, statyczne SEO (20 stron, 101 linków, 6 kotwic), measurement smoke i limity zasobów: PASS.

Entry JS: 202191 B. Największy deferred: 48679/50000 B. Łącznie JS: 315731/320000 B, CSS: 71306/72000 B. Moduł podpowiedzi: około 1 KB. Końcowy zasób: `/assets/index-Bbx2ylzC.js`. Nie zwiększano limitów.

## Testy

Rozszerzono dotychczasowe 82 scenariusze Chromium/WebKit o lazy loading, granicę długości bez utraty opisu, togglowanie, zachowanie po cofnięciu, reset usługi, treść payloadu z zakresem, zachowanie po błędzie oraz kolejną wysyłkę bez starego zakresu. Wszystkie wysyłki i pomiary są przechwytywane lokalnie. WebKit nie oznacza testu na fizycznym iPhonie.

CI #886 i Contact Submission Audit #16: PASS na `2fad688eef7a0dfd60d9110ed9a78bb34c7f06b0`. Wszystkie 82 scenariusze przeszły: 6 kombinacji silnika i szerokości, 52 scenariusze formularzy i 24 przejścia z treści. Przechwycono 54 wysyłki testowe, bez rzeczywistych leadów lub wiadomości. Wyniki: `docs/qa/brief-scope-20261015.json`.

PR #95 połączono z main jako `782703e5f4548dbf8d256fc07cd35fc0d0b800f1`.

## Potwierdzenie produkcji

CI, SEO Production Smoke i Pages build/deployment na commicie produkcyjnym: PASS. Strona `https://codefix.it/#contact` serwuje `/assets/index-Bbx2ylzC.js`.

W przeglądarce na głównej domenie potwierdzono drugi krok, rozwinięcie podpowiedzi i zaznaczenie „Panel klienta” oraz „Integracja z API” (`aria-pressed=true`). Brak poziomego przepełnienia w sprawdzonym widoku. Nie wysyłano rzeczywistego zapytania. Zrzut: `docs/qa/codefix-scope-production-20261015.jpg`.
