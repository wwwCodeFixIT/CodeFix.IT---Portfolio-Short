import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'welcome' | 'github' | 'contact' | 'social' | 'monitoring' | 'complete';

export function SetupWizard({ isOpen, onClose, onComplete }: SetupWizardProps) {
  const { settings, updateSection } = useSettings();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    // GitHub
    githubUsername: settings.github.username,
    githubToken: settings.github.token,
    // Contact
    companyName: settings.company.name,
    email: settings.contact.email,
    phone: settings.contact.phone,
    address: settings.contact.address,
    // Social
    githubUrl: settings.social.github,
    linkedinUrl: settings.social.linkedin,
    twitterUrl: settings.social.twitter,
    // Monitoring
    enableMonitoring: settings.monitoring.enabled,
  });
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);

  const steps: Step[] = ['welcome', 'github', 'contact', 'social', 'monitoring', 'complete'];
  const currentIndex = steps.indexOf(currentStep);

  useEffect(() => {
    // Reset na welcome gdy otwieramy
    if (isOpen) {
      setCurrentStep('welcome');
    }
  }, [isOpen]);

  const validateGitHub = async () => {
    if (!formData.githubUsername) return false;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const response = await fetch(`https://api.github.com/users/${formData.githubUsername}`, {
        headers: formData.githubToken ? {
          'Authorization': `token ${formData.githubToken}`
        } : undefined
      });
      
      if (response.ok) {
        setValidationResult('success');
        return true;
      } else {
        setValidationResult('error');
        return false;
      }
    } catch {
      setValidationResult('error');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const nextStep = async () => {
    // Walidacja przed przejściem
    if (currentStep === 'github' && formData.githubUsername) {
      const isValid = await validateGitHub();
      if (!isValid) return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    // Zapisz wszystkie ustawienia
    updateSection('github', {
      username: formData.githubUsername,
      token: formData.githubToken,
    });
    updateSection('company', {
      name: formData.companyName,
    });
    updateSection('contact', {
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });
    updateSection('social', {
      github: formData.githubUrl,
      linkedin: formData.linkedinUrl,
      twitter: formData.twitterUrl,
    });
    updateSection('monitoring', {
      enabled: formData.enableMonitoring,
    });

    onComplete();
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold mb-4">
              Witaj w <span className="text-red-500">CodeFix.IT</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Skonfiguruj swoje środowisko w kilku prostych krokach, aby odblokować wszystkie funkcje.
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              {[
                { icon: '📊', label: 'GitHub Stats', desc: 'Prawdziwe statystyki' },
                { icon: '📡', label: 'Monitoring', desc: 'Status usług' },
                { icon: '📈', label: 'Analytics', desc: 'Śledzenie odwiedzin' },
                { icon: '⚙️', label: 'Personalizacja', desc: 'Twoje dane' },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-gray-500 text-sm">{feature.desc}</div>
                </div>
              ))}
            </div>
            
            <p className="text-gray-500 text-sm">
              ⏱️ Konfiguracja zajmie około 2 minuty
            </p>
          </motion.div>
        );

      case 'github':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🐙</div>
              <h2 className="text-2xl font-bold mb-2">Połącz z GitHub</h2>
              <p className="text-gray-400">
                Pobierz prawdziwe statystyki ze swojego konta GitHub
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nazwa użytkownika GitHub *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, githubUsername: e.target.value }));
                    setValidationResult(null);
                  }}
                  placeholder="np. codefixIT"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl focus:outline-none transition-colors ${
                    validationResult === 'success' 
                      ? 'border-green-500' 
                      : validationResult === 'error'
                      ? 'border-red-500'
                      : 'border-white/10 focus:border-red-500'
                  }`}
                />
                {validationResult === 'success' && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                )}
                {validationResult === 'error' && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">✕</span>
                )}
              </div>
              {validationResult === 'error' && (
                <p className="text-red-400 text-sm mt-1">
                  Nie znaleziono użytkownika. Sprawdź pisownię.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Personal Access Token (opcjonalny)
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={formData.githubToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubToken: e.target.value }))}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showToken ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Zwiększa limit API z 60 do 5000 req/h
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <h4 className="font-medium text-blue-400 mb-2">📝 Jak uzyskać token?</h4>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>Przejdź do <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">GitHub Settings → Tokens</a></li>
                <li>Kliknij "Generate new token (classic)"</li>
                <li>Wybierz uprawnienia: <code className="bg-black/30 px-1 rounded">public_repo</code></li>
                <li>Skopiuj token i wklej powyżej</li>
              </ol>
            </div>

            {formData.githubUsername && (
              <button
                onClick={validateGitHub}
                disabled={isValidating}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sprawdzanie...
                  </>
                ) : (
                  <>
                    🔍 Sprawdź połączenie
                  </>
                )}
              </button>
            )}
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-2xl font-bold mb-2">Dane kontaktowe</h2>
              <p className="text-gray-400">
                Informacje wyświetlane na stronie i w formularzach
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nazwa firmy</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="CodeFix.IT"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email kontaktowy</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="kontakt@codefix.it"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+48 123 456 789"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adres / Lokalizacja</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Warszawa, Polska"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </motion.div>
        );

      case 'social':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🌐</div>
              <h2 className="text-2xl font-bold mb-2">Social Media</h2>
              <p className="text-gray-400">
                Linki do profili społecznościowych (opcjonalne)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="mr-2">🐙</span>GitHub URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="mr-2">💼</span>LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="mr-2">🐦</span>Twitter / X URL
              </label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </motion.div>
        );

      case 'monitoring':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">📡</div>
              <h2 className="text-2xl font-bold mb-2">Monitoring usług</h2>
              <p className="text-gray-400">
                Sprawdzaj dostępność stron i API w czasie rzeczywistym
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium">Włącz monitoring</div>
                  <div className="text-gray-500 text-sm">
                    Automatyczne sprawdzanie dostępności usług
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.enableMonitoring}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableMonitoring: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-14 h-8 rounded-full transition-colors ${
                    formData.enableMonitoring ? 'bg-red-500' : 'bg-white/20'
                  }`}>
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                      formData.enableMonitoring ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                </div>
              </label>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h4 className="font-medium text-green-400 mb-2">✅ Wbudowane funkcje</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Sprawdzanie dostępności co 60 sekund</li>
                <li>• Historia uptime z ostatnich 90 dni</li>
                <li>• Powiadomienia email o awariach</li>
                <li>• Mierzenie czasu odpowiedzi</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <h4 className="font-medium text-yellow-400 mb-2">💡 Pro tip</h4>
              <p className="text-sm text-gray-400">
                Aby dodać własne usługi do monitoringu, edytuj plik{' '}
                <code className="bg-black/30 px-1 rounded">src/context/SettingsContext.tsx</code>{' '}
                lub użyj panelu ustawień po zakończeniu konfiguracji.
              </p>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-7xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">
              Konfiguracja <span className="text-green-500">zakończona!</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Twoje środowisko jest gotowe. Wszystkie statystyki będą teraz aktualizowane automatycznie.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm text-green-400">GitHub połączony</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm text-green-400">Dane kontaktowe</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm text-green-400">Social media</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm text-green-400">Monitoring aktywny</div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Ustawienia możesz zmienić w każdej chwili naciskając <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘ + ,</kbd>
            </p>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-neutral-900 rounded-2xl max-w-xl w-full overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="h-1 bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-400"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {steps.map((step, idx) => (
                    <motion.div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx < currentIndex ? 'bg-green-500' :
                        idx === currentIndex ? 'bg-red-500' : 'bg-white/20'
                      }`}
                      animate={{ scale: idx === currentIndex ? 1.2 : 1 }}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">
                  Krok {currentIndex + 1} z {steps.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
              <div>
                {currentIndex > 0 && currentStep !== 'complete' && (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    ← Wstecz
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {currentStep === 'welcome' && (
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition-colors font-medium"
                  >
                    Rozpocznij konfigurację →
                  </button>
                )}
                
                {currentStep !== 'welcome' && currentStep !== 'complete' && (
                  <>
                    <button
                      onClick={nextStep}
                      disabled={currentStep === 'github' && !formData.githubUsername}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                      {currentStep === 'monitoring' ? 'Zakończ' : 'Dalej →'}
                    </button>
                  </>
                )}

                {currentStep === 'complete' && (
                  <button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-xl transition-colors font-medium"
                  >
                    🚀 Uruchom środowisko
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SetupWizard;
