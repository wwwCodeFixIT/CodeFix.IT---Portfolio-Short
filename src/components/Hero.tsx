import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Code2, Sparkles, Calendar, CheckCircle2, Users } from "lucide-react";
import { useRef } from "react";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const currentMonth = new Date().toLocaleString('pl-PL', { month: 'long' });

  return (
    <section 
      ref={ref}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 lg:pt-32"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px]"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <a 
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all duration-300" />
            <div className="relative flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 border border-green-500/30 rounded-full backdrop-blur-sm hover:border-green-500/50 transition-all duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-300 font-medium">
                Dostępny do nowych projektów
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-sm text-green-400 font-semibold capitalize">
                {currentMonth} 2025
              </span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-green-400"
              >
                →
              </motion.span>
            </div>
          </a>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight">
            <span className="block text-white">Cześć, jestem</span>
            <span className="block mt-2">
              <span className="text-red-600">Patryk</span>
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-3xl mx-auto text-lg sm:text-xl lg:text-2xl text-gray-400 mb-8 leading-relaxed"
        >
          <span className="text-white font-semibold">Frontend Developer</span> specjalizujący się w{" "}
          <span className="text-red-500">React</span>, <span className="text-red-500">Next.js</span>{" "}
          i <span className="text-red-500">TypeScript</span>. 
          <br className="hidden sm:block" />
          Tworzę nowoczesne strony i aplikacje webowe z pasją do czystego kodu.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-red-600 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl shadow-red-600/30"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles size={20} />
              Zobacz moje projekty
            </span>
            <motion.div
              className="absolute inset-0 bg-red-700"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          
          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/10 hover:border-red-600/30 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Code2 size={20} className="group-hover:text-red-500 transition-colors" />
              Skontaktuj się
            </span>
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: "7+", label: "Lat doświadczenia", icon: Calendar },
            { value: "4", label: "Zrealizowane projekty", icon: CheckCircle2 },
            { value: "4", label: "Zadowolonych klientów", icon: Users },
            { value: "React", label: "Specjalizacja", icon: Code2 },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-4 md:p-6 bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl border border-white/[0.05] hover:border-red-600/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <stat.icon className="w-5 h-5 text-red-500 mb-2 mx-auto" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#services"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
          }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
        >
          <span className="text-xs uppercase tracking-widest">Przewiń w dół</span>
          <ArrowDown size={20} />
        </motion.a>
      </motion.div>
    </section>
  );
}
