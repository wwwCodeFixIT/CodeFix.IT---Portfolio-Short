# CodeFix.IT — spokojniejsza strona główna

Strona główna otrzymuje krótszą treść i prostszą hierarchię. Wcześniej zawierała 12 sekcji i 6 linków głównego menu. Nowa wersja ma 5 sekcji i 3 linki menu; kontakt pozostaje wyraźnym przyciskiem.

1. Hero: „WordPress, który działa.”, jedno krótkie wprowadzenie, główne CTA i link do realizacji. Przestrzenny znak marki jest samodzielnym akcentem.
2. Usługi: trzy krótkie opisy, ceny startowe i jeden link zakresu dla każdej usługi. Kalkulator jest zwinięty pod przyciskiem; współpraca agencyjna prowadzi do własnej podstrony.
3. Realizacje: trzy podglądy i nazwy projektów. Współpraca z SyloSoftware pozostaje oznaczona; szczegóły są w case studies.
4. Współpraca: trzy zwięzłe kroki i trzy zwijane pytania.
5. Kontakt: opis, formularz i e-mail. Stopka zawiera tylko podstawowe linki.

Usunięto powtórzony wybór usługi w hero, wielokrotne bloki wiarygodności, rozbudowane opisy tych samych usług i osobne pasy dodatkowych CTA. Karty usług nie pobierają dekoracyjnych ilustracji. Zmniejszono nasycenie tła i usunięto nadmiar ramek oraz poświat.

Treść główna pochodzi z `src/data/homepage-content.json`. Statyczny HTML i FAQ schema korzystają z tego samego źródła. Canonical, metadane, adresy usług, treści poradników i case studies są zachowane.

Styl wariantu jest ograniczony do `.cf-home-minimal`; współdzielone arkusze oczyszczono wyłącznie z selektorów usuniętych elementów strony głównej. Osobne strony usług i poradników zachowują swój układ.

Obsługa wysyłania do CRM, atrybucji, zgód i dołączania/usuwania briefu zachowuje dotychczasową logikę. Pola mają etykiety, focus jest widoczny, a wymiary obrazów rezerwują miejsce. Pauza animacji, wariant dotykowy i `prefers-reduced-motion` pozostają dostępne. Nie dodano zależności.

Walidacja lokalna: typecheck, lint, production lint, format, build/prerender, hero motion smoke, estimator smoke, measurement-consent smoke, mobile CTA source smoke i build budgets. Strukturalne porównanie handlerów przed/po: bez zmian w obsłudze CRM i briefu.

Przegląd nowego podglądu, aktualne rozmiary paczek i wyniki kontroli przeglądarkowej są dokumentowane w opisie PR #91. Wcześniejsze wyniki `interactive-preview-qa-v1.md` dotyczą wcześniejszych SHA, przed uproszczeniem wyglądu.

Do kontroli przed publikacją pozostają również telefon, systemowe ograniczenie ruchu, Safari/iPhone, Lighthouse i pełny audyt WCAG. PR pozostaje szkicem.
