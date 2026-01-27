import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, Users } from "lucide-react";
import { projects, projectCategories, type Project } from "@/data/projects";
import { ProjectModal } from "./ProjectModal";

export function Portfolio() {
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
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
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
              Moje realizacje
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-red-600">Portfolio</span> projektów
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg">
              Projekty, które zrealizowałem dla moich klientów.
              Kliknij, aby zobaczyć szczegóły i podgląd na żywo.
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
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {displayedProjects.map((project) => (
                <motion.article
                  key={project.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ y: -10 }}
                  onClick={() => openProject(project)}
                  className="group relative cursor-pointer"
                >
                  {/* Card */}
                  <div className="relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.05] rounded-2xl overflow-hidden hover:border-red-600/30 transition-all duration-500">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      
                      {/* Featured Badge */}
                      {project.featured && (
                        <div className="absolute top-4 right-4">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-xs font-medium"
                          >
                            <Star size={12} className="fill-current" />
                            <span>Wyróżniony</span>
                          </motion.div>
                        </div>
                      )}

                      {/* Collaboration Badge */}
                      {project.collaboration && (
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-1 px-3 py-1 bg-blue-600/80 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                            <Users size={12} />
                            <span>Współpraca</span>
                          </div>
                        </div>
                      )}
                      
                      {/* View Project Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1 }}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-full text-white font-medium shadow-xl shadow-red-600/30"
                        >
                          <span>Zobacz projekt</span>
                          <ExternalLink size={18} />
                        </motion.div>
                      </div>

                      {/* Year Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/10">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold group-hover:text-red-500 transition-colors duration-300">
                          {project.title}
                        </h3>
                      </div>
                      
                      {project.client && (
                        <p className="text-red-500/80 text-sm mb-2 font-medium">
                          {project.client}
                        </p>
                      )}
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {project.shortDescription}
                      </p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded hover:bg-red-600/10 hover:text-red-400 transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 bg-red-600/10 text-red-500 text-xs rounded font-medium">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover Border Glow */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-red-600/0 group-hover:border-red-600/20 transition-all duration-500 pointer-events-none" />
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
                Pokaż więcej projektów ({filteredProjects.length - 6} więcej)
              </motion.button>
            </motion.div>
          )}

          {/* Show Less Button */}
          {showAll && filteredProjects.length > 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12"
            >
              <motion.button
                onClick={() => setShowAll(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white font-medium hover:bg-red-600/10 hover:border-red-600/30 hover:text-red-500 transition-all duration-300"
              >
                Pokaż mniej
              </motion.button>
            </motion.div>
          )}

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-500 text-lg">
                Brak projektów w tej kategorii. Wkrótce dodam więcej!
              </p>
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
              Masz projekt do realizacji?
            </h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Skontaktuj się ze mną, a wspólnie omówimy szczegóły i przygotujemy wycenę.
            </p>
            <motion.button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
            >
              Skontaktuj się
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
