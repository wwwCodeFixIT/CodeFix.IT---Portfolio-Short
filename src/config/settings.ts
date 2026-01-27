// ============================================
// KONFIGURACJA CODEFIX.IT
// ============================================
// Zmień te wartości na swoje własne dane
// ============================================

export const settings = {
  // ============================================
  // GITHUB - Twoje konto GitHub
  // ============================================
  github: {
    username: 'codefixIT', // Zmień na swoją nazwę użytkownika GitHub
    // Token jest opcjonalny - bez niego masz limit 60 requestów/godzinę
    // Z tokenem masz 5000 requestów/godzinę
    // Utwórz token: https://github.com/settings/tokens (scope: public_repo, read:user)
    token: '', // np. 'ghp_xxxxxxxxxxxxxxxxxxxx'
  },

  // ============================================
  // MONITORING - Endpointy do sprawdzania
  // ============================================
  monitoring: {
    // Lista usług do monitorowania
    services: [
      {
        id: 'website',
        name: 'Strona główna',
        url: 'https://codefix.it', // Zmień na swój URL
        description: 'Główna strona CodeFix.IT',
      },
      {
        id: 'api',
        name: 'API',
        url: 'https://api.codefix.it/health', // Zmień na swój endpoint
        description: 'REST API backend',
      },
      {
        id: 'cdn',
        name: 'CDN / Assets',
        url: 'https://cdn.codefix.it', // Zmień na swój URL
        description: 'Serwer plików statycznych',
      },
      {
        id: 'mail',
        name: 'Serwer Email',
        url: 'https://mail.codefix.it', // Zmień na swój URL
        description: 'Usługa wysyłki emaili',
      },
    ],
    // Interwał sprawdzania (ms)
    checkInterval: 60000, // 1 minuta
  },

  // ============================================
  // ANALYTICS - Konfiguracja analityki
  // ============================================
  analytics: {
    // Google Analytics 4
    googleAnalyticsId: '', // np. 'G-XXXXXXXXXX'
    
    // Własne śledzenie (zapisuje w localStorage dla demo)
    enableLocalTracking: true,
  },

  // ============================================
  // KONTAKT - Dane kontaktowe
  // ============================================
  contact: {
    email: 'kontakt@codefix.it',
    phone: '+48 123 456 789',
    address: 'Warszawa, Polska',
    social: {
      github: 'https://github.com/codefixIT',
      linkedin: 'https://linkedin.com/company/codefixIT',
      twitter: 'https://twitter.com/codefixIT',
      dribbble: 'https://dribbble.com/codefixIT',
    },
  },

  // ============================================
  // FIRMA - Dane firmy
  // ============================================
  company: {
    name: 'CodeFix.IT',
    tagline: 'Transformujemy wizje w cyfrową rzeczywistość',
    foundedYear: 2020,
    // Te statystyki są nadpisywane przez prawdziwe dane z API
    fallbackStats: {
      completedProjects: 150,
      happyClients: 80,
      yearsExperience: 5,
      uptime: 99.9,
    },
  },

  // ============================================
  // UPTIME ROBOT (opcjonalne)
  // ============================================
  // Zarejestruj się na https://uptimerobot.com (darmowe)
  // i wklej swój API key
  uptimeRobot: {
    apiKey: '', // np. 'u1234567-xxxxxxxxxxxxxxxxxxxx'
    // Możesz też użyć read-only API key dla bezpieczeństwa
  },

  // ============================================
  // CACHE - Ustawienia cachowania
  // ============================================
  cache: {
    // Jak długo przechowywać dane w cache (ms)
    githubStatsTTL: 3600000, // 1 godzina
    statusCheckTTL: 60000, // 1 minuta
    analyticsTTL: 300000, // 5 minut
  },
};

export type Settings = typeof settings;
