import { captureSessionAttribution } from './attribution';

export const funnelVersion = '14f_v1';
export const activeCroExperimentId = 'baseline-stage-14h-v1';
const funnelEventApiUrl = 'https://app.codefix.it/api/public/funnel-events';

type FunnelState = {
  sessionId: string;
  experimentId: string;
  entryPath: string;
  startedAt: string;
  selectedService: string;
  firstCta: string;
  lastCta: string;
  formStartedAt: string;
};

export type FunnelPayload = {
  funnelVersion: typeof funnelVersion;
  funnelExperimentId: string;
  funnelSessionId: string;
  funnelEntryPath: string;
  funnelStartedAt: string;
  funnelSelectedService: string;
  funnelFirstCta: string;
  funnelLastCta: string;
  funnelFormStartedAt: string;
};

const storageKey = 'codefix_sales_funnel_14f_v1';

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0').slice(-12);
}

function freshState(): FunnelState {
  return {
    sessionId: createSessionId(),
    experimentId: activeCroExperimentId,
    entryPath: clean(window.location.pathname || '/', 240),
    startedAt: new Date().toISOString(),
    selectedService: '',
    firstCta: '',
    lastCta: '',
    formStartedAt: '',
  };
}

function readState(): FunnelState {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      const state = freshState();
      window.sessionStorage.setItem(storageKey, JSON.stringify(state));
      return state;
    }

    const parsed = JSON.parse(raw) as Partial<FunnelState>;
    const state: FunnelState = {
      sessionId: clean(parsed.sessionId, 64) || createSessionId(),
      experimentId: clean(parsed.experimentId, 64) || activeCroExperimentId,
      entryPath: clean(parsed.entryPath, 240) || clean(window.location.pathname || '/', 240),
      startedAt: clean(parsed.startedAt, 40) || new Date().toISOString(),
      selectedService: clean(parsed.selectedService, 80),
      firstCta: clean(parsed.firstCta, 120),
      lastCta: clean(parsed.lastCta, 120),
      formStartedAt: clean(parsed.formStartedAt, 40),
    };
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
    return state;
  } catch {
    return freshState();
  }
}

function writeState(state: FunnelState) {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Funnel context is diagnostic only and must never block the contact flow.
  }
}

export function markFunnelService(service: string) {
  const state = readState();
  state.selectedService = clean(service, 80);
  writeState(state);
}

export function markFunnelCta(placement: string, service = '') {
  const state = readState();
  const value = clean(placement, 120);
  if (service) state.selectedService = clean(service, 80);
  if (value && !state.firstCta) state.firstCta = value;
  if (value) state.lastCta = value;
  writeState(state);
}

export function markFunnelFormStart(service = '') {
  const state = readState();
  if (service) state.selectedService = clean(service, 80);
  if (!state.formStartedAt) state.formStartedAt = new Date().toISOString();
  writeState(state);
}

export function readFunnelPayload(service = ''): FunnelPayload {
  const state = readState();
  if (service) {
    state.selectedService = clean(service, 80);
    writeState(state);
  }
  return {
    funnelVersion,
    funnelExperimentId: state.experimentId,
    funnelSessionId: state.sessionId,
    funnelEntryPath: state.entryPath,
    funnelStartedAt: state.startedAt,
    funnelSelectedService: state.selectedService,
    funnelFirstCta: state.firstCta,
    funnelLastCta: state.lastCta,
    funnelFormStartedAt: state.formStartedAt,
  };
}

export function clearFunnelSession() {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // A completed lead remains completed even if storage cleanup fails.
  }
}

export function trackFunnelEvent(
  eventName:
    | 'cf_funnel_view'
    | 'cf_service_select'
    | 'cf_cta_click'
    | 'cf_form_view'
    | 'cf_form_start'
    | 'cf_submit_attempt'
    | 'cf_lead_created'
    | 'cf_duplicate_submit'
    | 'cf_form_error',
  parameters: Record<string, string> = {},
) {
  const analyticsWindow = window as Window & {
    gtag?: (...args: unknown[]) => void;
    codefixAnalyticsAllowed?: boolean;
  };
  if (!analyticsWindow.codefixAnalyticsAllowed) return;

  const state = readState();
  const attribution = captureSessionAttribution();
  const pagePath = window.location.pathname || '/';
  const service = parameters.service || state.selectedService || 'not_selected';
  const placement = parameters.placement || '';

  analyticsWindow.gtag?.('event', eventName, {
    event_category: 'sales_funnel',
    funnel_version: funnelVersion,
    experiment_id: state.experimentId,
    funnel_id: state.sessionId,
    entry_path: state.entryPath,
    page_path: pagePath,
    service,
    ...parameters,
  });

  void fetch(funnelEventApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      funnelVersion,
      experimentId: state.experimentId,
      sessionId: state.sessionId,
      entryPath: state.entryPath,
      pagePath,
      service,
      placement,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrerOrigin: attribution.referrerOrigin,
    }),
  }).catch(() => {
    // Funnel telemetry is optional and must never interrupt navigation or a lead submission.
  });
}
