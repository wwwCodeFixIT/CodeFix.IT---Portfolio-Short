import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  glowOpacity?: number;
  borderRadius?: string;
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(239, 68, 68, 0.4)',
  glowSize = 400,
  glowOpacity = 0.15,
  borderRadius = '1rem',
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius }}
    >
      {/* Glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(${glowSize}px circle at ${x}px ${y}px, ${glowColor}, transparent 80%)`
          ),
          opacity: glowOpacity,
          borderRadius,
        }}
      />
      
      {/* Border gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(${glowSize / 2}px circle at ${x}px ${y}px, ${glowColor}, transparent 80%)`
          ),
          borderRadius,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      
      {children}
    </motion.div>
  );
}

interface Hover3DCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glareEnable?: boolean;
  glareColor?: string;
}

export function Hover3DCard({
  children,
  className = '',
  intensity = 15,
  glareEnable = true,
  glareColor = 'rgba(255, 255, 255, 0.2)',
}: Hover3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), springConfig);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, ${glareColor}, transparent 60%)`
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
    
    glareX.set(((e.clientX - rect.left) / rect.width) * 100);
    glareY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      {children}
      
      {/* Glare effect */}
      {glareEnable && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-inherit overflow-hidden"
          style={{
            background: glareBackground,
            opacity: 0.3,
          }}
        />
      )}
    </motion.div>
  );
}

interface NeonBorderCardProps {
  children: ReactNode;
  className?: string;
  color?: string;
  animated?: boolean;
  borderWidth?: number;
}

export function NeonBorderCard({
  children,
  className = '',
  color = '#ef4444',
  animated = true,
  borderWidth = 2,
}: NeonBorderCardProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Animated border */}
      <div
        className={`absolute -inset-[${borderWidth}px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${animated ? 'animate-pulse' : ''}`}
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}88, ${color})`,
          filter: `blur(${borderWidth * 2}px)`,
        }}
      />
      
      {/* Static border */}
      <div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}44, ${color})`,
        }}
      />
      
      {/* Content */}
      <div className="relative bg-zinc-900 rounded-xl">
        {children}
      </div>
    </div>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
}

export function GlassCard({
  children,
  className = '',
  blur = 10,
  opacity = 0.1,
  borderOpacity = 0.2,
}: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
      }}
    >
      {children}
    </div>
  );
}

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(239, 68, 68, 0.15)',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isHovering = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    isHovering.set(1);
  };

  const handleMouseLeave = () => {
    isHovering.set(0);
  };

  const spotlightOpacity = useSpring(isHovering, { stiffness: 300, damping: 30 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, ${spotlightColor}, transparent 40%)`
          ),
          opacity: spotlightOpacity,
        }}
      />
      
      {children}
    </motion.div>
  );
}
