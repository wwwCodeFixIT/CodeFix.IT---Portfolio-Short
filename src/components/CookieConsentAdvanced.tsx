import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  preferences: false,
};

export const CookieConsentAdvanced = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('codefix-cookie-consent');
    if (!consent) {
      // Show after 1.5 seconds
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved.preferences || defaultPreferences);
      } catch {
        // Invalid consent, show banner
        setTimeout(() => setIsVisible(true), 1500);
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const consent = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      preferences: prefs,
    };
    localStorage.setItem('codefix-cookie-consent', JSON.stringify(consent));
    setPreferences(prefs);
    setIsVisible(false);
    
    // Initialize services based on consent
    if (prefs.analytics) {
      // Initialize Google Analytics
      console.log('Analytics cookies accepted');
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent(defaultPreferences);
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as const,
      label: 'Niezbędne',
      icon: '🔒',
      description: 'Wymagane do działania strony. Nie można ich wyłączyć.',
      required: true,
    },
    {
      key: 'analytics' as const,
      label: 'Analityczne',
      icon: '📊',
      description: 'Pomagają zrozumieć jak odwiedzający korzystają ze strony.',
      required: false,
    },
    {
      key: 'preferences' as const,
      label: 'Preferencyjne',
      icon: '⚙️',
      description: 'Zapamiętują Twoje ustawienia (np. język, motyw).',
      required: false,
    },
    {
      key: 'marketing' as const,
      label: 'Marketingowe',
      icon: '📢',
      description: 'Używane do personalizacji reklam (aktualnie nie używane).',
      required: false,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Main banner */}
            {!showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🍪</span>
                      <h3 className="text-xl font-bold text-white">Używamy ciasteczek</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Ta strona używa plików cookies, aby zapewnić najlepsze doświadczenie. 
                      Możesz dostosować swoje preferencje lub zaakceptować wszystkie.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:min-w-[200px]">
                    <motion.button
                      onClick={acceptAll}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all"
                    >
                      Akceptuję wszystkie
                    </motion.button>
                    <motion.button
                      onClick={acceptNecessary}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                      Tylko niezbędne
                    </motion.button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-3 text-zinc-400 hover:text-white transition-colors text-sm underline underline-offset-4"
                    >
                      Dostosuj ustawienia
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>⚙️</span> Ustawienia cookies
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {cookieTypes.map((type) => (
                    <div
                      key={type.key}
                      className={`p-4 rounded-xl border transition-colors ${
                        preferences[type.key]
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-zinc-800/50 border-zinc-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <h4 className="font-medium text-white">
                              {type.label}
                              {type.required && (
                                <span className="ml-2 text-xs text-zinc-500">(wymagane)</span>
                              )}
                            </h4>
                            <p className="text-sm text-zinc-400">{type.description}</p>
                          </div>
                        </div>
                        
                        {/* Toggle */}
                        <button
                          onClick={() => togglePreference(type.key)}
                          disabled={type.required}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            preferences[type.key]
                              ? 'bg-red-500'
                              : 'bg-zinc-700'
                          } ${type.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <motion.div
                            animate={{ x: preferences[type.key] ? 28 : 4 }}
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Settings actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={savePreferences}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all"
                  >
                    Zapisz preferencje
                  </motion.button>
                  <motion.button
                    onClick={acceptAll}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Akceptuj wszystkie
                  </motion.button>
                </div>

                {/* Privacy link */}
                <p className="text-center text-xs text-zinc-500 mt-4">
                  Dowiedz się więcej w naszej{' '}
                  <button className="text-red-500 hover:underline">
                    Polityce Prywatności
                  </button>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
