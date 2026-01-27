import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
}

const articles: Article[] = [
  {
    id: '1',
    title: 'React 19 - Wszystko co musisz wiedzieć',
    excerpt: 'Nowa wersja React przynosi rewolucyjne zmiany w sposobie budowania aplikacji. Poznaj Server Components, Actions i więcej.',
    content: `React 19 to największa aktualizacja od lat. Wprowadza Server Components jako stabilną funkcję, nowe API Actions do obsługi formularzy, oraz znaczące usprawnienia wydajności.

## Server Components
Server Components pozwalają na renderowanie komponentów po stronie serwera, co znacząco zmniejsza rozmiar bundle'a JavaScript wysyłanego do klienta.

## Actions
Nowe API Actions upraszcza obsługę formularzy i mutacji danych. Zamiast manualnie zarządzać stanami loading/error, React robi to automatycznie.

## Compiler
React Compiler (wcześniej React Forget) automatycznie optymalizuje re-rendery, eliminując potrzebę ręcznego stosowania useMemo i useCallback.`,
    category: 'React',
    date: '2024-01-15',
    readTime: '8 min',
    image: '⚛️',
    author: { name: 'CodeFix Team', avatar: '👨‍💻' },
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    id: '2',
    title: 'Next.js 15 vs Remix - Porównanie frameworków',
    excerpt: 'Który framework full-stack wybrać w 2024? Szczegółowe porównanie Next.js 15 i Remix pod kątem wydajności i DX.',
    content: `Wybór między Next.js a Remix to jedno z najczęstszych dylematów współczesnych developerów React. Oba frameworki oferują świetne rozwiązania, ale mają różne filozofie.

## Next.js 15
- App Router jako domyślny
- Server Actions
- Partial Prerendering
- Turbopack (stabilny)

## Remix
- Nested routing
- Progressive enhancement
- Form handling
- Error boundaries

## Werdykt
Next.js lepszy dla dużych projektów i ekosystemu Vercel. Remix świetny dla projektów wymagających doskonałej obsługi formularzy i progresywnego ulepszania.`,
    category: 'Frameworks',
    date: '2024-01-10',
    readTime: '12 min',
    image: '🔥',
    author: { name: 'CodeFix Team', avatar: '👨‍💻' },
    tags: ['Next.js', 'Remix', 'Fullstack'],
  },
  {
    id: '3',
    title: 'Tailwind CSS v4 - Nowe możliwości',
    excerpt: 'Tailwind CSS v4 przynosi Oxide engine, CSS-first configuration i znacznie szybszą kompilację.',
    content: `Tailwind CSS v4 to kompletna rewrite biblioteki z naciskiem na wydajność i nowoczesne standardy CSS.

## Oxide Engine
Nowy silnik napisany w Rust oferuje do 10x szybszą kompilację w porównaniu do v3.

## CSS-first Configuration
Zamiast pliku tailwind.config.js, konfiguracja odbywa się bezpośrednio w CSS używając @theme directive.

## Nowości
- Container queries wbudowane
- 3D transforms
- Nowe gradienty
- Lepsze wsparcie dla ciemnego motywu`,
    category: 'CSS',
    date: '2024-01-05',
    readTime: '6 min',
    image: '🎨',
    author: { name: 'CodeFix Team', avatar: '👨‍💻' },
    tags: ['Tailwind', 'CSS', 'Styling'],
  },
  {
    id: '4',
    title: 'TypeScript 5.4 - Nowości i ulepszenia',
    excerpt: 'Najnowsza wersja TypeScript wprowadza narrowing w closures, NoInfer utility type i więcej.',
    content: `TypeScript 5.4 kontynuuje tradycję ulepszania systemu typów i doświadczenia developerskiego.

## Closure Narrowing
TypeScript teraz poprawnie zawęża typy wewnątrz closures, eliminując wiele fałszywych alarmów.

## NoInfer Utility Type
Nowy typ utility pozwala kontrolować, które parametry generyczne mają być inferowane.

## Ulepszenia wydajności
- Szybszy incremental build
- Mniejsze zużycie pamięci
- Lepsze wsparcie dla monorepo`,
    category: 'TypeScript',
    date: '2024-01-01',
    readTime: '5 min',
    image: '🔷',
    author: { name: 'CodeFix Team', avatar: '👨‍💻' },
    tags: ['TypeScript', 'JavaScript', 'Types'],
  },
  {
    id: '5',
    title: 'Architektura mikrofrontendów w praktyce',
    excerpt: 'Jak skutecznie wdrożyć mikrofrontendy? Omówienie Module Federation, single-spa i innych podejść.',
    content: `Mikrofrontendy to architektura pozwalająca na niezależne wdrażanie części aplikacji frontendowej przez różne zespoły.

## Module Federation
Webpack 5 Module Federation to najpopularniejsze rozwiązanie, pozwalające na dynamiczne ładowanie kodu z różnych buildów.

## Single-spa
Framework do orkiestracji wielu aplikacji na jednej stronie. Wspiera React, Vue, Angular i inne.

## Kiedy używać?
- Duże zespoły (5+ developerów)
- Niezależne release cycle'e
- Legacy migration`,
    category: 'Architektura',
    date: '2023-12-28',
    readTime: '15 min',
    image: '🏗️',
    author: { name: 'CodeFix Team', avatar: '👨‍💻' },
    tags: ['Architecture', 'Microfrontends', 'Webpack'],
  },
  {
    id: '6',
    title: 'AI w web development - narzędzia 2024',
    excerpt: 'Przegląd narzędzi AI dla web developerów: GitHub Copilot, Cursor, v0, Claude i więcej.',
    content: `AI rewolucjonizuje sposób, w jaki tworzymy aplikacje webowe. Oto przegląd najlepszych narzędzi w 2024.

## GitHub Copilot
Wciąż lider rynku z integracją w VS Code, JetBrains i Neovim. Copilot Chat dodaje możliwość konwersacji.

## Cursor
IDE oparte na VS Code z natywną integracją AI. Świetne do refaktoringu i generowania kodu.

## v0 by Vercel
Generowanie komponentów UI na podstawie opisu tekstowego. Idealne dla prototypowania.

## Claude (Anthropic)
Świetny do code review, dokumentacji i rozwiązywania złożonych problemów architektonicznych.`,
    category: 'AI',
    date: '2023-12-20',
    readTime: '10 min',
    image: '🤖',
    author: { name: 'CodeFix Team', avatar: '👨‍💻' },
    tags: ['AI', 'Tools', 'Productivity'],
  },
];

