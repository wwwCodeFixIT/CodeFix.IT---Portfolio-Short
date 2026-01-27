import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Typy ustawień
export interface AppSettings {
  github: {
    username: string;
    token: string;
  };
  analytics: {
    googleAnalyticsId: string;
    enableLocalTracking: boolean;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  company: {
    name: string;
    foundedYear: number;
    description: string;
    ownerName: string;
    ownerNick: string;
    yearsOfExperience: number;
    completedProjects: number;
    happyClients: number;
  };
  monitoring: {
    enabled: boolean;
    checkInterval: number;
    services: Array<{
      id: string;
      name: string;
      url: string;
      description: string;
    }>;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  partners: {
    backend: {
      name: string;
      nick: string;
      hasPortfolio: boolean;
      portfolioUrl: string;
    };
    design: {
      name: string;
      nick: string;
      hasPortfolio: boolean;
      portfolioUrl: string;
    };
  };
}

// Historia zmian
export interface SettingsHistoryEntry {
  id: string;
  timestamp: string;
  settings: AppSettings;
  changeDescription: string;
  version: number;
}

// Metadane konfiguracji
export interface SettingsMetadata {
  currentVersion: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  totalChanges: number;
}

// Domyślne ustawienia - PRAWDZIWE DANE CodeFix.IT
const defaultSettings: AppSettings = {
  github: {
    username: 'wwwCodeFixIT',
    token: '',
  },
  analytics: {
    googleAnalyticsId: '',
    enableLocalTracking: true,
  },
  contact: {
    email: 'wwwcodefixit@gmail.com',
    phone: '+48 883 667 943',
    address: 'Warszawa, Polska',
  },
  company: {
    name: 'CodeFix.IT',
    foundedYear: 2020,
    description: 'Nowoczesne strony i aplikacje webowe',
    ownerName: 'Patryk',
    ownerNick: 'Dziadzia',
    yearsOfExperience: 7,
    completedProjects: 4,
    happyClients: 4,
  },
  monitoring: {
    enabled: true,
    checkInterval: 60000,
    services: [
      {
        id: 'emair',
        name: 'eM-aiR System',
        url: 'https://em-airsystem.pl',
        description: 'Strona klienta - klimatyzacja i wentylacja',
      },
      {
        id: 'rzeczoznawca',
        name: 'Rzeczoznawca Marcin Dudek',
        url: 'https://rzeczoznawcamarcindudek.pl',
        description: 'Strona klienta - rzeczoznawca samochodowy',
      },
      {
        id: 'adwokat',
        name: 'Kancelaria Adwokacka Witkowska',
        url: 'https://adwokatwitkowska.com',
        description: 'Strona klienta - kancelaria prawna',
      },
    ],
  },
  social: {
    github: 'https://github.com/wwwCodeFixIT',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  },
  partners: {
    backend: {
      name: 'Partner Backend',
      nick: 'BackPartner',
      hasPortfolio: false,
      portfolioUrl: '',
    },
    design: {
      name: 'Partner UI/UX',
      nick: 'DesignPartner',
      hasPortfolio: true,
      portfolioUrl: '',
    },
  },
};

const defaultMetadata: SettingsMetadata = {
  currentVersion: 1,
  createdAt: new Date().toISOString(),
  lastModifiedAt: new Date().toISOString(),
  lastModifiedBy: 'Admin',
  totalChanges: 0,
};

const SETTINGS_STORAGE_KEY = 'codefix_settings_v3';
const SETTINGS_HISTORY_KEY = 'codefix_settings_history';
const SETTINGS_METADATA_KEY = 'codefix_settings_metadata';
const MAX_HISTORY_ENTRIES = 20;

// Context
interface SettingsContextType {
  settings: AppSettings;
  metadata: SettingsMetadata;
  history: SettingsHistoryEntry[];
  updateSettings: (newSettings: Partial<AppSettings>, changeDescription?: string) => void;
  updateSection: <K extends keyof AppSettings>(section: K, data: Partial<AppSettings[K]>, changeDescription?: string) => void;
  resetSettings: () => void;
  isConfigured: boolean;
  lastSaved: Date | null;
  restoreVersion: (historyId: string) => void;
  exportSettings: () => string;
  importSettings: (jsonData: string) => boolean;
  clearHistory: () => void;
  getSettingsDiff: (historyId: string) => { added: string[]; removed: string[]; changed: string[] } | null;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

// Provider
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [metadata, setMetadata] = useState<SettingsMetadata>(defaultMetadata);
  const [history, setHistory] = useState<SettingsHistoryEntry[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Załaduj ustawienia z localStorage przy starcie
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(deepMerge(defaultSettings, parsed));
      }

      const savedMetadata = localStorage.getItem(SETTINGS_METADATA_KEY);
      if (savedMetadata) {
        const parsed = JSON.parse(savedMetadata);
        setMetadata(parsed);
        setLastSaved(new Date(parsed.lastModifiedAt));
      }

      const savedHistory = localStorage.getItem(SETTINGS_HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const addToHistory = useCallback((
    currentSettings: AppSettings,
    changeDescription: string,
    newVersion: number
  ) => {
    const entry: SettingsHistoryEntry = {
      id: `v${newVersion}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      settings: JSON.parse(JSON.stringify(currentSettings)),
      changeDescription,
      version: newVersion,
    };

    setHistory(prev => {
      const newHistory = [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
      localStorage.setItem(SETTINGS_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const saveSettings = useCallback((
    newSettings: AppSettings,
    changeDescription: string = 'Aktualizacja ustawień'
  ) => {
    try {
      const now = new Date();
      const newVersion = metadata.currentVersion + 1;

      addToHistory(settings, changeDescription, metadata.currentVersion);

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));

      const newMetadata: SettingsMetadata = {
        ...metadata,
        currentVersion: newVersion,
        lastModifiedAt: now.toISOString(),
        totalChanges: metadata.totalChanges + 1,
      };
      localStorage.setItem(SETTINGS_METADATA_KEY, JSON.stringify(newMetadata));
      setMetadata(newMetadata);

      setLastSaved(now);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [metadata, settings, addToHistory]);

  const updateSettings = useCallback((
    newSettings: Partial<AppSettings>,
    changeDescription: string = 'Aktualizacja ustawień'
  ) => {
    setSettings(prev => {
      const updated: AppSettings = deepMerge(prev, newSettings);
      saveSettings(updated, changeDescription);
      return updated;
    });
  }, [saveSettings]);

  const updateSection = useCallback(<K extends keyof AppSettings>(
    section: K,
    data: Partial<AppSettings[K]>,
    changeDescription: string = `Aktualizacja sekcji: ${section}`
  ) => {
    setSettings(prev => {
      const updated: AppSettings = {
        ...prev,
        [section]: { ...prev[section], ...data },
      };
      saveSettings(updated, changeDescription);
      return updated;
    });
  }, [saveSettings]);

  const resetSettings = useCallback(() => {
    addToHistory(settings, 'Przed resetem do ustawień domyślnych', metadata.currentVersion);

    setSettings(defaultSettings);
    const newMetadata: SettingsMetadata = {
      ...defaultMetadata,
      currentVersion: metadata.currentVersion + 1,
      totalChanges: metadata.totalChanges + 1,
      lastModifiedAt: new Date().toISOString(),
    };
    setMetadata(newMetadata);

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    localStorage.setItem(SETTINGS_METADATA_KEY, JSON.stringify(newMetadata));
    setLastSaved(new Date());
  }, [settings, metadata, addToHistory]);

  const restoreVersion = useCallback((historyId: string) => {
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      addToHistory(settings, `Przed przywróceniem wersji ${entry.version}`, metadata.currentVersion);

      setSettings(entry.settings);

      const now = new Date();
      const newMetadata: SettingsMetadata = {
        ...metadata,
        currentVersion: metadata.currentVersion + 1,
        lastModifiedAt: now.toISOString(),
        totalChanges: metadata.totalChanges + 1,
      };
      setMetadata(newMetadata);

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(entry.settings));
      localStorage.setItem(SETTINGS_METADATA_KEY, JSON.stringify(newMetadata));
      setLastSaved(now);
    }
  }, [history, settings, metadata, addToHistory]);

  const exportSettings = useCallback(() => {
    const exportData = {
      settings,
      metadata,
      exportedAt: new Date().toISOString(),
      version: '3.0',
    };
    return JSON.stringify(exportData, null, 2);
  }, [settings, metadata]);

  const importSettings = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      
      if (!parsed.settings) {
        throw new Error('Invalid settings format');
      }

      addToHistory(settings, 'Przed importem ustawień', metadata.currentVersion);

      const importedSettings = deepMerge(defaultSettings, parsed.settings);
      setSettings(importedSettings);

      const now = new Date();
      const newMetadata: SettingsMetadata = {
        ...metadata,
        currentVersion: metadata.currentVersion + 1,
        lastModifiedAt: now.toISOString(),
        totalChanges: metadata.totalChanges + 1,
      };
      setMetadata(newMetadata);

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(importedSettings));
      localStorage.setItem(SETTINGS_METADATA_KEY, JSON.stringify(newMetadata));
      setLastSaved(now);

      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }, [settings, metadata, addToHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(SETTINGS_HISTORY_KEY);
  }, []);

  const getSettingsDiff = useCallback((historyId: string) => {
    const entry = history.find(h => h.id === historyId);
    if (!entry) return null;

    const currentFlat = flattenObject(settings as unknown as Record<string, unknown>);
    const historyFlat = flattenObject(entry.settings as unknown as Record<string, unknown>);

    const added: string[] = [];
    const removed: string[] = [];
    const changed: string[] = [];

    for (const key of Object.keys(historyFlat)) {
      if (!(key in currentFlat)) {
        removed.push(key);
      } else if (JSON.stringify(currentFlat[key]) !== JSON.stringify(historyFlat[key])) {
        changed.push(key);
      }
    }

    for (const key of Object.keys(currentFlat)) {
      if (!(key in historyFlat)) {
        added.push(key);
      }
    }

    return { added, removed, changed };
  }, [history, settings]);

  const isConfigured = Boolean(settings.github.username);

  return (
    <SettingsContext.Provider value={{
      settings,
      metadata,
      history,
      updateSettings,
      updateSection,
      resetSettings,
      isConfigured,
      lastSaved,
      restoreVersion,
      exportSettings,
      importSettings,
      clearHistory,
      getSettingsDiff,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

function deepMerge(target: AppSettings, source: Partial<AppSettings>): AppSettings {
  return {
    github: { ...target.github, ...source.github },
    analytics: { ...target.analytics, ...source.analytics },
    contact: { ...target.contact, ...source.contact },
    company: { ...target.company, ...source.company },
    monitoring: { 
      ...target.monitoring, 
      ...source.monitoring,
      services: source.monitoring?.services || target.monitoring.services,
    },
    social: { ...target.social, ...source.social },
    partners: {
      backend: { ...target.partners.backend, ...source.partners?.backend },
      design: { ...target.partners.design, ...source.partners?.design },
    },
  };
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

export { defaultSettings };
export type { AppSettings as Settings };
