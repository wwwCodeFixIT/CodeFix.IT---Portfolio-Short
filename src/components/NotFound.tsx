import { motion } from 'framer-motion';

interface NotFoundProps {
  onGoHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-lg"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          className="relative mb-8"
        >
          <span className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-700 leading-none select-none">
            404
          </span>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
          >
            🔍
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Strona nie znaleziona
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-400 mb-8 leading-relaxed"
        >
          Ups! Strona, której szukasz, nie istnieje lub została przeniesiona. 
          Może wrócimy na stronę główną?
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={onGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            <span>Wróć na stronę główną</span>
          </motion.button>
          
          <motion.a
            href="#kontakt"
            onClick={onGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>Skontaktuj się</span>
          </motion.a>
        </motion.div>

        {/* Fun suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 pt-8 border-t border-zinc-800"
        >
          <p className="text-sm text-zinc-500 mb-4">Może szukasz:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Portfolio', href: '#portfolio', icon: '💼' },
              { label: 'Usługi', href: '#uslugi', icon: '🛠️' },
              { label: 'Wycena', href: '#estimator', icon: '💰' },
              { label: 'Kontakt', href: '#kontakt', icon: '📧' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={onGoHome}
                className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <span className="text-2xl font-bold text-zinc-600">
            Code<span className="text-red-500/50">Fix</span>.IT
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};
