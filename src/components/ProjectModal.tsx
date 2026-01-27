import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ExternalLink, Github, CheckCircle, Monitor, Smartphone, Tablet, 
  RefreshCw, Maximize2, Minimize2, Loader2, Globe, Lock,
  ZoomIn, ZoomOut, RotateCcw, Eye
} from "lucide-react";
import type { Project } from "@/data/projects";
import { Button } from "./ui/Button";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

type DeviceView = "desktop" | "tablet" | "mobile";

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "details">("preview");
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActiveTab("preview");
      setIsLoading(true);
      setIsFullscreen(false);
      setHasError(false);
      setZoom(100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, project]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isFullscreen]);

  const deviceSizes = {
    desktop: { width: "100%", height: "100%", scale: 1 },
    tablet: { width: "768px", height: "1024px", scale: 0.75 },
    mobile: { width: "375px", height: "812px", scale: 0.65 }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const refreshPreview = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const previewUrl = project?.demoUrl && project.demoUrl !== "#" ? project.demoUrl : null;

  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/98 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col transition-all duration-300 ${
              isFullscreen 
                ? "max-w-full h-full m-0 rounded-none" 
                : "max-w-7xl h-[95vh]"
            }`}
          >
            {/* Header - Browser Style */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141414]">
              <div className="flex items-center gap-4">
                {/* Window Controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onClose}
                    className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group"
                  >
                    <X size={8} className="text-red-900 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button className="w-3.5 h-3.5 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="w-3.5 h-3.5 rounded-full bg-green-500 hover:bg-green-400 transition-colors"
                  />
                </div>
                
                {/* Navigation Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={refreshPreview}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Odśwież"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* URL Bar */}
              <div className="flex-1 max-w-2xl mx-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] rounded-lg border border-white/10">
                  <Lock size={12} className="text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400 truncate font-mono">
                    {previewUrl || "about:blank"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab Switcher */}
                <div className="hidden md:flex bg-white/5 rounded-lg p-0.5">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === "preview"
                        ? "bg-red-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === "details"
                        ? "bg-red-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Globe size={14} />
                    Szczegóły
                  </button>
                </div>

                {/* Fullscreen & Close */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex-shrink-0 flex bg-[#0f0f0f] border-b border-white/5">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                  activeTab === "preview"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-400"
                }`}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                  activeTab === "details"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-400"
                }`}
              >
                <Globe size={16} />
                Szczegóły
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "preview" ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full flex flex-col"
                  >
                    {/* Device & Zoom Toolbar */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[#0f0f0f] border-b border-white/5">
                      {/* Device Switcher */}
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        {[
                          { key: "desktop", icon: Monitor, label: "Desktop" },
                          { key: "tablet", icon: Tablet, label: "Tablet" },
                          { key: "mobile", icon: Smartphone, label: "Mobile" }
                        ].map(({ key, icon: Icon, label }) => (
                          <button
                            key={key}
                            onClick={() => setDeviceView(key as DeviceView)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                              deviceView === key
                                ? "bg-red-600 text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                            title={label}
                          >
                            <Icon size={14} />
                            <span className="hidden sm:inline text-xs">{label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Zoom Controls */}
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
                          <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 50}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
                          >
                            <ZoomOut size={14} />
                          </button>
                          <span className="px-2 text-xs text-gray-400 min-w-[48px] text-center">{zoom}%</span>
                          <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 200}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
                          >
                            <ZoomIn size={14} />
                          </button>
                          <button
                            onClick={resetZoom}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            title="Reset zoom"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>

                        {previewUrl && (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all"
                          >
                            <ExternalLink size={14} />
                            <span className="hidden sm:inline">Otwórz stronę</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Preview Container */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#080808] overflow-auto">
                      <motion.div
                        layout
                        className="relative bg-white rounded-lg shadow-2xl shadow-black/50 overflow-hidden"
                        style={{
                          width: deviceView === "desktop" ? "100%" : deviceSizes[deviceView].width,
                          maxWidth: deviceView === "desktop" ? "100%" : deviceSizes[deviceView].width,
                          height: deviceView === "desktop" ? "100%" : "auto",
                          aspectRatio: deviceView === "desktop" ? undefined : deviceView === "tablet" ? "3/4" : "9/19.5",
                          transform: `scale(${zoom / 100})`,
                          transformOrigin: "center center"
                        }}
                      >
                        {/* Device Frame for mobile/tablet */}
                        {deviceView !== "desktop" && (
                          <div className="absolute inset-0 pointer-events-none z-20 border-[12px] border-gray-800 rounded-[24px]">
                            {/* Notch for mobile */}
                            {deviceView === "mobile" && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-xl" />
                            )}
                          </div>
                        )}

                        {/* Loading State */}
                        <AnimatePresence>
                          {isLoading && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center z-30"
                            >
                              <div className="relative">
                                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl" />
                              </div>
                              <p className="mt-4 text-gray-400 text-sm">Ładowanie strony...</p>
                              <p className="mt-1 text-gray-600 text-xs">{previewUrl}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Error State */}
                        {hasError && !isLoading && (
                          <div className="absolute inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center z-30 p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mb-4">
                              <X className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Nie można załadować podglądu</h3>
                            <p className="text-gray-400 text-sm mb-4">
                              Ta strona może blokować osadzanie w iframe
                            </p>
                            {previewUrl && (
                              <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                              >
                                <ExternalLink size={16} />
                                Otwórz w nowej karcie
                              </a>
                            )}
                          </div>
                        )}

                        {/* Actual iframe - Real Live Preview */}
                        {previewUrl ? (
                          <iframe
                            ref={iframeRef}
                            key={iframeKey}
                            src={previewUrl}
                            className="w-full h-full border-0"
                            style={{ 
                              minHeight: deviceView === "desktop" ? "600px" : undefined,
                              height: deviceView === "desktop" ? "100%" : "100%"
                            }}
                            title={`${project.title} - Live Preview`}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            loading="eager"
                          />
                        ) : (
                          /* Fallback - Project Image */
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f0f] p-8">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="max-w-full max-h-[50%] object-contain rounded-lg shadow-xl mb-6"
                              onLoad={handleIframeLoad}
                            />
                            <p className="text-gray-400 text-sm text-center">
                              Live preview niedostępny dla tego projektu
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Project Info Bar */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#0f0f0f] border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{project.title}</span>
                        <span className="px-2 py-0.5 bg-red-600/20 text-red-500 text-xs rounded-full">{project.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span key={tech} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="text-gray-500 text-xs">+{project.technologies.length - 4}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Details Tab */
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full overflow-y-auto"
                  >
                    <div className="p-6 sm:p-8 space-y-8">
                      {/* Project Image */}
                      <div className="relative aspect-video rounded-xl overflow-hidden group">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-full">
                            {project.category}
                          </span>
                        </div>

                        {/* Preview Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <button
                            onClick={() => setActiveTab("preview")}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-all transform hover:scale-105"
                          >
                            <Eye size={20} />
                            Zobacz Live Preview
                          </button>
                        </div>
                      </div>

                      {/* Header */}
                      <div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{project.title}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                          {project.fullDescription}
                        </p>
                      </div>

                      {/* Technologies */}
                      <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-red-600 rounded-full" />
                          Stack Technologiczny
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <motion.span
                              key={tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm hover:border-red-600/50 hover:bg-red-600/5 transition-colors duration-300"
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      {/* Scope of Work */}
                      <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-red-600 rounded-full" />
                          Zakres Prac
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {project.scope.map((item, index) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-3 text-gray-300"
                            >
                              <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              {item}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                        {project.demoUrl && project.demoUrl !== "#" && (
                          <>
                            <Button onClick={() => setActiveTab("preview")}>
                              <Eye className="w-4 h-4 mr-2" />
                              Live Preview
                            </Button>
                            <Button variant="outline" onClick={() => window.open(project.demoUrl, "_blank")}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Otwórz stronę
                            </Button>
                          </>
                        )}
                        {project.repoUrl && project.repoUrl !== "#" && (
                          <Button variant="outline" onClick={() => window.open(project.repoUrl, "_blank")}>
                            <Github className="w-4 h-4 mr-2" />
                            Repozytorium
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
