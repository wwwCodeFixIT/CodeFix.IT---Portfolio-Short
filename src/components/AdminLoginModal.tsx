import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, isAdmin } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isLoginModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoginModalOpen]);

  // Lockout timer
  useEffect(() => {
    if (lockTime > 0) {
      const timer = setInterval(() => {
        setLockTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isLocked && lockTime === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [lockTime, isLocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;

    const success = login(password);
    
    if (success) {
      setPassword('');
      setError('');
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError('Nieprawidłowe hasło');
      setPassword('');
      
      // Lockout after 3 failed attempts
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockTime(30); // 30 seconds lockout
        setError('Zbyt wiele prób. Odczekaj 30 sekund.');
      }
    }
  };

  const handleClose = () => {
    closeLoginModal();
    setPassword('');
    setError('');
  };

  if (isAdmin) return null;

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Panel Administratora</h2>
              <p className="text-zinc-400 text-sm">
                Wprowadź hasło, aby uzyskać dostęp do ustawień
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-zinc-300 mb-2">
                  Hasło administratora
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="password"
                    id="admin-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    disabled={isLocked}
                    className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      error 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-zinc-700 focus:ring-red-500/50 focus:border-red-500'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                  />
                  {isLocked && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm font-mono">
                      {lockTime}s
                    </div>
                  )}
                </div>
                
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </motion.p>
                )}

                {attempts > 0 && attempts < 3 && !isLocked && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Pozostałe próby: {3 - attempts}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLocked || !password}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isLocked || !password
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-600/25'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Zaloguj się
              </button>
            </form>

            {/* Footer hint */}
            <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-500">
                Skrót klawiszowy: <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">Ctrl</kbd> + <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">Shift</kbd> + <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">A</kbd>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
