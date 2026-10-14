import { useState } from 'react'
import { ArrowRight, Layers3, Rocket, Wrench } from 'lucide-react'

const options = [
  {
    label: 'Strona',
    icon: Layers3,
    title: 'Strona firmowa WordPress',
    description: 'Czytelna oferta, formularz i wygodna edycja. Dopasuję stronę do Twojej firmy.',
    price: 'Wycena indywidualna',
    cta: 'Wyceń stronę',
    service: 'CODEFIX_BUSINESS_SITE',
    placement: 'hero_path_business_site',
  },
  {
    label: 'Aplikacja',
    icon: Rocket,
    title: 'Aplikacja lub integracja',
    description: 'Panel klienta, narzędzie firmowe lub API. Opisz cel, a zaproponuję rozwiązanie.',
    price: 'Wycena indywidualna',
    cta: 'Omów aplikację',
    service: 'development',
    placement: 'hero_path_application',
  },
  {
    label: 'Naprawa',
    icon: Wrench,
    title: 'Naprawa WordPress',
    description: 'Formularz, sklep lub błąd po aktualizacji. Najpierw sprawdzę, co nie działa.',
    price: 'Od 390 zł · zakres i cena przed startem',
    cta: 'Zgłoś naprawę',
    service: 'WORDPRESS_QUICK_FIX',
    placement: 'hero_path_quickfix',
  },
]

export function HeroServicePicker({
  onChoose,
  disabled,
}: {
  onChoose: (service: string, placement: string) => void
  disabled: boolean
}) {
  const [active, setActive] = useState(0)
  const option = options[active]

  return (
    <div className="cf-hero-picker">
      <div className="cf-hero-path-list" role="group" aria-label="Wybierz potrzebę">
        {options.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            className="cf-hero-path"
            aria-pressed={active === index}
            aria-controls="cf-hero-recommendation"
            disabled={disabled}
            onClick={() => setActive(index)}
          >
            <Icon size={19} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div id="cf-hero-recommendation" className="cf-hero-recommendation" role="status">
        <h3>{option.title}</h3>
        <p>{option.description}</p>
        <span>{option.price}</span>
      </div>
      <a
        href="#contact"
        className="cf-button cf-button-primary"
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          event.preventDefault()
          if (!disabled) onChoose(option.service, option.placement)
        }}
      >
        {option.cta}
        <ArrowRight size={17} aria-hidden="true" />
      </a>
    </div>
  )
}
