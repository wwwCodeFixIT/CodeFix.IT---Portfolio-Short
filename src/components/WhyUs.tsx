import { motion } from "framer-motion";
import { Code2, Zap, Palette, Users, Clock, Shield, CheckCircle2 } from "lucide-react";

const reasons = [
  {
    icon: Code2,
    title: "Czysty, pixel-perfect kod",
    description: "Piszę semantyczny, dobrze zorganizowany kod zgodny z najlepszymi praktykami. Twój projekt będzie łatwy w utrzymaniu i rozbudowie.",
  },
  {
    icon: Zap,
    title: "Wydajność i szybkość",
    description: "Optymalizuję każdy projekt pod kątem Core Web Vitals. Szybkie ładowanie to lepszy UX i wyższe pozycje w Google.",
  },
  {
    icon: Palette,
    title: "Nowoczesny design",
    description: "Implementuję responsywne, estetyczne interfejsy z dbałością o każdy detal. React i Tailwind to moje codzienne narzędzia.",
  },
  {
    icon: Users,
    title: "Współpraca z ekspertami",
    description: "Przy większych projektach współpracuję z zaufanym partnerem backendowym i UI/UX designerem. Razem dostarczamy kompletne rozwiązania.",
  },
  {
    icon: Clock,
    title: "Terminowość",
    description: "Szanuję Twój czas. Ustalam realistyczne terminy i dotrzymuję ich. Regularna komunikacja na każdym etapie projektu.",
  },
  {
    icon: Shield,
    title: "Wsparcie po wdrożeniu",
    description: "Nie zostawiam klientów po zakończeniu projektu. Oferuję wsparcie techniczne, aktualizacje i pomoc w rozwoju.",
  },
];

const stats = [
  { value: "7+", label: "Lat doświadczenia", description: "w web developmencie" },
  { value: "4", label: "Zrealizowane projekty", description: "dla różnych branż" },
  { value: "4", label: "Zadowolonych klientów", description: "którzy polecają moje usługi" },
  { value: "2020", label: "Rok założenia", description: "CodeFix.IT" },
];

export function WhyUs() {
  return (
    <section id="why-us" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Dlaczego ja?
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Tworzę z <span className="text-red-600">pasją</span> i precyzją
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Frontend to moja specjalizacja. Łączę techniczne umiejętności z dbałością
            o UX, aby dostarczać projekty, które nie tylko wyglądają świetnie, ale też świetnie działają.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group p-6 bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl border border-white/[0.05] hover:border-red-600/30 transition-all duration-300 text-center"
            >
              <div className="absolute inset-0 bg-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-red-500 font-semibold mb-1">{stat.label}</div>
                <div className="text-gray-500 text-sm">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -10 }}
              className="group relative p-6 lg:p-8 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/[0.05] hover:border-red-600/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 mb-6 rounded-xl bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 group-hover:scale-110 transition-all duration-300">
                <reason.icon className="w-7 h-7 text-red-500" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-red-500 transition-colors duration-300">
                {reason.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {reason.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Partnership Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-2xl border border-blue-500/20"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center lg:text-left flex-grow">
              <h3 className="text-xl font-bold mb-2">Model współpracy z partnerami</h3>
              <p className="text-gray-400">
                Przy projektach wymagających backendu lub profesjonalnego designu współpracuję z zaufanymi partnerami.
                Dzięki temu mogę oferować kompletne rozwiązania full-stack, zachowując najwyższą jakość w każdym aspekcie projektu.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 mx-auto">
                  <Code2 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm text-gray-400">Backend</div>
                <div className="text-xs text-blue-400 font-medium">BackPartner</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2 mx-auto">
                  <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-sm text-gray-400">UI/UX</div>
                <div className="text-xs text-purple-400 font-medium">DesignPartner</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Bezpłatna wstępna konsultacja dla każdego projektu
          </p>
          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
          >
            Porozmawiajmy o Twoim projekcie
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
