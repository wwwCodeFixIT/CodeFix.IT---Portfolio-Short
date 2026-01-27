import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================
interface Technology {
  id: string;
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'mobile' | 'database' | 'devops' | 'design' | 'testing';
  description: string;
  pros: string[];
  cons: string[];
  useCase: string[];
  learningCurve: 'easy' | 'medium' | 'hard';
  popularity: number; // 0-100
  trending: 'up' | 'down' | 'stable';
  weeklyDownloads?: number;
  githubStars?: number;
  website: string;
  experienceLevel: number; // 0-100 - nasz poziom umiejętności
}

interface QuizAnswer {
  questionId: string;
  value: string | string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: { techId: string; level: number }[];
}

// ==================== DATA ====================
const technologies: Technology[] = [
  // Frontend
  {
    id: 'react',
    name: 'React',
    icon: '⚛️',
    category: 'frontend',
    description: 'Biblioteka JavaScript do budowania interfejsów użytkownika',
    pros: ['Ogromny ekosystem', 'Virtual DOM', 'Duża społeczność', 'React Native dla mobile'],
    cons: ['Wymaga dodatkowych bibliotek', 'JSX może być mylący', 'Częste zmiany'],
    useCase: ['SPA', 'Aplikacje webowe', 'Dashboard', 'E-commerce'],
    learningCurve: 'medium',
    popularity: 95,
    trending: 'stable',
    weeklyDownloads: 22000000,
    githubStars: 218000,
    website: 'https://react.dev',
    experienceLevel: 95
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    icon: '▲',
    category: 'frontend',
    description: 'Framework React z SSR, SSG i wieloma optymalizacjami',
    pros: ['SSR/SSG out-of-box', 'Routing automatyczny', 'Optymalizacja obrazów', 'API Routes'],
    cons: ['Vendor lock-in', 'Może być overkill dla małych projektów', 'Hosting ograniczony'],
    useCase: ['Strony firmowe', 'Blogi', 'E-commerce', 'Aplikacje fullstack'],
    learningCurve: 'medium',
    popularity: 88,
    trending: 'up',
    weeklyDownloads: 5500000,
    githubStars: 117000,
    website: 'https://nextjs.org',
    experienceLevel: 90
  },
  {
    id: 'vue',
    name: 'Vue.js',
    icon: '💚',
    category: 'frontend',
    description: 'Progresywny framework JavaScript',
    pros: ['Łatwy do nauki', 'Świetna dokumentacja', 'Elastyczny', 'Mały rozmiar'],
    cons: ['Mniejszy ekosystem niż React', 'Mniej ofert pracy', 'Migracja między wersjami'],
    useCase: ['SPA', 'Prototypy', 'Małe/średnie projekty', 'Interaktywne elementy'],
    learningCurve: 'easy',
    popularity: 75,
    trending: 'stable',
    weeklyDownloads: 4200000,
    githubStars: 45000,
    website: 'https://vuejs.org',
    experienceLevel: 75
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '🔷',
    category: 'frontend',
    description: 'Nadzbiór JavaScript z typowaniem statycznym',
    pros: ['Typowanie statyczne', 'Lepsza autokompletacja', 'Refactoring', 'Mniej bugów'],
    cons: ['Krzywa uczenia', 'Konfiguracja', 'Wolniejszy development na początku'],
    useCase: ['Duże projekty', 'Zespoły', 'Enterprise', 'Biblioteki'],
    learningCurve: 'medium',
    popularity: 92,
    trending: 'up',
    weeklyDownloads: 45000000,
    githubStars: 95000,
    website: 'https://typescriptlang.org',
    experienceLevel: 92
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    icon: '🎨',
    category: 'frontend',
    description: 'Utility-first CSS framework',
    pros: ['Szybki development', 'Spójny design', 'Mały bundle', 'Świetna dokumentacja'],
    cons: ['Długie klasy w HTML', 'Krzywa uczenia', 'Może być nieczytelny'],
    useCase: ['Wszystkie projekty web', 'Prototypy', 'Design systems'],
    learningCurve: 'easy',
    popularity: 85,
    trending: 'up',
    weeklyDownloads: 8000000,
    githubStars: 75000,
    website: 'https://tailwindcss.com',
    experienceLevel: 95
  },
  // Backend (realizowane przez partnera)
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: '💚',
    category: 'backend',
    description: 'Środowisko uruchomieniowe JavaScript po stronie serwera',
    pros: ['JavaScript fullstack', 'Szybki I/O', 'NPM ekosystem', 'Duża społeczność'],
    cons: ['Single-threaded', 'Callback hell', 'Nie najlepszy do CPU-intensive'],
    useCase: ['API REST', 'Real-time apps', 'Microservices', 'CLI tools'],
    learningCurve: 'medium',
    popularity: 90,
    trending: 'stable',
    weeklyDownloads: 0,
    githubStars: 100000,
    website: 'https://nodejs.org',
    experienceLevel: 70 // Podstawowa znajomość, pełny poziom przez partnera
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    category: 'backend',
    description: 'Wszechstronny język programowania',
    pros: ['Czytelna składnia', 'Ogromny ekosystem', 'AI/ML', 'Szybki development'],
    cons: ['Wolniejszy niż kompilowane', 'GIL', 'Wersjonowanie pakietów'],
    useCase: ['AI/ML', 'Data Science', 'Automatyzacja', 'API'],
    learningCurve: 'easy',
    popularity: 95,
    trending: 'up',
    weeklyDownloads: 0,
    githubStars: 58000,
    website: 'https://python.org',
    experienceLevel: 40 // Partner specjalizuje się w tym
  },
  {
    id: 'express',
    name: 'Express.js',
    icon: '🚂',
    category: 'backend',
    description: 'Minimalistyczny framework webowy dla Node.js',
    pros: ['Prosty', 'Elastyczny', 'Ogromny ekosystem middleware', 'Dojrzały'],
    cons: ['Minimalny', 'Wymaga wielu pakietów', 'Brak struktury'],
    useCase: ['API REST', 'Backend aplikacji', 'Microservices'],
    learningCurve: 'easy',
    popularity: 85,
    trending: 'stable',
    weeklyDownloads: 30000000,
    githubStars: 63000,
    website: 'https://expressjs.com',
    experienceLevel: 65 // Podstawy, pełna realizacja przez partnera
  },
  {
    id: 'nestjs',
    name: 'NestJS',
    icon: '🐱',
    category: 'backend',
    description: 'Framework Node.js inspirowany Angularem',
    pros: ['Struktura enterprise', 'TypeScript natywnie', 'DI', 'Modularność'],
    cons: ['Krzywa uczenia', 'Overengineering dla małych projektów', 'Boilerplate'],
    useCase: ['Enterprise API', 'Microservices', 'GraphQL', 'Duże projekty'],
    learningCurve: 'hard',
    popularity: 75,
    trending: 'up',
    weeklyDownloads: 2500000,
    githubStars: 62000,
    website: 'https://nestjs.com',
    experienceLevel: 50 // Partner specjalizuje się w tym
  },
  // Database (realizowane przez partnera)
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    category: 'database',
    description: 'Zaawansowana relacyjna baza danych',
    pros: ['ACID', 'Rozszerzalność', 'JSON support', 'Darmowy'],
    cons: ['Wolniejszy dla prostych operacji', 'Konfiguracja', 'Zasoby'],
    useCase: ['Enterprise', 'Finanse', 'GIS', 'Złożone zapytania'],
    learningCurve: 'medium',
    popularity: 88,
    trending: 'up',
    githubStars: 14000,
    website: 'https://postgresql.org',
    experienceLevel: 55 // Partner zarządza bazami
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    category: 'database',
    description: 'Dokumentowa baza danych NoSQL',
    pros: ['Elastyczny schemat', 'Skalowalność', 'JSON natywnie', 'Szybki development'],
    cons: ['Brak ACID (domyślnie)', 'Duplikacja danych', 'Pamięć'],
    useCase: ['Prototypy', 'Content management', 'IoT', 'Logi'],
    learningCurve: 'easy',
    popularity: 80,
    trending: 'stable',
    githubStars: 25000,
    website: 'https://mongodb.com',
    experienceLevel: 60 // Podstawy, partner pełna konfiguracja
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: '🔴',
    category: 'database',
    description: 'In-memory data store',
    pros: ['Ekstremalnie szybki', 'Różne struktury danych', 'Pub/Sub', 'Cache'],
    cons: ['RAM-limited', 'Persystencja ograniczona', 'Koszty'],
    useCase: ['Cache', 'Sesje', 'Real-time', 'Queue'],
    learningCurve: 'easy',
    popularity: 85,
    trending: 'stable',
    githubStars: 63000,
    website: 'https://redis.io',
    experienceLevel: 45 // Partner specjalizuje się w cache
  },
  // Mobile
  {
    id: 'reactnative',
    name: 'React Native',
    icon: '📱',
    category: 'mobile',
    description: 'Framework do budowania natywnych aplikacji mobilnych',
    pros: ['Kod współdzielony z React', 'Hot reload', 'Natywna wydajność', 'Duża społeczność'],
    cons: ['Natywne moduły potrzebne', 'Debugowanie', 'Aktualizacje'],
    useCase: ['Aplikacje mobilne', 'MVP', 'Cross-platform'],
    learningCurve: 'medium',
    popularity: 82,
    trending: 'stable',
    weeklyDownloads: 2000000,
    githubStars: 115000,
    website: 'https://reactnative.dev',
    experienceLevel: 85
  },
  {
    id: 'flutter',
    name: 'Flutter',
    icon: '🦋',
    category: 'mobile',
    description: 'UI toolkit od Google do cross-platform',
    pros: ['Szybki development', 'Piękne UI', 'Jeden codebase', 'Wydajność'],
    cons: ['Dart mniej popularny', 'Rozmiar apki', 'Mniej bibliotek'],
    useCase: ['Mobile apps', 'Desktop apps', 'Web apps'],
    learningCurve: 'medium',
    popularity: 78,
    trending: 'up',
    githubStars: 160000,
    website: 'https://flutter.dev',
    experienceLevel: 75
  },
  // DevOps
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    category: 'devops',
    description: 'Platforma konteneryzacji aplikacji',
    pros: ['Izolacja', 'Przenośność', 'Skalowalność', 'DevOps standard'],
    cons: ['Krzywa uczenia', 'Zasoby', 'Bezpieczeństwo'],
    useCase: ['Microservices', 'CI/CD', 'Development env', 'Deployment'],
    learningCurve: 'medium',
    popularity: 92,
    trending: 'stable',
    githubStars: 68000,
    website: 'https://docker.com',
    experienceLevel: 60 // Podstawy, partner pełna konfiguracja
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: '☸️',
    category: 'devops',
    description: 'Orkiestracja kontenerów',
    pros: ['Auto-scaling', 'Self-healing', 'Standard branżowy', 'Ekosystem'],
    cons: ['Bardzo złożony', 'Overkill dla małych projektów', 'Koszty'],
    useCase: ['Microservices at scale', 'Enterprise', 'Cloud native'],
    learningCurve: 'hard',
    popularity: 85,
    trending: 'stable',
    githubStars: 105000,
    website: 'https://kubernetes.io',
    experienceLevel: 35 // Partner specjalizuje się w tym
  },
  {
    id: 'aws',
    name: 'AWS',
    icon: '☁️',
    category: 'devops',
    description: 'Amazon Web Services - platforma chmurowa',
    pros: ['Największy wybór usług', 'Skalowalność', 'Globalny zasięg', 'Dojrzałość'],
    cons: ['Złożony pricing', 'Krzywa uczenia', 'Vendor lock-in'],
    useCase: ['Wszystko w chmurze', 'Enterprise', 'Startupy'],
    learningCurve: 'hard',
    popularity: 90,
    trending: 'stable',
    website: 'https://aws.amazon.com',
    experienceLevel: 50 // Partner zarządza infrastrukturą
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    category: 'devops',
    description: 'Platforma do deploymentu frontend/fullstack',
    pros: ['Zero-config', 'Edge network', 'Preview deployments', 'Integracja z Git'],
    cons: ['Koszty przy skali', 'Ograniczenia', 'Lock-in z Next.js'],
    useCase: ['Frontend apps', 'Next.js', 'Jamstack', 'Preview environments'],
    learningCurve: 'easy',
    popularity: 80,
    trending: 'up',
    website: 'https://vercel.com',
    experienceLevel: 95 // Główna platforma deploymentu frontend
  },
  // Testing
  {
    id: 'jest',
    name: 'Jest',
    icon: '🃏',
    category: 'testing',
    description: 'Framework do testowania JavaScript',
    pros: ['Zero-config', 'Snapshots', 'Mocking', 'Coverage'],
    cons: ['Wolny dla dużych projektów', 'Pamięć', 'ESM support'],
    useCase: ['Unit tests', 'Integration tests', 'React testing'],
    learningCurve: 'easy',
    popularity: 88,
    trending: 'stable',
    weeklyDownloads: 22000000,
    githubStars: 43000,
    website: 'https://jestjs.io',
    experienceLevel: 88
  },
  {
    id: 'cypress',
    name: 'Cypress',
    icon: '🌲',
    category: 'testing',
    description: 'E2E testing framework',
    pros: ['Developer experience', 'Time travel', 'Real browser', 'Debugging'],
    cons: ['Tylko Chrome (głównie)', 'Wolny', 'Ograniczenia cross-origin'],
    useCase: ['E2E tests', 'Integration tests', 'Component tests'],
    learningCurve: 'easy',
    popularity: 82,
    trending: 'stable',
    weeklyDownloads: 5000000,
    githubStars: 46000,
    website: 'https://cypress.io',
    experienceLevel: 80
  },
  // Build Tools & Additional
  {
    id: 'graphql',
    name: 'GraphQL',
    icon: '◈',
    category: 'backend',
    description: 'Język zapytań i runtime do API',
    pros: ['Elastyczne zapytania', 'Jeden endpoint', 'Silne typowanie', 'Introspection'],
    cons: ['Złożoność cache', 'Learning curve', 'Over-fetching nadal możliwy'],
    useCase: ['Złożone API', 'Mobile apps', 'Agregacja danych', 'Real-time'],
    learningCurve: 'medium',
    popularity: 78,
    trending: 'stable',
    githubStars: 20000,
    weeklyDownloads: 2500000,
    website: 'https://graphql.org',
    experienceLevel: 82
  },
  {
    id: 'vite',
    name: 'Vite',
    icon: '⚡',
    category: 'frontend',
    description: 'Nowoczesny bundler i dev server',
    pros: ['Błyskawiczny HMR', 'ESM natywnie', 'Prosty config', 'Uniwersalny'],
    cons: ['Młodszy ekosystem', 'Różnice prod/dev', 'Niektóre pluginy'],
    useCase: ['React/Vue/Svelte apps', 'Biblioteki', 'SSR', 'Prototypy'],
    learningCurve: 'easy',
    popularity: 88,
    trending: 'up',
    githubStars: 62000,
    weeklyDownloads: 12000000,
    website: 'https://vitejs.dev',
    experienceLevel: 95
  },
  {
    id: 'storybook',
    name: 'Storybook',
    icon: '📚',
    category: 'testing',
    description: 'Narzędzie do budowania UI w izolacji',
    pros: ['Dokumentacja komponentów', 'Visual testing', 'Addons', 'Współpraca z designerami'],
    cons: ['Konfiguracja', 'Build time', 'Nadmiarowość dla małych projektów'],
    useCase: ['Design systems', 'Component libraries', 'UI documentation', 'Visual regression'],
    learningCurve: 'medium',
    popularity: 75,
    trending: 'stable',
    githubStars: 82000,
    weeklyDownloads: 4000000,
    website: 'https://storybook.js.org',
    experienceLevel: 85
  },
  {
    id: 'playwright',
    name: 'Playwright',
    icon: '🎭',
    category: 'testing',
    description: 'Framework do E2E testów od Microsoft',
    pros: ['Multi-browser', 'Auto-waiting', 'Szybki', 'Trace viewer'],
    cons: ['Nowszy niż Cypress', 'Mniej materiałów', 'Konfiguracja'],
    useCase: ['E2E testing', 'Cross-browser testing', 'Visual testing', 'API testing'],
    learningCurve: 'medium',
    popularity: 80,
    trending: 'up',
    githubStars: 58000,
    weeklyDownloads: 6000000,
    website: 'https://playwright.dev',
    experienceLevel: 78
  },
  // Design
  {
    id: 'figma',
    name: 'Figma',
    icon: '🎨',
    category: 'design',
    description: 'Narzędzie do projektowania UI/UX - używane przez naszego partnera designera',
    pros: ['Collaborative', 'Web-based', 'Komponenty', 'Prototyping'],
    cons: ['Wymaga internetu', 'Koszty dla zespołów', 'Krzywa uczenia'],
    useCase: ['UI design', 'Prototyping', 'Design systems', 'Collaboration'],
    learningCurve: 'medium',
    popularity: 95,
    trending: 'stable',
    website: 'https://figma.com',
    experienceLevel: 45 // Podstawy - pełne projekty przez partnera UI/UX
  },
  {
    id: 'framer',
    name: 'Framer Motion',
    icon: '🎬',
    category: 'design',
    description: 'Biblioteka animacji dla React',
    pros: ['Deklaratywne API', 'Gesture support', 'Layout animations', 'Exit animations'],
    cons: ['Bundle size', 'Może być overkill', 'Performance'],
    useCase: ['Animacje UI', 'Page transitions', 'Gestures', 'Micro-interactions'],
    learningCurve: 'medium',
    popularity: 80,
    trending: 'up',
    weeklyDownloads: 3500000,
    githubStars: 22000,
    website: 'https://framer.com/motion',
    experienceLevel: 92
  }
];

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'CodeFix.IT',
    role: 'Frontend Developer - Główny specjalista',
    avatar: '👨‍💻',
    skills: [
      { techId: 'react', level: 95 },
      { techId: 'nextjs', level: 92 },
      { techId: 'typescript', level: 90 },
      { techId: 'tailwind', level: 95 },
      { techId: 'vite', level: 92 },
      { techId: 'framer', level: 90 },
      { techId: 'vue', level: 75 },
      { techId: 'reactnative', level: 80 },
      { techId: 'jest', level: 85 },
      { techId: 'cypress', level: 80 },
      { techId: 'storybook', level: 82 },
      { techId: 'playwright', level: 78 }
    ]
  },
  {
    id: '2',
    name: 'Partner Backend',
    role: 'Backend Developer - Zaufany partner',
    avatar: '⚙️',
    skills: [
      { techId: 'nodejs', level: 95 },
      { techId: 'nestjs', level: 92 },
      { techId: 'express', level: 90 },
      { techId: 'python', level: 88 },
      { techId: 'postgresql', level: 92 },
      { techId: 'mongodb', level: 90 },
      { techId: 'redis', level: 85 },
      { techId: 'graphql', level: 88 },
      { techId: 'docker', level: 90 },
      { techId: 'aws', level: 85 },
      { techId: 'kubernetes', level: 80 }
    ]
  },
  {
    id: '3',
    name: 'Partner UI/UX',
    role: 'UI/UX Designer - Zaufany partner',
    avatar: '🎨',
    skills: [
      { techId: 'figma', level: 98 },
      { techId: 'framer', level: 85 }
    ]
  }
];

