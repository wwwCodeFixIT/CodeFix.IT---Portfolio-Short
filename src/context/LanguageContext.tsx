import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pl' | 'en';

interface Translations {
  [key: string]: {
    pl: string;
    en: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.home': { pl: 'Start', en: 'Home' },
  'nav.services': { pl: 'Usługi', en: 'Services' },
  'nav.portfolio': { pl: 'Portfolio', en: 'Portfolio' },
  'nav.about': { pl: 'O mnie', en: 'About' },
  'nav.blog': { pl: 'Blog', en: 'Blog' },
  'nav.contact': { pl: 'Kontakt', en: 'Contact' },
  'nav.tools': { pl: 'Narzędzia', en: 'Tools' },
  'nav.playground': { pl: 'Code Playground', en: 'Code Playground' },
  'nav.estimator': { pl: 'Kalkulator wyceny', en: 'Price Calculator' },
  'nav.status': { pl: 'Status usług', en: 'Service Status' },
  'nav.techCenter': { pl: 'Tech Center', en: 'Tech Center' },
  'nav.github': { pl: 'GitHub Stats', en: 'GitHub Stats' },
  
  // Hero
  'hero.badge': { pl: 'Dostępny do nowych projektów', en: 'Available for new projects' },
  'hero.greeting': { pl: 'Cześć, jestem Patryk', en: "Hi, I'm Patryk" },
  'hero.title': { pl: 'Tworzę nowoczesne', en: 'I create modern' },
  'hero.titleHighlight': { pl: 'interfejsy webowe', en: 'web interfaces' },
  'hero.description': { pl: 'Frontend Developer specjalizujący się w React, Next.js i TypeScript. Przekształcam pomysły w szybkie, responsywne i piękne aplikacje.', en: 'Frontend Developer specializing in React, Next.js and TypeScript. I transform ideas into fast, responsive and beautiful applications.' },
  'hero.cta.portfolio': { pl: 'Zobacz portfolio', en: 'View portfolio' },
  'hero.cta.contact': { pl: 'Skontaktuj się', en: 'Get in touch' },
  'hero.stats.experience': { pl: 'lat doświadczenia', en: 'years of experience' },
  'hero.stats.projects': { pl: 'zrealizowanych projektów', en: 'completed projects' },
  'hero.stats.clients': { pl: 'zadowolonych klientów', en: 'satisfied clients' },
  'hero.stats.specialization': { pl: 'Specjalizacja', en: 'Specialization' },
  
  // Services
  'services.title': { pl: 'Moje usługi', en: 'My Services' },
  'services.subtitle': { pl: 'Kompleksowe rozwiązania webowe', en: 'Comprehensive web solutions' },
  'services.specialization': { pl: 'Specjalizacja', en: 'Specialization' },
  'services.collaboration': { pl: 'Współpraca', en: 'Collaboration' },
  
  // Portfolio
  'portfolio.title': { pl: 'Moje realizacje', en: 'My Work' },
  'portfolio.subtitle': { pl: 'Projekty, które zrealizowałem', en: 'Projects I have completed' },
  'portfolio.viewProject': { pl: 'Zobacz projekt', en: 'View project' },
  'portfolio.livePreview': { pl: 'Live Preview', en: 'Live Preview' },
  'portfolio.details': { pl: 'Szczegóły', en: 'Details' },
  'portfolio.technologies': { pl: 'Technologie', en: 'Technologies' },
  'portfolio.scope': { pl: 'Zakres prac', en: 'Scope of work' },
  
  // Contact
  'contact.title': { pl: 'Kontakt', en: 'Contact' },
  'contact.subtitle': { pl: 'Porozmawiajmy o Twoim projekcie', en: "Let's talk about your project" },
  'contact.form.name': { pl: 'Imię i nazwisko', en: 'Full name' },
  'contact.form.email': { pl: 'Email', en: 'Email' },
  'contact.form.phone': { pl: 'Telefon (opcjonalnie)', en: 'Phone (optional)' },
  'contact.form.subject': { pl: 'Temat', en: 'Subject' },
  'contact.form.message': { pl: 'Wiadomość', en: 'Message' },
  'contact.form.submit': { pl: 'Wyślij wiadomość', en: 'Send message' },
  'contact.form.sending': { pl: 'Wysyłanie...', en: 'Sending...' },
  'contact.form.success': { pl: 'Wiadomość wysłana!', en: 'Message sent!' },
  'contact.form.error': { pl: 'Błąd wysyłania', en: 'Sending error' },
  'contact.info.email': { pl: 'Email', en: 'Email' },
  'contact.info.phone': { pl: 'Telefon', en: 'Phone' },
  'contact.info.location': { pl: 'Lokalizacja', en: 'Location' },
  'contact.info.availability': { pl: 'Dostępność', en: 'Availability' },
  
  // Footer
  'footer.description': { pl: 'Frontend Developer tworzący nowoczesne strony i aplikacje webowe.', en: 'Frontend Developer creating modern websites and web applications.' },
  'footer.navigation': { pl: 'Nawigacja', en: 'Navigation' },
  'footer.services': { pl: 'Usługi', en: 'Services' },
  'footer.legal': { pl: 'Prawne', en: 'Legal' },
  'footer.privacy': { pl: 'Polityka prywatności', en: 'Privacy Policy' },
  'footer.terms': { pl: 'Regulamin', en: 'Terms of Service' },
  'footer.cookies': { pl: 'Cookies', en: 'Cookies' },
  'footer.rights': { pl: 'Wszelkie prawa zastrzeżone.', en: 'All rights reserved.' },
  
  // Common
  'common.loading': { pl: 'Ładowanie...', en: 'Loading...' },
  'common.error': { pl: 'Błąd', en: 'Error' },
  'common.success': { pl: 'Sukces', en: 'Success' },
  'common.close': { pl: 'Zamknij', en: 'Close' },
  'common.open': { pl: 'Otwórz', en: 'Open' },
  'common.save': { pl: 'Zapisz', en: 'Save' },
  'common.cancel': { pl: 'Anuluj', en: 'Cancel' },
  'common.back': { pl: 'Wstecz', en: 'Back' },
  'common.next': { pl: 'Dalej', en: 'Next' },
  'common.learnMore': { pl: 'Dowiedz się więcej', en: 'Learn more' },
  'common.seeAll': { pl: 'Zobacz wszystkie', en: 'See all' },
  'common.from': { pl: 'od', en: 'from' },
  
  // Chat
  'chat.title': { pl: 'CodeFix Assistant', en: 'CodeFix Assistant' },
  'chat.online': { pl: 'Online teraz', en: 'Online now' },
  'chat.placeholder': { pl: 'Napisz wiadomość...', en: 'Type a message...' },
  'chat.typing': { pl: 'Pisze...', en: 'Typing...' },
  
  // Cookies
  'cookies.title': { pl: 'Używamy ciasteczek 🍪', en: 'We use cookies 🍪' },
  'cookies.description': { pl: 'Ta strona używa plików cookies, aby zapewnić najlepsze doświadczenie.', en: 'This website uses cookies to ensure the best experience.' },
  'cookies.accept': { pl: 'Akceptuję wszystkie', en: 'Accept all' },
  'cookies.reject': { pl: 'Tylko niezbędne', en: 'Essential only' },
  'cookies.settings': { pl: 'Ustawienia', en: 'Settings' },
  
  // 404
  '404.title': { pl: 'Strona nie znaleziona', en: 'Page not found' },
  '404.description': { pl: 'Przepraszamy, strona której szukasz nie istnieje.', en: 'Sorry, the page you are looking for does not exist.' },
  '404.home': { pl: 'Wróć na stronę główną', en: 'Go back home' },
  
  // Testimonials
  'testimonials.title': { pl: 'Opinie klientów', en: 'Client Testimonials' },
  'testimonials.subtitle': { pl: 'Co mówią o współpracy ze mną', en: 'What they say about working with me' },
  
  // Case Studies
  'caseStudies.title': { pl: 'Case Studies', en: 'Case Studies' },
  'caseStudies.subtitle': { pl: 'Szczegółowe opisy wybranych projektów', en: 'Detailed descriptions of selected projects' },
  'caseStudies.challenge': { pl: 'Wyzwanie', en: 'Challenge' },
  'caseStudies.solution': { pl: 'Rozwiązanie', en: 'Solution' },
  'caseStudies.results': { pl: 'Rezultaty', en: 'Results' },
  
  // Estimator
  'estimator.title': { pl: 'Kalkulator wyceny', en: 'Price Calculator' },
  'estimator.subtitle': { pl: 'Oszacuj koszt swojego projektu', en: 'Estimate the cost of your project' },
  'estimator.projectType': { pl: 'Typ projektu', en: 'Project type' },
  'estimator.features': { pl: 'Funkcjonalności', en: 'Features' },
  'estimator.timeline': { pl: 'Termin realizacji', en: 'Timeline' },
  'estimator.total': { pl: 'Szacunkowy koszt', en: 'Estimated cost' },
  'estimator.getQuote': { pl: 'Poproś o wycenę', en: 'Request a quote' },
  
  // Theme
  'theme.dark': { pl: 'Ciemny', en: 'Dark' },
  'theme.light': { pl: 'Jasny', en: 'Light' },
  'theme.system': { pl: 'Systemowy', en: 'System' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('codefix-language');
    if (saved === 'pl' || saved === 'en') return saved;
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('pl') ? 'pl' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('codefix-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'pl' ? 'en' : 'pl');
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
