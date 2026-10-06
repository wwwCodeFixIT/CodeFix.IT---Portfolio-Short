export type LeadAttribution = {
  landingPath: string;
  submitPath: string;
  referrerOrigin: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  googleClickId: string;
};

type StoredAttribution = Omit<LeadAttribution, 'submitPath'>;

const storageKey = 'codefix_attribution_v1';

function clean(value: string | null, maxLength: number) {
  return (value ?? '').trim().slice(0, maxLength);
}

function currentExternalReferrer() {
  if (!document.referrer) return '';
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return '';
    return clean(referrer.origin, 240);
  } catch {
    return '';
  }
}

function readStored(): StoredAttribution | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAttribution>;
    return {
      landingPath: clean(parsed.landingPath ?? '', 240),
      referrerOrigin: clean(parsed.referrerOrigin ?? '', 240),
      utmSource: clean(parsed.utmSource ?? '', 160),
      utmMedium: clean(parsed.utmMedium ?? '', 160),
      utmCampaign: clean(parsed.utmCampaign ?? '', 160),
      utmContent: clean(parsed.utmContent ?? '', 160),
      utmTerm: clean(parsed.utmTerm ?? '', 160),
      googleClickId: clean(parsed.googleClickId ?? '', 270),
    };
  } catch {
    return null;
  }
}

function writeStored(value: StoredAttribution) {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Storage is an optimization only; the form can still submit current-page attribution.
  }
}

export function captureSessionAttribution(): LeadAttribution {
  const url = new URL(window.location.href);
  const query = url.searchParams;
  const clickKey = query.has('gclid') ? 'gclid' : query.has('gbraid') ? 'gbraid' : query.has('wbraid') ? 'wbraid' : '';
  const current = {
    utmSource: clean(query.get('utm_source'), 160),
    utmMedium: clean(query.get('utm_medium'), 160),
    utmCampaign: clean(query.get('utm_campaign'), 160),
    utmContent: clean(query.get('utm_content'), 160),
    utmTerm: clean(query.get('utm_term'), 160),
    googleClickId: clickKey ? `${clickKey}=${clean(query.get(clickKey), 256)}` : '',
  };
  const hasTaggedTouch = Object.values(current).some(Boolean);
  const stored = readStored();
  const referrerOrigin = currentExternalReferrer();

  const snapshot: StoredAttribution = hasTaggedTouch
    ? {
        landingPath: clean(url.pathname, 240),
        referrerOrigin: referrerOrigin || stored?.referrerOrigin || '',
        ...current,
      }
    : stored ?? {
        landingPath: clean(url.pathname, 240),
        referrerOrigin,
        ...current,
      };

  writeStored(snapshot);

  return {
    ...snapshot,
    submitPath: clean(url.pathname, 240),
  };
}
