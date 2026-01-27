import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const easeOut = 1 - Math.pow(1 - currentStep / steps, 3);
      setProgress(Math.min(100, Math.round(easeOut * 100)));

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 500);
        }, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center"
        >
          {/* Animated Background Grid */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Animated Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"
          />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", damping: 15 }}
            className="relative mb-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/30">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white font-bold text-4xl"
              >
                &lt;/&gt;
              </motion.span>
            </div>
            
            {/* Rotating Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-red-600/30 rounded-3xl"
              style={{ borderStyle: "dashed" }}
            />
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold mb-8"
          >
            CodeFix<span className="text-red-600">.IT</span>
          </motion.h1>

          {/* Progress Bar */}
          <div className="relative w-64">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
              />
            </div>
            
            {/* Progress Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <span className="text-gray-500 text-sm">Ładowanie</span>
              <span className="text-red-600 font-mono ml-2">{progress}%</span>
            </motion.div>
          </div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-12 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
                className="w-2 h-2 bg-red-600 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
