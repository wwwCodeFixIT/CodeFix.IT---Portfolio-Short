# CodeFix.IT — SEO Stage 4 baseline

Baseline date: 2026-09-30

## Search Console baseline

Source: Google Search Console performance export captured on 2026-09-30.

- Clicks: 1
- Impressions: 9
- CTR: 11.11%
- Homepage average position: 3.78
- Brand query `codefix`: 5 impressions, average position 4
- Country: Poland — 8 impressions, 1 click
- Devices: mobile — 4 impressions / 1 click; desktop — 5 impressions / 0 clicks

At this point Search Console visibility is still predominantly brand/homepage driven. The commercial landing pages below are the Stage 4 indexing cohort:

- https://codefix.it/naprawa-wordpress
- https://codefix.it/strony-wordpress
- https://codefix.it/opieka-wordpress

## Measurement rule

Compare the same URLs after Google has had time to recrawl them. Track:

1. Indexed state / URL Inspection verdict.
2. Impressions and clicks per landing page.
3. Non-brand queries entering each landing page.
4. Average position only with the query and date range attached; do not treat a site-wide average as a keyword ranking.
5. CTR only after meaningful impression volume appears.

## Technical acceptance criteria

The automated production smoke must verify:

- `robots.txt` returns 200 and advertises the sitemap.
- `sitemap.xml` returns 200 and contains the three commercial landing pages.
- every sitemap URL returns 200;
- every sitemap URL has a self-referencing canonical;
- no sitemap URL contains `noindex`;
- every sitemap URL has a title and meta description;
- a deliberately unknown URL returns a real HTTP 404 with `noindex`.

The smoke runs after pushes to `main`, can be started manually, and also runs once per day.
