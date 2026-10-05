export interface Project {
  id: number;
  title: string;
  shortDescription: string;
  goal: string;
  contribution: string;
  result: string;
  technologies: string[];
  demoUrl: string;
  scope: string[];
  client?: string;
  year: number;
  collaboration?: string;
  slug: string;
}

export const projects: Project[] = [
  {
    id: 3,
    slug: "kancelaria-adwokacka-witkowska",
    title: "Kancelaria Adwokacka Witkowska",
    shortDescription: "Strona kancelarii z prezentacją specjalizacji i kontaktem. WordPress i front-end we współpracy z SyloSoftware.",
    goal: "Przedstawić specjalizacje kancelarii i ułatwić dostęp do informacji oraz kontaktu.",
    contribution: "Wdrożenie WordPress i front-endu z SyloSoftware: Elementor, ACF PRO, niestandardowe typy treści i formularze.",
    result: "Strona kancelarii z widokami specjalizacji, formularzami i sekcjami edytowanymi w WordPressie.",
    technologies: ["WordPress", "Elementor", "ACF Pro", "PHP", "CSS", "JavaScript"],
    demoUrl: "https://adwokatwitkowska.com/",
    scope: [
      "Projekt we współpracy z SyloSoftware",
      "WordPress + Elementor",
      "Custom Post Types",
      "ACF Pro integration",
      "Responsywny design",
      "Formularze kontaktowe",
      "Optymalizacja prędkości",
      "Widoki dopasowane do treści kancelarii"
    ],
    year: 2024,
    collaboration: "SyloSoftware"
  },
  {
    id: 2,
    slug: "rzeczoznawca-marcin-dudek",
    title: "Rzeczoznawca Marcin Dudek",
    shortDescription: "Strona rzeczoznawcy z ofertą, formularzami kontaktowymi i wersją mobilną. Autorski motyw WordPress przygotowany od podstaw.",
    goal: "Przedstawić usługi rzeczoznawcy i ułatwić kontakt w sprawie wyceny samochodu.",
    contribution: "Projekt i front-end w HTML, CSS oraz JavaScript, następnie konwersja na autorski motyw WordPress z formularzami i analityką.",
    result: "Strona usługowa z opisem oferty, formularzami kontaktowymi i układem dopasowanym do komputera oraz telefonu.",
    technologies: ["WordPress", "HTML", "CSS", "JavaScript", "PHP", "ACF Pro", "Google Analytics"],
    demoUrl: "https://rzeczoznawcamarcindudek.pl/",
    scope: [
      "Strona od podstaw",
      "Konwersja HTML → WordPress",
      "Custom PHP theme",
      "Integracja ACF Pro",
      "Google Analytics",
      "Formularze kontaktowe",
      "Optymalizacja wydajności",
      "SEO on-page"
    ],
    client: "Marcin Dudek - Rzeczoznawca Samochodowy",
    year: 2023
  },
  {
    id: 1,
    slug: "em-air-system",
    title: "eM-aiR System",
    shortDescription: "Przebudowa strony firmy klimatyzacyjnej: oferta, galeria realizacji i kontakt, z edycją treści w WordPressie.",
    goal: "Pokazać ofertę firmy klimatyzacyjnej, wykonane instalacje i dane kontaktowe.",
    contribution: "Przebudowa strony i autorskiego motywu WordPress, pola ACF PRO, responsywny front-end, galeria i formularz kontaktowy.",
    result: "Strona firmowa z ofertą, realizacjami i danymi kontaktowymi, których treść można aktualizować z panelu WordPress.",
    technologies: ["WordPress", "HTML", "CSS", "JavaScript", "PHP", "ACF Pro"],
    demoUrl: "https://em-airsystem.pl/",
    scope: [
      "Przebudowa istniejącej strony",
      "Projekt responsywny",
      "Custom WordPress theme",
      "Integracja ACF Pro",
      "Optymalizacja SEO",
      "Integracja Google Maps",
      "Formularz kontaktowy",
      "Galeria realizacji"
    ],
    year: 2023
  }
];
