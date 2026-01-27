import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { 
  Zap, 
  Code2, 
  HeartHandshake, 
  MessageSquare,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

export function WhyMe() {
  const { language } = useLanguage();

  const reasons = language === 'pl' ? [
    {
      icon: Zap,
      title: "Szybkość ma znaczenie",
      description: "Strony, które tworzę ładują się w mniej niż 3 sekundy. PageSpeed 90+ to standard, nie wyjątek.",
      highlight: "PageSpeed 90+"
    },
    {
      icon: Code2,
      title: "Czysty kod = niższe koszty",
      description: "Piszę kod, który łatwo rozbudować i utrzymać. Oszczędzasz na przyszłych zmianach.",
      highlight: "Łatwa rozbudowa"
    },
    {
      icon: HeartHandshake,
      title: "Partner, nie wykonawca",
      description: "Doradzam najlepsze rozwiązania dla Twojego biznesu. Nie sprzedaję niepotrzebnych funkcji.",
      highlight: "Uczciwe podejście"
    },
    {
      icon: MessageSquare,
      title: "Komunikacja bez stresu",
      description: "Odpowiadam w ciągu 24h. Mówię prostym językiem. Wiesz co się dzieje z projektem.",
      highlight: "Odpowiedź w 24h"
    },
    {
      icon: TrendingUp,
      title: "Myślę o Twoich celach",
      description: "Strona ma przynosić klientów, nie tylko wyglądać. Projektuję z myślą o konwersji.",
      highlight: "Fokus na wyniki"
    },
    {
      icon: CheckCircle2,
      title: "Gwarancja jakości",
      description: "Poprawki gratis przez 30 dni po wdrożeniu. Jeśli coś nie działa - naprawiam bez dyskusji.",
      highlight: "30 dni gwarancji"
    },
  ] : [
    {
      icon: Zap,
      title: "Speed matters",
      description: "Sites I create load in under 3 seconds. PageSpeed 90+ is standard, not exception.",
      highlight: "PageSpeed 90+"
    },
    {
      icon: Code2,
      title: "Clean code = lower costs",
      description: "I write code that's easy to expand and maintain. You save on future changes.",
      highlight: "Easy to expand"
    },
    {
      icon: HeartHandshake,
      title: "Partner, not contractor",
      description: "I advise the best solutions for your business. I don't sell unnecessary features.",
      highlight: "Honest approach"
    },
    {
      icon: MessageSquare,
      title: "Stress-free communication",
      description: "I respond within 24h. I speak plain language. You know what's happening.",
      highlight: "24h response"
    },
    {
      icon: TrendingUp,
      title: "I think about your goals",
      description: "Website should bring clients, not just look good. I design for conversion.",
      highlight: "Results focused"
    },
    {
      icon: CheckCircle2,
      title: "Quality guarantee",
      description: "Free fixes for 30 days after launch. If something doesn't work - I fix it.",
      highlight: "30 days warranty"
    },
  ];

  return (
    <section id="why-me" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {language === 'pl' ? 'Dlaczego ' : 'Why '}
            <span className="text-red-500">
              {language === 'pl' ? 'warto ze mną pracować?' : 'work with me?'}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {language === 'pl' 
              ? 'Nie tylko tworzę strony - pomagam rozwijać Twój biznes w internecie'
              : "I don't just create websites - I help grow your business online"}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-red-500/30 transition-all duration-300"
            >
              {/* Highlight badge */}
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
                  {reason.highlight}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                <reason.icon className="w-6 h-6 text-red-500" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {reason.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {reason.description}
              </p>
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
          <p className="text-gray-400 mb-4">
            {language === 'pl' 
              ? 'Brzmi dobrze? Porozmawiajmy o Twoim projekcie.'
              : 'Sounds good? Let\'s talk about your project.'}
          </p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors inline-flex items-center gap-2"
          >
            {language === 'pl' ? 'Umów bezpłatną konsultację' : 'Book free consultation'}
            <MessageSquare size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
