import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  category: string;
  thumbnail: string;
  url: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  duration: string;
  year: number;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'emair',
    title: 'eM-aiR System',
    client: 'Firma klimatyzacyjna',
    category: 'Strona firmowa',
    thumbnail: '🏢',
    url: 'https://em-airsystem.pl',
    challenge: 'Klient miał przestarzałą stronę, która nie oddawała profesjonalizmu firmy. Strona była wolna, nieresponsywna i trudna w nawigacji. Potrzebowali kompleksowej przebudowy, która zwiększy konwersję i zaufanie klientów.',
    solution: 'Zaprojektowałem i zbudowałem całkowicie nową stronę od podstaw. Użyłem WordPress z własnym motywem opartym na ACF Pro dla łatwej edycji treści. Zoptymalizowałem wydajność i SEO, dodałem nowoczesne animacje i przejrzysty układ prezentujący usługi.',
    results: [
      '↑ 60% wzrost ruchu organicznego',
      '↑ 40% więcej zapytań ofertowych',
      '↓ 70% szybsze ładowanie strony',
      '✓ Pełna responsywność na wszystkich urządzeniach',
    ],
    technologies: ['WordPress', 'PHP', 'ACF Pro', 'JavaScript', 'CSS3', 'SEO'],
    duration: '4 tygodnie',
    year: 2023,
  },
  {
    id: 'rzeczoznawca',
    title: 'Rzeczoznawca Marcin Dudek',
    client: 'Rzeczoznawca samochodowy',
    category: 'Strona wizytówka',
    thumbnail: '🚗',
    url: 'https://rzeczoznawcamarcindudek.pl',
    challenge: 'Klient nie posiadał żadnej strony internetowej i tracił potencjalnych klientów szukających rzeczoznawcy w Google. Potrzebował profesjonalnej wizytówki online z możliwością łatwego kontaktu.',
    solution: 'Stworzyłem nowoczesną stronę wizytówkę od zera, najpierw jako statyczny HTML/CSS/JS, następnie przekonwertowałem na WordPress dla łatwej edycji. Zintegrowałem Google Analytics i zoptymalizowałem pod lokalne SEO.',
    results: [
      '✓ Pierwsza strona w Google na lokalne frazy',
      '↑ 25+ zapytań miesięcznie przez stronę',
      '✓ Profesjonalny wizerunek online',
      '✓ Łatwa edycja treści przez klienta',
    ],
    technologies: ['WordPress', 'HTML5', 'CSS3', 'JavaScript', 'PHP', 'ACF Pro', 'Google Analytics'],
    duration: '3 tygodnie',
    year: 2023,
  },
  {
    id: 'kancelaria',
    title: 'Kancelaria Adwokacka Witkowska',
    client: 'Kancelaria prawnicza',
    category: 'Strona firmowa',
    thumbnail: '⚖️',
    url: 'https://adwokatwitkowska.com',
    challenge: 'Projekt zlecony przez SyloSoftware. Kancelaria potrzebowała eleganckiej, profesjonalnej strony budującej zaufanie potencjalnych klientów. Ważna była prezentacja specjalizacji i łatwy kontakt.',
    solution: 'Zbudowałem stronę w WordPress z Elementorem i ACF Pro. Stworzyłem custom post types dla specjalizacji i publikacji prawniczych. Zadbałem o elegancki design pasujący do branży prawniczej.',
    results: [
      '✓ Elegancki, profesjonalny design',
      '✓ System zarządzania treścią',
      '✓ Optymalizacja SEO dla branży prawniczej',
      '✓ Szybki czas realizacji',
    ],
    technologies: ['WordPress', 'Elementor', 'ACF Pro', 'PHP', 'CSS3', 'JavaScript'],
    duration: '2 tygodnie',
    year: 2024,
  },
];

export const CaseStudies = () => {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);

  return (
    <section id="case-studies" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900/50" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-medium mb-4">
            📊 Case Studies
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Szczegółowe analizy projektów
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Zobacz dokładnie jak podchodzę do projektów - od wyzwania, przez rozwiązanie, po wymierne rezultaty
          </p>
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => setSelectedStudy(study)}
                whileHover={{ y: -5 }}
                className="w-full text-left bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-red-500/30 transition-all group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {study.thumbnail}
                </div>
                
                {/* Category */}
                <span className="text-xs text-red-500 font-medium uppercase tracking-wider">
                  {study.category}
                </span>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mt-2 mb-2 group-hover:text-red-500 transition-colors">
                  {study.title}
                </h3>
                
                {/* Client */}
                <p className="text-sm text-zinc-400 mb-4">
                  {study.client}
                </p>
                
                {/* Technologies preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {study.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-zinc-800/50 text-zinc-400 text-xs rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {study.technologies.length > 3 && (
                    <span className="px-2 py-1 text-zinc-500 text-xs">
                      +{study.technologies.length - 3}
                    </span>
                  )}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <span className="text-sm text-zinc-500">{study.year}</span>
                  <span className="text-sm text-red-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Zobacz case study →
                  </span>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedStudy(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 flex items-center justify-center text-2xl">
                    {selectedStudy.thumbnail}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedStudy.title}</h3>
                    <p className="text-sm text-zinc-400">{selectedStudy.client}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudy(null)}
                  className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Meta info */}
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-zinc-800/50 rounded-lg">
                    <span className="text-xs text-zinc-500">Czas realizacji</span>
                    <p className="text-white font-medium">{selectedStudy.duration}</p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-800/50 rounded-lg">
                    <span className="text-xs text-zinc-500">Rok</span>
                    <p className="text-white font-medium">{selectedStudy.year}</p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-800/50 rounded-lg">
                    <span className="text-xs text-zinc-500">Kategoria</span>
                    <p className="text-white font-medium">{selectedStudy.category}</p>
                  </div>
                </div>

                {/* Challenge */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-red-500">🎯</span> Wyzwanie
                  </h4>
                  <p className="text-zinc-300 leading-relaxed">{selectedStudy.challenge}</p>
                </div>

                {/* Solution */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-green-500">💡</span> Rozwiązanie
                  </h4>
                  <p className="text-zinc-300 leading-relaxed">{selectedStudy.solution}</p>
                </div>

                {/* Results */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-blue-500">📈</span> Rezultaty
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {selectedStudy.results.map((result, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-zinc-300 bg-zinc-800/30 p-3 rounded-lg"
                      >
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-purple-500">🛠️</span> Technologie
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudy.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-zinc-800">
                  <a
                    href={selectedStudy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all inline-flex items-center gap-2"
                  >
                    <span>Zobacz stronę</span>
                    <span>↗</span>
                  </a>
                  <a
                    href="#kontakt"
                    onClick={() => setSelectedStudy(null)}
                    className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-all"
                  >
                    Chcę podobny projekt
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
