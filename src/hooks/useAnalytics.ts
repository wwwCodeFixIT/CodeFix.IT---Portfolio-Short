import { useState, useEffect, useCallback } from 'react';
import { settings } from '../config/settings';

// ============================================
// TYPY
// ============================================

export interface PageView {
  path: string;
  title: string;
  timestamp: number;
  referrer: string;
  userAgent: string;
  screenSize: string;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
}

export interface VisitorData {
  id: string;
  firstVisit: number;
  lastVisit: number;
  visitCount: number;
  pageViews: PageView[];
  events: AnalyticsEvent[];
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  country?: string;
}

export interface AnalyticsStats {
  totalVisitors: number;
  totalPageViews: number;
  uniqueVisitorsToday: number;
  pageViewsToday: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; count: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  visitorsByDay: { date: string; visitors: number; pageViews: number }[];
}

// ============================================
// STORAGE KEYS
// ============================================

const VISITOR_KEY = 'codefix_visitor';
const ANALYTICS_KEY = 'codefix_analytics';

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateVisitorId(): string {
  return 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Other';
}

function getOSInfo(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

function getVisitorData(): VisitorData | null {
  try {
    const data = localStorage.getItem(VISITOR_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveVisitorData(data: VisitorData): void {
  try {
    localStorage.setItem(VISITOR_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

function getAllAnalytics(): VisitorData[] {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAllAnalytics(data: VisitorData[]): void {
  try {
    // Zachowaj tylko ostatnie 30 dni danych
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = data.filter(v => v.lastVisit > thirtyDaysAgo);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(filtered.slice(-1000)));
  } catch {
    // Ignore
  }
}

// ============================================
// GOOGLE ANALYTICS INTEGRATION
// ============================================

function initGoogleAnalytics(measurementId: string): void {
  if (!measurementId || typeof window === 'undefined') return;

  // Dodaj gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Inicjalizuj gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });

  // Zapisz gtag globalnie
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
}

// ============================================
// MAIN HOOK
// ============================================

export function useAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalVisitors: 0,
    totalPageViews: 0,
    uniqueVisitorsToday: 0,
    pageViewsToday: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    topReferrers: [],
    deviceBreakdown: [],
    visitorsByDay: [],
  });

  const [currentVisitor, setCurrentVisitor] = useState<VisitorData | null>(null);

  // Inicjalizacja
  useEffect(() => {
    if (!settings.analytics.enableLocalTracking) return;

    // Inicjalizuj Google Analytics jeśli skonfigurowane
    if (settings.analytics.googleAnalyticsId) {
      initGoogleAnalytics(settings.analytics.googleAnalyticsId);
    }

    // Pobierz lub utwórz dane visitora
    let visitor = getVisitorData();
    const now = Date.now();

    if (!visitor) {
      visitor = {
        id: generateVisitorId(),
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        pageViews: [],
        events: [],
        device: getDeviceType(),
        browser: getBrowserInfo(),
        os: getOSInfo(),
      };
    } else {
      // Aktualizuj ostatnią wizytę
      const isNewSession = now - visitor.lastVisit > 30 * 60 * 1000; // 30 min
      visitor.lastVisit = now;
      if (isNewSession) {
        visitor.visitCount++;
      }
    }

    // Zapisz page view
    const pageView: PageView = {
      path: window.location.pathname,
      title: document.title,
      timestamp: now,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    };
    visitor.pageViews.push(pageView);

    // Zachowaj tylko ostatnie 100 page views per visitor
    visitor.pageViews = visitor.pageViews.slice(-100);

    saveVisitorData(visitor);
    setCurrentVisitor(visitor);

    // Zapisz do globalnej analityki
    const allAnalytics = getAllAnalytics();
    const existingIndex = allAnalytics.findIndex(v => v.id === visitor!.id);
    if (existingIndex >= 0) {
      allAnalytics[existingIndex] = visitor;
    } else {
      allAnalytics.push(visitor);
    }
    saveAllAnalytics(allAnalytics);

    // Oblicz statystyki
    calculateStats();
  }, []);

  // Śledzenie zmiany strony (dla SPA)
  useEffect(() => {
    const handleRouteChange = () => {
      if (!currentVisitor || !settings.analytics.enableLocalTracking) return;

      const pageView: PageView = {
        path: window.location.pathname + window.location.hash,
        title: document.title,
        timestamp: Date.now(),
        referrer: '',
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      };

      const updatedVisitor = {
        ...currentVisitor,
        pageViews: [...currentVisitor.pageViews, pageView].slice(-100),
        lastVisit: Date.now(),
      };

      saveVisitorData(updatedVisitor);
      setCurrentVisitor(updatedVisitor);

      // Google Analytics
      if ((window as unknown as { gtag?: Function }).gtag) {
        (window as unknown as { gtag: Function }).gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    // Nasłuchuj na hash change (dla nawigacji w obrębie strony)
    window.addEventListener('hashchange', handleRouteChange);
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [currentVisitor]);

  // Funkcja do śledzenia eventów
  const trackEvent = useCallback((
    name: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (!settings.analytics.enableLocalTracking) return;

    const event: AnalyticsEvent = {
      name,
      category,
      label,
      value,
      timestamp: Date.now(),
    };

    if (currentVisitor) {
      const updatedVisitor = {
        ...currentVisitor,
        events: [...currentVisitor.events, event].slice(-100),
      };
      saveVisitorData(updatedVisitor);
      setCurrentVisitor(updatedVisitor);
    }

    // Google Analytics
    if ((window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag('event', name, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    console.log('[Analytics] Event tracked:', { name, category, label, value });
  }, [currentVisitor]);

  // Funkcja do obliczania statystyk
  const calculateStats = useCallback(() => {
    const allVisitors = getAllAnalytics();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today).getTime();

    // Podstawowe statystyki
    const totalVisitors = allVisitors.length;
    const totalPageViews = allVisitors.reduce((sum, v) => sum + v.pageViews.length, 0);

    // Dzisiejsze statystyki
    const todayVisitors = allVisitors.filter(v => v.lastVisit >= todayStart);
    const uniqueVisitorsToday = todayVisitors.length;
    const pageViewsToday = todayVisitors.reduce((sum, v) => 
      sum + v.pageViews.filter(pv => pv.timestamp >= todayStart).length, 0
    );

    // Średni czas sesji (w sekundach)
    let totalDuration = 0;
    let sessionCount = 0;
    allVisitors.forEach(v => {
      if (v.pageViews.length > 1) {
        const firstPV = v.pageViews[0].timestamp;
        const lastPV = v.pageViews[v.pageViews.length - 1].timestamp;
        totalDuration += (lastPV - firstPV) / 1000;
        sessionCount++;
      }
    });
    const averageSessionDuration = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;

    // Bounce rate (visitors z tylko 1 page view)
    const bouncedVisitors = allVisitors.filter(v => v.pageViews.length === 1).length;
    const bounceRate = totalVisitors > 0 ? Math.round((bouncedVisitors / totalVisitors) * 100) : 0;

    // Top pages
    const pageCounts: Record<string, number> = {};
    allVisitors.forEach(v => {
      v.pageViews.forEach(pv => {
        pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
      });
    });
    const topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path, views]) => ({ path, views }));

    // Top referrers
    const referrerCounts: Record<string, number> = {};
    allVisitors.forEach(v => {
      v.pageViews.forEach(pv => {
        if (pv.referrer) {
          try {
            const source = new URL(pv.referrer).hostname;
            referrerCounts[source] = (referrerCounts[source] || 0) + 1;
          } catch {
            // Invalid URL
          }
        }
      });
    });
    const topReferrers = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    allVisitors.forEach(v => {
      deviceCounts[v.device] = (deviceCounts[v.device] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        percentage: Math.round((count / totalVisitors) * 100) || 0,
      }));

    // Visitors by day (ostatnie 7 dni)
    const visitorsByDay: { date: string; visitors: number; pageViews: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayVisitors = allVisitors.filter(v => v.lastVisit >= dayStart && v.lastVisit < dayEnd);
      const dayPageViews = dayVisitors.reduce((sum, v) =>
        sum + v.pageViews.filter(pv => pv.timestamp >= dayStart && pv.timestamp < dayEnd).length, 0
      );

      visitorsByDay.push({
        date: dateStr,
        visitors: dayVisitors.length,
        pageViews: dayPageViews,
      });
    }

    setStats({
      totalVisitors,
      totalPageViews,
      uniqueVisitorsToday,
      pageViewsToday,
      averageSessionDuration,
      bounceRate,
      topPages,
      topReferrers,
      deviceBreakdown,
      visitorsByDay,
    });
  }, []);

  return {
    stats,
    currentVisitor,
    trackEvent,
    refreshStats: calculateStats,
  };
}

// Deklaracja dla window
declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export default useAnalytics;
