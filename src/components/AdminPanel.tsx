import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

interface AdminPanelProps {
  children: React.ReactNode;
  showWhenAdmin?: boolean;
}

// Wrapper component that shows content only for admins
export const AdminOnly: React.FC<AdminPanelProps> = ({ children, showWhenAdmin = true }) => {
  const { isAdmin } = useAdmin();
  
  if (showWhenAdmin && !isAdmin) return null;
  if (!showWhenAdmin && isAdmin) return null;
  
  return <>{children}</>;
};

// Floating admin indicator
export const AdminIndicator: React.FC = () => {
  const { isAdmin, logout, lastActivity } = useAdmin();

  if (!isAdmin) return null;

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 z-[9998] bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Tryb Admin</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            {lastActivity && (
              <p className="text-xs text-zinc-500">
                Ostatnia aktywność: {formatTime(lastActivity)}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="ml-2 p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Wyloguj"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Quick actions toolbar for admin
export const AdminToolbar: React.FC<{
  onOpenSettings: () => void;
  onOpenSetupWizard: () => void;
}> = ({ onOpenSettings, onOpenSetupWizard }) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-[9997] flex flex-col gap-2"
    >
      <button
        onClick={onOpenSettings}
        className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-500 transition-all group"
        title="Ustawienia (⌘,)"
      >
        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <button
        onClick={onOpenSetupWizard}
        className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-500 transition-all group"
        title="Kreator konfiguracji"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      </button>

      <button
        onClick={() => window.location.reload()}
        className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-500 transition-all group"
        title="Odśwież stronę"
      >
        <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <div className="w-12 h-px bg-zinc-800 my-1" />

      <button
        onClick={() => localStorage.clear()}
        className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-500 transition-all"
        title="Wyczyść cache"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  );
};
