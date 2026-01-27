import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: {
    pl: string;
    en: string;
  };
  rating: number;
  avatar: string;
  project?: string;
  projectUrl?: string;
  date: string;
  tags: string[];
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Adam Kowalski',
    role: 'Właściciel',
    company: 'eM-aiR System',
    content: {
      pl: 'Profesjonalna współpraca od początku do końca. Patryk doskonale zrozumiał nasze potrzeby i stworzył stronę, która idealnie reprezentuje naszą firmę. Szczególnie doceniam responsywność i szybkość działania. Polecam każdemu, kto szuka rzetelnego wykonawcy!',
      en: 'Professional collaboration from start to finish. Patryk perfectly understood our needs and created a website that ideally represents our company. I especially appreciate the responsiveness and speed. I recommend to anyone looking for a reliable contractor!'
    },
    rating: 5,
    avatar: '👨‍💼',
    project: 'eM-aiR System',
    projectUrl: 'https://em-airsystem.pl',
    date: '2023-08',
    tags: ['WordPress', 'Responsywność', 'PHP']
  },
  {
    id: 2,
    name: 'Marcin Dudek',
    role: 'Rzeczoznawca samochodowy',
    company: 'Rzeczoznawca Marcin Dudek',
    content: {
      pl: 'Strona powstała dokładnie taka, jaką sobie wyobrażałem. Patryk cierpliwie wysłuchał moich pomysłów i przełożył je na nowoczesny design. Komunikacja była świetna - zawsze odpowiadał szybko i wyczerpująco. Bardzo polecam!',
      en: 'The website turned out exactly as I imagined. Patryk patiently listened to my ideas and translated them into modern design. Communication was great - he always responded quickly and thoroughly. Highly recommend!'
    },
    rating: 5,
    avatar: '🚗',
    project: 'Rzeczoznawca Marcin Dudek',
    projectUrl: 'https://rzeczoznawcamarcindudek.pl',
    date: '2023-10',
    tags: ['WordPress', 'SEO', 'Analytics']
  },
  {
    id: 3,
    name: 'Marta Witkowska',
    role: 'Adwokat',
    company: 'Kancelaria Adwokacka Witkowska',
    content: {
      pl: 'Współpraca przebiegła bardzo sprawnie. Strona jest elegancka, profesjonalna i doskonale oddaje charakter kancelarii. Doceniam szybkie wprowadzanie poprawek i stałą dostępność. Efekt końcowy przeszedł moje oczekiwania!',
      en: 'The collaboration went very smoothly. The website is elegant, professional and perfectly captures the character of the law firm. I appreciate the quick implementation of corrections and constant availability. The final result exceeded my expectations!'
    },
    rating: 5,
    avatar: '⚖️',
    project: 'Kancelaria Adwokacka Witkowska',
    projectUrl: 'https://adwokatwitkowska.com',
    date: '2024-01',
    tags: ['WordPress', 'Elementor', 'ACF Pro']
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const { language, t } = useLanguage();

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleDotClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const handleNavClick = (dir: 'prev' | 'next') => {
    if (dir === 'prev') prevSlide();
    else nextSlide();
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const currentTestimonial = testimonials[activeIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
      
      {/* Quote marks decoration */}
      <div className="absolute top-32 left-1/4 text-[200px] font-serif text-red-500/5 select-none pointer-events-none">
        "
      </div>
      <div className="absolute bottom-32 right-1/4 text-[200px] font-serif text-red-500/5 select-none pointer-events-none rotate-180">
        "
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-6"
          >
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-yellow-400"
                >
                  ⭐
                </motion.span>
              ))}
            </span>
            <span className="ml-1">5.0 {language === 'pl' ? 'średnia ocena' : 'average rating'}</span>
          </motion.span>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Main Testimonial Card */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Navigation Arrows - Desktop */}
            <button
              onClick={() => handleNavClick('prev')}
              className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 group z-10"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => handleNavClick('next')}
              className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 group z-10"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Testimonial Card */}
            <div className="relative min-h-[450px] md:min-h-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="absolute inset-0"
                >
                  <div className="h-full bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/20">
                    {/* Top section - Quote & Rating */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="text-6xl md:text-7xl text-red-500/30 font-serif leading-none">
                        "
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(currentTestimonial.rating)].map((_, i) => (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-xl text-yellow-400"
                            >
                              ⭐
                            </motion.span>
                          ))}
                        </div>
                        <span className="text-xs text-zinc-500">
                          {currentTestimonial.date.replace('-', '/')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <blockquote className="text-lg md:text-xl lg:text-2xl text-zinc-200 leading-relaxed mb-8 font-light italic">
                      {currentTestimonial.content[language]}
                    </blockquote>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {currentTestimonial.tags.map((tag, i) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="px-3 py-1 bg-zinc-800/80 border border-zinc-700/50 rounded-full text-xs text-zinc-400"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    
                    {/* Author & Project */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-700/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/30 to-orange-500/20 border-2 border-red-500/30 flex items-center justify-center text-3xl shadow-lg shadow-red-500/10">
                            {currentTestimonial.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-lg">
                            {currentTestimonial.name}
                          </h4>
                          <p className="text-zinc-400 text-sm">
                            {currentTestimonial.role}
                          </p>
                          <p className="text-red-400 text-sm font-medium">
                            {currentTestimonial.company}
                          </p>
                        </div>
                      </div>
                      
                      {/* Project Link */}
                      {currentTestimonial.projectUrl && (
                        <motion.a
                          href={currentTestimonial.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all duration-300 group"
                        >
                          <span className="text-lg">🔗</span>
                          <span className="text-sm font-medium">
                            {language === 'pl' ? 'Zobacz projekt' : 'View project'}
                          </span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Mobile Navigation Arrows */}
            <div className="flex md:hidden justify-center gap-4 mt-6">
              <button
                onClick={() => handleNavClick('prev')}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 text-white active:bg-red-500/20 transition-all"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleNavClick('next')}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 text-white active:bg-red-500/20 transition-all"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`relative h-3 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? 'w-10 bg-gradient-to-r from-red-500 to-orange-500'
                    : 'w-3 bg-zinc-700 hover:bg-zinc-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                {index === activeIndex && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Auto-play indicator */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              {isAutoPlaying ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>{language === 'pl' ? 'Automatyczne przewijanie' : 'Auto-scrolling'}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                  <span>{language === 'pl' ? 'Przewijanie wstrzymane' : 'Scrolling paused'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20"
        >
          {[
            { 
              value: '100%', 
              label: language === 'pl' ? 'Zadowolonych klientów' : 'Satisfied clients',
              icon: '😊',
              color: 'from-green-500/20 to-emerald-500/10'
            },
            { 
              value: '5.0', 
              label: language === 'pl' ? 'Średnia ocena' : 'Average rating',
              icon: '⭐',
              color: 'from-yellow-500/20 to-orange-500/10'
            },
            { 
              value: '4', 
              label: language === 'pl' ? 'Zrealizowane projekty' : 'Completed projects',
              icon: '🚀',
              color: 'from-blue-500/20 to-cyan-500/10'
            },
            { 
              value: '100%', 
              label: language === 'pl' ? 'Projektów na czas' : 'Projects on time',
              icon: '⏱️',
              color: 'from-purple-500/20 to-pink-500/10'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`text-center p-6 bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300`}
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-zinc-400 mb-6">
            {language === 'pl' 
              ? 'Chcesz dołączyć do grona zadowolonych klientów?' 
              : 'Want to join our satisfied clients?'}
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300"
          >
            <span>{language === 'pl' ? 'Rozpocznij współpracę' : 'Start collaboration'}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
