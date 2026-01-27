import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface ConfigGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigGuide({ isOpen, onClose }: ConfigGuideProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { settings, isConfigured } = useSettings();

  const steps = [
    {
      title: 'Przegląd systemu',
      icon: '📋',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            CodeFix.IT to kompletne środowisko technologiczne, które integruje się z zewnętrznymi serwisami,
            aby dostarczyć prawdziwe dane i statystyki.
          </p>
          
          <h4 className="font-bold text-lg mt-6 mb-3">Dostępne integracje:</h4>
          
          <div className="grid gap-3">
            {[
              { name: 'GitHub API', desc: 'Prawdziwe statystyki repozytoriów i aktywności', status: settings.github.username ? 'connected' : 'disconnected' },
              { name: 'Monitoring', desc: 'Sprawdzanie dostępności usług w czasie rzeczywistym', status: settings.monitoring.enabled ? 'connected' : 'disconnected' },
              { name: 'Analytics', desc: 'Lokalne śledzenie odwiedzin i zachowań', status: 'connected' },
              { name: 'Social Media', desc: 'Linki do profili społecznościowych', status: settings.social.github ? 'connected' : 'disconnected' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium">{integration.name}</div>
                  <div className="text-gray-500 text-sm">{integration.desc}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  integration.status === 'connected' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {integration.status === 'connected' ? '✓ Połączono' : '○ Nie skonfigurowano'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Konfiguracja GitHub',
      icon: '🐙',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Połącz swoje konto GitHub, aby wyświetlać prawdziwe statystyki repozytoriów, 
            języki programowania i wykres aktywności.
          </p>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-bold mb-3">Kroki konfiguracji:</h4>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <span>Otwórz ustawienia: naciśnij <kbd className="px-2 py-0.5 bg-black/30 rounded">⌘ + ,</kbd> lub kliknij ikonę ⚙️</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <span>W zakładce "GitHub" wpisz swoją nazwę użytkownika</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <span>Opcjonalnie: dodaj Personal Access Token dla większych limitów API</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
                <span>Kliknij "Zapisz zmiany"</span>
              </li>
            </ol>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-medium text-blue-400 mb-2">🔑 Jak uzyskać GitHub Token?</h4>
            <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
              <li>Przejdź do <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">GitHub Settings → Developer Settings → Tokens</a></li>
              <li>Kliknij "Generate new token (classic)"</li>
              <li>Wybierz uprawnienia: <code className="bg-black/30 px-1 rounded">public_repo</code>, <code className="bg-black/30 px-1 rounded">read:user</code></li>
              <li>Skopiuj wygenerowany token</li>
            </ol>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h4 className="font-medium text-green-400 mb-2">✅ Korzyści z tokena:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Zwiększony limit API: 5000 req/h zamiast 60</li>
              <li>• Dostęp do prywatnych repozytoriów</li>
              <li>• Dokładniejsze statystyki</li>
            </ul>
          </div>

          <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium">Aktualny status:</div>
              <div className={`text-sm ${isConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
                {isConfigured 
                  ? `✓ Połączono jako @${settings.github.username}` 
                  : '○ Nie skonfigurowano'
                }
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Monitoring usług',
      icon: '📡',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            System monitoringu sprawdza dostępność Twoich usług w czasie rzeczywistym 
            i wyświetla historię uptime.
          </p>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-bold mb-3">Jak to działa:</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">●</span>
                <span>System wykonuje zapytania HTTP do skonfigurowanych endpointów</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">●</span>
                <span>Mierzy czas odpowiedzi (response time)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">●</span>
                <span>Zapisuje historię statusów (90 dni)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">●</span>
                <span>Oblicza uptime % dla każdej usługi</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <h4 className="font-medium text-yellow-400 mb-2">⚠️ Ograniczenia:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• CORS może blokować niektóre domeny</li>
              <li>• Monitoring działa tylko gdy strona jest otwarta</li>
              <li>• Historia jest zapisywana lokalnie w przeglądarce</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-bold mb-3">Dodawanie własnych usług:</h4>
            <p className="text-sm text-gray-400 mb-2">
              Edytuj plik <code className="bg-black/30 px-1 rounded">src/context/SettingsContext.tsx</code>:
            </p>
            <pre className="bg-black/50 rounded-lg p-3 text-xs overflow-x-auto">
{`monitoring: {
  enabled: true,
  services: [
    {
      id: 'my-api',
      name: 'Moje API',
      url: 'https://api.example.com/health',
      description: 'Backend API'
    },
    // Dodaj więcej...
  ]
}`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      title: 'Analytics i statystyki',
      icon: '📈',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            System analytics śledzi odwiedziny i interakcje użytkowników. 
            Wszystkie dane są przechowywane lokalnie w przeglądarce.
          </p>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h4 className="font-medium text-green-400 mb-2">✅ Zbierane dane:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
              <div>• Page views</div>
              <div>• Czas na stronie</div>
              <div>• Typ urządzenia</div>
              <div>• Źródło ruchu</div>
              <div>• Interakcje</div>
              <div>• Najpopularniejsze sekcje</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-bold mb-3">Prywatność:</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Dane przechowywane tylko lokalnie</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Brak śledzenia między stronami</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Brak cookies trzecich stron</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Anonimowe ID sesji</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-medium text-blue-400 mb-2">🔗 Integracja z Google Analytics:</h4>
            <p className="text-sm text-gray-400">
              Możesz opcjonalnie dodać Google Analytics 4 Measurement ID w ustawieniach, 
              aby łączyć lokalne dane z GA4.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Skróty klawiszowe',
      icon: '⌨️',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Używaj skrótów klawiszowych dla szybszej nawigacji i dostępu do funkcji.
          </p>

          <div className="space-y-2">
            {[
              { keys: ['⌘', 'K'], desc: 'Otwórz Command Palette' },
              { keys: ['⌘', ','], desc: 'Otwórz Ustawienia' },
              { keys: ['⌘', '⇧', 'S'], desc: 'Otwórz Setup Wizard' },
              { keys: ['?'], desc: 'Pokaż skróty klawiszowe' },
              { keys: ['G', 'H'], desc: 'Idź do Hero' },
              { keys: ['G', 'S'], desc: 'Idź do Usług' },
              { keys: ['G', 'P'], desc: 'Idź do Portfolio' },
              { keys: ['G', 'C'], desc: 'Idź do Kontaktu' },
              { keys: ['Esc'], desc: 'Zamknij modal/overlay' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex gap-1">
                  {shortcut.keys.map((key, j) => (
                    <kbd key={j} className="px-2 py-1 bg-black/50 rounded text-sm min-w-[28px] text-center">
                      {key}
                    </kbd>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">{shortcut.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold">📚 Przewodnik konfiguracji</h2>
                <p className="text-gray-500 text-sm">Jak połączyć i skonfigurować wszystkie integracje</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/10 p-4 bg-white/[0.02]">
                <nav className="space-y-1">
                  {steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeStep === index 
                          ? 'bg-red-500/20 text-white' 
                          : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span className="text-sm">{step.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <span>{steps[activeStep].icon}</span>
                      {steps[activeStep].title}
                    </h3>
                    {steps[activeStep].content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                ← Poprzedni
              </button>
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === activeStep ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Następny →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfigGuide;
