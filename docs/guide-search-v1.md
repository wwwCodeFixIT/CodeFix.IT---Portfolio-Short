# Wyszukiwanie poradników — 16.10.2026

PR #102: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/pull/102.

Kandydat: `5803c3beac6b534b98094259220f566bdd5e7507`; drzewo `1651e3a57d35c421e32369f3e82a39ab0e0d24d9`. Runtime: `/assets/index-BooDYH1_.js`.

## Zachowanie

Na /poradniki/ dodano jedno pole wyszukiwania i skrócono wstęp. Lista filtruje się podczas pisania według tytułu, opisu i tematu poradnika. Wszystkie wpisane słowa muszą wystąpić; ich kolejność i wielkość liter nie mają znaczenia. Normalizacja obsługuje polskie znaki, w tym ł. „Maile”, „maili” i „e-mail” znajdują poradnik o poczcie.

Licznik ogłasza liczbę wyników przez role=status. Puste grupy i prowadzące do nich skróty kategorii znikają na czas wyszukiwania. Brak wyników pokazuje krótką podpowiedź i przycisk powrotu do całej listy. „Wyczyść”, ten przycisk oraz Escape przywracają listę i fokus pola. Enter w polu nie przeładowuje strony.

Pole ma widoczną, połączoną etykietę, aria-controls, 48 px wysokości, tekst 16 px i widoczny fokus. Linki do artykułów zachowano jako natywne kotwice. Prerender nadal udostępnia wszystkie dziewięć poradników, również bez JavaScriptu.

Wyszukiwanie pracuje w pamięci strony, bez nowego API, biblioteki ani zapisu zapytań. Nie przeszukuje pełnej treści artykułów ani nie stosuje semantycznego AI. Zapytanie nie jest dodawane do URL; odświeżenie otwiera pełną listę.

## Stabilność układu

Odtworzono błąd WebKit przy 320 px: po skróceniu listy pointerdown trafiał w przycisk resetu, a pointerup w formularz. Indeks używa teraz istniejącej klasy cf-layout-ready, aby stopka miała od początku rzeczywistą wysokość, bez późnego zmniejszania dokumentu i zmiany scrolla podczas kliknięcia. Kontrola powtarza trzy razy powrót z pustych wyników w każdej z 12 kombinacji przeglądarki, szerokości i preferencji ruchu.

Pierwszy audyt (#29) zatrzymał się wcześniej na pojedynczym nieudanym załadowaniu kalkulatora w WebKit; kalkulator nie był zmieniany, a końcowa pełna regresja i ręczny podgląd przeszły. Audyty #30–31 odtworzyły problem resetu. Przebieg #32 zatrzymała błędna asercja nowego testu: dosłowne „wordpress” występuje w ośmiu streszczeniach, nie w dziewięciu. Oczekiwanie poprawiono według katalogu. Żaden z tych przebiegów nie został opublikowany.

## Weryfikacja i zasoby

PASS: TypeScript, ESLint, formatowanie, build, limity zasobów, statyczne SEO (20 stron, 101 linków, 6 kotwic), measurement smoke i diff check.

| Zasób                  |    Wynik |    Limit |
| ---------------------- | -------: | -------: |
| Entry JS               | 202191 B | 215000 B |
| Największy deferred JS |  49331 B |  50000 B |
| Cały JS                | 327658 B | 328000 B |
| Największy CSS         |  38178 B |  40000 B |
| Cały CSS               |  78701 B |  79000 B |

Wzrost względem poprzedniej produkcji: 1513 B JS i 938 B CSS na trasach poradników. Limity sum jawnie podniesiono z 327000/78000 B do 328000/79000 B. Rozmiar wejścia, największej trasy i największego CSS bez wzrostu.

- CI #930: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38837596804 — success.
- Contact Submission Audit #33: https://github.com/wwwCodeFixIT/CodeFix.IT---Portfolio-Short/actions/runs/38837596802 — success.
- 126 scenariuszy: 12 wyszukiwania, 2 bez JavaScriptu, 12 podglądu realizacji, 12 kreatora, 52 wysyłki, 24 ścieżki poradników i projektów oraz 12 przykładu automatyzacji.
- Nowy test: Chromium i WebKit, 320/390/1280 px, obie preferencje ruchu; polskie znaki, wielowyrazowe hasła, opis i temat, brak wyników, trzykrotny reset, focus, Escape, Enter, natywne linki, zachowanie atrybucji i brak żądań podczas filtrowania.
- 78 przechwyconych żądań testowych, 0 rzeczywistych zgłoszeń.

Końcowy podgląd: https://eff150a8.codefix-it---portfolio-short.pages.dev/poradniki/. Ręcznie potwierdzono runtime, „blad 500”, „maile”, Escape, focus, stabilną stopkę oraz przejście z wyniku do artykułu i usługi. W podglądzie d13ea909, z identycznym runtime aplikacji, potwierdzono również brak wyników i reset z przywróceniem fokusu. Bez wysyłki formularza.

## Produkcja

Commit `e071a77b71a45fd78b9915cb41503ad73214639a`; drzewo identyczne z końcowym kandydatem. CI 38838399194, SEO Production Smoke 38838399183, Pages 38838398924 i Cloudflare Pages 116772667805 — success.

Na https://codefix.it/poradniki/ potwierdzono runtime, canonical, dziewięć poradników na początku, wyniki dla „500, BLAD”, „koszt opieki” i „maile”, brak wyników, reset do dziewięciu i focus, natywne przejście do artykułu, powrót do indeksu oraz klawiaturę. Brak poziomego przepełnienia. Nie wysyłano formularzy.

Zrzut opublikowanej strony: `qa/codefix-guide-search-production-20261016.jpg`. Szczegóły i wszystkie wyniki: `qa/guide-search-20261016.json`. Archiwum w gałęzi `reports/guide-search-20261016`, bez kolejnego wdrożenia aplikacji.

Nie wykonywano rzeczywistej wysyłki do CRM, testu na fizycznym iPhonie, audytu czytnikiem ekranu ani nowego Lighthouse.
