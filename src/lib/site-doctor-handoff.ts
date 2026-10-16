/**
 * CodeFix.IT Site Doctor -> contact handoff.
 * Store only user-approved, shortened report evidence in sessionStorage.
 * Never persist an email, typed issue description, AI commentary or URL query.
 */
export const DOCTOR_HANDOFF_KEY = 'codefix_site_doctor_handoff_v1';
export const DOCTOR_HANDOFF_TTL = 15 * 60 * 1000;
export const DOCTOR_HANDOFF_LIMIT = 1300;

export type DoctorEvidence = {
  url: string;
  finalUrl: string;
  testedAt: string;
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
  checks: Array<{ id: string; label: string; status: string }>;
};

export type DoctorHandoff = {
  version: 1;
  createdAt: number;
  summary: string;
};

function oneLine(text: string, max = 90) {
  return [...text].filter((character) => {
    const n = character.charCodeAt(0);
    return n >= 32 && n !== 127;
  }).join('').replace(/\s+/g, ' ').trim().slice(0, max);
}

function safeAddress(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return '';
    return `https://${url.hostname}${url.pathname === '/' ? '/' : url.pathname.slice(0, 140)}`;
  } catch {
    return '';
  }
}

const printableScore = (value: number | null) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100
    ? String(value) + '/100'
    : 'brak danych';

/** Short technical facts only; explanatory AI and free-text problem stay out. */
export function buildDoctorHandoff(evidence: DoctorEvidence): string {
  const address = safeAddress(evidence.finalUrl) || safeAddress(evidence.url);
  if (!address) return '';
  const issueChecks = evidence.checks
    .filter((check) => check.status === 'fail' || check.status === 'warning')
    .slice(0, 6)
    .map((check) => '- ' + oneLine(check.label) + ': ' +
      (check.status === 'fail' ? 'problem' : 'uwaga'));
  const report = [
    'ZAŁĄCZONY RAPORT AI SITE DOCTOR — Lighthouse mobile',
    'Strona: ' + address,
    'Pomiar: ' + (Number.isNaN(Date.parse(evidence.testedAt))
      ? 'brak daty' : new Date(evidence.testedAt).toISOString()),
    'Wydajność: ' + printableScore(evidence.scores.performance),
    'SEO: ' + printableScore(evidence.scores.seo),
    'Dostępność: ' + printableScore(evidence.scores.accessibility),
    'Wykryte sygnały:',
    ...(issueChecks.length ? issueChecks : ['- Brak ostrzeżeń w podstawowych kontrolach.']),
    'Uwaga: to test laboratoryjny jednej podstrony, nie audyt WordPress ani WCAG.',
  ].join('\n');
  return report.slice(0, DOCTOR_HANDOFF_LIMIT);
}


// Only read a URL produced by our diagnostic handoff; do not parse arbitrary text.
export function doctorPageUrl(summary: string): string {
  if (!summary.startsWith('ZAŁĄCZONY RAPORT AI SITE DOCTOR')) return '';
  const match = summary.match(/^Strona: (https:\/\/[^\s]+)$/m);
  return match ? safeAddress(match[1]) : '';
}

export function writeDoctorHandoff(
  storage: Pick<Storage, 'setItem'>,
  summary: string,
  now: number = Date.now(),
): boolean {
  const trimmed = summary.trim();
  if (!trimmed.startsWith('ZAŁĄCZONY RAPORT AI SITE DOCTOR') ||
      trimmed.length > DOCTOR_HANDOFF_LIMIT || trimmed.length < 80) return false;
  try {
    storage.setItem(DOCTOR_HANDOFF_KEY, JSON.stringify({
      version: 1,
      createdAt: now,
      summary: trimmed,
    } satisfies DoctorHandoff));
    return true;
  } catch {
    return false;
  }
}

export function readDoctorHandoff(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  now: number = Date.now(),
): DoctorHandoff | null {
  let raw: string | null = null;
  try { raw = storage.getItem(DOCTOR_HANDOFF_KEY); }
  catch { return null; }
  if (!raw) return null;

  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Invalid payload');
    const item = data as Partial<DoctorHandoff>;
    if (item.version !== 1 || typeof item.createdAt !== 'number' ||
        now < item.createdAt || now - item.createdAt > DOCTOR_HANDOFF_TTL ||
        typeof item.summary !== 'string' ||
        item.summary.length > DOCTOR_HANDOFF_LIMIT ||
        !item.summary.startsWith('ZAŁĄCZONY RAPORT AI SITE DOCTOR')) {
      throw Error('Expired or invalid');
    }
    return item as DoctorHandoff;
  } catch {
    try { storage.removeItem(DOCTOR_HANDOFF_KEY); } catch { /* storage blocked */ }
    return null;
  }
}

export function deleteDoctorHandoff(storage: Pick<Storage, 'removeItem'>) {
  try { storage.removeItem(DOCTOR_HANDOFF_KEY); }
  catch { /* unavailable storage must never break the lead form */ }
}
