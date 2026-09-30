# Stage 7 — organic traffic to lead conversion funnel

## Funnel

1. Guide page view — standard GA4 `page_view`.
2. `service_cta_click` — visitor moves from a guide to its commercial service.
3. Service page view — standard GA4 `page_view`.
4. `contact_cta_click` — visitor jumps to the contact section.
5. `lead_form_start` — first interaction with the lead form.
6. `lead_form_submit_attempt` — submit attempt.
7. `generate_lead` — API accepted the lead.
8. `lead_form_error` — submission failed.

## Internal conversion journey

A first-party sessionStorage record keeps only:

- source: GUIDE
- guide slug
- intended service path
- journey start timestamp

It expires after two hours and is removed after a successful lead. It contains no name, email, phone, page URL or message.

The internal journey is deliberately separate from acquisition attribution. It must not overwrite `utm_*`, external referrer or the original landing path.

## GA4 reporting parameters

Useful event parameters:

- `service`
- `landing_path`
- `journey_source`
- `journey_guide`
- `destination`

To use custom parameters as report dimensions in GA4, register the needed parameters as event-scoped custom dimensions after confirming they arrive in Realtime/DebugView.
