import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, CheckCircle2, Zap, Clock, Shield } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

export function Hero() {
  const { language } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Korzyści dla klienta (nie features!)
  const benefits = language === 'pl' ? [
    { icon: Zap, text: "PageSpeed 90+ gwarantowany" },
    { icon: Clock, text: "Wycena w 24h" },
    { icon: Shield, text: "Gwarancja jakości" },
  ] : [
    { icon: Zap, text: "PageSpeed 90+ guaranteed" },
    { icon: Clock, text: "Quote within 24h" },
    { icon: Shield, text: "Quality guarantee" },
  ];

  // Statystyki z wynikami
  const stats = language === 'pl' ? [
    { value: "90+", label: "PageSpeed Score", sublabel: "szybkość stron" },
    { value: "7", label: "Lat doświadczenia", sublabel: "od 2018 roku" },
    { value: "100%", label: "Zadowolonych klientów", sublabel: "polecenia" },
    { value: "24h", label: "Czas odpowiedzi", sublabel: "na wycenę" },
  ] : [
    { value: "90+", label: "PageSpeed Score", sublabel: "site speed" },
    { value: "7", label: "Years of experience", sublabel: "since 2018" },
    { value: "100%", label: "Satisfied clients", sublabel: "referrals" },
    { value: "24h", label: "Response time", sublabel: "for quote" },
  ];

  return (
    <section 
      ref={ref}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 lg:pt-32"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge - dostępność */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <button 
            onClick={() => scrollToSection('contact')}
            className="group relative"
          >
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all duration-300" />
            <div className="relative flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 border border-green-500/30 rounded-full backdrop-blur-sm hover:border-green-500/50 transition-all duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-300 font-medium">
                {language === 'pl' ? 'Wolne terminy w tym miesiącu' : 'Available this month'}
              </span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-green-400"
              >
                →
              </motion.span>
            </div>
          </button>
        </motion.div>

        {/* GŁÓWNY HEADLINE - SPRZEDAŻOWY */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight leading-tight">
            <span className="block text-white">
              {language === 'pl' 
                ? 'Szybkie strony i aplikacje,' 
                : 'Fast websites and apps,'}
            </span>
            <span className="block mt-2">
              {language === 'pl' 
                ? <>które <span className="text-red-500">zwiększają konwersję</span></>
                : <>that <span className="text-red-500">boost conversion</span></>}
            </span>
          </h1>
        </motion.div>

        {/* PODTYTUŁ - CO ROBIĘ I DLA KOGO */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-400 mb-6 leading-relaxed"
        >
          {language === 'pl' ? (
            <>
              Projektuję <span className="text-white">nowoczesne strony</span> i{" "}
              <span className="text-white">aplikacje webowe</span> dla firm, 
              które chcą wyróżnić się w internecie.
              <br className="hidden sm:block" />
              <span className="text-red-400">React</span>,{" "}
              <span className="text-red-400">WordPress</span>,{" "}
              optymalizacja i pełna obsługa techniczna.
            </>
          ) : (
            <>
              I design <span className="text-white">modern websites</span> and{" "}
              <span className="text-white">web applications</span> for businesses 
              that want to stand out online.
              <br className="hidden sm:block" />
              <span className="text-red-400">React</span>,{" "}
              <span className="text-red-400">WordPress</span>,{" "}
              optimization and full technical support.
            </>
          )}
        </motion.p>

        {/* KORZYŚCI - 3 punkty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8"
        >
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm sm:text-base">
              <benefit.icon size={18} className="text-green-500" />
              <span className="text-gray-300">{benefit.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA BUTTONS - WYRAŹNE AKCJE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {/* Główny CTA - Darmowa wycena */}
          <motion.button
            onClick={() => scrollToSection('contact')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-red-600 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl shadow-red-600/30"
          >
            <span className="relative z-10 flex items-center gap-2">
              {language === 'pl' ? 'Darmowa wycena' : 'Free quote'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-red-700"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          
          {/* Drugi CTA - Zobacz projekty */}
          <motion.button
            onClick={() => scrollToSection('portfolio')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/10 hover:border-red-600/30 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              {language === 'pl' ? 'Zobacz projekty' : 'View projects'}
              <CheckCircle2 size={20} className="group-hover:text-red-500 transition-colors" />
            </span>
          </motion.button>
        </motion.div>

        {/* STATYSTYKI - z rezultatami */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-4 md:p-5 bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl border border-white/[0.05] hover:border-red-600/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-3xl md:text-4xl font-bold text-red-500 mb-1">{stat.value}</div>
              <div className="text-sm text-white font-medium">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.sublabel}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof - krótka wzmianka */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 text-gray-500 text-sm"
        >
          {language === 'pl' 
            ? '✓ Zaufali mi: eM-aiR System, Kancelaria Adwokacka Witkowska, Rzeczoznawca Marcin Dudek'
            : '✓ Trusted by: eM-aiR System, Witkowska Law Firm, Expert Marcin Dudek'}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={() => scrollToSection('services')}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
        >
          <span className="text-xs uppercase tracking-widest">
            {language === 'pl' ? 'Przewiń w dół' : 'Scroll down'}
          </span>
          <ArrowDown size={20} />
        </motion.button>
      </motion.div>
    </section>
  );
}
