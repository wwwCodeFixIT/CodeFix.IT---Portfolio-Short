import { Globe, Smartphone, Palette, RefreshCw, Headphones, Layout, Layers, Zap } from "lucide-react";

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: typeof Globe;
  features: string[];
  badge?: string;
  badgeType?: 'backend' | 'design';
  isPrimary?: boolean;
}

export const services: Service[] = [
  {
    id: 1,
    title: "Strony Internetowe",
    description: "Koduję responsywne, szybkie strony internetowe na podstawie projektów graficznych lub gotowych szablonów. Od landing page po rozbudowane serwisy.",
    icon: Globe,
    features: ["Kodowanie z projektu", "Responsywność", "Optymalizacja SEO", "Animacje i interakcje"],
    badge: "Specjalizacja",
    isPrimary: true
  },
  {
    id: 2,
    title: "Interfejsy Aplikacji",
    description: "Tworzę nowoczesne interfejsy użytkownika dla aplikacji webowych. React, Next.js, TypeScript - to moje codzienne narzędzia.",
    icon: Layout,
    features: ["React / Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    badge: "Specjalizacja",
    isPrimary: true
  },
  {
    id: 3,
    title: "Aplikacje Mobilne",
    description: "Rozwijam aplikacje mobilne w React Native - jeden kod, dwie platformy. Natywne doświadczenie użytkownika.",
    icon: Smartphone,
    features: ["React Native", "Cross-platform", "iOS & Android", "Natywna wydajność"]
  },
  {
    id: 4,
    title: "WordPress & CMS",
    description: "Tworzę custom motywy WordPress oraz integruję headless CMS dla elastycznego zarządzania treścią.",
    icon: Palette,
    features: ["Custom themes", "Elementor / ACF", "Headless CMS", "WooCommerce"]
  },
  {
    id: 5,
    title: "Pełne Aplikacje Webowe",
    description: "We współpracy z zaufanym partnerem backendowym dostarczam kompletne rozwiązania full-stack - od frontu po bazę danych.",
    icon: Layers,
    features: ["Frontend + Backend", "REST / GraphQL API", "Bazy danych", "Autoryzacja"],
    badge: "Współpraca",
    badgeType: "backend"
  },
  {
    id: 6,
    title: "Projektowanie UI/UX",
    description: "We współpracy z doświadczonym grafikiem oferuję profesjonalne projekty interfejsów. Figma, prototypy, design systemy.",
    icon: RefreshCw,
    features: ["Projekty w Figma", "Prototypy", "Design System", "User Research"],
    badge: "Współpraca",
    badgeType: "design"
  },
  {
    id: 7,
    title: "Optymalizacja & Performance",
    description: "Audytuję i optymalizuję istniejące aplikacje. Przyspieszam ładowanie, poprawiam Core Web Vitals i UX.",
    icon: Zap,
    features: ["Audyt wydajności", "Core Web Vitals", "Lazy loading", "Code splitting"]
  },
  {
    id: 8,
    title: "Wsparcie & Rozwój",
    description: "Zapewniam ciągłe wsparcie techniczne, wdrażam nowe funkcje i dbam o aktualność Twojego projektu.",
    icon: Headphones,
    features: ["Utrzymanie kodu", "Nowe funkcje", "Aktualizacje", "Konsultacje"]
  }
];
