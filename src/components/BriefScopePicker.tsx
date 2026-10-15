const options: Record<string, string[]> = {
  CODEFIX_BUSINESS_SITE: [
    'Prezentacja oferty',
    'Zapytania z formularza',
    'Sklep internetowy',
    'Dodatkowy język',
  ],
  development: ['Panel klienta', 'Automatyzacja pracy', 'Integracja z API', 'Funkcje AI'],
  WORDPRESS_QUICK_FIX: [
    'Formularz lub maile',
    'Błąd po aktualizacji',
    'Płatności WooCommerce',
    'Widok na telefonie',
  ],
  WORDPRESS_CARE: ['Aktualizacje i kopie', 'Kontrola działania', 'Drobne zmiany', 'Rozwój funkcji'],
  AGENCY_WHITE_LABEL: ['WordPress + ACF', 'WooCommerce', 'Front-end', 'Stała współpraca'],
  FREE_MINI_AUDIT: [
    'Szybkość działania',
    'Formularz kontaktowy',
    'Widok na telefonie',
    'SEO techniczne',
  ],
  other: ['Nowe wdrożenie', 'Zmiana istniejącej strony', 'Konsultacja'],
}

export default function BriefScopePicker({
  service,
  selected,
  onToggle,
}: {
  service: string
  selected: string[]
  onToggle: (option: string) => void
}) {
  return (
    <div className="cf-brief-choices" role="group" aria-label="Elementy zakresu">
      {(options[service] ?? options.other).map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={selected.includes(option)}
          onClick={() => onToggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
