import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large gradient orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1/4 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px]"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-1/4 w-4 h-4 border border-red-500/20 rotate-45"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-40 left-1/4 w-6 h-6 border border-white/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 left-20 w-3 h-3 bg-red-500/20 rotate-45"
      />
    </div>
  );
}

export function FloatingCode() {
  const codeSnippets = [
    '<div className="hero">',
    'const [state, setState] = useState()',
    'export default function App()',
    'npm run build',
    'git commit -m "feat: add"',
    'tailwind.config.js',
    'useEffect(() => {}, [])',
    'framer-motion',
    'TypeScript',
    'Next.js 14',
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {codeSnippets.map((snippet, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: -50,
            opacity: 0,
          }}
          animate={{
            y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
            opacity: [0, 0.15, 0.15, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: 'linear',
          }}
          className="absolute font-mono text-xs text-red-500/30 whitespace-nowrap"
        >
          {snippet}
        </motion.div>
      ))}
    </div>
  );
}

export function MouseFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (typeof window === 'undefined') return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[100] mix-blend-screen"
      animate={{
        x: position.x - 200,
        y: position.y - 200,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
    >
      <div className="w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />
    </motion.div>
  );
}

export function ScrollIndicator() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2"
    >
      <span className="text-xs text-zinc-500 uppercase tracking-widest">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"
        />
      </motion.div>
    </motion.div>
  );
}

export function SectionDivider() {
  return (
    <div className="relative h-32 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      </div>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-0 w-20 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
      />
    </div>
  );
}

export function BackgroundNoise() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

interface GradientBlobProps {
  color?: string;
  size?: number;
  position?: { top?: string; left?: string; right?: string; bottom?: string };
  blur?: number;
  opacity?: number;
  animate?: boolean;
}

export function GradientBlob({
  color = 'red',
  size = 400,
  position = { top: '0', left: '0' },
  blur = 100,
  opacity = 0.1,
  animate = true,
}: GradientBlobProps) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <motion.div
      animate={animate ? {
        scale: [1, 1.1, 1],
        x: [0, 20, 0],
        y: [0, -20, 0],
      } : {}}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute ${colorMap[color] || color} rounded-full pointer-events-none`}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        opacity,
        ...position,
      }}
    />
  );
}

export function AnimatedGradientBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative p-px rounded-2xl overflow-hidden ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-conic from-red-500 via-transparent to-red-500"
        style={{ 
          background: 'conic-gradient(from 0deg, #ef4444, transparent, #ef4444)',
        }}
      />
      <div className="relative bg-zinc-900 rounded-2xl">
        {children}
      </div>
    </div>
  );
}

export function Spotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(239, 68, 68, 0.03), transparent 40%)`,
      }}
    />
  );
}
