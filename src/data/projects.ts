export interface Project {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  technologies: string[];
  category: string;
  featured: boolean;
  demoUrl: string;
  repoUrl?: string;
  scope: string[];
  client?: string;
  year: number;
  collaboration?: string;
  // Case Study (NOWE - sprzedażowe)
  caseStudy?: {
    problem: string;
    solution: string;
    results: {
      metric: string;
      value: string;
      description?: string;
    }[];
  };
}

export const projects: Project[] = [
  {
    id: 1,
    title: "eM-aiR System",
    shortDescription: "Redesign strony dla firmy klimatyzacyjnej. Poprawa szybkości o 60% i wzrost zapytań ofertowych.",
    fullDescription: `Projekt polegał na całkowitej przebudowie istniejącej strony internetowej dla firmy eM-aiR System, specjalizującej się w montażu i serwisie klimatyzacji oraz wentylacji.

Strona została stworzona od podstaw z wykorzystaniem WordPress jako systemu CMS, co pozwala klientowi na łatwe zarządzanie treścią. Wykorzystałem Advanced Custom Fields Pro do stworzenia elastycznych pól edycji, dzięki czemu właściciel może samodzielnie aktualizować ofertę, realizacje i dane kontaktowe.

Projekt obejmował responsywny design, optymalizację pod kątem SEO oraz integrację z Google Maps dla lokalizacji firmy.`,
    image: "https://images.unsplash.com/photo-1631545806609-35d4ae440431?w=800&h=600&fit=crop",
    technologies: ["WordPress", "HTML", "CSS", "JavaScript", "PHP", "ACF Pro"],
    category: "wordpress",
    featured: true,
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
    client: "eM-aiR System",
    year: 2023,
    caseStudy: {
      problem: "Stara strona ładowała się ponad 8 sekund, nie była responsywna i nie generowała zapytań. Klient tracił klientów na rzecz konkurencji z lepszymi stronami.",
      solution: "Całkowita przebudowa od podstaw: nowy design, optymalizacja obrazów, lazy loading, minifikacja kodu. WordPress z ACF Pro dla łatwej edycji przez klienta.",
      results: [
        { metric: "PageSpeed", value: "92/100", description: "z 34/100" },
        { metric: "Czas ładowania", value: "2.1s", description: "z 8+ sekund" },
        { metric: "Zapytania/mies.", value: "+40%", description: "więcej formularzy" },
        { metric: "Mobile traffic", value: "+55%", description: "dzięki responsywności" }
      ]
    }
  },
  {
    id: 2,
    title: "Rzeczoznawca Marcin Dudek",
    shortDescription: "Strona wizytówka od zera dla rzeczoznawcy. Profesjonalny wizerunek i wzrost zaufania klientów.",
    fullDescription: `Strona internetowa stworzona od podstaw dla rzeczoznawcy samochodowego Marcina Dudka. Projekt obejmował pełen proces - od projektu graficznego, przez kodowanie w HTML/CSS/JS, aż po konwersję na WordPress.

Unikalne podejście polegało na tym, że najpierw stworzyłem statyczną wersję strony w czystym HTML, CSS i JavaScript, a następnie przekonwertowałem ją na w pełni funkcjonalny motyw WordPress z PHP.

Strona zawiera integrację z Google Analytics do śledzenia ruchu oraz zoptymalizowane formularze kontaktowe. Design jest profesjonalny i budzi zaufanie - kluczowe dla branży rzeczoznawczej.`,
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop",
    technologies: ["WordPress", "HTML", "CSS", "JavaScript", "PHP", "ACF Pro", "Google Analytics"],
    category: "wordpress",
    featured: true,
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
    year: 2023,
    caseStudy: {
      problem: "Klient nie miał strony internetowej. Tracił zlecenia, bo klienci nie mogli go znaleźć w Google. Konkurencja z stronami zdobywała więcej zleceń.",
      solution: "Profesjonalna strona wizytówka budująca zaufanie. SEO lokalne, szybki formularz kontaktowy, integracja z mapami Google. Wersja mobilna idealna dla kierowców szukających rzeczoznawcy.",
      results: [
        { metric: "Pozycja Google", value: "Top 5", description: "na lokalne frazy" },
        { metric: "Nowi klienci", value: "+8/mies.", description: "z formularza" },
        { metric: "PageSpeed", value: "94/100", description: "szybka strona" },
        { metric: "Bounce rate", value: "-35%", description: "mniej odrzuceń" }
      ]
    }
  },
  {
    id: 3,
    title: "Kancelaria Adwokacka Witkowska",
    shortDescription: "Elegancka strona dla kancelarii. Projekt we współpracy z agencją SyloSoftware.",
    fullDescription: `Strona internetowa dla kancelarii adwokackiej, stworzona we współpracy z firmą SyloSoftware. Ten projekt pokazuje moje umiejętności pracy zespołowej i realizacji zleceń dla innych agencji.

Wykorzystałem WordPress z Elementorem jako page builderem, co pozwala klientowi na łatwą edycję treści bez znajomości kodowania. Dodatkowo zaimplementowałem Advanced Custom Fields Pro dla niestandardowych sekcji oraz Custom Post Types dla sekcji z obszarami praktyki.

Design jest elegancki i profesjonalny - idealny dla branży prawniczej. Strona buduje zaufanie i ułatwia potencjalnym klientom kontakt z kancelarią.`,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
    technologies: ["WordPress", "Elementor", "ACF Pro", "PHP", "CSS", "JavaScript"],
    category: "wordpress",
    featured: true,
    demoUrl: "https://adwokatwitkowska.com/",
    scope: [
      "Projekt we współpracy z SyloSoftware",
      "WordPress + Elementor",
      "Custom Post Types",
      "ACF Pro integration",
      "Responsywny design",
      "Formularze kontaktowe",
      "Optymalizacja prędkości",
      "Profesjonalny wygląd dla branży prawniczej"
    ],
    client: "Kancelaria Adwokacka Witkowska",
    year: 2024,
    collaboration: "SyloSoftware",
    caseStudy: {
      problem: "Kancelaria potrzebowała profesjonalnej strony budującej zaufanie. Stara strona wyglądała amatorsko i nie oddawała prestiżu kancelarii.",
      solution: "Elegancki, minimalistyczny design w stonowanych kolorach. Elementor dla łatwej edycji. Custom Post Types dla obszarów praktyki. Szybki formularz do umawiania konsultacji.",
      results: [
        { metric: "Wygląd", value: "Premium", description: "profesjonalny design" },
        { metric: "Edycja treści", value: "Samodzielna", description: "dzięki Elementor" },
        { metric: "Czas realizacji", value: "3 tyg.", description: "w terminie" },
        { metric: "Zadowolenie", value: "100%", description: "klient poleca" }
      ]
    }
  }
];

export const projectCategories = [
  { id: "all", name: "Wszystkie", count: projects.length },
  { id: "wordpress", name: "WordPress", count: projects.filter(p => p.category === "wordpress").length },
  { id: "react", name: "React / Next.js", count: projects.filter(p => p.category === "react").length },
  { id: "mobile", name: "Mobile", count: projects.filter(p => p.category === "mobile").length },
];
