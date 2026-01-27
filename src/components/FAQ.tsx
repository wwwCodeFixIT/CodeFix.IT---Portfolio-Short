import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FAQItem {
  question: {
    pl: string;
    en: string;
  };
  answer: {
    pl: string;
    en: string;
  };
}

const faqData: FAQItem[] = [
  {
    question: {
      pl: "Ile kosztuje strona internetowa?",
      en: "How much does a website cost?"
    },
    answer: {
      pl: "Cena zależy od zakresu projektu. Strona wizytówka zaczyna się od ok. 1500 zł, strona firmowa od 3000 zł, a sklep internetowy od 6000 zł. Każdy projekt wyceniam indywidualnie po poznaniu wymagań. Napisz do mnie, a przygotuję bezpłatną wycenę.",
      en: "The price depends on the project scope. A business card website starts from around 1500 PLN, a company website from 3000 PLN, and an online store from 6000 PLN. I quote each project individually after learning the requirements. Contact me for a free quote."
    }
  },
  {
    question: {
      pl: "Jak długo trwa realizacja projektu?",
      en: "How long does a project take?"
    },
    answer: {
      pl: "Czas realizacji zależy od złożoności. Prosta strona wizytówka to 1-2 tygodnie, strona firmowa 2-4 tygodnie, a sklep lub aplikacja webowa 4-8 tygodni. Zawsze ustalam realistyczny termin przed rozpoczęciem prac.",
      en: "The timeline depends on complexity. A simple business card website takes 1-2 weeks, a company website 2-4 weeks, and a store or web application 4-8 weeks. I always set a realistic deadline before starting work."
    }
  },
  {
    question: {
      pl: "Co potrzebujesz do rozpoczęcia projektu?",
      en: "What do you need to start a project?"
    },
    answer: {
      pl: "Potrzebuję: opisu Twojej firmy/działalności, informacji o celu strony, przykładów stron które Ci się podobają (opcjonalnie), logo i materiałów graficznych (jeśli masz), oraz treści (teksty, zdjęcia). Jeśli nie masz wszystkiego - pomogę przygotować.",
      en: "I need: a description of your company/business, information about the website's purpose, examples of websites you like (optional), logo and graphics (if you have them), and content (texts, photos). If you don't have everything - I'll help you prepare."
    }
  },
  {
    question: {
      pl: "Czy oferujesz wsparcie po wdrożeniu?",
      en: "Do you offer support after launch?"
    },
    answer: {
      pl: "Tak! Każdy projekt obejmuje 30 dni bezpłatnego wsparcia po wdrożeniu. Później oferuję pakiety utrzymania strony obejmujące aktualizacje, kopie bezpieczeństwa i drobne poprawki. Możesz też kontaktować się z jednorazowymi zleceniami.",
      en: "Yes! Every project includes 30 days of free support after launch. After that, I offer website maintenance packages including updates, backups, and minor fixes. You can also contact me for one-time tasks."
    }
  },
  {
    question: {
      pl: "Czy pomagasz z hostingiem i domeną?",
      en: "Do you help with hosting and domain?"
    },
    answer: {
      pl: "Tak, pomagam w wyborze i konfiguracji hostingu oraz domeny. Mogę doradzić najlepsze rozwiązanie dla Twojego projektu i pomóc w całym procesie uruchomienia strony. Koszt hostingu i domeny to ok. 200-400 zł rocznie.",
      en: "Yes, I help with choosing and configuring hosting and domain. I can advise on the best solution for your project and help with the entire website launch process. Hosting and domain cost around 200-400 PLN per year."
    }
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { language } = useLanguage();

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-red-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-red-500 text-sm font-medium tracking-wider uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'pl' ? 'Najczęściej zadawane pytania' : 'Frequently asked questions'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {language === 'pl' 
              ? 'Odpowiedzi na pytania, które najczęściej zadają moi klienci'
              : 'Answers to the questions my clients ask most often'}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-red-500/30 shadow-lg shadow-red-500/5' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className={`font-medium transition-colors ${
                  openIndex === index ? 'text-white' : 'text-gray-300'
                }`}>
                  {item.question[language]}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-shrink-0 ml-4 p-1 rounded-lg ${
                    openIndex === index ? 'text-red-500 bg-red-500/10' : 'text-gray-500'
                  }`}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                      {item.answer[language]}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            {language === 'pl' 
              ? 'Nie znalazłeś odpowiedzi na swoje pytanie?'
              : "Didn't find the answer to your question?"}
          </p>
          <motion.a
            href="#kontakt"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#kontakt')?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
          >
            <MessageCircle size={20} />
            {language === 'pl' ? 'Napisz do mnie' : 'Contact me'}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
