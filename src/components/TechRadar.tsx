import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Technology {
  name: string;
  category: 'adopt' | 'trial' | 'assess' | 'hold';
  quadrant: 'languages' | 'frameworks' | 'tools' | 'platforms';
  description: string;
  icon: string;
}

const technologies: Technology[] = [
  // Adopt - Actively recommended
  { name: 'TypeScript', category: 'adopt', quadrant: 'languages', description: 'Typowany JavaScript dla większych projektów', icon: '🔷' },
  { name: 'React', category: 'adopt', quadrant: 'frameworks', description: 'Główna biblioteka do UI', icon: '⚛️' },
  { name: 'Next.js', category: 'adopt', quadrant: 'frameworks', description: 'Framework React z SSR/SSG', icon: '▲' },
  { name: 'Tailwind CSS', category: 'adopt', quadrant: 'frameworks', description: 'Utility-first CSS framework', icon: '🎨' },
  { name: 'Node.js', category: 'adopt', quadrant: 'platforms', description: 'Runtime JavaScript na serwerze', icon: '🟢' },
  { name: 'Git', category: 'adopt', quadrant: 'tools', description: 'System kontroli wersji', icon: '📦' },
  { name: 'Docker', category: 'adopt', quadrant: 'tools', description: 'Konteneryzacja aplikacji', icon: '🐳' },
  { name: 'PostgreSQL', category: 'adopt', quadrant: 'platforms', description: 'Relacyjna baza danych', icon: '🐘' },
  
  // Trial - Worth trying
  { name: 'Rust', category: 'trial', quadrant: 'languages', description: 'Język systemowy z bezpieczeństwem pamięci', icon: '🦀' },
  { name: 'Bun', category: 'trial', quadrant: 'platforms', description: 'Szybki runtime JavaScript', icon: '🍞' },
  { name: 'tRPC', category: 'trial', quadrant: 'frameworks', description: 'End-to-end typesafe API', icon: '🔗' },
  { name: 'Prisma', category: 'trial', quadrant: 'tools', description: 'Next-gen ORM dla Node.js', icon: '◮' },
  { name: 'Turborepo', category: 'trial', quadrant: 'tools', description: 'High-performance monorepo', icon: '⚡' },
  { name: 'Astro', category: 'trial', quadrant: 'frameworks', description: 'Framework dla content-driven sites', icon: '🚀' },
  { name: 'SvelteKit', category: 'trial', quadrant: 'frameworks', description: 'Framework full-stack Svelte', icon: '🧡' },
  
  // Assess - Exploring
  { name: 'Go', category: 'assess', quadrant: 'languages', description: 'Język do systemów rozproszonych', icon: '🐹' },
  { name: 'Deno', category: 'assess', quadrant: 'platforms', description: 'Secure runtime dla JS/TS', icon: '🦕' },
  { name: 'Qwik', category: 'assess', quadrant: 'frameworks', description: 'Resumable framework', icon: '⚡' },
  { name: 'Tauri', category: 'assess', quadrant: 'frameworks', description: 'Alternatywa dla Electron', icon: '🖥️' },
  { name: 'EdgeDB', category: 'assess', quadrant: 'platforms', description: 'Nowoczesna baza grafowa', icon: '📊' },
  
  // Hold - Use with caution
  { name: 'jQuery', category: 'hold', quadrant: 'frameworks', description: 'Legacy - używaj w starych projektach', icon: '📜' },
  { name: 'Webpack', category: 'hold', quadrant: 'tools', description: 'Rozważ Vite lub esbuild', icon: '📦' },
  { name: 'Create React App', category: 'hold', quadrant: 'tools', description: 'Używaj Vite lub Next.js', icon: '⚠️' },
];

const categories = {
  adopt: { label: 'Adopt', color: 'bg-green-500', description: 'Aktywnie rekomendowane' },
  trial: { label: 'Trial', color: 'bg-blue-500', description: 'Warte wypróbowania' },
  assess: { label: 'Assess', color: 'bg-yellow-500', description: 'W fazie eksploracji' },
  hold: { label: 'Hold', color: 'bg-red-500', description: 'Używaj ostrożnie' },
};

const quadrants = {
  languages: { label: 'Języki', icon: '💻' },
  frameworks: { label: 'Frameworks', icon: '🏗️' },
  tools: { label: 'Narzędzia', icon: '🔧' },
  platforms: { label: 'Platformy', icon: '☁️' },
};

