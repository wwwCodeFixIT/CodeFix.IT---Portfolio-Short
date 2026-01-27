import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsProps {
  onOpenCommandPalette: () => void;
}

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Otwórz Command Palette', category: 'Nawigacja' },
  { keys: ['G', 'H'], description: 'Przejdź do strony głównej', category: 'Nawigacja' },
  { keys: ['G', 'S'], description: 'Przejdź do usług', category: 'Nawigacja' },
  { keys: ['G', 'P'], description: 'Przejdź do portfolio', category: 'Nawigacja' },
  { keys: ['G', 'C'], description: 'Przejdź do kontaktu', category: 'Nawigacja' },
  { keys: ['G', 'B'], description: 'Przejdź do bloga', category: 'Nawigacja' },
  { keys: ['G', 'L'], description: 'Otwórz Playground', category: 'Nawigacja' },
  { keys: ['G', 'E'], description: 'Otwórz Estimator', category: 'Nawigacja' },
  { keys: ['ESC'], description: 'Zamknij modal', category: 'Ogólne' },
  { keys: ['?'], description: 'Pokaż skróty klawiszowe', category: 'Ogólne' },
  { keys: ['↑', '↓'], description: 'Nawiguj w Command Palette', category: 'Command Palette' },
  { keys: ['↵'], description: 'Wybierz opcję', category: 'Command Palette' },
];

export default function KeyboardShortcuts({ onOpenCommandPalette }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastKeys, setLastKeys] = useState<string[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Show shortcuts: ?
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close: ESC
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Navigation shortcuts (G + letter)
      const key = e.key.toUpperCase();
      setLastKeys(prev => {
        const newKeys = [...prev, key].slice(-2);
        
        clearTimeout(timeout);
        timeout = setTimeout(() => setLastKeys([]), 1000);

        // Check for G + letter combinations
        if (newKeys[0] === 'G' && newKeys.length === 2) {
          const targetMap: Record<string, string> = {
            'H': 'hero',
            'S': 'uslugi',
            'P': 'portfolio',
            'C': 'kontakt',
            'B': 'blog',
            'L': 'playground',
            'E': 'estimator',
          };

          const target = targetMap[newKeys[1]];
          if (target) {
            const element = document.getElementById(target);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }

        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [onOpenCommandPalette]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <>
      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 left-6 z-40 hidden lg:flex items-center gap-2 text-xs text-zinc-600"
      >
        <span>Naciśnij</span>
        <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400">?</kbd>
        <span>aby zobaczyć skróty</span>
      </motion.div>

      {/* Last pressed keys indicator */}
      <AnimatePresence>
        {lastKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-1"
          >
            {lastKeys.map((key, i) => (
              <kbd
                key={i}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono text-lg shadow-xl"
              >
                {key}
              </kbd>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⌨️</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Skróty klawiszowe</h2>
                    <p className="text-xs text-zinc-500">Szybka nawigacja po stronie</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                          <span className="text-zinc-300 text-sm">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, j) => (
                              <span key={j} className="flex items-center">
                                <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 font-mono min-w-[28px] text-center">
                                  {key}
                                </kbd>
                                {j < shortcut.keys.length - 1 && (
                                  <span className="text-zinc-600 mx-1">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <p className="text-xs text-zinc-500 text-center">
                  Naciśnij <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">ESC</kbd> aby zamknąć
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
