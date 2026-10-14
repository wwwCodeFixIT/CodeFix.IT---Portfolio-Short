# CodeFix.IT — Patryk i widoczne interakcje

CodeFix.IT prowadzi samodzielnie Patryk. Pierwszy ekran, sekcja „O mnie”, opisy, FAQ, formularz, kalkulator, metadane i statyczny HTML używają liczby pojedynczej. Oferta obejmuje strony, aplikacje i WordPress; AI wspiera pracę, a Patryk odpowiada za jej weryfikację i wdrożenie.

## Widoczne funkcje

- W pierwszym ekranie trzy przyciski: Strona, Aplikacja, Naprawa. Wybrana opcja ma wyraźny stan aktywny i od razu zmienia opis, informację o cenie i CTA. Wynik jest ogłaszany przez `role="status"`.
- CTA przenosi do formularza, wybiera właściwą usługę CRM i ustawia focus na imieniu. Zmiana opcji w panelu pozostaje lokalna; nie tworzy zgłoszenia ani konwersji.
- Przycisk „Kalkulator WordPress” w pierwszym ekranie otwiera istniejący kalkulator, przewija do niego i przenosi focus na jego przełącznik. Kalkulator nadal ładuje się na żądanie i zachowuje odpowiedzi po zwinięciu.
- Animowane tło i CSS 3D pozostają z pauzą oraz obsługą preferencji ograniczenia ruchu. Przyciski wyboru działają klawiaturą.

Zachowano układ aktualnej strony, czarno-czerwoną identyfikację, ilustracje usług i portfolio. Stare style wierszy wyboru zastąpiono stylem kompaktowego panelu, dzięki czemu nowa funkcja nie zwiększa łącznego CSS. Nie dodano zależności.

## Sprawdzenia lokalne

PASS: typecheck, lint, production lint, format, clean build/prerender, estimator smoke, hero motion smoke, measurement consent smoke, mobile CTA source smoke, build budgets i `git diff --check`.

Sprawdzono zgodność FAQ/schema i metadanych z katalogiem treści, brak nieaktualnych treści zespołowych w głównych źródłach i statycznym HTML, kotwice `about` i `contact` oraz identyczność wszystkich skryptów bootstrapu pomiarów i zgód. Wszystkie dziewięć poradników jest nadal prerenderowanych.

| Zasób | Rozmiar | Limit |
| --- | ---: | ---: |
| Entry JS | 200739 B | 215000 B |
| Największy deferred JS | 43854 B | 50000 B |
| Łączny JS | 309329 B | 320000 B |
| Największy CSS | 33889 B | 40000 B |
| Łączny CSS | 69385 B | 70000 B |

## Podgląd

Adres gałęzi: https://feat-project-estimator-v1.codefix-it---portfolio-short.pages.dev/

Raport weryfikacji bieżącego wdrożenia zostanie uzupełniony po sprawdzeniu podglądu. Zmiany są przygotowywane w PR #91; bez merge i publikacji produkcyjnej.

## Wcześniejszy test formularza i CRM

14.10.2026 o 11:48 Europe/Warsaw na `5d93b71` wysłano dokładnie jedno rzeczywiste zgłoszenie oznaczone „TEST QA CodeFix.IT”, z publicznym adresem marki. Opcjonalne pomiary zostały odrzucone. Formularz pokazał sukces, wyczyścił dane i ustawił focus na statusie. Neon potwierdził jeden lead `WEBSITE_FORM`, powiązaną notatkę z `service=development`, atrybucję oraz CTA `hero_path_application`. Rekord pozostaje wyraźnie oznaczony jako test w CRM.

Bieżąca zmiana zachowuje ten sam endpoint, payload, identyfikatory usług, zgody i wywołania konwersji. Testu tworzącego nowy rekord nie powtarza się dla samej zmiany tekstów i panelu wyboru. Zrzut wcześniejszego potwierdzenia: `qa/codefix-agency-form-success-20261014.jpg`.

## Zakres weryfikacji

Wcześniejsza próba PageSpeed API zwróciła HTTP 429 z powodu wyczerpanego limitu. Wyników Lighthouse ani CWV nie potwierdzono. Fizyczny telefon/Safari oraz pełny ręczny audyt WCAG pozostają poza wykonanymi sprawdzeniami.
