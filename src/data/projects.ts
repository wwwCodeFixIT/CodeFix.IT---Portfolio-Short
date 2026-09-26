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
  slug: string;
}

export const projects: Project[] = [
  {
    id: 1,
    slug: "em-air-system",
    title: "eM-aiR System",
    shortDescription: "Redesign strony firmy klimatyzacyjnej: responsywny WordPress, ACF PRO, oferta, realizacje i kontakt.",
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
    year: 2023
  },
  {
    id: 2,
    slug: "rzeczoznawca-marcin-dudek",
    title: "Rzeczoznawca Marcin Dudek",
    shortDescription: "Strona wizytówka od zera dla rzeczoznawcy: WordPress, formularze, analityka i wersja mobilna.",
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
    year: 2023
  },
  {
    id: 3,
    slug: "kancelaria-adwokacka-witkowska",
    title: "Kancelaria Adwokacka Witkowska",
    shortDescription: "Strona kancelarii wykonana we współpracy z SyloSoftware: WordPress, Elementor, ACF PRO i responsywny front-end.",
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
    collaboration: "SyloSoftware"
  }
];

export const projectCategories = [
  { id: "all", name: "Wszystkie", count: projects.length },
  { id: "wordpress", name: "WordPress", count: projects.filter(p => p.category === "wordpress").length },
  { id: "react", name: "React / Next.js", count: projects.filter(p => p.category === "react").length },
  { id: "mobile", name: "Mobile", count: projects.filter(p => p.category === "mobile").length },
];
