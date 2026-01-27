import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 origin-left z-[60]"
      style={{ scaleX }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-red-500 blur-sm" />
    </motion.div>
  );
}
