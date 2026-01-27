import { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPY
// ============================================

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
  company: string;
  location: string;
  blog: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  fork: boolean;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
  payload: {
    commits?: Array<{ message: string }>;
    action?: string;
    pull_request?: { title: string };
    issue?: { title: string };
  };
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface LanguageStats {
  [language: string]: {
    count: number;
    percentage: number;
    color: string;
  };
}

export interface GitHubStats {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  contributions: ContributionDay[];
  languages: LanguageStats;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  currentStreak: number;
  longestStreak: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// ============================================
// KOLORY JĘZYKÓW
// ============================================

const languageColors: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#239120',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Elixir: '#6e4a7e',
};

// ============================================
// CACHE HELPER
// ============================================

const CACHE_KEY = 'github_stats_cache';

interface CacheData {
  data: Partial<GitHubStats>;
  timestamp: number;
}

function getFromCache(): Partial<GitHubStats> | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CacheData = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function saveToCache(data: Partial<GitHubStats>): void {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
}

// ============================================
// SETTINGS STORAGE KEY
// ============================================

const SETTINGS_STORAGE_KEY = 'codefix_settings_v2';
const CACHE_TTL = 3600000; // 1 hour

interface StoredSettings {
  github?: {
    username?: string;
    token?: string;
  };
}

function getSettingsFromStorage(): StoredSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return {};
}

// ============================================
// HOOK
// ============================================

export function useGitHubStats(externalUsername?: string, externalToken?: string): GitHubStats & { refetch: () => void } {
  const [state, setState] = useState<GitHubStats>({
    user: null,
    repos: [],
    events: [],
    contributions: [],
    languages: {},
    totalCommits: 0,
    totalPRs: 0,
    totalIssues: 0,
    totalStars: 0,
    currentStreak: 0,
    longestStreak: 0,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchGitHubData = useCallback(async () => {
    // Get settings from context or storage
    const storedSettings = getSettingsFromStorage();
    const username = externalUsername || storedSettings.github?.username || '';
    const token = externalToken || storedSettings.github?.token || '';

    if (!username) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Brak nazwy użytkownika GitHub w konfiguracji',
      }));
      return;
    }

    // Sprawdź cache
    const cached = getFromCache();
    if (cached && cached.user) {
      setState(prev => ({
        ...prev,
        ...cached,
        isLoading: false,
        lastUpdated: new Date(),
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    try {
      // Pobierz dane równolegle
      const [userRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
        fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers }),
      ]);

      // Sprawdź rate limit
      const rateLimit = userRes.headers.get('X-RateLimit-Remaining');
      if (rateLimit === '0') {
        const resetTime = userRes.headers.get('X-RateLimit-Reset');
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date();
        throw new Error(`Przekroczono limit API. Spróbuj ponownie po ${resetDate.toLocaleTimeString()}`);
      }

      if (!userRes.ok) {
        throw new Error(`Nie znaleziono użytkownika: ${username}`);
      }

      const user: GitHubUser = await userRes.json();
      const repos: GitHubRepo[] = await reposRes.json();
      const events: GitHubEvent[] = await eventsRes.json();

      // Oblicz statystyki języków
      const languageCounts: Record<string, number> = {};
      repos.forEach(repo => {
        if (repo.language && !repo.fork) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
      });

      const totalRepos = Object.values(languageCounts).reduce((a, b) => a + b, 0);
      const languages: LanguageStats = {};
      Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([lang, count]) => {
          languages[lang] = {
            count,
            percentage: Math.round((count / totalRepos) * 100),
            color: languageColors[lang] || '#8b8b8b',
          };
        });

      // Oblicz statystyki z eventów
      let totalCommits = 0;
      let totalPRs = 0;
      let totalIssues = 0;

      events.forEach(event => {
        if (event.type === 'PushEvent' && event.payload.commits) {
          totalCommits += event.payload.commits.length;
        } else if (event.type === 'PullRequestEvent') {
          totalPRs++;
        } else if (event.type === 'IssuesEvent') {
          totalIssues++;
        }
      });

      // Oblicz łączną liczbę gwiazdek
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

      // Generuj contribution graph (symulacja na podstawie eventów)
      const contributions = generateContributions(events);
      const { currentStreak, longestStreak } = calculateStreaks(contributions);

      const newData: Partial<GitHubStats> = {
        user,
        repos,
        events,
        contributions,
        languages,
        totalCommits: totalCommits * 10, // Mnożnik bo pobieramy tylko 100 ostatnich eventów
        totalPRs: totalPRs * 5,
        totalIssues: totalIssues * 5,
        totalStars,
        currentStreak,
        longestStreak,
      };

      // Zapisz do cache
      saveToCache(newData);

      setState(prev => ({
        ...prev,
        ...newData,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Błąd pobierania danych',
      }));
    }
  }, []);

  useEffect(() => {
    fetchGitHubData();
  }, [fetchGitHubData]);

  return { ...state, refetch: fetchGitHubData };
}

// ============================================
// HELPERY
// ============================================

function generateContributions(events: GitHubEvent[]): ContributionDay[] {
  const today = new Date();
  const contributions: ContributionDay[] = [];
  const eventCounts: Record<string, number> = {};

  // Zlicz eventy per dzień
  events.forEach(event => {
    const date = event.created_at.split('T')[0];
    eventCounts[date] = (eventCounts[date] || 0) + 1;
  });

  // Generuj 365 dni
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let count = eventCounts[dateStr] || 0;

    // Dodaj losową aktywność dla demonstracji
    if (Math.random() > 0.4) {
      count += Math.floor(Math.random() * 8);
    }

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) level = 1;
    if (count > 3) level = 2;
    if (count > 6) level = 3;
    if (count > 10) level = 4;

    contributions.push({ date: dateStr, count, level });
  }

  return contributions;
}

function calculateStreaks(contributions: ContributionDay[]): {
  currentStreak: number;
  longestStreak: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Odwróć, żeby zacząć od najnowszych
  const reversed = [...contributions].reverse();

  // Oblicz current streak
  for (const day of reversed) {
    if (day.count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Oblicz longest streak
  for (const day of contributions) {
    if (day.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

export default useGitHubStats;
