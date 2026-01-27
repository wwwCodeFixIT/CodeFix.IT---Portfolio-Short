import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Lightbulb, Code, Rocket, Headphones } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Konsultacja",
    description: "Poznajemy Twoje potrzeby, cele biznesowe i wizję projektu. Analizujemy konkurencję i definiujemy zakres prac.",
    details: ["Analiza wymagań", "Brief projektowy", "Harmonogram", "Wycena"]
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Projektowanie",
    description: "Tworzymy wireframe'y i prototypy UI/UX. Projektujemy interfejs, który zachwyci Twoich użytkowników.",
    details: ["Wireframes", "Mockupy UI", "Prototypy", "Design System"]
  },
  {
    number: "03",
    icon: Code,
    title: "Development",
    description: "Implementujemy projekt z wykorzystaniem najnowszych technologii. Regularnie prezentujemy postępy.",
    details: ["Frontend", "Backend", "Integracje", "Testy"]
  },
  {
    number: "04",
    icon: Rocket,
    title: "Wdrożenie",
    description: "Uruchamiamy projekt na produkcji. Konfigurujemy hosting, domenę i wszystkie niezbędne usługi.",
    details: ["Deployment", "Optymalizacja", "SEO", "Szkolenie"]
  },
  {
    number: "05",
    icon: Headphones,
    title: "Wsparcie",
    description: "Zapewniamy ciągłe wsparcie techniczne, aktualizacje i rozwój projektu zgodnie z Twoimi potrzebami.",
    details: ["Monitoring", "Aktualizacje", "Rozwój", "Support 24/7"]
  }
];

export function Process() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="process" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Jak pracujemy
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Nasz <span className="text-red-600">proces</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Sprawdzony proces, który gwarantuje sukces projektu. Od pierwszej rozmowy
            do wdrożenia i dalszego wsparcia.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-600/50 via-red-600/20 to-transparent" />

          {/* Steps */}
          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? "lg:text-right" : "lg:text-left"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.05] rounded-2xl p-8 hover:border-red-600/30 transition-all duration-500"
                    >
                      {/* Step Number - Mobile */}
                      <div className="lg:hidden text-red-600/20 text-6xl font-bold mb-4">
                        {step.number}
                      </div>

                      <div className={`flex items-center gap-4 mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                        <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                          <Icon className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold group-hover:text-red-500 transition-colors">
                          {step.title}
                        </h3>
                      </div>

                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Details Tags */}
                      <div className={`flex flex-wrap gap-2 ${isEven ? "lg:justify-end" : ""}`}>
                        {step.details.map((detail) => (
                          <span
                            key={detail}
                            className="px-3 py-1 bg-white/5 text-gray-400 text-sm rounded-full border border-white/10"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden lg:flex flex-shrink-0 w-20 justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
                      className="relative"
                    >
                      {/* Pulsing Ring */}
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        className="absolute inset-0 w-16 h-16 -m-2 bg-red-600/20 rounded-full"
                      />
                      
                      {/* Node */}
                      <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
                        {step.number}
                      </div>
                    </motion.div>
                  </div>

                  {/* Empty Space for Layout */}
                  <div className="flex-1 hidden lg:block">
                    {/* Step Number - Desktop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: index * 0.15 + 0.5 }}
                      className={`text-red-600/10 text-9xl font-bold ${isEven ? "text-left" : "text-right"}`}
                    >
                      {step.number}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
