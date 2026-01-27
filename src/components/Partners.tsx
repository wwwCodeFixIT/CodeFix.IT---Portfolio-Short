import { motion } from "framer-motion";

const partners = [
  { 
    name: "TechStart", 
    logo: "🚀",
    description: "Startup technologiczny"
  },
  { 
    name: "FinanceApp", 
    logo: "💰",
    description: "Fintech"
  },
  { 
    name: "BrandHouse", 
    logo: "🏠",
    description: "Agencja brandingowa"
  },
  { 
    name: "FitLife", 
    logo: "💪",
    description: "Fitness & Wellness"
  },
  { 
    name: "MediaGroup", 
    logo: "📺",
    description: "Media & Entertainment"
  },
  { 
    name: "CloudSync", 
    logo: "☁️",
    description: "Cloud Solutions"
  },
  { 
    name: "GreenEnergy", 
    logo: "🌱",
    description: "Energie odnawialne"
  },
  { 
    name: "DataFlow", 
    logo: "📊",
    description: "Big Data & Analytics"
  }
];

export function Partners() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-red-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Zaufali nam
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Nasi <span className="text-red-600">partnerzy</span>
          </h2>
          <p className="max-w-xl mx-auto text-gray-400 text-lg">
            Współpracujemy z firmami różnych branż, dostarczając im 
            najwyższej jakości rozwiązania cyfrowe.
          </p>
        </motion.div>

        {/* Partners Marquee - First Row */}
        <div className="relative mb-8">
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: [0, -1920] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex gap-8 pr-8"
            >
              {[...partners, ...partners, ...partners].map((partner, index) => (
                <motion.div
                  key={`${partner.name}-${index}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex-shrink-0 group"
                >
                  <div className="flex items-center gap-4 px-8 py-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:border-red-600/30 hover:bg-white/[0.05] transition-all duration-300 min-w-[240px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {partner.logo}
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-red-500 transition-colors">
                        {partner.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {partner.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        </div>

        {/* Partners Marquee - Second Row (reverse) */}
        <div className="relative">
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: [-1920, 0] }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="flex gap-8 pr-8"
            >
              {[...partners.slice().reverse(), ...partners.slice().reverse(), ...partners.slice().reverse()].map((partner, index) => (
                <motion.div
                  key={`${partner.name}-rev-${index}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex-shrink-0 group"
                >
                  <div className="flex items-center gap-4 px-8 py-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:border-red-600/30 hover:bg-white/[0.05] transition-all duration-300 min-w-[240px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {partner.logo}
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-red-500 transition-colors">
                        {partner.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {partner.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-12 mt-16 pt-12 border-t border-white/5"
        >
          {[
            { value: "50+", label: "Zadowolonych klientów" },
            { value: "120+", label: "Zrealizowanych projektów" },
            { value: "8", label: "Branż obsłużonych" },
            { value: "5+", label: "Lat współpracy" }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
