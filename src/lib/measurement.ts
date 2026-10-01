export type MeasurementPreferences = { analytics: boolean; ads: boolean };

type MeasurementWindow = Window & {
  codefixConsentChoice?: 'accepted' | 'rejected' | null;
  codefixAdConsentChoice?: 'accepted' | 'rejected' | null;
  codefixAdMeasurementAllowed?: boolean;
  codefixSetMeasurementConsent?: (preferences: MeasurementPreferences) => void;
  oaiq?: (...args: unknown[]) => void;
};

export function readMeasurementPreferences(): MeasurementPreferences {
  const measurementWindow = window as MeasurementWindow;
  return {
    analytics: measurementWindow.codefixConsentChoice === 'accepted',
    ads: measurementWindow.codefixAdConsentChoice === 'accepted',
  };
}

export function needsMeasurementChoice(): boolean {
  const measurementWindow = window as MeasurementWindow;
  return !measurementWindow.codefixConsentChoice || !measurementWindow.codefixAdConsentChoice;
}

export function saveMeasurementPreferences(preferences: MeasurementPreferences): void {
  (window as MeasurementWindow).codefixSetMeasurementConsent?.(preferences);
}

export function openMeasurementSettings(): void {
  window.dispatchEvent(new Event('codefix:open-measurement-settings'));
}

// Only call after the lead API accepts the submission. Measurement must never
// turn an accepted CRM lead into a visible form error when an SDK is blocked.
export function measureAcceptedLead(): void {
  const measurementWindow = window as MeasurementWindow;
  if (!measurementWindow.codefixAdMeasurementAllowed) return;
  try {
    measurementWindow.oaiq?.('measure', 'lead_created', { type: 'customer_action' }, { opt_out: true });
  } catch {
    // The contact request has already succeeded independently of measurement.
  }
}
