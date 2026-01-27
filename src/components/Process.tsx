import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { 
  MessageSquare, 
  FileSearch, 
  Palette, 
  Code2, 
  Rocket,
  ArrowRight
} from "lucide-react";

export function Process() {
  const { language } = useLanguage();

  const steps = language === 'pl' ? [
    {
      icon: MessageSquare,
      number: "01",
      title: "Rozmowa",
      description: "Poznaję Twoje potrzeby, cele i oczekiwania. Doradzam najlepsze rozwiązanie.",
      duration: "15-30 min",
      free: true
    },
    {
      icon: FileSearch,
      number: "02", 
      title: "Wycena i plan",
      description: "Dostajesz szczegółową wycenę i harmonogram. Bez ukrytych kosztów.",
      duration: "24-48h",
      free: true
    },
    {
      icon: Palette,
      number: "03",
      title: "Projekt graficzny",
      description: "Tworzę makietę strony do akceptacji. Możesz wprowadzać poprawki.",
      duration: "3-7 dni",
      free: false
    },
    {
      icon: Code2,
      number: "04",
      title: "Kodowanie",
      description: "Zamieniamy projekt w działającą stronę. Regularnie pokazuję postępy.",
      duration: "1-4 tyg.",
      free: false
    },
    {
      icon: Rocket,
      number: "05",
      title: "Wdrożenie",
      description: "Publikuję stronę, konfiguruję hosting i SSL. Uczę obsługi panelu.",
      duration: "1-2 dni",
      free: false
    },
  ] : [
    {
      icon: MessageSquare,
      number: "01",
      title: "Consultation",
      description: "I learn your needs, goals and expectations. I advise the best solution.",
      duration: "15-30 min",
      free: true
    },
    {
      icon: FileSearch,
      number: "02",
      title: "Quote & plan",
      description: "You get detailed quote and timeline. No hidden costs.",
      duration: "24-48h",
      free: true
    },
    {
      icon: Palette,
      number: "03",
      title: "Design",
      description: "I create mockup for approval. You can request changes.",
      duration: "3-7 days",
      free: false
    },
    {
      icon: Code2,
      number: "04",
      title: "Development",
      description: "We turn design into working site. I show progress regularly.",
      duration: "1-4 weeks",
      free: false
    },
    {
      icon: Rocket,
      number: "05",
      title: "Launch",
      description: "I publish site, configure hosting and SSL. I teach you the panel.",
      duration: "1-2 days",
      free: false
    },
  ];

  return (
    <section id="process" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-950" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {language === 'pl' ? 'Jak ' : 'How we '}
            <span className="text-red-500">
              {language === 'pl' ? 'współpracujemy?' : 'work together?'}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {language === 'pl' 
              ? 'Przejrzysty proces od pierwszego kontaktu do gotowej strony'
              : 'Clear process from first contact to finished website'}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-6 pb-12 last:pb-0"
            >
              {/* Line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-full bg-gradient-to-b from-red-500 to-zinc-800" />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.free 
                    ? 'bg-green-500/20 border-2 border-green-500/50' 
                    : 'bg-red-500/20 border-2 border-red-500/50'
                }`}>
                  <step.icon className={`w-5 h-5 ${step.free ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-red-500 font-mono text-sm">{step.number}</span>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  {step.free && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {language === 'pl' ? 'GRATIS' : 'FREE'}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-xs rounded-full">
                    {step.duration}
                  </span>
                </div>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm mb-6">
            <span>✓</span>
            {language === 'pl' 
              ? 'Pierwsza konsultacja i wycena są bezpłatne'
              : 'First consultation and quote are free'}
          </div>
          <br />
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors inline-flex items-center gap-2"
          >
            {language === 'pl' ? 'Zacznij od rozmowy' : 'Start with a call'}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
