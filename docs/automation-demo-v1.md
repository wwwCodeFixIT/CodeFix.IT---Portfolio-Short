# CodeFix.IT — interaktywne demo automatyzacji

Data: 15 października 2026.

W istniejącej sekcji aplikacji lista możliwości została zastąpiona jedną kartą demo. Trzy scenariusze — zapytania, dokumenty i panel klienta — mają po cztery kroki. Każdy pokazuje przykład wejścia, przekształcenia i wyniku. Symulacja jest oznaczona jako fikcyjne dane; nie wywołuje AI, nie zapisuje rekordów CRM i nie wysyła wiadomości.

Użytkownik wybiera scenariusz, dowolny krok, następny krok lub powrót do początku. Odtwarzanie uruchamia się wyłącznie przyciskiem, można je zatrzymać i wznowić. Kończy się na czwartym kroku. Zmiana scenariusza, opuszczenie widoku, zmiana widoczności karty i preferencji ruchu zatrzymują timer. Przy prefers-reduced-motion pozostaje sterowanie ręczne. Efekty sprzątają timer, observer i nasłuchy.

Natywne przyciski mają aria-pressed, wynik jest stabilnym regionem statusu z aria-atomic, a focus pozostaje na użytym sterowaniu. Moduł jest ładowany osobno przez React.lazy; bez nowych zależności i zmian API. Usunięto nieużywane style zastąpionej listy.

## Kontrole lokalne

TypeScript, lint produkcji i skryptu QA, formatowanie, build/prerender, statyczne SEO i measurement smoke: PASS. SEO obejmuje 20 stron, 101 linków wewnętrznych, 6 kotwic, metadata, JSON-LD i 404.

Entry JS: 202191 B. Moduł demo: około 3.75 KB (gzip około 1.79 KB). Największy deferred: 48859/50000 B. Łącznie JS: 319658/320000 B, CSS: 71673/72000 B. Bez zwiększania limitów. Zasób: `/assets/index-C8B6yZek.js`.

## Testy

CI #898 i Contact Submission Audit #20: PASS na `5cb207ec791a87a884cce4ca18c778d39a583f05`. Wszystkie 94 scenariusze przeszły: 6 kombinacji kreatora, 52 scenariusze wysyłki, 24 przejścia z treści oraz 12 nowych kombinacji Chromium/WebKit, szerokości 320/390/1280 i preferencji ruchu. Przechwycono 54 testowe POST-y; rzeczywistych leadów i wiadomości: 0. WebKit nie oznacza testu na fizycznym iPhonie.

Nowe kontrole obejmują trzy scenariusze i 12 kroków, kolejność klawiatury, przyciski minimum 44 × 44 px, brak poziomego przepełnienia, odtwarzanie, pauzę, wznowienie i powtórzenie, reset scenariusza, zatrzymanie po opuszczeniu ekranu i po zmianie preferencji ruchu. Test przewijania potwierdza najpierw faktyczne opuszczenie widoku demo. Wyniki: `docs/qa/automation-demo-20261015.json`.

PR #97 połączono jako `401e5340505284f632a3aad18223cffa78c29c4b`.

## Potwierdzenie produkcji

CI, SEO Production Smoke, Pages build/deployment i Cloudflare Pages na commicie produkcyjnym: PASS. Na `https://codefix.it/#applications` potwierdzono nowy komponent, zasób `/assets/index-C8B6yZek.js` oraz wybór kroku „Propozycja AI” klawiaturą. W sprawdzonym widoku brak poziomego przepełnienia. Nie wysyłano rzeczywistych danych ani zgłoszeń.

Zrzut: `docs/qa/codefix-automation-production-20261015.jpg`.
