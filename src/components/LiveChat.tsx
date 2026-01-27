import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPY
// ============================================

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'card' | 'buttons' | 'form';
  buttons?: QuickReply[];
  card?: CardData;
}

interface QuickReply {
  text: string;
  action?: string;
  icon?: string;
}

interface CardData {
  title: string;
  description: string;
  image?: string;
  link?: string;
}

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

// ============================================
// KONFIGURACJA ODPOWIEDZI BOTA
// ============================================

interface BotResponse {
  patterns: string[];
  response: string | ((match: string, context: ConversationContext) => string);
  buttons?: QuickReply[];
  card?: CardData;
}

interface ConversationContext {
  userName?: string;
  lastTopic?: string;
  messageCount: number;
}

// Dynamiczne powitanie na podstawie pory dnia
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Dzień dobry! ☀️';
  if (hour >= 12 && hour < 18) return 'Cześć! 👋';
  if (hour >= 18 && hour < 22) return 'Dobry wieczór! 🌆';
  return 'Cześć nocny marku! 🦉';
}

const botKnowledge: BotResponse[] = [
  // Powitania
  {
    patterns: ['cześć', 'hej', 'hello', 'hi', 'witam', 'siema', 'dzień dobry', 'dobry wieczór', 'hejka'],
    response: (_, ctx) => {
      const greeting = getGreeting();
      if (ctx.userName) {
        return `${greeting} ${ctx.userName}! Miło Cię znowu widzieć! Jak mogę Ci dzisiaj pomóc?`;
      }
      return `${greeting} Jestem asystentem CodeFix.IT. Specjalizujemy się w tworzeniu stron i aplikacji webowych. Jak mogę Ci pomóc?`;
    },
    buttons: [
      { text: 'Wycena projektu', icon: '💰' },
      { text: 'Nasze usługi', icon: '⚡' },
      { text: 'Portfolio', icon: '📁' },
      { text: 'Kontakt', icon: '📧' },
    ],
  },

  // Imię użytkownika
  {
    patterns: ['jestem', 'mam na imię', 'nazywam się', 'moje imię to'],
    response: (match) => {
      const words = match.split(' ');
      const nameIndex = words.findIndex(w => 
        ['jestem', 'imię', 'nazywam'].some(p => w.includes(p))
      );
      const name = words[nameIndex + 1] || words[words.length - 1];
      const cleanName = name.replace(/[.,!?]/g, '');
      return `Miło Cię poznać, **${cleanName}**! 😊 Zapamiętam Twoje imię. Jak mogę Ci pomóc z projektem?`;
    },
    buttons: [
      { text: 'Potrzebuję strony WWW', icon: '🌐' },
      { text: 'Chcę aplikację', icon: '📱' },
      { text: 'Mam pytanie', icon: '❓' },
    ],
  },

  // Cennik i wyceny
  {
    patterns: ['cena', 'koszt', 'ile kosztuje', 'wycena', 'cennik', 'budżet', 'pieniądze', 'zł', 'pln', 'kasa'],
    response: (match) => {
      if (match.includes('strona') || match.includes('landing') || match.includes('www')) {
        return '💰 **Strony internetowe:**\n\n• Landing Page: od **1 200 - 2 500 zł**\n• Strona wizytówka: od **1 500 - 3 000 zł**\n• Strona firmowa: od **3 000 - 6 000 zł**\n• Strona z blogiem/CMS: od **4 000 - 8 000 zł**\n\n📊 Dokładna wycena zależy od funkcjonalności i złożoności projektu. Mogę przygotować dla Ciebie indywidualną ofertę!';
      }
      if (match.includes('sklep') || match.includes('ecommerce') || match.includes('e-commerce')) {
        return '💰 **Sklepy internetowe:**\n\n• Sklep na WooCommerce: od **6 000 - 12 000 zł**\n• Sklep na Shopify: od **5 000 - 10 000 zł**\n• Custom e-commerce: od **12 000 zł**\n\n🛒 Cena zależy od liczby produktów, integracji płatności i funkcji dodatkowych.';
      }
      if (match.includes('aplikacja') || match.includes('app') || match.includes('webapp')) {
        return '💰 **Aplikacje:**\n\n• Aplikacja webowa (SPA): od **8 000 - 20 000 zł**\n• Panel administracyjny: od **6 000 - 12 000 zł**\n• Aplikacja mobilna: od **12 000 - 30 000 zł**\n• System dedykowany: **wycena indywidualna**\n\n🚀 Złożoność aplikacji ma największy wpływ na cenę. Przy backendzie współpracuję z zaufanym partnerem.';
      }
      return '💰 **Orientacyjne ceny:**\n\n🌐 **Strony WWW:**\n• Landing Page: od **1 200 zł**\n• Strona wizytówka: od **1 500 zł**\n• Strona firmowa: od **3 000 zł**\n\n🛒 **E-commerce:**\n• Sklep online: od **6 000 zł**\n\n📱 **Aplikacje:**\n• Web app: od **8 000 zł**\n• Mobile app: od **12 000 zł**\n\n📋 Skorzystaj z kalkulatora wyceny lub opisz swój projekt, a przygotuję **bezpłatną wycenę**!';
    },
    buttons: [
      { text: '🧮 Kalkulator wyceny', action: 'scroll:estimator' },
      { text: '📧 Wyślij zapytanie', action: 'form' },
      { text: '💬 Mam więcej pytań', icon: '❓' },
    ],
  },

  // Czas realizacji
  {
    patterns: ['czas', 'termin', 'jak długo', 'kiedy', 'deadline', 'realizacja', 'ile trwa', 'szybko'],
    response: '⏰ **Orientacyjne czasy realizacji:**\n\n🌐 **Strony WWW:**\n• Landing Page: **5-10 dni roboczych**\n• Strona firmowa: **2-4 tygodnie**\n• Strona z CMS: **3-5 tygodni**\n\n🛒 **E-commerce:**\n• Sklep online: **4-8 tygodni**\n\n📱 **Aplikacje:**\n• Web app: **6-12 tygodni**\n• Mobile app: **8-16 tygodni**\n\n⚡ **Tryb ekspresowy:** Możliwa realizacja w krótszym czasie (+30-50% do ceny)\n\n📅 Czas zależy też od Twojej dostępności do feedbacku!',
    buttons: [
      { text: '🚀 Tryb ekspresowy', icon: '⚡' },
      { text: '📋 Jak wygląda proces?', action: 'scroll:process' },
      { text: '📧 Zapytaj o termin', action: 'form' },
    ],
  },

  // Usługi
  {
    patterns: ['usługi', 'oferujecie', 'robicie', 'specjalizacja', 'co potraficie', 'zakres', 'oferta'],
    response: '⚡ **Moja specjalizacja to Frontend Development:**\n\n🌐 **Strony internetowe**\n• Responsywne, szybkie, zoptymalizowane pod SEO\n• WordPress, React, Next.js\n\n💻 **Interfejsy aplikacji**\n• Panele administracyjne\n• Dashboardy\n• SPA (Single Page Applications)\n\n📝 **WordPress & CMS**\n• Custom themes od podstaw\n• Elementor, ACF Pro\n• WooCommerce\n\n🎨 **UI/UX (z partnerem DesignPartner)**\n• Projektowanie interfejsów\n• Prototypy w Figma\n\n⚙️ **Backend (z partnerem BackPartner)**\n• API, bazy danych\n• Integracje\n\nKtóra usługa Cię interesuje?',
    buttons: [
      { text: 'Strony WWW', icon: '🌐' },
      { text: 'Aplikacje', icon: '📱' },
      { text: 'Wycena projektu', icon: '💰' },
      { text: 'Portfolio', icon: '📁' },
    ],
  },

  // Portfolio
  {
    patterns: ['portfolio', 'realizacje', 'projekty', 'przykłady', 'case study', 'pokazać', 'wasze prace'],
    response: '📁 **Moje realizacje:**\n\nZrealizowałem projekty dla klientów z różnych branż:\n\n✅ **eM-aiR System** - strona dla firmy klimatyzacyjnej\n✅ **Rzeczoznawca Marcin Dudek** - strona wizytówka\n✅ **Kancelaria Adwokacka Witkowska** - współpraca z SyloSoftware\n\n🔧 Specjalizuję się w WordPress oraz React/Next.js\n\n👀 Zobacz moje portfolio i przekonaj się o jakości!',
    buttons: [
      { text: '👁️ Zobacz portfolio', action: 'scroll:portfolio' },
      { text: '📊 GitHub Stats', action: 'scroll:github' },
      { text: '💬 Zapytaj o podobny projekt', action: 'form' },
    ],
    card: {
      title: '🎨 Portfolio CodeFix.IT',
      description: 'Projekty dla firm z różnych branż. Kliknij aby zobaczyć!',
      image: '🖼️',
      link: '#portfolio',
    },
  },

  // Technologie
  {
    patterns: ['technologie', 'stack', 'react', 'vue', 'angular', 'node', 'python', 'framework', 'narzędzia', 'w czym robicie', 'w czym programujesz'],
    response: '🛠️ **Mój stack technologiczny:**\n\n**🎯 Frontend (moja specjalizacja):**\n• React & Next.js\n• TypeScript\n• Tailwind CSS\n• Framer Motion\n\n**⚙️ Backend (z partnerem):**\n• Node.js & Express\n• PostgreSQL & MongoDB\n• REST API & GraphQL\n\n**🎨 Design (z partnerem):**\n• Figma\n• UI/UX Design\n\n**☁️ DevOps:**\n• Vercel, Netlify\n• Docker\n• GitHub Actions\n\nZobacz szczegóły w sekcji Technologie! 👇',
    buttons: [
      { text: '🔧 Zobacz technologie', action: 'scroll:technologies' },
      { text: '🎯 Tech Center', action: 'scroll:tech-center' },
    ],
  },

  // Wsparcie i SLA
  {
    patterns: ['wsparcie', 'support', 'pomoc', 'sla', 'po wdrożeniu', 'utrzymanie', 'serwis', 'opieka'],
    response: '🛡️ **Wsparcie po wdrożeniu:**\n\n✅ **Gwarancja** - 3 miesiące na poprawki\n✅ **Aktualizacje** - bezpieczeństwo i bug fixes\n✅ **Backup** - regularne kopie zapasowe\n✅ **Monitoring** - śledzenie dostępności 24/7\n✅ **Szybka reakcja** - odpowiedź w ciągu 24h\n\n📋 **Pakiety wsparcia:**\n• Basic: poprawki błędów\n• Standard: + małe zmiany\n• Premium: pełna opieka + rozwój\n\nChcesz poznać szczegóły pakietów?',
    buttons: [
      { text: '📊 Status usług', action: 'scroll:status' },
      { text: '💬 Zapytaj o pakiet', action: 'form' },
    ],
  },

  // Proces pracy
  {
    patterns: ['proces', 'jak pracujecie', 'etapy', 'kroki', 'metodologia', 'agile', 'jak to wygląda'],
    response: '🔄 **Jak wygląda współpraca:**\n\n**1️⃣ Konsultacja** (bezpłatna)\n• Poznajemy Twoje cele i wymagania\n• Omawiamy budżet i termin\n\n**2️⃣ Wycena & Brief**\n• Przygotowuję szczegółową wycenę\n• Definiujemy zakres prac\n\n**3️⃣ Projektowanie**\n• Wireframes i mockupy (z partnerem UI/UX)\n• Twoja akceptacja designu\n\n**4️⃣ Development**\n• Kodowanie z regularnymi preview\n• Testy i poprawki\n\n**5️⃣ Wdrożenie**\n• Launch na produkcję\n• Szkolenie z obsługi\n\n**6️⃣ Wsparcie**\n• Gwarancja i opieka\n\n✅ Pracuję zwinnie - widzisz postępy na bieżąco!',
    buttons: [
      { text: '📋 Zobacz szczegóły', action: 'scroll:process' },
      { text: '🚀 Zacznijmy projekt!', action: 'scroll:contact' },
    ],
  },

  // Kontakt
  {
    patterns: ['kontakt', 'email', 'telefon', 'zadzwonić', 'spotkanie', 'konsultacja', 'porozmawiać', 'mail', 'napisać'],
    response: '📞 **Dane kontaktowe:**\n\n📧 Email: **wwwcodefixit@gmail.com**\n📱 Telefon: **+48 883 667 943**\n📍 Lokalizacja: **Warszawa, Polska**\n\n⏰ Godziny pracy: **Pon-Pt, 9:00-17:00**\n📬 Odpowiadam w ciągu **24 godzin**!\n\n💬 Możesz też wypełnić szybki formularz tutaj w chacie lub na stronie.',
    buttons: [
      { text: '📝 Formularz kontaktowy', action: 'scroll:contact' },
      { text: '📧 Wyślij wiadomość tutaj', action: 'form' },
    ],
  },

  // FAQ
  {
    patterns: ['faq', 'pytania', 'wątpliwości', 'informacje', 'najczęściej zadawane'],
    response: '❓ **Najczęściej zadawane pytania:**\n\n• Ile kosztuje strona/aplikacja?\n• Jak długo trwa realizacja?\n• Jakie technologie używacie?\n• Czy oferujecie wsparcie po wdrożeniu?\n• Jak wygląda proces współpracy?\n• Czy można zobaczyć portfolio?\n\nNa wszystkie te pytania znajdziesz odpowiedzi w sekcji FAQ!',
    buttons: [
      { text: '📖 Zobacz FAQ', action: 'scroll:faq' },
      { text: '💬 Zapytaj mnie', icon: '❓' },
    ],
  },

  // Playground
  {
    patterns: ['playground', 'kod', 'edytor', 'testować', 'wypróbować', 'pobawić'],
    response: '🎮 **Code Playground!**\n\nMam interaktywny edytor kodu, w którym możesz:\n\n• ✍️ Pisać HTML, CSS i JavaScript\n• 👁️ Widzieć rezultaty na żywo\n• 💡 Testować swoje pomysły\n• 📚 Uczyć się programowania\n\nWypróbuj go teraz!',
    buttons: [
      { text: '🎮 Otwórz Playground', action: 'scroll:playground' },
    ],
  },

  // Dziękuję
  {
    patterns: ['dziękuję', 'dzięki', 'super', 'świetnie', 'ok', 'jasne', 'rozumiem', 'git', 'spoko', 'okej'],
    response: (_, ctx) => {
      const responses = [
        'Nie ma za co! 😊 Cieszę się, że mogłem pomóc.',
        'Proszę bardzo! 👍 Czy jest jeszcze coś, w czym mogę Ci pomóc?',
        'Super! 🎉 Daj znać jeśli masz więcej pytań.',
        'Świetnie! 🚀 Jestem tu jeśli będziesz potrzebować pomocy.',
      ];
      const randomResponse = responses[ctx.messageCount % responses.length];
      return randomResponse;
    },
    buttons: [
      { text: 'Mam jeszcze pytanie', icon: '❓' },
      { text: 'To wszystko, dzięki!', icon: '👋' },
    ],
  },

  // Pożegnanie
  {
    patterns: ['pa', 'do widzenia', 'nara', 'bye', 'koniec', 'to wszystko', 'do zobaczenia'],
    response: 'Do zobaczenia! 👋 Miło było porozmawiać. Wróć do mnie, gdy będziesz gotowy na swój projekt.\n\n🚀 Powodzenia i do usłyszenia!\n\n— Asystent CodeFix.IT',
  },

  // Człowiek / prawdziwa osoba
  {
    patterns: ['człowiek', 'osoba', 'prawdziwy', 'nie bot', 'nie robot', 'żywy człowiek', 'porozmawiać z kimś'],
    response: '👤 Rozumiem! Jestem botem, ale możesz łatwo skontaktować się z Patrykiem:\n\n📧 **Email:** wwwcodefixit@gmail.com\n📱 **Telefon:** +48 883 667 943\n\nMożesz też wypełnić formularz kontaktowy - odpowiem osobiście w ciągu 24h! 📬',
    buttons: [
      { text: '📝 Formularz kontaktowy', action: 'form' },
      { text: '📧 Napisz email', action: 'scroll:contact' },
    ],
  },

  // WordPress
  {
    patterns: ['wordpress', 'wp', 'cms', 'motyw', 'theme', 'wtyczka', 'plugin', 'woocommerce'],
    response: '📝 **WordPress & WooCommerce:**\n\n✅ Tworzenie stron na WordPressie\n✅ Custom themes od podstaw\n✅ Sklepy WooCommerce\n✅ Optymalizacja wydajności\n✅ Bezpieczeństwo & aktualizacje\n✅ Migracje i redesign\n\n💡 WordPress jest świetny dla stron firmowych, blogów i sklepów!',
    buttons: [
      { text: '💰 Ile kosztuje strona WP?', icon: '💰' },
      { text: '📧 Zapytaj o WordPress', action: 'form' },
    ],
  },

  // SEO
  {
    patterns: ['seo', 'pozycjonowanie', 'google', 'wyszukiwarka', 'ranking', 'widoczność'],
    response: '🎯 **SEO jest wliczone w każdy projekt!**\n\n✅ Semantyczny HTML5\n✅ Optymalizacja Core Web Vitals\n✅ Meta tagi i Open Graph\n✅ Szybkość ładowania\n✅ Responsywność (mobile-first)\n✅ Struktura nagłówków\n✅ Sitemap i robots.txt\n\n📈 Strony, które tworzę, są zoptymalizowane pod kątem wyszukiwarek od samego początku!',
    buttons: [
      { text: '🌐 Chcę stronę z SEO', action: 'form' },
    ],
  },

  // Kalkulator wyceny
  {
    patterns: ['kalkulator', 'wyceń', 'oszacuj', 'policz'],
    response: '🧮 **Kalkulator wyceny projektu**\n\nMam interaktywny kalkulator, który pomoże Ci oszacować koszt projektu!\n\nWybierzesz:\n• Typ projektu\n• Funkcjonalności\n• Priorytet czasowy\n\nI otrzymasz orientacyjną wycenę od razu! 📊',
    buttons: [
      { text: '🧮 Otwórz kalkulator', action: 'scroll:estimator' },
    ],
  },

  // Startup
  {
    patterns: ['startup', 'mvp', 'nowy biznes', 'pomysł', 'prototyp'],
    response: '🚀 **Projekty dla startupów & MVP:**\n\n Specjalizuję się w szybkim tworzeniu MVP (Minimum Viable Product):\n\n✅ Szybka realizacja (4-8 tygodni)\n✅ Iteracyjne podejście\n✅ Elastyczny zakres\n✅ Skalowalna architektura\n✅ Niższy początkowy budżet\n\n💡 Pomagam startupom zweryfikować pomysł bez przepalania budżetu!',
    buttons: [
      { text: '💰 Ile kosztuje MVP?', icon: '💰' },
      { text: '📧 Opowiedz o pomyśle', action: 'form' },
    ],
  },
];

