type ProjectInsight = {
  title: string
  description: string
  desktop: [number, number]
  mobile: [number, number]
}

// Coordinates refer to the existing public screenshots, not a live embedded site.
// Copy is limited to the contribution recorded in projects.ts.
export const projectInsights: Record<string, ProjectInsight[]> = {
  'kancelaria-adwokacka-witkowska': [
    {
      title: 'Responsywny front-end',
      description:
        'Wspólnie z SyloSoftware wdrożyłem front-end dopasowany do komputera i telefonu, w tym układ nagłówka i nawigacji.',
      desktop: [78, 10],
      mobile: [84, 6],
    },
    {
      title: 'Treści w WordPressie',
      description:
        'Mój zakres we współpracy z SyloSoftware obejmował wdrożenie WordPressa, Elementora, pól ACF PRO i niestandardowych typów treści.',
      desktop: [24, 40],
      mobile: [45, 57],
    },
  ],
  'rzeczoznawca-marcin-dudek': [
    {
      title: 'Autorski motyw',
      description:
        'Przygotowałem projekt i front-end w HTML, CSS i JavaScript, a następnie przeniosłem stronę na autorski motyw WordPress.',
      desktop: [26, 54],
      mobile: [50, 31],
    },
    {
      title: 'Formularze kontaktowe',
      description:
        'Wdrożyłem formularze kontaktowe, przez które odwiedzający może przesłać zapytanie w sprawie wyceny samochodu.',
      desktop: [73, 60],
      mobile: [50, 89],
    },
  ],
  'em-air-system': [
    {
      title: 'Układ na komputer i telefon',
      description:
        'Przebudowałem responsywny front-end i autorski motyw WordPress, dostosowując stronę do komputera oraz telefonu.',
      desktop: [79, 4],
      mobile: [84, 5],
    },
    {
      title: 'Edycja treści przez ACF PRO',
      description:
        'Wdrożyłem pola ACF PRO do edycji treści strony. Informacje o firmie i ofercie można aktualizować z panelu WordPress.',
      desktop: [48, 85],
      mobile: [48, 94],
    },
  ],
}
