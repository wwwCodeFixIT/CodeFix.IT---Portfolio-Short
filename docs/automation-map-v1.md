# Mapa automatyzacji — etap 1

Nowe narzędzie w laboratorium CodeFix.IT, bazujące na poprawionym Draft PR #111.

## Działanie

- Cztery procesy: obsługa zapytań, zamówień, dokumentów i zgłoszeń.
- Wybór źródła danych i miejsca wyniku spośród systemów odpowiednich dla procesu. Zmiana procesu zachowuje obsługiwany wybór, a niedostępny zastępuje domyślnym.
- Przełączniki roboczego szkicu AI i własnej akceptacji. AI jest domyślnie wyłączone, akceptacja włączona.
- Cztery lub pięć klikalnych etapów; opis aktualnego etapu i osobna ścieżka braków/błędów do ręcznej obsługi.
- Opcjonalne własne wymagania (280 znaków), zakres do skopiowania, podgląd tekstu, ręczne kopiowanie przy niedostępnym schowku i reset.
- Przejście do formularza wybiera istniejącą usługę `development`. Plan można wkleić samodzielnie; formularz nie otrzymuje nowych pól.

Mapa opisuje plan wdrożenia. Nie łączy się z systemami, nie uruchamia modelu AI ani nie wysyła danych. Stan pozostaje w pamięci karty, zachowuje się przy przełączaniu narzędzi i resetuje po przeładowaniu. Brak localStorage/sessionStorage dla treści planu.

Wejście: `/narzedzia/` → „Mapa automatyzacji” lub `/narzedzia/?tool=automatyzacja`. Domyślnym narzędziem strony pozostaje Site Doctor.

## UI, dostępność i SEO

Lista etapów ma strukturę `ol`, przyciski `aria-pressed`/`aria-controls`, opis `aria-live`, natywne selecty, checkboxy i details. Cele dotykowe co najmniej 44 px, widoczny fokus i pionowy układ na telefonie. Narzędzie nie dodaje animacji; działa przy `prefers-reduced-motion`.

Mapa ładuje się dopiero po otwarciu. Wejście bezpośrednie nie ładuje skanera Site Doctor. Po otwarciu ukryty widok mapy pozostaje zamontowany, aby przełączenie narzędzi nie usuwało planu.

Tytuł, description, OG/schema i statyczny opis laboratorium uwzględniają automatyzacje. HTML bez JavaScript zawiera opis i informację o wymaganiu JavaScript do interakcji. Canonical pozostaje `/narzedzia/`, także przy parametrze wyboru narzędzia.

## Walidacja

```bash
npm run typecheck
npm run lint
npm run lint:production
npm run format:check
npm run automation:smoke
npm run build
npm run seo:static
npm run build:budget
```

Smoke: 144 prawidłowe kombinacje procesu, źródła, celu, AI i akceptacji; spójność zakresu, limity oraz zachowanie wyborów przy zmianie procesu.

Test przeglądarkowy `scripts/automation-map-qa.mjs` działa w istniejącym workflow Site Doctor: Chromium/WebKit × 320/390/1280 px × reduce/no-preference. Obejmuje cztery procesy, inspektor etapu, akceptację, AI, własne wymagania jako zwykły tekst, zachowanie stanu między narzędziami, kopię i fallback, reset, wejście bezpośrednie, lazy loading, szerokości, klawiaturę i brak żądań zewnętrznych. Oddzielna kontrola HTML bez JS w obu silnikach. Istniejąca regresja Site Doctor/briefu i 16 przechwyconych zgłoszeń nadal działa w tym samym jobie.

Build: entry 202522 B i homepage 57162 B bez wzrostu. Łącznie JS 377854 B (+9594 B), CSS 100948 B (+3653 B). Limity sumy: 380000/102000 B; limity entry, homepage i największego CSS zachowane. Brak nowych zależności.

## Wydanie

Osobny Draft PR na bazie `feat/site-doctor-lead-handoff-20261016`. Ten etap nie scala stosu draftów, nie publikuje produkcji i nie aktywuje integracji Google/OpenAI. Istniejąca produkcja oraz CRM pozostają poza zakresem zmiany.
