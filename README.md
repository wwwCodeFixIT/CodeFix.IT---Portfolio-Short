# CodeFix.IT

**WordPress dla firm — naprawa, nowe strony i stała opieka techniczna.**

🌐 [codefix.it](https://codefix.it/)  
📍 Warszawa + zdalnie cała Polska

CodeFix.IT pomaga firmom utrzymać i rozwijać strony WordPress: od napraw pojedynczych błędów, przez nowe strony firmowe z ACF PRO, po stałą opiekę techniczną.

## Usługi

- [Naprawa WordPress](https://codefix.it/naprawa-wordpress) — błędy, formularze, WooCommerce, problemy po aktualizacjach i awarie.
- [Strony WordPress dla firm](https://codefix.it/strony-wordpress) — nowe wdrożenia z ACF PRO, responsywnym front-endem, formularzem i technicznym SEO.
- [Opieka WordPress](https://codefix.it/opieka-wordpress) — aktualizacje, backupy, drobne poprawki i dalszy rozwój.

## Wybrane realizacje

- [Kancelaria Adwokacka Witkowska](https://codefix.it/realizacje/kancelaria-adwokacka-witkowska)
- [Rzeczoznawca Marcin Dudek](https://codefix.it/realizacje/rzeczoznawca-marcin-dudek)
- [EM Air System](https://codefix.it/realizacje/em-air-system)

Podglądy w `public/portfolio/` pokazują publiczne strony z 5 października 2026: komputer oraz mobilny viewport 390 px. Komponent `ProjectPreview` korzysta z lokalnych obrazów WebP, wariantów 600/1200 px dla komputera, stałych proporcji i lazy loading. Strony klientów nie są osadzane w portfolio.

Opisy realizacji rozdzielają cel strony, mój zakres pracy i efekt wdrożenia. Współpraca z SyloSoftware pozostaje wskazana przy kancelarii; podglądy aktualnych stron nie rozszerzają deklarowanego zakresu realizacji z lat 2023–2024.

## Baza wiedzy

Praktyczne materiały diagnostyczne są dostępne w sekcji [Poradniki WordPress](https://codefix.it/poradniki), m.in. o błędach 500, błędach krytycznych, problemach po aktualizacji, niedziałającym checkout WooCommerce i poczcie WordPress.

## Stack projektu

React 19, Vite 7, TypeScript, Tailwind CSS, statyczny prerender HTML, Cloudflare Pages, GitHub Actions, techniczne SEO i monitoring produkcyjny.

## Lokalnie

```bash
npm install
npm run dev
```

Build produkcyjny:

```bash
npm run build
```

Kontrole jakości:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run seo:smoke
```

---

**CodeFix.IT** — [codefix.it](https://codefix.it/)  
*Diabeł tkwi w kodzie.* 😈