const quizQuestions = [
  {
    id: 'projectType',
    question: 'Jaki typ projektu planujesz?',
    type: 'single',
    options: [
      { value: 'website', label: '🌐 Strona internetowa', description: 'Wizytówka, landing page, blog' },
      { value: 'webapp', label: '💻 Aplikacja webowa', description: 'SPA, dashboard, SaaS' },
      { value: 'ecommerce', label: '🛒 E-commerce', description: 'Sklep internetowy' },
      { value: 'mobile', label: '📱 Aplikacja mobilna', description: 'iOS, Android lub cross-platform' },
      { value: 'api', label: '🔌 API / Backend', description: 'REST API, GraphQL, microservices' }
    ]
  },
  {
    id: 'scale',
    question: 'Jaka jest przewidywana skala projektu?',
    type: 'single',
    options: [
      { value: 'small', label: '🏠 Mały', description: 'Do 100 użytkowników dziennie' },
      { value: 'medium', label: '🏢 Średni', description: '100 - 10,000 użytkowników dziennie' },
      { value: 'large', label: '🏙️ Duży', description: '10,000 - 100,000 użytkowników dziennie' },
      { value: 'enterprise', label: '🌍 Enterprise', description: 'Ponad 100,000 użytkowników dziennie' }
    ]
  },
  {
    id: 'features',
    question: 'Jakie funkcjonalności są potrzebne?',
    type: 'multiple',
    options: [
      { value: 'auth', label: '🔐 Autoryzacja', description: 'Logowanie, rejestracja, role' },
      { value: 'payments', label: '💳 Płatności', description: 'Stripe, PayU, przelewy' },
      { value: 'realtime', label: '⚡ Real-time', description: 'Chat, powiadomienia, live updates' },
      { value: 'cms', label: '📝 CMS', description: 'Panel administracyjny, edycja treści' },
      { value: 'analytics', label: '📊 Analytics', description: 'Statystyki, raporty, dashboardy' },
      { value: 'integrations', label: '🔗 Integracje', description: 'API zewnętrzne, CRM, ERP' },
      { value: 'multilang', label: '🌍 Wielojęzyczność', description: 'i18n, lokalizacja' }
    ]
  },
  {
    id: 'timeline',
    question: 'Jaki jest przewidywany czas realizacji?',
    type: 'single',
    options: [
      { value: 'asap', label: '🚀 ASAP', description: 'Jak najszybciej (MVP)' },
      { value: '1-2months', label: '📅 1-2 miesiące', description: 'Standardowy projekt' },
      { value: '3-6months', label: '📆 3-6 miesięcy', description: 'Złożony projekt' },
      { value: '6months+', label: '🗓️ Ponad 6 miesięcy', description: 'Projekt enterprise' }
    ]
  },
  {
    id: 'priorities',
    question: 'Co jest najważniejsze?',
    type: 'multiple',
    options: [
      { value: 'performance', label: '⚡ Wydajność', description: 'Szybkość, optymalizacja' },
      { value: 'seo', label: '🔍 SEO', description: 'Pozycjonowanie, widoczność' },
      { value: 'ux', label: '🎨 UX/Design', description: 'Doświadczenie użytkownika' },
      { value: 'security', label: '🔒 Bezpieczeństwo', description: 'Ochrona danych, GDPR' },
      { value: 'scalability', label: '📈 Skalowalność', description: 'Możliwość rozwoju' },
      { value: 'cost', label: '💰 Niski koszt', description: 'Optymalizacja budżetu' }
    ]
  },
  {
    id: 'team',
    question: 'Kto będzie utrzymywał projekt?',
    type: 'single',
    options: [
      { value: 'us', label: '👥 Wy (CodeFix.IT)', description: 'Pełne wsparcie i utrzymanie' },
      { value: 'client', label: '🏢 Nasz zespół IT', description: 'Mamy własnych developerów' },
      { value: 'hybrid', label: '🤝 Wspólnie', description: 'Hybrydowe podejście' }
    ]
  }
];

