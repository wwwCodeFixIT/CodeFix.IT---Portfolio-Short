/**
 * Site Doctor: browser never fetches a third-party URL.
 * This component only talks to the same-origin, rate-limited Pages Function.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { buildDoctorHandoff, writeDoctorHandoff } from '../lib/site-doctor-handoff';
import { refreshToolAvailability, useToolAvailability } from '../lib/tool-availability';
import './ToolControls.css';
import './SiteDoctor.css';

type CheckStatus = 'pass' | 'warning' | 'fail' | 'unknown';
type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
};
type DoctorReport = {
  url: string;
  finalUrl: string;
  testedAt: string;
  source: 'Google PageSpeed Insights / Lighthouse';
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
  checks: Check[];
  note: string;
  recommendations: string[];
  aiExplanation?: string;
};

type Problem = 'slow' | 'seo' | 'mobile' | 'forms' | 'update' | 'other';
const problems: Record<Problem, string> = {
  slow: 'Strona działa wolno',
  seo: 'Problem z SEO',
  mobile: 'Problem na telefonie',
  forms: 'Formularz nie działa',
  update: 'Problem po aktualizacji',
  other: 'Inny problem',
};
const statusLabels: Record<CheckStatus, string> = {
  pass: 'OK', warning: 'Uwaga', fail: 'Problem', unknown: 'Nie sprawdzono',
};
const thresholds = (score: number | null) =>
  score === null ? 'Brak pomiaru' : score >= 90 ? 'Dobry' : score >= 50 ? 'Do poprawy' : 'Słaby';

function buildReportText(report: DoctorReport, problem: Problem, description: string) {
  const scores = report.scores;
  return [
    'AI SITE DOCTOR — WYNIK POMIARU LIGHTHOUSE',
    'Adres: ' + report.url,
    'Zbadany adres: ' + report.finalUrl,
    'Data UTC: ' + report.testedAt,
    'Objaw: ' + problems[problem],
    description.trim() ? 'Opis: ' + description.trim() : '',
    'Performance: ' + (scores.performance ?? 'brak') + '/100',
    'SEO: ' + (scores.seo ?? 'brak') + '/100',
    'Accessibility: ' + (scores.accessibility ?? 'brak') + '/100',
    '',
    ...report.checks.map((check) => '- ' + check.label + ': ' + statusLabels[check.status] + ' — ' + check.detail),
    '',
    'Wskazówki:',
    ...report.recommendations.map((item) => '- ' + item),
    report.aiExplanation ? '\nWyjaśnienie AI: ' + report.aiExplanation : '',
    '',
    'Testy laboratoryjne nie zastępują ręcznej diagnozy WordPress, formularzy i urządzeń.',
  ].filter(Boolean).join('\n').slice(0, 6800);
}

type Props = {
  initialUrl?: string;
  onAttach?: (summary: string) => void;
  onDismiss?: () => void;
};

export default function SiteDoctor({ initialUrl = '', onAttach, onDismiss }: Props) {
  const availability = useToolAvailability();
  const [retryFocus, setRetryFocus] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [problem, setProblem] = useState<Problem>('slow');
  const [description, setDescription] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState('');
  const [requestKey, setRequestKey] = useState(0);
  const running = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const cancelRequested = useRef(false);

  useEffect(() => () => controller.current?.abort(), []);

  async function runScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running.current || !availability.doctor) return;
    // Fail on private/internal addresses at the client for quick feedback.
    let normalized: URL;
    try {
      normalized = new URL(url.trim());
      if (normalized.protocol !== 'https:' || !normalized.hostname.includes('.') ||
          normalized.username || normalized.password || normalized.port ||
          normalized.hash || normalized.href.length > 450) throw Error('Invalid URL');
    } catch {
      setMessage('Podaj publiczny adres HTTPS, np. https://twoja-strona.pl.');
      setState('error');
      setReport(null);
      return;
    }

    running.current = true;
    cancelRequested.current = false;
    setRequestKey((n) => n + 1);
    setReport(null);
    setCopied('');
    setState('loading');
    setMessage('Wysyłam adres do Google PageSpeed Insights. Badanie może potrwać kilkadziesiąt sekund.');
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 65000);
    try {
      const response = await fetch('/api/site-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized.href, problem, description: description.trim(), includeAi: useAi && availability.ai }),
        signal: abort.signal,
      });
      if (!response.ok) {
        const errors: Record<number, string> = {
          400: 'Sprawdź adres strony i pola formularza.',
          403: 'Ta funkcja działa wyłącznie na codefix.it.',
          429: 'Limit analiz został osiągnięty. Spróbuj ponownie później.',
          503: 'Skaner nie został jeszcze aktywowany. Możesz nadal skorzystać z innych narzędzi.',
          504: 'Google PageSpeed nie ukończył pomiaru w wyznaczonym czasie.',
          502: 'Google PageSpeed nie zwrócił prawidłowego raportu. Spróbuj z innym adresem.',
        };
        throw new Error(errors[response.status] || 'Nie udało się pobrać wyniku diagnozy.');
      }
      const data: DoctorReport = await response.json();
      if (!data || !Array.isArray(data.checks) || !data.scores || !Array.isArray(data.recommendations)) {
        throw new Error('Niepoprawna odpowiedź diagnostyczna.');
      }
      setReport(data);
      setMessage('Pomiar gotowy. Diabełek znalazł wyniki do przejrzenia.');
      setState('success');
    } catch (error) {
      setMessage(cancelRequested.current
        ? 'Pomiar został anulowany. Nie dołączono żadnego raportu.'
        : error instanceof Error && error.name === 'AbortError'
          ? 'Upłynął czas pomiaru. Spróbuj ponownie później.'
          : error instanceof Error ? error.message : 'Nie udało się wykonać pomiaru.');
      setState('error');
    } finally {
      clearTimeout(timeout);
      controller.current = null;
      running.current = false;
    }
  }

  function handoffToContact() {
    if (!report) return;
    const summary = buildDoctorHandoff(report);
    if (onAttach) {
      onAttach(summary);
      return;
    }
    let saved: boolean;
    try { saved = writeDoctorHandoff(window.sessionStorage, summary); }
    catch { saved = false; }

    if (!saved) {
      setCopied('Nie udało się zapisać wyniku na czas przejścia. Skopiuj raport poniżej i wklej go w formularzu.');
      return;
    }
    // Explicit visitor action: stage a minimal report for the existing contact form.
    window.location.assign('/?service=WORDPRESS_QUICK_FIX&doctor=1#contact');
  }

  async function copyReport() {
    if (!report) return;
    const summary = buildReportText(report, problem, description);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied('Skopiowano raport.');
    } catch {
      setCopied('Nie udało się skopiować automatycznie. Zaznacz raport w polu poniżej.');
    }
  }

  return (
    <section className="cf-doctor" aria-labelledby="cf-doctor-title">
      <div className="cf-doctor-top">
        <div className={'cf-doctor-avatar' + (state === 'loading' ? ' is-scanning' : '')}>
          <img src="/brand/codefix-devil-mark.webp" width="128" height="128" alt="" loading="lazy" />
          {availability.doctor && <span className="cf-doctor-led" aria-hidden="true" />}
        </div>
        <div>
          <p className="cf-section-kicker">04 / Laboratorium diagnostyczne</p>
          <h2 id="cf-doctor-title">AI Site Doctor<span className="cf-doctor-accent">.</span></h2>
          <p className="cf-doctor-tagline">Diabełek sprawdza, gdzie tkwi problem.</p>
        </div>
      </div>
      {availability.doctor ? <><p className="cf-doctor-intro">
        Pomiar mobilny Lighthouse: wydajność, SEO i dostępność. Adres trafia do Google
        PageSpeed Insights. Formularze i WordPress wymagają osobnego testu.
      </p>
      <form className="cf-tool-form cf-doctor-form" onSubmit={(event) => void runScan(event)}>
        <label>
          Adres strony
          <input required type="url" inputMode="url" maxLength={450} autoComplete="url" autoFocus={retryFocus}
            value={url} onChange={(event) => setUrl(event.target.value)}
            placeholder="https://twoja-strona.pl" />
        </label>
        <label>
          Co się dzieje?
          <select value={problem} onChange={(event) => setProblem(event.target.value as Problem)}>
            {Object.entries(problems).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Krótki opis (opcjonalnie)
          <textarea rows={3} maxLength={400} value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Np. po aktualizacji koszyk nie przechodzi do płatności." />
        </label>
        {availability.ai && <label className="cf-doctor-optin">
          <input type="checkbox" checked={useAi} onChange={(event) => setUseAi(event.target.checked)} />
          <span><strong>Dodaj komentarz modelu AI</strong>
            <small>Opcjonalnie — opis i wyniki zostaną przekazane do dostawcy modelu, jeśli integracja jest aktywna.</small>
          </span>
        </label>}
        <div className="cf-tool-actions">
          <button className="cf-tool-primary" type="submit" disabled={state === 'loading'}>
            {state === 'loading' ? 'Trwa pomiar…' : 'Uruchom diagnozę'} <span aria-hidden="true">↗</span>
          </button>
          {state === 'loading' && <button type="button" onClick={() => {
            cancelRequested.current = true;
            controller.current?.abort();
          }}>Anuluj</button>}
        </div>
        <p className="cf-doctor-data-note">Podaj publiczny adres HTTPS. Nie wpisuj poufnych adresów ani haseł.</p>
      </form></> : <div className="cf-doctor-intro" role="status">
        <p>{availability.state === 'loading' ? 'Sprawdzam dostępność diagnozy…'
          : availability.state === 'error' ? 'Nie udało się sprawdzić dostępności diagnozy.'
          : 'Diagnoza online jest niedostępna. Opisz problem w zgłoszeniu.'}</p>
        <div className="cf-tool-actions">
          {onDismiss ? <button type="button" onClick={onDismiss}>Wróć do zgłoszenia</button>
            : <a href="/?service=WORDPRESS_QUICK_FIX#contact">Opisz problem →</a>}
          {availability.state === 'error' && <button type="button" autoFocus={retryFocus} onClick={() => {
            setRetryFocus(true);
            void refreshToolAvailability();
          }}>Sprawdź ponownie</button>}
        </div>
      </div>}

      {availability.doctor && <div role="status" aria-live="polite" className={'cf-doctor-status' + (state === 'error' ? ' is-error' : '')} key={requestKey}>
        <span className="cf-doctor-status-dot" aria-hidden="true" />
        <span>{message || 'Diabełek gotowy do diagnozy.'}</span>
      </div>}

      {availability.doctor && state === 'error' && (
        <div className="cf-doctor-intro cf-doctor-recovery" role="group" aria-labelledby="cf-doctor-recovery-title">
          <h3 id="cf-doctor-recovery-title">Zgłoś problem bez automatycznego pomiaru.</h3>
          <p>Nie ma wiarygodnego raportu Lighthouse. Opisz objawy, a CodeFix.IT pomoże zdiagnozować usterkę.</p>
          <div className="cf-tool-actions">
            {onDismiss ? (
              <button type="button" onClick={onDismiss}>Wróć do zgłoszenia bez raportu →</button>
            ) : (
              <a href="/?service=WORDPRESS_QUICK_FIX#contact">Opisz problem bez diagnozy →</a>
            )}
          </div>
        </div>
      )}

      {report && state === 'success' && (
        <div className="cf-doctor-results" aria-label="Wynik diagnozy">
          <div className="cf-doctor-result-head">
            <div>
              <p className="cf-section-kicker">Zmierzone przez Lighthouse / mobile</p>
              <h3>Raport diagnostyczny</h3>
              <p>Sprawdzony adres: <span>{report.finalUrl}</span></p>
              <p><time dateTime={report.testedAt}>{new Date(report.testedAt).toLocaleString('pl-PL')}</time></p>
            </div>
            <div className="cf-doctor-result-logo" aria-hidden="true"><img src="/brand/codefix-devil-mark.webp" width="80" height="80" alt="" loading="lazy" /></div>
          </div>
          <div className="cf-doctor-scores">
            {([['Wydajność', report.scores.performance], ['SEO', report.scores.seo], ['Dostępność', report.scores.accessibility]] as const).map(([name, value]) => (
              <div className="cf-doctor-score" key={name}>
                <span>{name}</span>
                <strong>{value === null ? '—' : value}<small>{value === null ? '' : '/100'}</small></strong>
                <span>{thresholds(value)}</span>
              </div>
            ))}
          </div>
          <h4>Co znaleziono</h4>
          <div className="cf-doctor-checks">
            {report.checks.map((check) => (
              <article className="cf-doctor-check" key={check.id}>
                <span className={'cf-doctor-check-icon is-' + check.status} aria-hidden="true">
                  {check.status === 'pass' ? '✓' : check.status === 'unknown' ? '?' : '!'}
                </span>
                <div><h5>{check.label}</h5><p>{check.detail}</p></div>
                <span className="cf-doctor-check-label">{statusLabels[check.status]}</span>
              </article>
            ))}
          </div>
          <div className="cf-doctor-interpretation">
            <img src="/brand/codefix-devil-mark.webp" width="60" height="60" alt="" loading="lazy" />
            <div><h4>{report.aiExplanation ? 'Komentarz diabełka — AI' : 'Diabełek radzi — reguły diagnostyczne'}</h4>
              <p>{report.aiExplanation || report.note}</p>
              <ol>{report.recommendations.map((recommendation, i) => <li key={i}>{recommendation}</li>)}</ol>
            </div>
          </div>
          <p className="cf-doctor-disclaimer">
            Wyniki to pomiar jednej publicznej podstrony na symulowanym urządzeniu mobilnym,
            a nie certyfikat WCAG, audyt bezpieczeństwa ani potwierdzenie sprawności WordPress.
          </p>
          <div className="cf-doctor-handoff" aria-labelledby="cf-doctor-handoff-title">
            <div>
              <p className="cf-section-kicker">Osobna funkcja · Przekaż diagnozę</p>
              <h4 id="cf-doctor-handoff-title">Z wyniku do zgłoszenia — bez przepisywania.</h4>
              <p>
                {onAttach ? 'Dołączę' : 'Przeniosę'} wyłącznie skrócony raport z pomiaru Lighthouse do formularza.
                Nie przenoszę opisu problemu ani komentarza AI. Raport będzie widoczny
                przed wysłaniem i możesz go usunąć.
              </p>
            </div>
            <div className="cf-tool-actions">
              <button className="cf-tool-primary" type="button" onClick={handoffToContact}>
                Dołącz diagnozę do zapytania →
              </button>
              {onDismiss ? (
                <button type="button" onClick={onDismiss}>Wróć bez raportu</button>
              ) : (
                <a href="/?service=WORDPRESS_QUICK_FIX#contact">Napisz bez diagnozy</a>
              )}
            </div>
          </div>
          <div className="cf-tool-actions">
            <button type="button" onClick={() => void copyReport()}>Kopiuj pełny raport</button>
          </div>
          <p role="status">{copied}</p>
          {copied.startsWith('Nie udało') && (
            <textarea aria-label="Raport do ręcznego skopiowania" readOnly rows={8}
              value={buildReportText(report, problem, description)} onFocus={(event) => event.currentTarget.select()} />
          )}
        </div>
      )}
    </section>
  );
}
