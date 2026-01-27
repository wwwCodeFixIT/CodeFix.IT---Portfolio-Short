import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilitySettings {
  fontSize: number;
  contrast: 'normal' | 'high' | 'inverted';
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  highlightLinks: boolean;
  cursorSize: 'normal' | 'large' | 'xlarge';
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  contrast: 'normal',
  reducedMotion: false,
  dyslexiaFont: false,
  highlightLinks: false,
  cursorSize: 'normal',
};

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (s: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${s.fontSize}%`;
    
    // Contrast
    root.classList.remove('high-contrast', 'inverted-contrast');
    if (s.contrast === 'high') root.classList.add('high-contrast');
    if (s.contrast === 'inverted') root.classList.add('inverted-contrast');
    
    // Reduced motion
    if (s.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Dyslexia font
    if (s.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }
    
    // Highlight links
    if (s.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }
    
    // Cursor size
    root.classList.remove('cursor-large', 'cursor-xlarge');
    if (s.cursorSize === 'large') root.classList.add('cursor-large');
    if (s.cursorSize === 'xlarge') root.classList.add('cursor-xlarge');
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-zinc-900 border border-zinc-800 border-l-0 rounded-r-xl p-3 hover:bg-zinc-800 transition-colors group"
        aria-label="Otwórz panel dostępności"
      >
        <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-zinc-900 border-r border-zinc-800 z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">♿</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Dostępność</h2>
                    <p className="text-xs text-zinc-500">Dostosuj stronę do swoich potrzeb</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Settings */}
              <div className="p-4 space-y-6">
                {/* Font Size */}
                <div>
                  <label className="flex items-center justify-between text-white font-medium mb-3">
                    <span className="flex items-center gap-2">
                      <span>🔤</span> Rozmiar tekstu
                    </span>
                    <span className="text-sm text-zinc-400">{settings.fontSize}%</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSetting('fontSize', Math.max(80, settings.fontSize - 10))}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min="80"
                      max="150"
                      step="10"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <button
                      onClick={() => updateSetting('fontSize', Math.min(150, settings.fontSize + 10))}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Contrast */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <span>🎨</span> Kontrast
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'high', 'inverted'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => updateSetting('contrast', option)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.contrast === option
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-full h-8 rounded mb-2 ${
                          option === 'normal' ? 'bg-gradient-to-r from-zinc-800 to-zinc-600' :
                          option === 'high' ? 'bg-gradient-to-r from-black to-white' :
                          'bg-gradient-to-r from-white to-black'
                        }`} />
                        <span className="text-xs text-zinc-300">
                          {option === 'normal' ? 'Normalny' : option === 'high' ? 'Wysoki' : 'Odwrócony'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cursor Size */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <span>🖱️</span> Rozmiar kursora
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'large', 'xlarge'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => updateSetting('cursorSize', option)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                          settings.cursorSize === option
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`rounded-full bg-white ${
                          option === 'normal' ? 'w-3 h-3' :
                          option === 'large' ? 'w-5 h-5' :
                          'w-8 h-8'
                        }`} />
                        <span className="text-xs text-zinc-300 mt-2">
                          {option === 'normal' ? 'Normalny' : option === 'large' ? 'Duży' : 'Bardzo duży'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  {/* Reduced Motion */}
                  <button
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      settings.reducedMotion
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xl">🎬</span>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Ogranicz animacje</h4>
                      <p className="text-xs text-zinc-500">Wyłącza lub zmniejsza animacje</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.reducedMotion ? 'bg-red-500' : 'bg-zinc-700'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                        settings.reducedMotion ? 'translate-x-6' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Dyslexia Font */}
                  <button
                    onClick={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      settings.dyslexiaFont
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xl">📖</span>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Czcionka dla dysleksji</h4>
                      <p className="text-xs text-zinc-500">Łatwiejsza do czytania czcionka</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.dyslexiaFont ? 'bg-red-500' : 'bg-zinc-700'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                        settings.dyslexiaFont ? 'translate-x-6' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Highlight Links */}
                  <button
                    onClick={() => updateSetting('highlightLinks', !settings.highlightLinks)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      settings.highlightLinks
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xl">🔗</span>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">Podświetl linki</h4>
                      <p className="text-xs text-zinc-500">Wyróżnia wszystkie linki na stronie</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      settings.highlightLinks ? 'bg-red-500' : 'bg-zinc-700'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                        settings.highlightLinks ? 'translate-x-6' : ''
                      }`} />
                    </div>
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Przywróć domyślne
                </button>

                {/* Keyboard Shortcuts */}
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <span>⌨️</span> Skróty klawiszowe
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Otwórz Command Palette</span>
                      <kbd className="px-2 py-0.5 bg-zinc-700 rounded text-xs text-zinc-300">⌘K</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Zamknij modal</span>
                      <kbd className="px-2 py-0.5 bg-zinc-700 rounded text-xs text-zinc-300">ESC</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nawigacja</span>
                      <kbd className="px-2 py-0.5 bg-zinc-700 rounded text-xs text-zinc-300">Tab</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
