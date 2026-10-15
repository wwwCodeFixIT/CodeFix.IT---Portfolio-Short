import { useEffect, useRef, useState } from 'react'

const scenarios = [
  {
    label: 'Zapytania',
    steps: [
      ['Wiadomość', 'Klient opisuje potrzebę.', '„Potrzebuję strony dla studia jogi.”'],
      [
        'Propozycja AI',
        'Dane zostają uporządkowane do sprawdzenia.',
        'Temat: nowa strona\nCel: zapisy na zajęcia',
      ],
      [
        'CRM',
        'Zapytanie pojawia się na liście.',
        'DEMO-01 · Nowe zapytanie\nDo ustalenia: zakres i termin',
      ],
      [
        'Szkic odpowiedzi',
        'Człowiek sprawdza treść przed wysyłką.',
        '„Czy masz już system zapisów?”\nStatus: czeka na akceptację',
      ],
    ],
  },
  {
    label: 'Dokumenty',
    steps: [
      [
        'Notatka',
        'Zaczynamy od przykładowego zamówienia.',
        '„Studio Joga: 12 mat, dostawa w piątek.”',
      ],
      [
        'Odczyt danych',
        'Informacje trafiają do osobnych pól.',
        'Produkt: mata\nLiczba: 12\nTermin: piątek',
      ],
      [
        'Weryfikacja',
        'Operator sprawdza i uzupełnia dane.',
        'Adres: ul. Przykładowa 10\nWeryfikacja: zatwierdzona',
      ],
      [
        'Zestawienie',
        'Gotowe dane trafiają do wspólnej listy.',
        'Studio Joga · 12 mat · piątek\nStatus: zatwierdzone',
      ],
    ],
  },
  {
    label: 'Panel klienta',
    steps: [
      [
        'Projekt',
        'Klient ma podgląd swojego projektu.',
        'Strona studia jogi\nStatus: w realizacji',
      ],
      ['Postęp', 'Widać aktualny etap pracy.', 'Projekt graficzny: gotowy\nWdrożenie: w toku'],
      [
        'Uwagi',
        'Podgląd i uwagi są w jednym miejscu.',
        'Podgląd: dostępny\nUwaga klienta: zmiana zdjęcia',
      ],
      [
        'Akceptacja',
        'Po sprawdzeniu zmian wiadomo, co dalej.',
        'Poprawki: zaakceptowane\nNastępny krok: publikacja',
      ],
    ],
  },
]

export default function AutomationDemo() {
  const [scenario, setScenario] = useState(0)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const root = useRef<HTMLDivElement>(null)
  const current = scenarios[scenario]
  const [title, description, sample] = current.steps[step]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pause = () => setPlaying(false)
    const preference = () => {
      setReduced(media.matches)
      pause()
    }
    media.addEventListener('change', preference)
    document.addEventListener('visibilitychange', pause)
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) pause()
          })
    if (root.current) observer?.observe(root.current)
    return () => {
      media.removeEventListener('change', preference)
      document.removeEventListener('visibilitychange', pause)
      observer?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      setStep(step + 1)
      if (step === 2) setPlaying(false)
    }, 2600)
    return () => window.clearTimeout(timer)
  }, [playing, step])

  function selectStep(index: number) {
    setPlaying(false)
    setStep(index)
  }

  return (
    <div className="cf-auto-demo" ref={root} role="group" aria-label="Demo automatyzacji">
      <p className="cf-section-kicker">Interaktywne demo</p>
      <p className="cf-demo-note">Symulacja na fikcyjnych danych. Wybierz przykład.</p>
      <div className="cf-hero-path-list" role="group" aria-label="Wybierz scenariusz">
        {scenarios.map(({ label }, index) => (
          <button
            className="cf-hero-path"
            type="button"
            key={label}
            aria-pressed={scenario === index}
            onClick={() => {
              setScenario(index)
              selectStep(0)
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div data-demo-steps role="group" aria-label="Kroki demonstracji">
        {current.steps.map(([label], index) => (
          <button
            className="cf-hero-path"
            type="button"
            key={label}
            aria-label={`Krok ${index + 1}: ${label}`}
            aria-pressed={step === index}
            onClick={() => selectStep(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="cf-hero-recommendation" role="status" aria-atomic="true">
        <span>
          Krok {step + 1} z 4 · {current.label}
        </span>
        <h3>{title}</h3>
        <p>{description}</p>
        <p className="cf-demo-sample">{sample}</p>
      </div>
      <div className="cf-brief-review-actions">
        {!reduced && (
          <button
            className="cf-button cf-button-primary"
            type="button"
            onClick={() => {
              if (step === 3) setStep(0)
              setPlaying((value) => !value)
            }}
          >
            {playing ? 'Zatrzymaj' : step === 3 ? 'Powtórz pokaz' : 'Uruchom pokaz'}
          </button>
        )}
        <button
          className="cf-button cf-button-secondary"
          type="button"
          onClick={() => selectStep((step + 1) % 4)}
        >
          {step === 3 ? 'Od początku' : 'Następny krok'}
        </button>
      </div>
      {reduced && <p className="cf-demo-note">Tryb ręczny — wybieraj kolejne kroki.</p>}
    </div>
  )
}
