import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Brand } from '../components/Brand';
import { openMeasurementSettings } from '../lib/measurement';
import { refreshToolAvailability, useToolAvailability } from '../lib/tool-availability';
import '../components/ToolControls.css';
import './ToolsLab.css';

const SiteDoctor = lazy(() => import('../components/SiteDoctor'));
const AutomationMap = lazy(() => import('../components/AutomationMap').catch(() => ({
  default: () => <p role="alert">Nie udało się załadować mapy. Odśwież stronę i spróbuj ponownie.</p>,
})));

type ToolId = 'doctor' | 'brief' | 'seo' | 'contrast' | 'automation';
type ProjectKind = 'strona' | 'aplikacja' | 'naprawa' | 'opieka';

const kinds: Record<ProjectKind, string> = {
  strona: 'Nowa strona firmowa',
  aplikacja: 'Aplikacja / integracja',
  naprawa: 'Naprawa WordPress',
  opieka: 'Stała opieka',
};

const projectServices: Record<ProjectKind, string> = {
  strona: 'CODEFIX_BUSINESS_SITE',
  aplikacja: 'development',
  naprawa: 'WORDPRESS_QUICK_FIX',
  opieka: 'WORDPRESS_CARE',
};

function basicBrief(kind: ProjectKind, audience: string, goal: string, website: string) {
  const result = [
    'BRIEF PROJEKTU — WERSJA LOKALNA (bez analizy AI)',
    '',
    'Typ: ' + kinds[kind],
    'Odbiorcy: ' + (audience.trim() || 'do ustalenia'),
    'Cel / problem: ' + goal.trim(),
    website.trim() ? 'Adres strony: ' + website.trim() : '',
    '',
    'Do ustalenia:',
    '- Jak wygląda oczekiwany efekt i kryterium akceptacji?',
    '- Jakie treści, funkcje lub integracje są niezbędne?',
    '- Jaki jest termin, budżet oraz dostępność materiałów?',
    '- Jak będzie weryfikowane działanie na telefonie i komputerze?',
    '',
    'To szkic rozmowy, nie audyt techniczny ani wycena.',
  ];
  return result.filter((line) => line !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
}

function luminance(hex: string) {
  const values = hex.slice(1).match(/.{2}/g)?.map((x) => parseInt(x, 16) / 255) ?? [0, 0, 0];
  const rgb = values.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function ToolsLab() {
  const [active, setActive] = useState<ToolId>(() =>
    new URL(window.location.href).searchParams.get('tool') === 'automatyzacja' ? 'automation'
      : new URL(window.location.href).searchParams.get('tool') === 'diagnoza' ? 'doctor' : 'brief',
  );
  const availability = useToolAvailability();
  const [automationStarted, setAutomationStarted] = useState(active === 'automation');
  const [kind, setKind] = useState<ProjectKind>('strona');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [website, setWebsite] = useState('');
  const [result, setResult] = useState<{ text: string; kind: ProjectKind } | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const output = useRef<HTMLTextAreaElement>(null);
  const [seoTitle, setSeoTitle] = useState('Strony internetowe dla firm | CodeFix.IT');
  const [seoDescription, setSeoDescription] = useState('Projektowanie, naprawa i rozwój WordPress. Responsywne strony firmowe, ACF PRO, optymalizacja i wsparcie.');
  const [fg, setFg] = useState('#f7f7f8');
  const [bg, setBg] = useState('#101011');
  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);

  useEffect(() => {
    const before = document.title;
    document.title = 'Narzędzia AI, SEO i automatyzacji | CodeFix.IT';
    return () => { document.title = before; };
  }, []);

  const draft = basicBrief(kind, audience, goal, website);

  function localDraft() {
    if (goal.trim().length < 15) {
      setStatus('Opisz cel lub problem w co najmniej 15 znakach.');
      return;
    }
    setResult({ text: draft, kind });
    setStatus('Szkic lokalny gotowy. Bez połączenia z AI.');
    setCopyStatus('');
  }

  async function aiDraft() {
    if (!availability.ai) { localDraft(); return; }
    if (goal.trim().length < 15) {
      setStatus('Opisz cel lub problem w co najmniej 15 znakach.');
      return;
    }
    setBusy(true);
    setStatus('Trwa tworzenie briefu…');
    setCopyStatus('');
    try {
      const response = await fetch('/api/ai-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, audience: audience.trim(), goal: goal.trim(), website: website.trim() }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        if (response.status === 503) {
          setResult({ text: draft, kind });
          setStatus('AI nie jest jeszcze aktywne. Wyświetlam szkic lokalny.');
          return;
        }
        if (response.status === 429) throw new Error('Limit zapytań został osiągnięty. Spróbuj później.');
        throw new Error('Nie udało się uzyskać odpowiedzi AI. Możesz użyć szkicu lokalnego.');
      }
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('brief' in data) || typeof data.brief !== 'string') {
        throw new Error('Nieprawidłowa odpowiedź serwera.');
      }
      setResult({ text: data.brief.slice(0, 3800), kind });
      setStatus('Brief przygotowany przez model AI. Sprawdź i popraw informacje przed użyciem.');
    } catch (error) {
      setResult({ text: draft, kind });
      setStatus(error instanceof Error ? error.message + ' Wyświetlam szkic lokalny.' : 'Wyświetlam szkic lokalny.');
    } finally {
      setBusy(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopyStatus('Skopiowano brief.');
    } catch {
      output.current?.focus();
      output.current?.select();
      setCopyStatus('Zaznaczony tekst możesz skopiować ręcznie.');
    }
  }

  return (
    <div className="homepage-v1 cf-tools">
      <header className="cf-header">
        <div className="cf-container cf-tools-nav">
          <Brand />
          <a href="/">← Strona główna</a>
        </div>
      </header>

      <main className="cf-container cf-tools-main">
        <p className="cf-section-kicker">CodeFix.IT / Laboratorium</p>
        <h1>Narzędzia, które pomagają podjąć decyzję.</h1>
        <p className="cf-tools-intro">
          Zaplanuj automatyzację, przygotuj brief lub sprawdź stronę. Wybierz jedno narzędzie.
        </p>

        <div className="cf-tool-tabs" role="group" aria-label="Wybierz narzędzie">
          <button type="button" aria-pressed={active === 'doctor'} onClick={() => setActive('doctor')}>AI Site Doctor 😈</button>
          <button type="button" aria-pressed={active === 'brief'} onClick={() => setActive('brief')}>Asystent briefu</button>
          <button type="button" aria-pressed={active === 'automation'} onClick={() => {
            setAutomationStarted(true);
            setActive('automation');
          }}>Mapa automatyzacji</button>
          <button type="button" aria-pressed={active === 'seo'} onClick={() => setActive('seo')}>Podgląd SEO</button>
          <button type="button" aria-pressed={active === 'contrast'} onClick={() => setActive('contrast')}>Kontrast WCAG</button>
        </div>

        {automationStarted && (
          <div hidden={active !== 'automation'}>
            <Suspense fallback={<p role="status">Ładuję mapę automatyzacji…</p>}>
              <AutomationMap />
            </Suspense>
          </div>
        )}

        {active === 'doctor' && (
          <Suspense fallback={<div className="cf-tool-panel" role="status">Ładuję Site Doctor…</div>}>
            <SiteDoctor />
          </Suspense>
        )}

        {active === 'brief' && (
          <section className="cf-tool-panel" aria-labelledby="brief-title">
            <div className="cf-tool-heading">
              <div><p className="cf-section-kicker">01 / Planowanie</p><h2 id="brief-title">Asystent briefu projektu</h2></div>
              <span className="cf-tool-chip">{availability.ai ? 'Szkic lokalny + opcjonalne AI' : 'Szkic lokalny'}</span>
            </div>
            <p>Szkic powstaje w tej karcie. {availability.ai && 'Wybór „Generuj z AI” wysyła treść do modelu — pomiń informacje poufne.'}</p>
            <form className="cf-tool-form" onSubmit={(event) => { event.preventDefault(); localDraft(); }}>
              <label>Rodzaj projektu
                <select value={kind} onChange={(event) => setKind(event.target.value as ProjectKind)}>
                  {Object.entries(kinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Do kogo kierujesz stronę lub aplikację?
                <input value={audience} maxLength={120} onChange={(event) => setAudience(event.target.value)} placeholder="Np. lokalne firmy usługowe" />
              </label>
              <label>Cel lub problem
                <textarea required minLength={15} maxLength={900} rows={4} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Co chcesz osiągnąć? Co obecnie nie działa?" />
              </label>
              <label>Adres obecnej strony (opcjonalnie)
                <input value={website} maxLength={200} onChange={(event) => setWebsite(event.target.value)} placeholder="https://twoja-strona.pl" />
              </label>
              <div className="cf-tool-actions">
                <button type="submit" disabled={busy} className="cf-tool-primary">Szkic bez AI</button>
                {availability.ai && <button type="button" disabled={busy} onClick={() => void aiDraft()}>{busy ? 'Analizuję…' : 'Generuj z AI'}</button>}
                {availability.state === 'error' && <button type="button" onClick={(event) => {
                  event.currentTarget.form?.querySelector<HTMLButtonElement>('.cf-tool-primary')?.focus();
                  void refreshToolAvailability();
                }}>Sprawdź dostępność AI</button>}
              </div>
            </form>
            <p className="cf-tool-status" role="status" aria-live="polite">{status}</p>
            {result && (
              <div className="cf-tool-result">
                <label htmlFor="cf-tool-brief-result">Twój brief</label>
                <p>Brief dotyczy: {kinds[result.kind]}.</p>
                <textarea ref={output} id="cf-tool-brief-result" readOnly rows={15} value={result.text} />
                <div className="cf-tool-actions">
                  <button type="button" onClick={() => void copyResult()}>Skopiuj brief</button>
                  <a href={`/?service=${projectServices[result.kind]}#contact`}>Omów projekt z CodeFix.IT →</a>
                </div>
                <p role="status">{copyStatus}</p>
              </div>
            )}
          </section>
        )}

        {active === 'seo' && (
          <section className="cf-tool-panel" aria-labelledby="seo-title">
            <div className="cf-tool-heading"><div><p className="cf-section-kicker">02 / SEO</p><h2 id="seo-title">Podgląd tytułu i opisu</h2></div><span className="cf-tool-chip">Lokalnie · bez AI</span></div>
            <p>Sprawdź, jak może wyglądać wynik wyszukiwania. Google może zmienić tytuł, opis i ich długość — to tylko symulacja.</p>
            <div className="cf-tool-form">
              <label>Meta title <span className="cf-tool-count">{seoTitle.length} znaków · orientacyjnie 50–60</span>
                <input value={seoTitle} maxLength={120} onChange={(event) => setSeoTitle(event.target.value)} />
              </label>
              <label>Meta description <span className="cf-tool-count">{seoDescription.length} znaków · orientacyjnie 140–160</span>
                <textarea value={seoDescription} rows={3} maxLength={300} onChange={(event) => setSeoDescription(event.target.value)} />
              </label>
            </div>
            <div className="cf-seo-preview" aria-label="Przykładowy wynik wyszukiwania">
              <span>codefix.it › przykładowa-strona</span>
              <strong>{seoTitle || 'Tytuł strony'}</strong>
              <p>{seoDescription || 'Tutaj pojawi się meta description.'}</p>
            </div>
          </section>
        )}

        {active === 'contrast' && (
          <section className="cf-tool-panel" aria-labelledby="contrast-title">
            <div className="cf-tool-heading"><div><p className="cf-section-kicker">03 / Dostępność</p><h2 id="contrast-title">Tester kontrastu WCAG</h2></div><span className="cf-tool-chip">Lokalnie · bez AI</span></div>
            <p>Sprawdź kontrast dwóch pełnych kolorów HEX. Wynik dotyczy tekstu na jednolitym tle, nie całego interfejsu.</p>
            <div className="cf-tool-colors">
              <label>Kolor tekstu <input aria-label="Wybierz kolor tekstu" type="color" value={fg} onChange={(event) => setFg(event.target.value)} /> <output>{fg}</output></label>
              <label>Kolor tła <input aria-label="Wybierz kolor tła" type="color" value={bg} onChange={(event) => setBg(event.target.value)} /> <output>{bg}</output></label>
            </div>
            <div className="cf-contrast-preview" style={{ color: fg, background: bg }}><strong>Diabeł tkwi w kodzie.</strong><span>Przykładowy tekst o normalnym rozmiarze.</span></div>
            <div className="cf-contrast-values" aria-live="polite">
              <strong>Kontrast {ratio.toFixed(2)}:1</strong>
              <span>Tekst zwykły AA (4.5:1): {ratio >= 4.5 ? 'spełnia' : 'nie spełnia'}</span>
              <span>Tekst duży AA (3:1): {ratio >= 3 ? 'spełnia' : 'nie spełnia'}</span>
              <span>Tekst zwykły AAA (7:1): {ratio >= 7 ? 'spełnia' : 'nie spełnia'}</span>
            </div>
          </section>
        )}

        <aside className="cf-tools-bottom">
          <h2>Potrzebujesz diagnozy zamiast symulacji?</h2>
          <p>Site Doctor analizuje wyłącznie publiczną stronę przez Lighthouse. Naprawy WordPress, formularze, backend i bezpieczeństwo wymagają osobnej weryfikacji.</p>
          <a href="/naprawa-wordpress/">Zgłoś problem z WordPress →</a>
        </aside>
      </main>
      <footer className="cf-container cf-tools-footer">
        <span>© 2026 CodeFix.IT · Diabeł tkwi w kodzie.</span>
        <div className="cf-tools-footer-links">
          <a href="/polityka-prywatnosci/">Prywatność</a>
          <button type="button" onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            openMeasurementSettings();
          }}>Ustawienia prywatności</button>
        </div>
      </footer>
    </div>
  );
}
