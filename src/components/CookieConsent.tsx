import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "./ui/Button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      // Delay showing the banner
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setIsVisible(false);
  };

  const close = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
        >
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">
            {/* Close Button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-lg">Używamy plików cookies</h3>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Używamy plików cookies, aby zapewnić Ci najlepsze doświadczenia na naszej stronie.
              {!showDetails && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-red-500 hover:text-red-400 ml-1 underline underline-offset-2"
                >
                  Dowiedz się więcej
                </button>
              )}
            </p>

            {/* Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Niezbędne</span>
                        <span className="text-xs text-green-500">Zawsze aktywne</span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Wymagane do prawidłowego działania strony.
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Analityczne</span>
                        <span className="text-xs text-gray-500">Opcjonalne</span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Pomagają nam zrozumieć jak korzystasz ze strony.
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Marketingowe</span>
                        <span className="text-xs text-gray-500">Opcjonalne</span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        Używane do personalizacji reklam.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={acceptAll} size="sm" className="flex-1">
                Akceptuj wszystkie
              </Button>
              <Button onClick={acceptNecessary} variant="outline" size="sm" className="flex-1">
                Tylko niezbędne
              </Button>
            </div>

            {/* Privacy Link */}
            <p className="text-center text-gray-600 text-xs mt-4">
              Szczegóły w naszej{" "}
              <a href="#" className="text-red-500 hover:underline">
                Polityce Prywatności
              </a>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