export default function TechRadar() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);

  const filteredTech = technologies.filter(tech => {
    if (selectedCategory && tech.category !== selectedCategory) return false;
    if (selectedQuadrant && tech.quadrant !== selectedQuadrant) return false;
    return true;
  });

  const getCategoryPosition = (category: string, index: number, total: number) => {
    const rings = { adopt: 0.2, trial: 0.4, assess: 0.6, hold: 0.8 };
    const ring = rings[category as keyof typeof rings];
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const jitter = (Math.random() - 0.5) * 0.1;
    
    return {
      x: 50 + (ring + jitter) * 45 * Math.cos(angle),
      y: 50 + (ring + jitter) * 45 * Math.sin(angle),
    };
  };

  return (
    <section id="tech-radar" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-medium mb-4">
            <span className="text-lg">📡</span>
            Technology Radar
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Nasz <span className="text-red-500">Tech Radar</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Interaktywny przegląd technologii, które używamy i obserwujemy.
            Kliknij na technologię, aby zobaczyć szczegóły.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? `${value.color} text-white`
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${value.color}`} />
                {value.label}
              </button>
            ))}
          </div>
          
          <div className="w-px h-8 bg-zinc-700 hidden md:block" />
          
          {/* Quadrant filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(quadrants).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedQuadrant(selectedQuadrant === key ? null : key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedQuadrant === key
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{value.icon}</span>
                {value.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Radar Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square max-w-lg mx-auto w-full"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Rings */}
              {[0.8, 0.6, 0.4, 0.2].map((r, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={r * 45}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.3"
                />
              ))}
              
              {/* Quadrant lines */}
              <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
              
              {/* Ring labels */}
              <text x="50" y="12" textAnchor="middle" className="fill-zinc-600 text-[3px]">HOLD</text>
              <text x="50" y="22" textAnchor="middle" className="fill-zinc-600 text-[3px]">ASSESS</text>
              <text x="50" y="32" textAnchor="middle" className="fill-zinc-600 text-[3px]">TRIAL</text>
              <text x="50" y="42" textAnchor="middle" className="fill-zinc-600 text-[3px]">ADOPT</text>
              
              {/* Technology dots */}
              {filteredTech.map((tech, i) => {
                const categoryTech = filteredTech.filter(t => t.category === tech.category);
                const indexInCategory = categoryTech.indexOf(tech);
                const pos = getCategoryPosition(tech.category, indexInCategory, categoryTech.length);
                const color = categories[tech.category].color.replace('bg-', '');
                
                return (
                  <g key={tech.name}>
                    <motion.circle
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      cx={pos.x}
                      cy={pos.y}
                      r={hoveredTech?.name === tech.name ? 3 : 2}
                      className={`cursor-pointer transition-all ${
                        color === 'green-500' ? 'fill-green-500' :
                        color === 'blue-500' ? 'fill-blue-500' :
                        color === 'yellow-500' ? 'fill-yellow-500' :
                        'fill-red-500'
                      }`}
                      onMouseEnter={() => setHoveredTech(tech)}
                      onMouseLeave={() => setHoveredTech(null)}
                    />
                    {hoveredTech?.name === tech.name && (
                      <text
                        x={pos.x}
                        y={pos.y - 4}
                        textAnchor="middle"
                        className="fill-white text-[2.5px] font-medium pointer-events-none"
                      >
                        {tech.name}
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Center */}
              <circle cx="50" cy="50" r="3" className="fill-red-500" />
              <text x="50" y="51" textAnchor="middle" className="fill-white text-[2px] font-bold">CF</text>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
              {Object.entries(categories).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${value.color}`} />
                  <span className="text-zinc-500">{value.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Technology List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span>
                Lista technologii
                <span className="ml-auto text-sm text-zinc-500">{filteredTech.length} pozycji</span>
              </h3>
              
              <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {filteredTech.map((tech) => (
                    <motion.div
                      key={tech.name}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border transition-all cursor-pointer ${
                        hoveredTech?.name === tech.name
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-transparent hover:border-zinc-700'
                      }`}
                      onMouseEnter={() => setHoveredTech(tech)}
                      onMouseLeave={() => setHoveredTech(null)}
                    >
                      <span className="text-xl">{tech.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm">{tech.name}</h4>
                        <p className="text-zinc-500 text-xs truncate">{tech.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${categories[tech.category].color}`} />
                        <span className="text-xs text-zinc-400">{quadrants[tech.quadrant].icon}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Hovered Tech Details */}
            <AnimatePresence>
              {hoveredTech && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{hoveredTech.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{hoveredTech.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${categories[hoveredTech.category].color} text-white`}>
                          {categories[hoveredTech.category].label}
                        </span>
                        <span className="text-zinc-500 text-xs">
                          {quadrants[hoveredTech.quadrant].icon} {quadrants[hoveredTech.quadrant].label}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mt-2">{hoveredTech.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
