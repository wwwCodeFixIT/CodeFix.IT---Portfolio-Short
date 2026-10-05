import { useEffect, useRef, useState } from 'react';
import {
  needsMeasurementChoice,
  openMeasurementSettings,
  readMeasurementPreferences,
  saveMeasurementPreferences,
} from '../lib/measurement';
import './MeasurementConsent.css';

export function MeasurementConsent({ servicePage = false }: { servicePage?: boolean }) {
  const [preferences, setPreferences] = useState(readMeasurementPreferences);
  const [open, setOpen] = useState(needsMeasurementChoice);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;
    function showSettings() {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setPreferences(readMeasurementPreferences());
      setOpen(true);
      frame = window.requestAnimationFrame(() => panelRef.current?.focus());
    }
    window.addEventListener('codefix:open-measurement-settings', showSettings);
    return () => {
      window.removeEventListener('codefix:open-measurement-settings', showSettings);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function save(nextPreferences = preferences) {
    saveMeasurementPreferences(nextPreferences);
    setPreferences(nextPreferences);
    setOpen(false);
    previousFocus.current?.focus();
  }

  return open ? (
    <section
      ref={panelRef}
      className="cf-measurement-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cf-measurement-title"
      aria-describedby="cf-measurement-description"
      tabIndex={-1}
    >
      <h2 id="cf-measurement-title">Ty wybierasz, co mierzymy</h2>
      <p id="cf-measurement-description">
        Możesz osobno włączyć analitykę strony i pomiar reklam. Formularz działa przy każdym wyborze.
        Szczegóły znajdziesz w <a href="/polityka-prywatnosci/">polityce prywatności</a>.
      </p>
      <fieldset className="cf-measurement-options">
        <legend>Opcjonalne pomiary</legend>
        <label>
          <input
            type="checkbox"
            checked={preferences.analytics}
            onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
          />
          <span><strong>Analityka strony (Google Analytics)</strong><small>Pomiar odwiedzin i wysłanych zapytań.</small></span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences.ads}
            onChange={(event) => setPreferences((current) => ({ ...current, ads: event.target.checked }))}
          />
          <span><strong>Pomiar reklam (Google Ads i OpenAI)</strong><small>Atrybucja reklam i konwersji po dobrowolnej zgodzie.</small></span>
        </label>
      </fieldset>
      <div className="cf-measurement-actions">
        <button type="button" onClick={() => save({ analytics: false, ads: false })}>Odrzuć wszystkie</button>
        <button type="button" onClick={() => save()}>Zapisz wybór</button>
        <button type="button" onClick={() => save({ analytics: true, ads: true })}>Akceptuj wszystkie</button>
      </div>
    </section>
  ) : (
    <button
      type="button"
      className="cf-measurement-settings"
      data-service-page={servicePage}
      onClick={openMeasurementSettings}
    >
      Ustawienia prywatności
    </button>
  );
}
