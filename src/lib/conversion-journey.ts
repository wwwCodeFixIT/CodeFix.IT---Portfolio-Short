export type ConversionJourneyPayload = {
  journeySource: string;
  journeyGuide: string;
  journeyDestination: string;
  journeyStartedAt: string;
};

type StoredConversionJourney = {
  source: 'GUIDE';
  guide: string;
  destination: string;
  startedAt: string;
};

const storageKey = 'codefix_conversion_journey_v1';
const maxAgeMs = 2 * 60 * 60 * 1000;

const emptyJourney: ConversionJourneyPayload = {
  journeySource: '',
  journeyGuide: '',
  journeyDestination: '',
  journeyStartedAt: '',
};

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function markGuideToServiceJourney(guideSlug: string, destination: string) {
  const value: StoredConversionJourney = {
    source: 'GUIDE',
    guide: clean(guideSlug, 160),
    destination: clean(destination, 240),
    startedAt: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Journey tracking is optional and must never block navigation.
  }
}

export function readConversionJourney(): ConversionJourneyPayload {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return emptyJourney;

    const parsed = JSON.parse(raw) as Partial<StoredConversionJourney>;
    const startedAt = clean(parsed.startedAt, 40);
    const startedAtMs = Date.parse(startedAt);
    const expired = !Number.isFinite(startedAtMs) || Date.now() - startedAtMs > maxAgeMs;

    if (parsed.source !== 'GUIDE' || expired) {
      window.sessionStorage.removeItem(storageKey);
      return emptyJourney;
    }

    return {
      journeySource: 'GUIDE',
      journeyGuide: clean(parsed.guide, 160),
      journeyDestination: clean(parsed.destination, 240),
      journeyStartedAt: startedAt,
    };
  } catch {
    return emptyJourney;
  }
}

export function clearConversionJourney() {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Ignore storage failures; a completed lead must stay completed.
  }
}
