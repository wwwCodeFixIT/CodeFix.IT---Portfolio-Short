import { motion } from "framer-motion";
import { ArrowUpRight, Github, Mail, Phone, MapPin, Heart, ArrowUp } from "lucide-react";

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export function Footer({ onOpenPrivacy, onOpenTerms }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    services: [
      { name: "Strony internetowe", href: "#services" },
      { name: "Aplikacje React", href: "#services" },
      { name: "WordPress", href: "#services" },
      { name: "Optymalizacja", href: "#services" },
    ],
    company: [
      { name: "O mnie", href: "#why-us" },
      { name: "Portfolio", href: "#portfolio" },
      { name: "Technologie", href: "#technologies" },
      { name: "Kontakt", href: "#contact" },
    ],
    resources: [
      { name: "Kalkulator wyceny", href: "#estimator" },
      { name: "Status usług", href: "#status" },
      { name: "FAQ", href: "#faq" },
      { name: "Blog", href: "#blog" },
    ],
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black border-t border-white/[0.05]">
      {/* CTA Section */}
      <div className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            Gotowy na <span className="text-red-600">nowy projekt</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto"
          >
            Skontaktuj się ze mną, a wspólnie stworzymy coś wyjątkowego.
            Bezpłatna wstępna konsultacja dla każdego projektu.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              Rozpocznij projekt
              <ArrowUpRight size={20} />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Zobacz moje projekty
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }} className="inline-block mb-6">
              <span className="text-2xl font-bold">
                Code<span className="text-red-600">Fix</span>.IT
              </span>
            </a>
            <p className="text-gray-400 mb-6 max-w-sm">
              Frontend Developer specjalizujący się w React, Next.js i TypeScript.
              Tworzę nowoczesne strony i aplikacje webowe z pasją do czystego kodu.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:wwwcodefixit@gmail.com" 
                className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Mail size={18} />
                <span>wwwcodefixit@gmail.com</span>
              </a>
              <a 
                href="tel:+48883667943" 
                className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Phone size={18} />
                <span>+48 883 667 943</span>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin size={18} />
                <span>Warszawa, Polska</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <motion.a
                href="https://github.com/wwwCodeFixIT"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all"
              >
                <Github size={20} />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Usługi</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">O mnie</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Narzędzia</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.05]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 text-sm">
              <span>© 2020-{currentYear} CodeFix.IT. Wszelkie prawa zastrzeżone.</span>
              <button 
                onClick={onOpenPrivacy}
                className="hover:text-red-500 transition-colors"
              >
                Polityka prywatności
              </button>
              <button 
                onClick={onOpenTerms}
                className="hover:text-red-500 transition-colors"
              >
                Regulamin
              </button>
            </div>

            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <span>Stworzone z</span>
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>przez Patryka</span>
            </div>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-600/50 transition-all"
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
