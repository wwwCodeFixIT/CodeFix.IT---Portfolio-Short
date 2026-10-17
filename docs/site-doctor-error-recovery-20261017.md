# Site Doctor — recovery po błędzie pomiaru

Zakres: wyłącznie aktywna diagnostyka na stronie `/narzedzia/?tool=diagnoza` lub w oknie dialogowym otwartym z formularza. Gdy `/api/tool-status` wskazuje brak aktywnej diagnozy, zachowujemy wcześniejszy widok informujący o niedostępności i przycisk ręcznego kontaktu.

W trakcie aktywnego pomiaru:
- Błędy 503, 429, 502, 504 i błędy sieciowe pozostają czytelne; nie powstaje raport Lighthouse z fikcyjnymi wynikami.
- Osobny panel zawiera ręczne CTA do `/?service=WORDPRESS_QUICK_FIX#contact` lub przycisk powrotu do formularza, gdy skaner był otwarty jako modal.
- Kliknięcie **Anuluj** przerywa żądanie i wyświetla informację o anulowaniu, a nie mylący timeout.
- W przypadku błędu z formularza użytkownik nie traci już wpisanych pól i może wysłać opis usterki bez diagnozy.
- CSS wykorzystuje istniejącą typografię i akcje CodeFix.IT. Bez nowych zależności i bez nowego API.

Regresje Chromium/WebKit 390/1280 z mockowanym API sprawdzają: sukces, 503, 429, anulowanie, modalny powrót i zachowanie danych. Testy nie wywołują Google/OpenAI ani produkcyjnego CRM.

Gałąź bazowa to aktualny `main`, który zawiera już funkcje starszego stosu #109–#111. Stary PR #115 (LAB-4) był rozbieżny względem `main`; ten etap przenosi jedynie brakującą obsługę błędów, **nie scala starych PR-ów**.

**HOLD:** Draft, bez merge, zmiany produkcyjnej lub aktywacji API. WAF, sekrety i rzeczywisty Google PageSpeed wymagają odrębnego odbioru.
