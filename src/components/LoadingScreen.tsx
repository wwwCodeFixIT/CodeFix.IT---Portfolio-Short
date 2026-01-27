import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Inicjalizacja');
  const [showContent, setShowContent] = useState(true);

  const loadingSteps = [
    { progress: 0, text: 'Inicjalizacja' },
    { progress: 15, text: 'Ładowanie zasobów' },
    { progress: 30, text: 'Przygotowywanie komponentów' },
    { progress: 50, text: 'Optymalizacja wydajności' },
    { progress: 70, text: 'Ładowanie portfolio' },
    { progress: 85, text: 'Finalizacja' },
    { progress: 100, text: 'Gotowe!' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowContent(false);
            setTimeout(onLoadingComplete, 500);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  useEffect(() => {
    const step = loadingSteps.reduce((acc, curr) => 
      progress >= curr.progress ? curr : acc
    );
    setLoadingText(step.text);
  }, [progress]);

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
            
            {/* Animated orbs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.15, 0.1, 0.15],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/20 rounded-full blur-[80px]"
            />
            
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * -200 - 100],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-1 h-1 bg-red-500 rounded-full"
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="relative">
                {/* Logo glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500/30 blur-xl rounded-full"
                />
                
                {/* Logo text */}
                <div className="relative flex items-center gap-1">
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-6xl font-bold text-white"
                  >
                    Code
                  </motion.span>
                  <motion.span
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl font-bold text-red-500"
                  >
                    Fix
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="text-5xl md:text-6xl font-bold text-zinc-500"
                  >
                    .IT
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Code animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8 font-mono text-sm text-zinc-500 flex items-center gap-2"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-red-500"
              >
                {'<'}
              </motion.span>
              <span className="text-zinc-400">Loading</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="text-zinc-500"
              >
                portfolio
              </motion.span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-red-500"
              >
                {'/>'}
              </motion.span>
            </motion.div>

            {/* Progress bar */}
            <div className="w-72 md:w-96 mb-6">
              <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full"
                />
                
                {/* Shimmer effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
            </div>

            {/* Progress text */}
            <div className="flex items-center justify-between w-72 md:w-96 text-sm">
              <motion.span
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-zinc-400"
              >
                {loadingText}
              </motion.span>
              <span className="text-red-500 font-mono font-bold">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Tech stack icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-4"
            >
              {['⚛️', '🔷', '🎨', '⚡'].map((icon, i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [0, -5, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="text-2xl"
                >
                  {icon}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 text-zinc-700 font-mono text-xs">
            &lt;html&gt;
          </div>
          <div className="absolute top-8 right-8 text-zinc-700 font-mono text-xs">
            v2.0.0
          </div>
          <div className="absolute bottom-8 left-8 text-zinc-700 font-mono text-xs">
            © 2020-2025
          </div>
          <div className="absolute bottom-8 right-8 text-zinc-700 font-mono text-xs">
            &lt;/html&gt;
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