// ==================== COMPONENTS ====================

// Stack Recommender Component
const StackRecommender = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Technology[]>([]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    const existingIndex = answers.findIndex(a => a.questionId === questionId);
    const newAnswers = [...answers];
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId, value };
    } else {
      newAnswers.push({ questionId, value });
    }
    
    setAnswers(newAnswers);
  };

  const toggleMultipleAnswer = (questionId: string, optionValue: string) => {
    const existing = answers.find(a => a.questionId === questionId);
    let currentValues: string[] = existing?.value as string[] || [];
    
    if (currentValues.includes(optionValue)) {
      currentValues = currentValues.filter(v => v !== optionValue);
    } else {
      currentValues = [...currentValues, optionValue];
    }
    
    handleAnswer(questionId, currentValues);
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.value;
  };

  const calculateRecommendations = () => {
    const projectType = answers.find(a => a.questionId === 'projectType')?.value as string;
    const scale = answers.find(a => a.questionId === 'scale')?.value as string;
    const features = answers.find(a => a.questionId === 'features')?.value as string[] || [];
    const priorities = answers.find(a => a.questionId === 'priorities')?.value as string[] || [];
    
    let recommended: Technology[] = [];
    
    // Frontend recommendations
    if (['website', 'webapp', 'ecommerce'].includes(projectType)) {
      if (priorities.includes('seo') || projectType === 'website') {
        recommended.push(technologies.find(t => t.id === 'nextjs')!);
      } else {
        recommended.push(technologies.find(t => t.id === 'react')!);
      }
      recommended.push(technologies.find(t => t.id === 'typescript')!);
      recommended.push(technologies.find(t => t.id === 'tailwind')!);
    }
    
    // Mobile recommendations
    if (projectType === 'mobile') {
      recommended.push(technologies.find(t => t.id === 'reactnative')!);
      recommended.push(technologies.find(t => t.id === 'typescript')!);
    }
    
    // Backend recommendations
    if (['webapp', 'ecommerce', 'api'].includes(projectType)) {
      if (scale === 'enterprise' || scale === 'large') {
        recommended.push(technologies.find(t => t.id === 'nestjs')!);
      } else {
        recommended.push(technologies.find(t => t.id === 'express')!);
      }
      recommended.push(technologies.find(t => t.id === 'nodejs')!);
    }
    
    // Database recommendations
    if (features.includes('analytics') || scale === 'enterprise') {
      recommended.push(technologies.find(t => t.id === 'postgresql')!);
    } else {
      recommended.push(technologies.find(t => t.id === 'mongodb')!);
    }
    
    if (features.includes('realtime')) {
      recommended.push(technologies.find(t => t.id === 'redis')!);
    }
    
    // DevOps recommendations
    if (scale !== 'small') {
      recommended.push(technologies.find(t => t.id === 'docker')!);
      recommended.push(technologies.find(t => t.id === 'vercel')!);
    }
    
    if (scale === 'enterprise' || scale === 'large') {
      recommended.push(technologies.find(t => t.id === 'kubernetes')!);
      recommended.push(technologies.find(t => t.id === 'aws')!);
    }
    
    // Build tools
    recommended.push(technologies.find(t => t.id === 'vite')!);
    
    // Testing
    recommended.push(technologies.find(t => t.id === 'jest')!);
    if (['webapp', 'ecommerce'].includes(projectType)) {
      recommended.push(technologies.find(t => t.id === 'cypress')!);
      recommended.push(technologies.find(t => t.id === 'playwright')!);
    }
    
    // Design
    recommended.push(technologies.find(t => t.id === 'figma')!);
    recommended.push(technologies.find(t => t.id === 'framer')!);
    
    setRecommendations(recommended.filter(Boolean));
    setShowResults(true);
  };

  const question = quizQuestions[currentStep];

  if (showResults) {
    // Group recommendations by category
    const grouped = recommendations.reduce((acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category].push(tech);
      return acc;
    }, {} as Record<string, Technology[]>);

    const categoryLabels: Record<string, string> = {
      frontend: '🎨 Frontend',
      backend: '⚙️ Backend',
      database: '🗄️ Baza danych',
      mobile: '📱 Mobile',
      devops: '🚀 DevOps',
      testing: '🧪 Testing',
      design: '🎯 Design'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4"
          >
            <span className="text-4xl">✓</span>
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Rekomendowany Stack Technologiczny</h3>
          <p className="text-zinc-400">Na podstawie Twoich odpowiedzi, rekomendujemy:</p>
        </div>

        <div className="grid gap-6">
          {Object.entries(grouped).map(([category, techs], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800"
            >
              <h4 className="text-lg font-semibold mb-4 text-zinc-300">
                {categoryLabels[category] || category}
              </h4>
              <div className="flex flex-wrap gap-3">
                {techs.map(tech => (
                  <motion.div
                    key={tech.id}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-zinc-800/80 px-4 py-2 rounded-lg border border-zinc-700 hover:border-red-500/50 transition-colors cursor-pointer group"
                  >
                    <span className="text-xl">{tech.icon}</span>
                    <span className="font-medium">{tech.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tech.trending === 'up' ? 'bg-green-500/20 text-green-400' :
                      tech.trending === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-zinc-600/50 text-zinc-400'
                    }`}>
                      {tech.trending === 'up' ? '↑' : tech.trending === 'down' ? '↓' : '→'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
              setAnswers([]);
            }}
            className="flex-1 px-6 py-3 bg-zinc-800 rounded-xl font-medium hover:bg-zinc-700 transition-colors"
          >
            🔄 Rozpocznij od nowa
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const element = document.getElementById('contact');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-medium hover:from-red-500 hover:to-red-400 transition-colors"
          >
            📧 Skonsultuj z nami
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {quizQuestions.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-colors ${
              idx < currentStep ? 'bg-red-500' :
              idx === currentStep ? 'bg-red-500/50' :
              'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-500 font-bold">
              {currentStep + 1}
            </span>
            <h3 className="text-xl font-bold">{question.question}</h3>
          </div>

          <div className="grid gap-3">
            {question.options.map((option) => {
              const currentAnswer = getCurrentAnswer(question.id);
              const isSelected = question.type === 'multiple'
                ? (currentAnswer as string[] || []).includes(option.value)
                : currentAnswer === option.value;

              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (question.type === 'multiple') {
                      toggleMultipleAnswer(question.id, option.value);
                    } else {
                      handleAnswer(question.id, option.value);
                    }
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-red-500/20 border-red-500'
                      : 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                    isSelected ? 'border-red-500 bg-red-500' : 'border-zinc-600'
                  }`}>
                    {isSelected && <span className="text-white text-sm">✓</span>}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{option.label}</span>
                    <p className="text-sm text-zinc-500">{option.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        {currentStep > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-6 py-3 bg-zinc-800 rounded-xl font-medium hover:bg-zinc-700 transition-colors"
          >
            ← Wstecz
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (currentStep < quizQuestions.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              calculateRecommendations();
            }
          }}
          disabled={!getCurrentAnswer(question.id) || (question.type === 'multiple' && (getCurrentAnswer(question.id) as string[] || []).length === 0)}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-medium hover:from-red-500 hover:to-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep < quizQuestions.length - 1 ? 'Dalej →' : '🚀 Zobacz rekomendacje'}
        </motion.button>
      </div>
    </div>
  );
};

// Technology Comparison Component
const TechComparison = () => {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTechs = technologies.filter(tech =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTechObjects = selectedTechs.map(id => technologies.find(t => t.id === id)!).filter(Boolean);

  const toggleTech = (techId: string) => {
    if (selectedTechs.includes(techId)) {
      setSelectedTechs(selectedTechs.filter(id => id !== techId));
    } else if (selectedTechs.length < 4) {
      setSelectedTechs([...selectedTechs, techId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and selection */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
          <input
            type="text"
            placeholder="Szukaj technologii..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Wybrano:</span>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-medium">
            {selectedTechs.length}/4
          </span>
        </div>
      </div>

      {/* Tech pills */}
      <div className="flex flex-wrap gap-2">
        {filteredTechs.map(tech => (
          <motion.button
            key={tech.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleTech(tech.id)}
            disabled={selectedTechs.length >= 4 && !selectedTechs.includes(tech.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              selectedTechs.includes(tech.id)
                ? 'bg-red-500/20 border-red-500 text-white'
                : 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <span>{tech.icon}</span>
            <span className="font-medium">{tech.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Comparison table */}
      {selectedTechObjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-4 px-4 text-zinc-500 font-medium">Aspekt</th>
                {selectedTechObjects.map(tech => (
                  <th key={tech.id} className="text-center py-4 px-4 min-w-[180px]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">{tech.icon}</span>
                      <span className="font-bold">{tech.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Kategoria */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400">Kategoria</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="text-center py-4 px-4">
                    <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm capitalize">
                      {tech.category}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Popularność */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400">Popularność</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full bg-zinc-800 rounded-full h-2 max-w-[120px]">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${tech.popularity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{tech.popularity}%</span>
                    </div>
                  </td>
                ))}
              </tr>
              {/* Trend */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400">Trend</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="text-center py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      tech.trending === 'up' ? 'bg-green-500/20 text-green-400' :
                      tech.trending === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-zinc-700 text-zinc-300'
                    }`}>
                      {tech.trending === 'up' ? '📈 Rośnie' :
                       tech.trending === 'down' ? '📉 Spada' : '➡️ Stabilny'}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Krzywa uczenia */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400">Krzywa uczenia</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="text-center py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tech.learningCurve === 'easy' ? 'bg-green-500/20 text-green-400' :
                      tech.learningCurve === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tech.learningCurve === 'easy' ? '🟢 Łatwa' :
                       tech.learningCurve === 'medium' ? '🟡 Średnia' : '🔴 Trudna'}
                    </span>
                  </td>
                ))}
              </tr>
              {/* GitHub Stars */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400">GitHub Stars</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="text-center py-4 px-4">
                    {tech.githubStars ? (
                      <span className="font-mono">⭐ {(tech.githubStars / 1000).toFixed(0)}k</span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* Nasz poziom */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400">Nasz poziom</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full bg-zinc-800 rounded-full h-2 max-w-[120px]">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${tech.experienceLevel}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{tech.experienceLevel}%</span>
                    </div>
                  </td>
                ))}
              </tr>
              {/* Zalety */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400 align-top">Zalety</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="py-4 px-4 align-top">
                    <ul className="text-sm space-y-1">
                      {tech.pros.slice(0, 3).map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-zinc-300">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              {/* Wady */}
              <tr className="border-b border-zinc-800/50">
                <td className="py-4 px-4 text-zinc-400 align-top">Wady</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="py-4 px-4 align-top">
                    <ul className="text-sm space-y-1">
                      {tech.cons.slice(0, 3).map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span className="text-zinc-300">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              {/* Use cases */}
              <tr>
                <td className="py-4 px-4 text-zinc-400 align-top">Zastosowania</td>
                {selectedTechObjects.map(tech => (
                  <td key={tech.id} className="py-4 px-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {tech.useCase.map((uc, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">
                          {uc}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>
      )}

      {selectedTechs.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <span className="text-4xl mb-4 block">⚖️</span>
          <p>Wybierz do 4 technologii aby je porównać</p>
        </div>
      )}
    </div>
  );
};

// Skills Matrix Component
const SkillsMatrix = () => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'team' | 'tech'>('team');

  const allTechIds = [...new Set(teamMembers.flatMap(m => m.skills.map(s => s.techId)))];

  // Info banner about partnership
  const PartnershipBanner = () => (
    <div className="mb-6 space-y-4">
      {/* Main info */}
      <div className="p-4 bg-gradient-to-r from-red-600/10 to-red-600/5 border border-red-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">👨‍💻</span>
          <div>
            <h4 className="font-semibold text-red-400 mb-1">Frontend Developer - Moja specjalizacja</h4>
            <p className="text-sm text-zinc-400">
              Specjalizuję się w <span className="text-white font-medium">Frontend Development</span> - React, Next.js, TypeScript, Tailwind CSS. 
              Tworzę nowoczesne, responsywne i wydajne interfejsy użytkownika.
            </p>
          </div>
        </div>
      </div>
      
      {/* Partners */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Backend Partner */}
        <div className="p-4 bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h4 className="font-semibold text-blue-400 mb-1">Partner Backend</h4>
              <p className="text-sm text-zinc-400">
                Przy projektach full-stack współpracuję z <span className="text-blue-400 font-medium">doświadczonym Backend Developerem</span> - 
                Node.js, NestJS, bazy danych, DevOps.
              </p>
            </div>
          </div>
        </div>
        
        {/* UI/UX Partner */}
        <div className="p-4 bg-gradient-to-r from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h4 className="font-semibold text-purple-400 mb-1">Partner UI/UX</h4>
              <p className="text-sm text-zinc-400">
                Przy projektach wymagających grafiki współpracuję z <span className="text-purple-400 font-medium">doświadczonym UI/UX Designerem</span> - 
                Figma, prototypy, design systemy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Partnership Banner */}
      <PartnershipBanner />
      
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex bg-zinc-900 rounded-xl p-1">
          <button
            onClick={() => setViewMode('team')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'team' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            👥 Według osób
          </button>
          <button
            onClick={() => setViewMode('tech')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'tech' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🔧 Według technologii
          </button>
        </div>
      </div>

      {viewMode === 'team' ? (
        /* Team view */
        <div className="grid gap-6">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-zinc-900/50 rounded-2xl p-6 border transition-all cursor-pointer ${
                selectedMember === member.id ? 'border-red-500' : 'border-zinc-800 hover:border-zinc-700'
              }`}
              onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="text-5xl">{member.avatar}</div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold">{member.name}</h4>
                      <p className="text-zinc-400 text-sm">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-500">
                        {Math.round(member.skills.reduce((sum, s) => sum + s.level, 0) / member.skills.length)}%
                      </div>
                      <p className="text-xs text-zinc-500">średni poziom</p>
                    </div>
                  </div>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {member.skills.slice(0, selectedMember === member.id ? undefined : 5).map(skill => {
                      const tech = technologies.find(t => t.id === skill.techId);
                      return tech ? (
                        <div key={skill.techId} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                          <span>{tech.icon}</span>
                          <span className="text-sm font-medium">{tech.name}</span>
                          <div className="w-12 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400">{skill.level}%</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {member.skills.length > 5 && selectedMember !== member.id && (
                    <p className="text-xs text-zinc-500 mt-2">
                      +{member.skills.length - 5} więcej umiejętności
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Tech view */
        <div className="grid gap-4">
          {allTechIds.map((techId, idx) => {
            const tech = technologies.find(t => t.id === techId);
            if (!tech) return null;

            const membersWithSkill = teamMembers
              .filter(m => m.skills.some(s => s.techId === techId))
              .map(m => ({
                ...m,
                level: m.skills.find(s => s.techId === techId)!.level
              }))
              .sort((a, b) => b.level - a.level);

            const avgLevel = Math.round(
              membersWithSkill.reduce((sum, m) => sum + m.level, 0) / membersWithSkill.length
            );

            return (
              <motion.div
                key={techId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Tech info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="text-3xl">{tech.icon}</span>
                    <div>
                      <h4 className="font-bold">{tech.name}</h4>
                      <p className="text-xs text-zinc-500 capitalize">{tech.category}</p>
                    </div>
                  </div>

                  {/* Team avg */}
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        style={{ width: `${avgLevel}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold text-red-400">{avgLevel}%</span>
                  </div>

                  {/* Team members */}
                  <div className="flex -space-x-2">
                    {membersWithSkill.map(member => (
                      <div
                        key={member.id}
                        className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-lg relative group"
                        title={`${member.name}: ${member.level}%`}
                      >
                        {member.avatar}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-700 rounded-full text-[10px] flex items-center justify-center font-bold">
                          {member.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6 border-t border-zinc-800 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>90-100% Expert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>70-89% Zaawansowany</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>50-69% Średni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Partner Backend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Partner UI/UX</span>
        </div>
      </div>
      
      {/* Additional info */}
      <div className="text-center pt-4 text-xs text-zinc-600">
        💡 Technologie backendowe i design są realizowane we współpracy z zaufanymi partnerami
      </div>
    </div>
  );
};

// Tech Trends Component
const TechTrends = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'trending' | 'name'>('popularity');

  const categories = ['all', 'frontend', 'backend', 'database', 'mobile', 'devops', 'testing', 'design'];
  const categoryLabels: Record<string, string> = {
    all: '🌐 Wszystkie',
    frontend: '🎨 Frontend',
    backend: '⚙️ Backend',
    database: '🗄️ Bazy danych',
    mobile: '📱 Mobile',
    devops: '🚀 DevOps',
    testing: '🧪 Testing',
    design: '🎯 Design'
  };

  const filteredTechs = technologies
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      if (sortBy === 'trending') {
        const trendOrder = { up: 0, stable: 1, down: 2 };
        return trendOrder[a.trending] - trendOrder[b.trending];
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="ml-auto px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-red-500"
        >
          <option value="popularity">📊 Popularność</option>
          <option value="trending">📈 Trend</option>
          <option value="name">🔤 Nazwa</option>
        </select>
      </div>

      {/* Tech Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechs.map((tech, idx) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 hover:border-red-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">{tech.icon}</span>
                <div>
                  <h4 className="font-bold">{tech.name}</h4>
                  <p className="text-xs text-zinc-500 capitalize">{tech.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tech.trending === 'up' ? 'bg-green-500/20 text-green-400' :
                tech.trending === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-zinc-700 text-zinc-400'
              }`}>
                {tech.trending === 'up' ? '📈 Trend ↑' :
                 tech.trending === 'down' ? '📉 Trend ↓' : '➡️ Stabilny'}
              </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{tech.description}</p>

            <div className="space-y-3">
              {/* Popularity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Popularność</span>
                  <span className="font-medium">{tech.popularity}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tech.popularity}%` }}
                    transition={{ delay: idx * 0.05 + 0.3, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  />
                </div>
              </div>

              {/* Our experience */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Nasz poziom</span>
                  <span className="font-medium">{tech.experienceLevel}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tech.experienceLevel}%` }}
                    transition={{ delay: idx * 0.05 + 0.4, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-500">
              {tech.githubStars && (
                <span className="flex items-center gap-1">
                  ⭐ {(tech.githubStars / 1000).toFixed(0)}k
                </span>
              )}
              {tech.weeklyDownloads && (
                <span className="flex items-center gap-1">
                  📦 {(tech.weeklyDownloads / 1000000).toFixed(1)}M/tydzień
                </span>
              )}
              <a
                href={tech.website}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
              >
                🔗 Strona
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export const TechCenter = () => {
  const [activeTab, setActiveTab] = useState<'recommender' | 'comparison' | 'skills' | 'trends'>('recommender');

  const tabs = [
    { id: 'recommender', label: '🎯 Stack Recommender', description: 'Quiz dopasowujący technologie' },
    { id: 'comparison', label: '⚖️ Porównywarka', description: 'Porównaj technologie' },
    { id: 'skills', label: '👥 Skill Matrix', description: 'Umiejętności zespołu' },
    { id: 'trends', label: '📈 Tech Trends', description: 'Trendy technologiczne' }
  ];

  return (
    <section id="tech-center" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium mb-4">
            🔬 Centrum Technologiczne
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tech <span className="text-red-500">Center</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Poznaj nasz stack technologiczny, porównaj technologie i sprawdź, 
            które rozwiązania najlepiej pasują do Twojego projektu.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="block">{tab.label}</span>
              <span className="block text-xs opacity-70 mt-0.5">{tab.description}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-zinc-800 p-6 md:p-10"
        >
          {activeTab === 'recommender' && <StackRecommender />}
          {activeTab === 'comparison' && <TechComparison />}
          {activeTab === 'skills' && <SkillsMatrix />}
          {activeTab === 'trends' && <TechTrends />}
        </motion.div>
      </div>
    </section>
  );
};

export default TechCenter;
