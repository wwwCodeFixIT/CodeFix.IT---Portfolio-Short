# Kalkulator projektu — wersja 1

Kalkulator na stronie głównej pozwala wybrać usługę i zakres, a następnie dołączyć czytelny brief do istniejącego formularza kontaktowego. W uproszczonym układzie znajduje się na końcu sekcji usług, pod jednym przyciskiem. Jest rozwijany na żądanie i zachowuje odpowiedzi po zwinięciu. Bieżący wariant opisuje [dokument uproszczenia strony](homepage-minimal-v1.md).

## Ceny i zakres

- Stawki pochodzą z aktualnego `public/data/service-landings.json`, pobieranego dopiero po otwarciu kalkulatora.
- Quick Fix: cena startowa dla jednego problemu. Kilka problemów wymaga indywidualnej wyceny.
- Opieka: cena startowa za miesiąc przemnożona przez wybrany planowany okres, bez rabatów ani narzucania okresu umowy.
- Agencje: publiczna stawka godzinowa razy wybrana pula godzin; konkretny czas zadania jest potwierdzany po briefie.
- Nowa strona: rodzaj, podstrony, materiały i dodatkowe funkcje; wycena pozostaje indywidualna zgodnie z obecną ofertą.
- Niedostępny cennik lub nieznany format ceny powoduje przejście do indywidualnej wyceny.

## Formularz i pomiary

Przeniesienie zakresu wybiera istniejący kod usługi i pokazuje dołączony brief. Własny opis klienta pozostaje w formularzu. Brief można usunąć, jest zastępowany przy kolejnym przeniesieniu i znika przy zmianie usługi albo po przyjęciu zgłoszenia. Cała wiadomość pozostaje ograniczona do 4000 znaków.

Formularz nadal używa tego samego API, pól atrybucji i zgód. Kalkulator nie tworzy leada ani zdarzenia konwersji; wysyłka następuje przez istniejący formularz. Testy nie wysyłają zgłoszeń do produkcyjnego CRM.

## Wydajność i SEO

Komponent i jego CSS są ładowane po otwarciu. Treści poradników są eksportowane z istniejącego źródła TypeScript do statycznego JSON; krótkie podsumowania na landingach usług pozostają lokalne. Prerender, canonical, metadane i wszystkie treści dziewięciu poradników są zachowane. Usunięto style starego terminala i paneli diagnostycznych, których aktualne komponenty nie używają.

Nie dodano zależności ani nie podniesiono limitów paczek.

| Zasób          |    Przed |       Po |    Limit |
| -------------- | -------: | -------: | -------: |
| Entry JS       | 200565 B | 200702 B | 215000 B |
| Łączny JS      | 319875 B | 306192 B | 320000 B |
| Największy CSS |  39806 B |  37135 B |  40000 B |
| Łączny CSS     |  69489 B |  69685 B |  70000 B |

## Walidacja

PASS: typecheck, lint, production lint, format check, build/prerender, estimator smoke, measurement-consent smoke, mobile CTA source smoke i build budgets. Produkcyjne zależności: `npm audit --omit=dev --audit-level=high`, 0 podatności.

`estimator:smoke` sprawdza stawki, przeliczenia okresów i godzin, brak fikcyjnej wyceny nowych stron i wielu usterek, błędny format ceny, zachowanie własnych uwag oraz zgodność katalogu i statycznych stron poradników. Jest wykonywany w istniejącym CI.

PASS w Chrome przy 1348 × 936 px: cztery usługi, wyceny, zachowanie ustawień po zwinięciu, obsługa Enterem, przeniesienie i usunięcie briefu, zachowanie własnych uwag, zmiana tematu oraz focus w formularzu. Po usunięciu zakresu focus wraca do pola opisu. Szczegóły zapisano w [raporcie kontroli podglądu](interactive-preview-qa-v1.md).

NOT RUN: widoki 390/1440 px, fizyczny Safari/iPhone i pełny audyt WCAG. Dostępna kontrola przeglądarki nie udostępnia emulacji viewportu. Kontrole źródłowe mobile CTA nie zastępują kontroli na telefonie.
