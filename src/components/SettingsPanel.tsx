import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings, SettingsHistoryEntry } from '../context/SettingsContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { 
    settings, 
    metadata,
    history,
    updateSection, 
    resetSettings, 
    lastSaved,
    restoreVersion,
    exportSettings,
    importSettings,
    clearHistory,
    getSettingsDiff,
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState<'github' | 'contact' | 'social' | 'monitoring' | 'history' | 'backup'>('github');
  const [formData, setFormData] = useState({
    // GitHub
    githubUsername: settings.github.username,
    githubToken: settings.github.token,
    // Contact
    email: settings.contact.email,
    phone: settings.contact.phone,
    address: settings.contact.address,
    // Company
    companyName: settings.company.name,
    companyDescription: settings.company.description,
    foundedYear: settings.company.foundedYear,
    // Social
    githubUrl: settings.social.github,
    linkedinUrl: settings.social.linkedin,
    twitterUrl: settings.social.twitter,
    facebookUrl: settings.social.facebook,
    instagramUrl: settings.social.instagram,
    // Monitoring
    monitoringEnabled: settings.monitoring.enabled,
  });
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<SettingsHistoryEntry | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form with settings
  useEffect(() => {
    setFormData({
      githubUsername: settings.github.username,
      githubToken: settings.github.token,
      email: settings.contact.email,
      phone: settings.contact.phone,
      address: settings.contact.address,
      companyName: settings.company.name,
      companyDescription: settings.company.description,
      foundedYear: settings.company.foundedYear,
      githubUrl: settings.social.github,
      linkedinUrl: settings.social.linkedin,
      twitterUrl: settings.social.twitter,
      facebookUrl: settings.social.facebook,
      instagramUrl: settings.social.instagram,
      monitoringEnabled: settings.monitoring.enabled,
    });
  }, [settings]);

  const validateGitHub = async () => {
    if (!formData.githubUsername) return;
    
    setIsValidating(true);
    setValidationStatus('idle');
    
    try {
      const headers: HeadersInit = {};
      if (formData.githubToken) {
        headers.Authorization = `token ${formData.githubToken}`;
      }
      
      const response = await fetch(`https://api.github.com/users/${formData.githubUsername}`, { headers });
      
      if (response.ok) {
        setValidationStatus('success');
      } else {
        setValidationStatus('error');
      }
    } catch {
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    // Update all sections with description
    updateSection('github', {
      username: formData.githubUsername,
      token: formData.githubToken,
    }, 'Aktualizacja danych GitHub');
    
    updateSection('contact', {
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    }, 'Aktualizacja danych kontaktowych');
    
    updateSection('company', {
      name: formData.companyName,
      description: formData.companyDescription,
      foundedYear: formData.foundedYear,
    }, 'Aktualizacja danych firmy');
    
    updateSection('social', {
      github: formData.githubUrl,
      linkedin: formData.linkedinUrl,
      twitter: formData.twitterUrl,
      facebook: formData.facebookUrl,
      instagram: formData.instagramUrl,
    }, 'Aktualizacja linków social media');
    
    updateSection('monitoring', {
      enabled: formData.monitoringEnabled,
    }, 'Aktualizacja ustawień monitoringu');

    // Clear GitHub cache to refetch
    localStorage.removeItem('github_stats_cache');

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Czy na pewno chcesz zresetować wszystkie ustawienia do domyślnych? Poprzednia konfiguracja zostanie zapisana w historii.')) {
      resetSettings();
      localStorage.removeItem('github_stats_cache');
      localStorage.removeItem('codefix_setup_completed');
    }
  };

  const handleExport = () => {
    const data = exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codefix-settings-v${metadata.currentVersion}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importSettings(content);
      
      if (success) {
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Nieprawidłowy format pliku. Upewnij się, że importujesz prawidłowy plik konfiguracji.');
        setTimeout(() => setImportError(null), 5000);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestore = (entry: SettingsHistoryEntry) => {
    setSelectedHistoryEntry(entry);
    setShowRestoreConfirm(true);
  };

  const confirmRestore = () => {
    if (selectedHistoryEntry) {
      restoreVersion(selectedHistoryEntry.id);
      setShowRestoreConfirm(false);
      setSelectedHistoryEntry(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'przed chwilą';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return formatDate(dateString);
  };

  const tabs = [
    { id: 'github' as const, label: 'GitHub', icon: '🐙' },
    { id: 'contact' as const, label: 'Kontakt', icon: '📧' },
    { id: 'social' as const, label: 'Social', icon: '🌐' },
    { id: 'monitoring' as const, label: 'Monitoring', icon: '📡' },
    { id: 'history' as const, label: 'Historia', icon: '📜' },
    { id: 'backup' as const, label: 'Backup', icon: '💾' },
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-neutral-900 to-neutral-800">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  ⚙️ Ustawienia
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                    v{metadata.currentVersion}
                  </span>
                </h2>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                  <span>Skonfiguruj integracje i dane firmy</span>
                  {lastSaved && (
                    <span className="flex items-center gap-1 text-green-500/70">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Zapisano {formatRelativeTime(lastSaved.toISOString())}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right text-xs text-gray-500 mr-4">
                  <div>Zmian: {metadata.totalChanges}</div>
                  <div>Utworzono: {formatDate(metadata.createdAt).split(',')[0]}</div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[80px] px-3 py-3 text-sm font-medium transition-colors relative whitespace-nowrap
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                  `}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'history' && history.length > 0 && (
                    <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {history.length}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="settingsActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {/* GitHub Tab */}
              {activeTab === 'github' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nazwa użytkownika GitHub
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <input
                        type="text"
                        value={formData.githubUsername}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, githubUsername: e.target.value }));
                          setValidationStatus('idle');
                        }}
                        placeholder="np. codefixIT"
                        className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl focus:outline-none transition-colors ${
                          validationStatus === 'success' 
                            ? 'border-green-500' 
                            : validationStatus === 'error'
                            ? 'border-red-500'
                            : 'border-white/10 focus:border-red-500'
                        }`}
                      />
                      {validationStatus === 'success' && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                      )}
                      {validationStatus === 'error' && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">✕</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Twoja nazwa użytkownika na GitHub dla statystyk
                    </p>
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showToken ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Zwiększa limit API z 60 do 5000 req/h.{' '}
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:underline"
                      >
                        Utwórz token →
                      </a>
                    </p>
                  </div>

                  <button
                    onClick={validateGitHub}
                    disabled={isValidating || !formData.githubUsername}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Sprawdzanie...
                      </>
                    ) : (
                      <>
                        🔍 Sprawdź połączenie z GitHub
                      </>
                    )}
                  </button>

                  {validationStatus === 'success' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <p className="text-green-400 text-sm">
                        ✅ Połączenie z GitHub działa poprawnie!
                      </p>
                    </div>
                  )}

                  {validationStatus === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm">
                        ❌ Nie znaleziono użytkownika lub nieprawidłowy token
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
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
                    <label className="block text-sm font-medium mb-2">Opis firmy</label>
                    <textarea
                      value={formData.companyDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                      placeholder="Profesjonalne rozwiązania webowe..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Rok założenia</label>
                    <input
                      type="number"
                      value={formData.foundedYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: parseInt(e.target.value) || 2020 }))}
                      min={1990}
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <div className="space-y-4">
                  {[
                    { key: 'githubUrl', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/...' },
                    { key: 'linkedinUrl', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/...' },
                    { key: 'twitterUrl', label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/...' },
                    { key: 'facebookUrl', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/...' },
                    { key: 'instagramUrl', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/...' },
                  ].map((social) => (
                    <div key={social.key}>
                      <label className="block text-sm font-medium mb-2">
                        <span className="mr-2">{social.icon}</span>
                        {social.label}
                      </label>
                      <input
                        type="url"
                        value={formData[social.key as keyof typeof formData] as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, [social.key]: e.target.value }))}
                        placeholder={social.placeholder}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Monitoring Tab */}
              {activeTab === 'monitoring' && (
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-medium">Włącz monitoring usług</div>
                        <div className="text-gray-500 text-sm">
                          Automatyczne sprawdzanie dostępności co 60 sekund
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.monitoringEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, monitoringEnabled: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-14 h-8 rounded-full transition-colors ${
                          formData.monitoringEnabled ? 'bg-red-500' : 'bg-white/20'
                        }`}>
                          <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                            formData.monitoringEnabled ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Monitorowane usługi:</h4>
                    <div className="space-y-2">
                      {settings.monitoring.services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">{service.name}</div>
                            <div className="text-gray-500 text-xs">{service.url}</div>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${formData.monitoringEnabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Historia zmian</h3>
                      <p className="text-sm text-gray-500">
                        Przywróć poprzednią wersję konfiguracji
                      </p>
                    </div>
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz wyczyścić całą historię zmian?')) {
                            clearHistory();
                          }
                        }}
                        className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                      >
                        🗑️ Wyczyść historię
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📜</div>
                      <p>Brak historii zmian</p>
                      <p className="text-sm mt-1">Zmiany w konfiguracji będą tutaj zapisywane</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((entry, index) => {
                        const diff = getSettingsDiff(entry.id);
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                                    v{entry.version}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {entry.changeDescription}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span>📅 {formatDate(entry.timestamp)}</span>
                                  <span>({formatRelativeTime(entry.timestamp)})</span>
                                </div>
                                {diff && (diff.added.length > 0 || diff.changed.length > 0 || diff.removed.length > 0) && (
                                  <div className="flex gap-3 mt-2 text-xs">
                                    {diff.changed.length > 0 && (
                                      <span className="text-yellow-500">
                                        ✏️ {diff.changed.length} zmienione
                                      </span>
                                    )}
                                    {diff.added.length > 0 && (
                                      <span className="text-green-500">
                                        ➕ {diff.added.length} dodane
                                      </span>
                                    )}
                                    {diff.removed.length > 0 && (
                                      <span className="text-red-500">
                                        ➖ {diff.removed.length} usunięte
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRestore(entry)}
                                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                              >
                                ↩️ Przywróć
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Backup Tab */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  {/* Export */}
                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📤</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-400">Eksportuj konfigurację</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Pobierz plik JSON z aktualną konfiguracją. Przechowuj go w bezpiecznym miejscu jako backup.
                        </p>
                        <button
                          onClick={handleExport}
                          className="mt-4 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          💾 Pobierz plik konfiguracji
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Import */}
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📥</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-400">Importuj konfigurację</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Wgraj wcześniej wyeksportowany plik JSON. Obecna konfiguracja zostanie zapisana w historii.
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          📂 Wybierz plik do importu
                        </button>

                        {importError && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            ❌ {importError}
                          </div>
                        )}

                        {importSuccess && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                            ✅ Konfiguracja zaimportowana pomyślnie!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current config info */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      📊 Informacje o konfiguracji
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Wersja:</span>
                        <span className="ml-2 font-mono">v{metadata.currentVersion}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Łączna liczba zmian:</span>
                        <span className="ml-2 font-mono">{metadata.totalChanges}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Utworzono:</span>
                        <span className="ml-2">{formatDate(metadata.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Ostatnia modyfikacja:</span>
                        <span className="ml-2">{formatDate(metadata.lastModifiedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h4 className="font-medium text-yellow-400 mb-2">⚠️ Ważne</h4>
                    <p className="text-sm text-gray-400">
                      Konfiguracja jest przechowywana w pamięci przeglądarki (localStorage). 
                      Wyczyszczenie danych przeglądarki spowoduje utratę konfiguracji. 
                      Regularnie eksportuj backup, aby nie stracić ustawień.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                🗑️ Resetuj wszystko
              </button>
              <div className="flex items-center gap-3">
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-400 text-sm"
                  >
                    ✓ Zapisano!
                  </motion.span>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center gap-2"
                >
                  💾 Zapisz zmiany
                </button>
              </div>
            </div>
          </motion.div>

          {/* Restore Confirmation Modal */}
          <AnimatePresence>
            {showRestoreConfirm && selectedHistoryEntry && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]"
                onClick={() => setShowRestoreConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-neutral-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold mb-2">Przywróć wersję v{selectedHistoryEntry.version}?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Obecna konfiguracja zostanie zapisana w historii, a następnie przywrócona zostanie wersja z:
                  </p>
                  <div className="p-3 bg-white/5 rounded-lg mb-6">
                    <div className="font-medium">{selectedHistoryEntry.changeDescription}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(selectedHistoryEntry.timestamp)}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRestoreConfirm(false)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={confirmRestore}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                    >
                      ↩️ Przywróć
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SettingsPanel;
