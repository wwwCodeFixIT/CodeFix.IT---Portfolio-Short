import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

interface NavbarEnhancedProps {
  onOpenSettings?: () => void;
}

export function NavbarEnhanced({ onOpenSettings }: NavbarEnhancedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const { scrollY } = useScroll();
  
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)']
  );
  
  const navBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(20px)']
  );
  
  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.1)']
  );

  const navItems = [
    { id: 'hero', label: 'Start', icon: '🏠' },
    { id: 'services', label: 'Usługi', icon: '⚡' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'technologies', label: 'Technologie', icon: '🛠️' },
    { id: 'process', label: 'Proces', icon: '📋' },
    { id: 'testimonials', label: 'Opinie', icon: '⭐' },
    { id: 'contact', label: 'Kontakt', icon: '📧' },
  ];

  const tools = [
    { id: 'playground', label: 'Code Playground', icon: '💻', description: 'Interaktywny edytor kodu' },
    { id: 'estimator', label: 'Kalkulator wyceny', icon: '🧮', description: 'Oszacuj koszt projektu' },
    { id: 'tech-center', label: 'Tech Center', icon: '🔬', description: 'Nasze technologie' },
    { id: 'status', label: 'Status usług', icon: '📊', description: 'Monitoring systemów' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        style={{
          backgroundColor: navBackground,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
          borderBottomColor: navBorder,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('hero');
              }}
              className="relative group flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Logo glow */}
              <motion.div
                className="absolute -inset-2 bg-red-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              <div className="relative flex items-center">
                <span className="text-xl md:text-2xl font-bold text-white">Code</span>
                <span className="text-xl md:text-2xl font-bold text-red-500">Fix</span>
                <span className="text-xl md:text-2xl font-bold text-zinc-500">.IT</span>
              </div>
              
              {/* Online indicator */}
              <div className="hidden md:flex items-center gap-1.5 ml-3 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-green-500 rounded-full"
                />
                <span className="text-[10px] text-green-500 font-medium">Online</span>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    activeSection === item.id ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active/Hover background */}
                  <AnimatePresence>
                    {(activeSection === item.id || hoveredItem === item.id) && (
                      <motion.div
                        layoutId="navActive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 rounded-lg ${
                          activeSection === item.id
                            ? 'bg-red-500/20 border border-red-500/30'
                            : 'bg-white/5'
                        }`}
                      />
                    )}
                  </AnimatePresence>
                  
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className="hidden xl:inline">{item.icon}</span>
                    {item.label}
                  </span>
                </motion.button>
              ))}

              {/* Tools dropdown */}
              <div className="relative group">
                <motion.button
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <span>🧰</span>
                  <span>Narzędzia</span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ rotate: hoveredItem === 'tools' ? 180 : 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
                    {tools.map((tool, i) => (
                      <motion.button
                        key={tool.id}
                        onClick={() => scrollToSection(tool.id)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group/item"
                      >
                        <span className="text-2xl group-hover/item:scale-110 transition-transform">{tool.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white group-hover/item:text-red-400 transition-colors">
                            {tool.label}
                          </div>
                          <div className="text-xs text-zinc-500">{tool.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Admin settings button */}
              {isAdmin && onOpenSettings && (
                <motion.button
                  onClick={onOpenSettings}
                  className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
                  />
                </motion.button>
              )}

              {/* CTA Button */}
              <motion.button
                onClick={() => scrollToSection('contact')}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-medium rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/25"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Rozpocznij projekt</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center text-white"
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative w-6 h-5">
                  <motion.span
                    animate={{
                      rotate: isOpen ? 45 : 0,
                      y: isOpen ? 8 : 0,
                    }}
                    className="absolute top-0 left-0 w-full h-0.5 bg-white rounded-full"
                  />
                  <motion.span
                    animate={{
                      opacity: isOpen ? 0 : 1,
                      x: isOpen ? -10 : 0,
                    }}
                    className="absolute top-2 left-0 w-full h-0.5 bg-white rounded-full"
                  />
                  <motion.span
                    animate={{
                      rotate: isOpen ? -45 : 0,
                      y: isOpen ? -8 : 0,
                    }}
                    className="absolute top-4 left-0 w-full h-0.5 bg-white rounded-full"
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeSection === item.id
                        ? 'bg-red-500/20 text-white border border-red-500/30'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="mobileActive"
                        className="ml-auto w-2 h-2 bg-red-500 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}

                {/* Tools section */}
                <div className="pt-4 mt-4 border-t border-white/10">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3 px-4">Narzędzia</div>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool, i) => (
                      <motion.button
                        key={tool.id}
                        onClick={() => scrollToSection(tool.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors"
                      >
                        <span className="text-2xl">{tool.icon}</span>
                        <span className="text-xs text-zinc-400">{tool.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  onClick={() => scrollToSection('contact')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-xl"
                >
                  🚀 Rozpocznij projekt
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 origin-left z-[51]"
        style={{
          scaleX: useTransform(scrollY, [0, document.body.scrollHeight - window.innerHeight], [0, 1]),
        }}
      />
    </>
  );
}
