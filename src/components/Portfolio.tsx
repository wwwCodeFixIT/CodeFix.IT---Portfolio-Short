import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Users, TrendingUp, ArrowRight } from "lucide-react";
import { projects, projectCategories, type Project } from "@/data/projects";
import { ProjectModal } from "./ProjectModal";
import { useLanguage } from "../context/LanguageContext";

export function Portfolio() {
  const { language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projects;
    return projects.filter(project => project.category === activeCategory);
  }, [activeCategory]);

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  return (
    <>
      <section id="portfolio" className="relative py-24 lg:py-32 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-32 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
              {language === 'pl' ? 'Case Studies' : 'Case Studies'}
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {language === 'pl' ? 'Projekty z ' : 'Projects with '}
              <span className="text-red-600">
                {language === 'pl' ? 'wynikami' : 'results'}
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg">
              {language === 'pl' 
                ? 'Nie tylko ładne strony - realne efekty dla biznesu. Zobacz jak pomogłem moim klientom.'
                : "Not just pretty websites - real business results. See how I helped my clients."}
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {projectCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setShowAll(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-red-600/30 hover:text-white"
                }`}
              >
                {category.name}
                {category.id !== "all" && (
                  <span className="ml-2 text-xs opacity-60">
                    ({category.count})
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            layout
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {displayedProjects.map((project, index) => (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => openProject(project)}
                  className="group relative cursor-pointer"
                >
                  {/* Card */}
                  <div className="relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.05] rounded-2xl overflow-hidden hover:border-red-600/30 transition-all duration-500">
                    {/* Top Section: Image + Quick Info */}
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80 md:block hidden" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent md:hidden" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {project.featured && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 rounded text-white text-xs font-medium">
                              <Star size={12} className="fill-current" />
                            </div>
                          )}
                          {project.collaboration && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/90 rounded text-white text-xs font-medium">
                              <Users size={12} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors duration-300">
                              {project.title}
                            </h3>
                            {project.client && (
                              <p className="text-red-500/80 text-sm font-medium">
                                {project.client}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-zinc-800 text-gray-400 text-xs rounded">
                            {project.year}
                          </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {project.shortDescription}
                        </p>

                        {/* Case Study Results - KLUCZOWE! */}
                        {project.caseStudy && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {project.caseStudy.results.slice(0, 4).map((result, i) => (
                              <div 
                                key={i}
                                className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                              >
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                  <TrendingUp size={10} className="text-green-500" />
                                  {result.metric}
                                </div>
                                <div className="text-sm font-semibold text-white">
                                  {result.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-2 py-0.5 bg-red-600/10 text-red-500 text-xs rounded font-medium">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-red-500 text-sm font-medium group-hover:gap-3 transition-all">
                          {language === 'pl' ? 'Zobacz case study' : 'View case study'}
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Show More Button */}
          {filteredProjects.length > 6 && !showAll && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <motion.button
                onClick={() => setShowAll(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white font-medium hover:bg-red-600/10 hover:border-red-600/30 hover:text-red-500 transition-all duration-300"
              >
                {language === 'pl' 
                  ? `Pokaż więcej projektów (${filteredProjects.length - 6} więcej)`
                  : `Show more projects (${filteredProjects.length - 6} more)`}
              </motion.button>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-16 p-8 bg-gradient-to-r from-white/[0.02] to-white/[0.05] rounded-2xl border border-white/[0.05]"
          >
            <h3 className="text-2xl font-bold mb-4">
              {language === 'pl' 
                ? 'Chcesz podobnych wyników dla swojego biznesu?'
                : 'Want similar results for your business?'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              {language === 'pl'
                ? 'Porozmawiajmy o Twoim projekcie. Pierwsza konsultacja gratis.'
                : "Let's talk about your project. First consultation is free."}
            </p>
            <motion.button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
            >
              {language === 'pl' ? 'Darmowa wycena' : 'Free quote'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
