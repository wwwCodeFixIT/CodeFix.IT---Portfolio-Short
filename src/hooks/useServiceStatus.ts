import { useState, useEffect, useCallback } from 'react';
import { settings } from '../config/settings';

// ============================================
// TYPY
// ============================================

export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'checking' | 'unknown';

export interface ServiceCheck {
  id: string;
  name: string;
  url: string;
  description: string;
  status: ServiceStatus;
  responseTime: number | null;
  lastCheck: Date | null;
  uptime: number;
  history: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  date: string;
  status: ServiceStatus;
  responseTime: number | null;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  affectedServices: string[];
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  message: string;
  status: Incident['status'];
  createdAt: Date;
}

export interface ServiceStatusState {
  services: ServiceCheck[];
  incidents: Incident[];
  overallStatus: ServiceStatus;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// ============================================
// CACHE
// ============================================

const CACHE_KEY = 'service_status_cache';
const HISTORY_KEY = 'service_status_history';

interface CacheData {
  services: ServiceCheck[];
  timestamp: number;
}

function getFromCache(): ServiceCheck[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { services, timestamp }: CacheData = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > settings.cache.statusCheckTTL;

    if (isExpired) return null;
    return services;
  } catch {
    return null;
  }
}

function saveToCache(services: ServiceCheck[]): void {
  try {
    const cacheData: CacheData = { services, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore
  }
}

function getHistory(): Record<string, StatusHistoryEntry[]> {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveHistory(serviceId: string, entry: StatusHistoryEntry): void {
  try {
    const history = getHistory();
    if (!history[serviceId]) history[serviceId] = [];
    
    // Zachowaj tylko ostatnie 90 dni
    history[serviceId] = [entry, ...history[serviceId]].slice(0, 90);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore
  }
}

// ============================================
// HELPER - Sprawdzanie usługi
// ============================================

async function checkService(service: { id: string; url: string }): Promise<{
  status: ServiceStatus;
  responseTime: number | null;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const startTime = performance.now();
    
    // Używamy mode: 'no-cors' bo większość stron blokuje CORS
    // To zwróci opaque response, ale przynajmniej wiemy że serwer odpowiada
    const response = await fetch(service.url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTime = Math.round(performance.now() - startTime);

    // W trybie no-cors nie mamy dostępu do status, ale jeśli nie było błędu = działa
    if (response.type === 'opaque' || response.ok) {
      return {
        status: responseTime > 2000 ? 'degraded' : 'operational',
        responseTime,
      };
    }

    return { status: 'degraded', responseTime };
  } catch (error) {
    clearTimeout(timeout);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'degraded', responseTime: 10000 };
    }
    
    return { status: 'outage', responseTime: null };
  }
}

// ============================================
// HOOK
// ============================================

export function useServiceStatus(): ServiceStatusState & { 
  refetch: () => void;
  checkNow: (serviceId: string) => void;
} {
  const [state, setState] = useState<ServiceStatusState>({
    services: [],
    incidents: [],
    overallStatus: 'checking',
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const initializeServices = useCallback((): ServiceCheck[] => {
    const history = getHistory();
    
    return settings.monitoring.services.map(service => ({
      ...service,
      status: 'checking' as ServiceStatus,
      responseTime: null,
      lastCheck: null,
      uptime: 99.9, // Domyślnie
      history: history[service.id] || generateMockHistory(),
    }));
  }, []);

  const calculateUptime = (history: StatusHistoryEntry[]): number => {
    if (history.length === 0) return 100;
    
    const operational = history.filter(h => h.status === 'operational').length;
    return Math.round((operational / history.length) * 1000) / 10;
  };

  const checkAllServices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Sprawdź cache
    const cached = getFromCache();
    if (cached) {
      const overallStatus = calculateOverallStatus(cached);
      setState({
        services: cached,
        incidents: generateMockIncidents(),
        overallStatus,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
      return;
    }

    const services = initializeServices();
    
    // Sprawdź każdą usługę równolegle
    const results = await Promise.all(
      services.map(async (service) => {
        const result = await checkService(service);
        
        const historyEntry: StatusHistoryEntry = {
          date: new Date().toISOString().split('T')[0],
          status: result.status,
          responseTime: result.responseTime,
        };
        
        // Zapisz do historii
        saveHistory(service.id, historyEntry);
        
        return {
          ...service,
          status: result.status,
          responseTime: result.responseTime,
          lastCheck: new Date(),
          uptime: calculateUptime([historyEntry, ...service.history]),
        };
      })
    );

    // Zapisz do cache
    saveToCache(results);

    const overallStatus = calculateOverallStatus(results);

    setState({
      services: results,
      incidents: generateMockIncidents(),
      overallStatus,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
    });
  }, [initializeServices]);

  const checkSingleService = useCallback(async (serviceId: string) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(s => 
        s.id === serviceId ? { ...s, status: 'checking' } : s
      ),
    }));

    const service = settings.monitoring.services.find(s => s.id === serviceId);
    if (!service) return;

    const result = await checkService(service);
    
    setState(prev => {
      const updatedServices = prev.services.map(s => {
        if (s.id !== serviceId) return s;
        
        return {
          ...s,
          status: result.status,
          responseTime: result.responseTime,
          lastCheck: new Date(),
        };
      });

      saveToCache(updatedServices);

      return {
        ...prev,
        services: updatedServices,
        overallStatus: calculateOverallStatus(updatedServices),
        lastUpdated: new Date(),
      };
    });
  }, []);

  useEffect(() => {
    checkAllServices();

    // Auto-refresh
    const interval = setInterval(checkAllServices, settings.monitoring.checkInterval);
    return () => clearInterval(interval);
  }, [checkAllServices]);

  return {
    ...state,
    refetch: checkAllServices,
    checkNow: checkSingleService,
  };
}

// ============================================
// HELPERY
// ============================================

function calculateOverallStatus(services: ServiceCheck[]): ServiceStatus {
  const hasOutage = services.some(s => s.status === 'outage');
  const hasDegraded = services.some(s => s.status === 'degraded');
  const allChecking = services.every(s => s.status === 'checking');

  if (allChecking) return 'checking';
  if (hasOutage) return 'outage';
  if (hasDegraded) return 'degraded';
  return 'operational';
}

function generateMockHistory(): StatusHistoryEntry[] {
  const history: StatusHistoryEntry[] = [];
  const today = new Date();

  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 95% szans na operational
    const rand = Math.random();
    let status: ServiceStatus = 'operational';
    if (rand > 0.98) status = 'outage';
    else if (rand > 0.95) status = 'degraded';

    history.push({
      date: date.toISOString().split('T')[0],
      status,
      responseTime: status === 'operational' 
        ? Math.floor(Math.random() * 500) + 50
        : status === 'degraded' 
          ? Math.floor(Math.random() * 2000) + 1000
          : null,
    });
  }

  return history;
}

function generateMockIncidents(): Incident[] {
  // W prawdziwej aplikacji pobierałbyś to z API
  return [
    {
      id: '1',
      title: 'Planowana konserwacja serwerów',
      description: 'Zaplanowana aktualizacja infrastruktury.',
      status: 'resolved',
      severity: 'minor',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000),
      affectedServices: ['api', 'cdn'],
      updates: [
        {
          id: '1-1',
          message: 'Konserwacja zakończona. Wszystkie systemy działają normalnie.',
          status: 'resolved',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000),
        },
      ],
    },
  ];
}

export default useServiceStatus;
