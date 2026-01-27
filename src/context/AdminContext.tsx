import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  isLoginModalOpen: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  lastActivity: Date | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Hasło administratora - ZMIEŃ TO NA WŁASNE!
// W produkcji użyj zmiennych środowiskowych lub bezpiecznego API
const ADMIN_PASSWORD = 'CodeFix2024!';

// Sekretna kombinacja klawiszy do otwarcia panelu logowania
// Domyślnie: Ctrl + Shift + A (Admin)
const SECRET_COMBO = ['Control', 'Shift', 'A'];

// Czas sesji w minutach
const SESSION_TIMEOUT = 60;

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  // Sprawdź zapisaną sesję przy starcie
  useEffect(() => {
    const savedSession = localStorage.getItem('codefix_admin_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const sessionTime = new Date(session.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - sessionTime.getTime()) / (1000 * 60);
        
        if (diffMinutes < SESSION_TIMEOUT && session.isAdmin) {
          setIsAdmin(true);
          setLastActivity(sessionTime);
        } else {
          localStorage.removeItem('codefix_admin_session');
        }
      } catch {
        localStorage.removeItem('codefix_admin_session');
      }
    }
  }, []);

  // Wykrywanie sekretnej kombinacji klawiszy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newKeys = [...prev, e.key];
        // Trzymaj tylko ostatnie 3 klawisze
        if (newKeys.length > 3) newKeys.shift();
        return newKeys;
      });
    };

    const handleKeyUp = () => {
      // Sprawdź czy kombinacja pasuje
      if (pressedKeys.length === SECRET_COMBO.length) {
        const matches = SECRET_COMBO.every((key, index) => 
          pressedKeys[index]?.toLowerCase() === key.toLowerCase()
        );
        if (matches && !isAdmin) {
          setIsLoginModalOpen(true);
        }
      }
      // Reset po krótkim czasie
      setTimeout(() => setPressedKeys([]), 500);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, isAdmin]);

  // Auto-logout po czasie nieaktywności
  useEffect(() => {
    if (!isAdmin) return;

    const checkSession = setInterval(() => {
      const savedSession = localStorage.getItem('codefix_admin_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const sessionTime = new Date(session.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - sessionTime.getTime()) / (1000 * 60);
        
        if (diffMinutes >= SESSION_TIMEOUT) {
          logout();
        }
      }
    }, 60000); // Sprawdzaj co minutę

    return () => clearInterval(checkSession);
  }, [isAdmin]);

  // Aktualizuj aktywność przy interakcji
  useEffect(() => {
    if (!isAdmin) return;

    const updateActivity = () => {
      const now = new Date();
      setLastActivity(now);
      localStorage.setItem('codefix_admin_session', JSON.stringify({
        isAdmin: true,
        timestamp: now.toISOString()
      }));
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, [isAdmin]);

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      const now = new Date();
      setLastActivity(now);
      localStorage.setItem('codefix_admin_session', JSON.stringify({
        isAdmin: true,
        timestamp: now.toISOString()
      }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    setLastActivity(null);
    localStorage.removeItem('codefix_admin_session');
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdmin,
      isLoginModalOpen,
      login,
      logout,
      openLoginModal,
      closeLoginModal,
      lastActivity
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
