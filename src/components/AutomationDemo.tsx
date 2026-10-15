import { useState } from 'react'

const examples = [
  {
    label: 'Zapytania',
    input: 'Wiadomość z formularza',
    source: '„Prowadzę studio jogi. Potrzebuję strony z zapisami na zajęcia.”',
    output: 'Zapytanie w CRM',
    rows: [
      ['Temat', 'Strona firmowa'],
      ['Cel', 'Zapisy na zajęcia'],
      ['Status', 'Do doprecyzowania'],
    ],
    action: 'Podejrzyj odpowiedź',
    close: 'Zwiń odpowiedź',
    detail:
      'Dziękuję za opis. Czy masz już system zapisów, z którym strona powinna się połączyć? To szkic do sprawdzenia przed wysyłką.',
  },
  {
    label: 'Dokumenty',
    input: 'Notatka z zamówienia',
    source: '„Studio Joga — 12 mat do ćwiczeń. Dostawa w piątek.”',
    output: 'Dane do sprawdzenia',
    rows: [
      ['Produkt', 'Maty do ćwiczeń'],
      ['Liczba', '12'],
      ['Dostawa', 'Piątek'],
    ],
    action: 'Sprawdź kompletność',
    close: 'Zwiń uwagę',
    detail:
      'W notatce brakuje adresu dostawy. Ten element wymaga uzupełnienia przed przekazaniem zamówienia dalej.',
  },
  {
    label: 'Panel klienta',
    input: 'Podgląd projektu',
    source: 'Strona studia jogi. Projekt graficzny jest gotowy do sprawdzenia przez klienta.',
    output: 'Etapy projektu',
    rows: [
      ['Projekt graficzny', 'Do sprawdzenia', 'Zaakceptowany'],
      ['Wdrożenie', 'Po akceptacji', 'Gotowe do startu'],
    ],
    action: 'Zaakceptuj podgląd',
    close: 'Cofnij akceptację',
    detail:
      'Akceptacja zapisana w tym przykładzie. Kolejny etap: wdrożenie zaakceptowanego projektu.',
  },
]

export default function AutomationDemo() {
  const [selected, setSelected] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const example = examples[selected]

  return (
    <div className="cf-auto-demo" role="group" aria-label="Przykład automatyzacji">
      <div className="cf-demo-heading">
        <strong>Przepływ pracy</strong>
        <span>Dane przykładowe</span>
      </div>
      <div className="cf-demo-tabs" role="group" aria-label="Wybierz scenariusz">
        {examples.map(({ label }, index) => (
          <button
            type="button"
            key={label}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index)
              setExpanded(false)
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="cf-demo-flow">
        <section aria-labelledby="cf-demo-input">
          <h3 id="cf-demo-input">{example.input}</h3>
          <p>{example.source}</p>
        </section>
        <section aria-labelledby="cf-demo-output">
          <h3 id="cf-demo-output">{example.output}</h3>
          <dl aria-live="polite" aria-atomic="true">
            {example.rows.map(([label, value, confirmed]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{expanded && confirmed ? confirmed : value}</dd>
              </div>
            ))}
          </dl>
          <button
            className="cf-demo-action"
            type="button"
            aria-expanded={expanded}
            aria-controls="cf-demo-detail"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? example.close : example.action}
            <span aria-hidden="true">{expanded ? '−' : '+'}</span>
          </button>
          <p id="cf-demo-detail" className="cf-demo-detail" role="status">
            {expanded ? example.detail : ''}
          </p>
        </section>
      </div>
    </div>
  )
}
