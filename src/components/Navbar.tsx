import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import { useAdmin } from "../context/AdminContext";
import { useLanguage } from "../context/LanguageContext";

export function Navbar({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { isAdmin, openLoginModal } = useAdmin();
  const { language, setLanguage, t } = useLanguage();

  // Uproszczona nawigacja - tylko 8 sekcji
  const navLinks = [
    { name: t('nav.home'), href: "#hero" },
    { name: t('nav.services'), href: "#uslugi" },
    { name: t('nav.portfolio'), href: "#portfolio" },
    { name: language === 'pl' ? 'Technologie' : 'Technologies', href: "#technologies" },
    { name: language === 'pl' ? 'Opinie' : 'Testimonials', href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
    { name: t('nav.contact'), href: "#kontakt" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Secret: 5 clicks on logo opens admin login
  useEffect(() => {
    if (logoClickCount >= 5 && !isAdmin) {
      openLoginModal();
      setLogoClickCount(0);
    }
    
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount, isAdmin, openLoginModal]);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href === "#") return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLogoClickCount(prev => prev + 1);
    scrollToSection("#hero");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/5 py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="#hero"
              onClick={handleLogoClick}
              className="flex items-center gap-2 select-none"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20 ${
                  logoClickCount > 0 ? 'ring-2 ring-red-500/50' : ''
                }`}
              >
                <span className="text-white font-bold text-xl">&lt;/&gt;</span>
              </motion.div>
              <span className="text-xl font-bold">
                CodeFix<span className="text-red-600">.IT</span>
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    scrollToSection(link.href); 
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.a>
              ))}
              
              <div className="ml-4 flex items-center gap-2">
                {/* Language Switcher */}
                <div className="relative">
                  <motion.button
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    onBlur={() => setTimeout(() => setIsLangMenuOpen(false), 200)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title={language === 'pl' ? 'Zmień język' : 'Change language'}
                  >
                    <Globe size={18} />
                    <span className="text-sm font-medium uppercase">{language}</span>
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isLangMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-36 bg-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                      >
                        <button
                          onClick={() => { setLanguage('pl'); setIsLangMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            language === 'pl' 
                              ? 'bg-red-500/10 text-red-400' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg">🇵🇱</span>
                          <span>Polski</span>
                          {language === 'pl' && (
                            <span className="ml-auto text-red-500">✓</span>
                          )}
                        </button>
                        <button
                          onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-t border-white/5 ${
                            language === 'en' 
                              ? 'bg-red-500/10 text-red-400' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg">🇬🇧</span>
                          <span>English</span>
                          {language === 'en' && (
                            <span className="ml-auto text-red-500">✓</span>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Admin Settings Button */}
                {isAdmin && (
                  <motion.button
                    onClick={onOpenSettings}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-red-500 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors relative"
                    title="Panel admina (⌘,)"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  </motion.button>
                )}
                
                <Button onClick={() => scrollToSection("#kontakt")} size="sm">
                  {language === 'pl' ? 'Rozpocznij projekt' : 'Start project'}
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Mobile Language Switch */}
              <motion.button
                onClick={() => setLanguage(language === 'pl' ? 'en' : 'pl')}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <span className="text-lg">{language === 'pl' ? '🇬🇧' : '🇵🇱'}</span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-[#0a0a0a] border-l border-white/10 pt-24 px-6 overflow-y-auto"
            >
              {/* Language Toggle in Mobile */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <span className="text-gray-400 text-sm">{language === 'pl' ? 'Język' : 'Language'}</span>
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                      language === 'pl' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'
                    }`}
                  >
                    <span>🇵🇱</span>
                    <span className="text-sm">PL</span>
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                      language === 'en' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span className="text-sm">EN</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => { 
                      e.preventDefault(); 
                      scrollToSection(link.href);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="py-4 text-xl text-gray-300 hover:text-white transition-colors border-b border-white/5"
                  >
                    {link.name}
                  </motion.a>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <Button onClick={() => scrollToSection("#kontakt")} className="w-full">
                    {language === 'pl' ? 'Rozpocznij projekt' : 'Start project'}
                  </Button>
                </motion.div>
                
                {/* Contact Info in Mobile Menu */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 pt-8 border-t border-white/10"
                >
                  <p className="text-gray-500 text-sm mb-2">{t('nav.contact')}</p>
                  <p className="text-white">wwwcodefixit@gmail.com</p>
                  <p className="text-gray-400">+48 883 667 943</p>
                </motion.div>

                {/* Admin access on mobile */}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 pt-4 border-t border-red-600/30"
                  >
                    <button
                      onClick={onOpenSettings}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {language === 'pl' ? 'Panel administratora' : 'Admin panel'}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