// Domyślna odpowiedź
const defaultResponse: BotResponse = {
  patterns: [],
  response: 'Hmm, nie jestem pewien jak odpowiedzieć na to pytanie. 🤔\n\nMogę pomóc w kwestiach:\n• 💰 Wyceny projektów\n• ⚡ Naszych usług\n• 🛠️ Technologii\n• 📋 Procesu współpracy\n• 📁 Portfolio\n\nMożesz też napisać do mnie bezpośrednio przez formularz!',
  buttons: [
    { text: '📧 Napisz do nas', action: 'form' },
    { text: '📞 Kontakt', action: 'scroll:contact' },
    { text: '❓ FAQ', action: 'scroll:faq' },
  ],
};

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

function findBestResponse(input: string, _context: ConversationContext): BotResponse {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const knowledge of botKnowledge) {
    for (const pattern of knowledge.patterns) {
      if (normalizedInput.includes(pattern.toLowerCase())) {
        return knowledge;
      }
    }
  }
  
  return defaultResponse;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getStoredHistory(): Message[] {
  try {
    const stored = localStorage.getItem('codefix_chat_history');
    if (stored) {
      const messages = JSON.parse(stored);
      return messages.map((msg: Message & { timestamp: string }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch {
    // Ignore errors
  }
  return [];
}

function saveHistory(messages: Message[]): void {
  try {
    const toSave = messages.slice(-50);
    localStorage.setItem('codefix_chat_history', JSON.stringify(toSave));
  } catch {
    // Ignore errors
  }
}

// ============================================
// QUICK ACTIONS
// ============================================

const quickActions = [
  { text: 'Wycena', icon: '💰', action: 'Ile kosztuje strona?' },
  { text: 'Usługi', icon: '⚡', action: 'Jakie usługi oferujesz?' },
  { text: 'Portfolio', icon: '📁', action: 'scroll:portfolio' },
  { text: 'Kontakt', icon: '📧', action: 'scroll:contact' },
  { text: 'Kalkulator', icon: '🧮', action: 'scroll:estimator' },
  { text: 'Technologie', icon: '🛠️', action: 'scroll:technologies' },
];

// ============================================
// KOMPONENT GŁÓWNY
// ============================================

export default function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);
  const [context, setContext] = useState<ConversationContext>({ messageCount: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicjalizacja
  useEffect(() => {
    const history = getStoredHistory();
    
    if (history.length > 0) {
      setMessages(history);
    } else {
      const welcomeMessage: Message = {
        id: generateMessageId(),
        text: `${getGreeting()} Jestem asystentem CodeFix.IT. Jak mogę Ci dzisiaj pomóc?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'buttons',
        buttons: [
          { text: 'Wycena projektu', icon: '💰' },
          { text: 'Nasze usługi', icon: '⚡' },
          { text: 'Portfolio', icon: '📁' },
          { text: 'Kontakt', icon: '📧' },
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Scroll do najnowszej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Zapisz historię
  useEffect(() => {
    if (messages.length > 0) {
      saveHistory(messages);
    }
  }, [messages]);

  // Reset unread count
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Obsługa akcji
  const handleAction = useCallback((action?: string) => {
    if (!action) return;

    if (action.startsWith('scroll:')) {
      const sectionId = action.replace('scroll:', '');
      const element = document.getElementById(sectionId);
      if (element) {
        setIsOpen(false);
        setIsMinimized(false);
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
      return;
    }

    if (action === 'form') {
      setShowContactForm(true);
      return;
    }
    
    // Jeśli action jest tekstem, wyślij jako wiadomość
    sendMessage(action);
  }, []);

  // Wyślij wiadomość
  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setContext(prev => ({ ...prev, messageCount: prev.messageCount + 1 }));

    // Sprawdź czy użytkownik podał imię
    const nameMatch = text.toLowerCase().match(/jestem\s+(\w+)|mam na imię\s+(\w+)|nazywam się\s+(\w+)/);
    if (nameMatch) {
      const name = nameMatch[1] || nameMatch[2] || nameMatch[3];
      setContext(prev => ({ ...prev, userName: name }));
    }

    // Symuluj pisanie
    const typingDelay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const botResponse = findBestResponse(text, context);
      const responseText = typeof botResponse.response === 'function'
        ? botResponse.response(text.toLowerCase(), context)
        : botResponse.response;

      const botMessage: Message = {
        id: generateMessageId(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        type: botResponse.buttons ? 'buttons' : botResponse.card ? 'card' : 'text',
        buttons: botResponse.buttons,
        card: botResponse.card,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    }, typingDelay);
  }, [context, isOpen, isMinimized]);

  // Obsługa wysyłania
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Quick reply
  const handleQuickReply = (reply: QuickReply) => {
    if (reply.action) {
      handleAction(reply.action);
    } else {
      sendMessage(reply.text);
    }
  };

  // Wyślij formularz
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userMessage: Message = {
      id: generateMessageId(),
      text: `📧 Wiadomość od: ${contactForm.name}\n📬 Email: ${contactForm.email}\n\n${contactForm.message}`,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setFormSent(true);
    
    setTimeout(() => {
      const confirmMessage: Message = {
        id: generateMessageId(),
        text: `✅ Dziękuję, ${contactForm.name}! Twoja wiadomość została wysłana.\n\n📬 Odpowiem na adres **${contactForm.email}** w ciągu 24 godzin.\n\nCzy mogę Ci jeszcze jakoś pomóc?`,
        sender: 'bot',
        timestamp: new Date(),
        buttons: [
          { text: 'Mam jeszcze pytanie', icon: '❓' },
          { text: 'To wszystko, dzięki!', icon: '👋' },
        ],
      };
      setMessages(prev => [...prev, confirmMessage]);
      setShowContactForm(false);
      setContactForm({ name: '', email: '', message: '' });
      setFormSent(false);
    }, 1000);
  };

  // Emoji picker
  const emojis = ['👋', '😊', '👍', '🚀', '💡', '❓', '📧', '💰', '⏰', '🎯', '✅', '🔥'];

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Wyczyść historię
  const clearHistory = () => {
    localStorage.removeItem('codefix_chat_history');
    const welcomeMessage: Message = {
      id: generateMessageId(),
      text: '🧹 Historia wyczyszczona! Jak mogę Ci pomóc?',
      sender: 'bot',
      timestamp: new Date(),
      buttons: [
        { text: 'Wycena projektu', icon: '💰' },
        { text: 'Nasze usługi', icon: '⚡' },
      ],
    };
    setMessages([welcomeMessage]);
  };

  // Pobierz ostatnią wiadomość bota
  const lastBotMessage = messages.filter(m => m.sender === 'bot').slice(-1)[0];

  return (
    <>
      {/* ============================================ */}
      {/* PRZYCISK OTWIERANIA CZATU */}
      {/* ============================================ */}
      <AnimatePresence>
        {!isOpen && !isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              {/* Pulse rings */}
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-[-4px] bg-red-500/20 rounded-full animate-pulse" />
              
              {/* Button */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-500/40">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-zinc-800 text-white text-sm px-4 py-2 rounded-xl shadow-xl whitespace-nowrap border border-zinc-700">
                💬 Porozmawiaj z nami!
                <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700" />
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* TRYB ZMINIMALIZOWANY */}
      {/* ============================================ */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
              style={{ width: '360px' }}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.25)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Gradient top line */}
              <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />
              
              {/* Header */}
              <div 
                className="p-4 cursor-pointer group"
                onClick={() => setIsMinimized(false)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20"
                        animate={{ 
                          boxShadow: [
                            "0 10px 25px -5px rgba(220, 38, 38, 0.2)",
                            "0 10px 25px -5px rgba(220, 38, 38, 0.4)",
                            "0 10px 25px -5px rgba(220, 38, 38, 0.2)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-2xl">💬</span>
                      </motion.div>
                      {/* Online dot */}
                      <motion.div 
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    
                    {/* Info */}
                    <div>
                      <p className="text-white font-semibold text-sm group-hover:text-red-400 transition-colors">
                        CodeFix Assistant
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-green-400 text-xs font-medium">Online teraz</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 bg-zinc-800 hover:bg-red-500/20 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors border border-zinc-700/50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
                
                {/* Last message preview */}
                {lastBotMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-800/50 rounded-2xl p-3 mb-3 border border-zinc-700/30"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">🤖</span>
                      <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed">
                        {lastBotMessage.text.replace(/\*\*/g, '').replace(/###/g, '').substring(0, 100)}
                        {lastBotMessage.text.length > 100 && '...'}
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {/* Quick action buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(false);
                      setTimeout(() => inputRef.current?.focus(), 300);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Kontynuuj rozmowę
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(false);
                      setIsOpen(false);
                    }}
                    className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl flex items-center justify-center border border-zinc-700/50 transition-all"
                    title="Zamknij"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-3"
                >
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    </div>
                    <span>Asystent pisze...</span>
                  </div>
                </motion.div>
              )}
              
              {/* Bottom gradient line */}
              <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            </motion.div>
            
            {/* New message notification */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-2 -left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
                >
                  ✨ Nowa wiadomość!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* PEŁNE OKNO CZATU */}
      {/* ============================================ */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: 'min(650px, calc(100vh - 100px))' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-red-600 to-red-500 flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                  🤖
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-red-600 animate-pulse" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white">CodeFix.IT Support</h3>
                <div className="flex items-center gap-2 text-red-100 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Online - odpowiadamy natychmiast</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear history */}
                <button
                  onClick={clearHistory}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
                  title="Wyczyść historię"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
                  title="Minimalizuj"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
                  title="Zamknij"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex-shrink-0 p-2 bg-zinc-800/50 border-b border-zinc-700/50 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action.action)}
                  className="flex-shrink-0 px-3 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-zinc-900 to-zinc-950">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-md border border-zinc-700/50'
                    }`}
                  >
                    {/* Message text */}
                    <div className="px-4 py-3">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.text.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                        )}
                      </p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-red-200' : 'text-zinc-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Card */}
                    {message.card && (
                      <div className="mx-2 mb-2 p-3 bg-zinc-700/50 rounded-xl cursor-pointer hover:bg-zinc-700 transition-colors"
                        onClick={() => handleAction(`scroll:portfolio`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{message.card.image}</span>
                          <div>
                            <h4 className="font-semibold text-sm">{message.card.title}</h4>
                            <p className="text-zinc-400 text-xs">{message.card.description}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick reply buttons */}
                    {message.buttons && message.buttons.length > 0 && (
                      <div className="px-2 pb-2 flex flex-wrap gap-1.5">
                        {message.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickReply(btn)}
                            className="px-3 py-1.5 bg-zinc-700 hover:bg-red-500/20 hover:text-red-400 text-zinc-200 text-xs rounded-full transition-all flex items-center gap-1.5 hover:scale-105 border border-zinc-600/50 hover:border-red-500/50"
                          >
                            {btn.icon && <span>{btn.icon}</span>}
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-md border border-zinc-700/50">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-zinc-500 text-xs ml-2">Piszę...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Contact Form Overlay */}
            <AnimatePresence>
              {showContactForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm p-4 flex flex-col z-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">📧 Wyślij wiadomość</h3>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Imię *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
                        placeholder="Twoje imię"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-red-500 transition-colors"
                        placeholder="twoj@email.pl"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Wiadomość *</label>
                      <textarea
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full h-full min-h-[120px] px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-red-500 transition-colors resize-none"
                        placeholder="Opisz swój projekt lub zadaj pytanie..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formSent}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {formSent ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Wysyłanie...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Wyślij wiadomość
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="flex-shrink-0 p-4 border-t border-zinc-800 bg-zinc-900">
              {/* Emoji picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-2 p-2 bg-zinc-800 rounded-xl flex flex-wrap gap-1"
                  >
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="w-8 h-8 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-lg transition-colors hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex gap-2">
                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    showEmojiPicker 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  😊
                </button>

                {/* Input field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-white text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-500"
                />

                {/* Contact form button */}
                <button
                  type="button"
                  onClick={() => setShowContactForm(true)}
                  className="flex-shrink-0 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-colors"
                  title="Formularz kontaktowy"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>

              {/* Powered by */}
              <div className="mt-3 text-center">
                <p className="text-xs text-zinc-600">
                  Powered by <span className="text-red-500 font-semibold">CodeFix.IT</span> 🚀
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