const categories = ['Wszystkie', 'React', 'Frameworks', 'CSS', 'TypeScript', 'Architektura', 'AI'];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = selectedCategory === 'Wszystkie'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <section id="blog" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-medium mb-4">
            <span className="text-lg">📝</span>
            Tech Insights
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Blog <span className="text-red-500">technologiczny</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Artykuły, tutoriale i przemyślenia na temat nowoczesnego web developmentu.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedArticle(article)}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-zinc-700 transition-all"
              >
                {/* Image/Icon */}
                <div className="h-40 bg-gradient-to-br from-red-500/20 to-zinc-900 flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform">{article.image}</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      {article.category}
                    </span>
                    <span className="text-zinc-600 text-xs">{article.readTime}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{article.author.avatar}</span>
                      <span className="text-zinc-500 text-xs">{article.author.name}</span>
                    </div>
                    <span className="text-zinc-600 text-xs">{article.date}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 border border-zinc-700 text-zinc-300 rounded-full hover:bg-zinc-800 transition-all inline-flex items-center gap-2">
            Zobacz więcej artykułów
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
              onClick={() => setSelectedArticle(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-zinc-900 border border-zinc-800 rounded-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedArticle.image}</span>
                  <div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      {selectedArticle.category}
                    </span>
                    <span className="text-zinc-500 text-xs ml-2">{selectedArticle.readTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-12">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                    {selectedArticle.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedArticle.author.avatar}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{selectedArticle.author.name}</p>
                        <p className="text-zinc-500 text-xs">{selectedArticle.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      {selectedArticle.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="prose prose-invert prose-lg max-w-none">
                    {selectedArticle.content.split('\n\n').map((paragraph, i) => {
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      return (
                        <p key={i} className="text-zinc-300 mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* Share */}
                  <div className="flex items-center justify-between mt-12 pt-8 border-t border-zinc-800">
                    <span className="text-zinc-500">Udostępnij artykuł:</span>
                    <div className="flex gap-2">
                      {['Twitter', 'LinkedIn', 'Facebook'].map(social => (
                        <button
                          key={social}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                        >
                          {social}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
