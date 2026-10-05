# Service form views after analytics consent

If the form on a service landing page is already visible while analytics is disabled, granting consent must allow the current visible form to be measured. The previous observer returned before recording that view and was not refreshed by a consent change.

The service landing now handles page and form visibility in the same consent listener. Form observation starts or refreshes only when analytics is allowed; the callback still checks consent, records one form view per component mount, and disconnects after that view. Cleanup removes both the observer and consent listener.

## Regression verification

Use the actual React component with local GA4 and funnel API counters. Block all live lead, telemetry and analytics requests.

- Form visible before consent: no events before consent; after granting consent, one `cf_funnel_view`, one `cf_form_view` and one `lead_form_view`.
- Repeated consent changes and scrolling: no extra page or form view.
- Form outside the viewport when consent arrives: a page view only; the form view appears when the form enters the viewport.
- Consent denied throughout: no analytics or funnel API requests.
- Component unmounted before a later consent change: no events from its removed listener.

The temporary browser fixture compares the previous and updated components. Remove the fixture before merging to production. This correction changes measurement coverage; comparisons spanning the deployment must account for that change.
