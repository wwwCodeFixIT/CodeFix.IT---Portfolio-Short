import { motion } from "framer-motion";
import { services } from "@/data/services";
import { ArrowUpRight, Users, Star } from "lucide-react";

export function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Separate primary (specialization) services from others
  const primaryServices = services.filter(s => s.isPrimary);
  const otherServices = services.filter(s => !s.isPrimary);

  return (
    <section id="services" className="relative py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Co oferuję
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Moje <span className="text-red-600">usługi</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Specjalizuję się w tworzeniu frontend'u - interfejsów użytkownika, stron i aplikacji webowych.
            Przy większych projektach współpracuję z zaufanym partnerem backendowym.
          </p>
        </motion.div>

        {/* Frontend Specialist Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600/10 to-red-600/5 border border-red-600/20 rounded-full">
            <Star className="w-5 h-5 text-red-500" />
            <span className="text-white font-medium">Frontend Developer</span>
            <span className="w-px h-5 bg-white/20" />
            <span className="text-gray-400 text-sm">React • Next.js • TypeScript • Tailwind</span>
          </div>
        </motion.div>

        {/* Primary Services - Specialization */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {primaryServices.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-gradient-to-b from-red-600/10 to-red-600/[0.02] border border-red-600/20 rounded-2xl p-8 hover:border-red-600/40 transition-all duration-500"
              >
                {/* Badge */}
                {service.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                    {service.badge}
                  </div>
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-red-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600/30 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-red-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-red-500 transition-colors duration-300 flex items-center gap-2">
                    {service.title}
                    <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed text-lg">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="grid grid-cols-2 gap-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="w-2 h-2 bg-red-600 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Other Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {otherServices.map((service) => {
            const Icon = service.icon;
            const isCollaboration = service.badge === "Współpraca";
            const isDesignPartner = service.badgeType === 'design';
            const isBackendPartner = service.badgeType === 'backend';
            
            // Define colors based on badge type
            const getBadgeColors = () => {
              if (isDesignPartner) return 'bg-purple-600/20 text-purple-400 border border-purple-500/30';
              if (isBackendPartner) return 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
              return 'bg-red-600 text-white';
            };
            
            const getIconBgColors = () => {
              if (isDesignPartner) return 'bg-purple-600/10 group-hover:bg-purple-600/20';
              if (isBackendPartner) return 'bg-blue-600/10 group-hover:bg-blue-600/20';
              return 'bg-red-600/10 group-hover:bg-red-600/20';
            };
            
            const getIconColor = () => {
              if (isDesignPartner) return 'text-purple-500';
              if (isBackendPartner) return 'text-blue-500';
              return 'text-red-600';
            };
            
            const getDotColor = () => {
              if (isDesignPartner) return 'bg-purple-500';
              if (isBackendPartner) return 'bg-blue-500';
              return 'bg-red-600';
            };
            
            const getBorderColor = () => {
              if (isDesignPartner) return 'border-purple-500/20';
              if (isBackendPartner) return 'border-blue-500/20';
              return 'border-white/[0.05]';
            };
            
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative bg-gradient-to-b from-white/[0.05] to-transparent border rounded-2xl p-8 hover:border-red-600/30 transition-all duration-500 ${getBorderColor()}`}
              >
                {/* Badge */}
                {service.badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${getBadgeColors()}`}>
                    {isCollaboration && <Users className="w-3 h-3" />}
                    {service.badge}
                  </div>
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 ${getIconBgColors()}`}>
                    <Icon className={`w-7 h-7 ${getIconColor()}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-red-500 transition-colors duration-300 flex items-center gap-2">
                    {service.title}
                    <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Partnership Info - Both Backend and Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Kompleksowa obsługa dzięki <span className="text-red-500">zaufanym partnerom</span>
            </h3>
            <p className="text-gray-400">
              Jako Frontend Developer specjalizuję się w interfejsach, ale dzięki współpracy z ekspertami mogę zaoferować więcej
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backend Partner */}
            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">Partner Backend</h4>
                    <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 text-xs font-medium rounded-full">
                      Full-Stack
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Doświadczony Backend Developer z którym współpracuję przy projektach wymagających API, baz danych i autoryzacji.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded">Node.js</span>
                    <span className="px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded">NestJS</span>
                    <span className="px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded">PostgreSQL</span>
                    <span className="px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded">Docker</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Partner */}
            <div className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎨</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">Partner UI/UX</h4>
                    <span className="px-2 py-0.5 bg-purple-600/30 text-purple-400 text-xs font-medium rounded-full">
                      Design
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Doświadczony grafik/designer z którym współpracuję przy projektach wymagających profesjonalnego UX/UI.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-600/10 text-purple-400 text-xs rounded">Figma</span>
                    <span className="px-2 py-1 bg-purple-600/10 text-purple-400 text-xs rounded">UI/UX</span>
                    <span className="px-2 py-1 bg-purple-600/10 text-purple-400 text-xs rounded">Prototypy</span>
                    <span className="px-2 py-1 bg-purple-600/10 text-purple-400 text-xs rounded">Branding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <button 
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-600/40"
            >
              <Users className="w-5 h-5" />
              Zapytaj o kompleksowy projekt
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
