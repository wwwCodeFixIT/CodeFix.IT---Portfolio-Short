import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      
      setScrollProgress(progress);
      setIsVisible(scrolled > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 shadow-lg shadow-black/20 flex items-center justify-center group cursor-pointer overflow-hidden"
          aria-label="Przewiń do góry"
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 56 56"
          >
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-700/30"
            />
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-red-500"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - scrollProgress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
            />
          </svg>
          
          {/* Arrow icon */}
          <motion.span
            className="relative text-white group-hover:text-red-500 transition-colors text-xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            ↑
          </motion.span>
          
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Na górę ({Math.round(scrollProgress)}%)
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
