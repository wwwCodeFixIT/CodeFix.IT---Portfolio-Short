import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export function ParallaxSection({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({
  src,
  alt,
  className = '',
  speed = 0.3,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

export function RevealOnScroll({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.6,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.5'],
  });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 50, x: 0 };
      case 'down': return { y: -50, x: 0 };
      case 'left': return { y: 0, x: 50 };
      case 'right': return { y: 0, x: -50 };
    }
  };

  const initial = getInitialPosition();
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [initial.x, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [initial.y, 0]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ opacity, x, y }}
        transition={{ duration, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface ScaleOnScrollProps {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  scaleTo?: number;
}

export function ScaleOnScroll({
  children,
  className = '',
  scaleFrom = 0.8,
  scaleTo = 1,
}: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RotateOnScrollProps {
  children: ReactNode;
  className?: string;
  degrees?: number;
}

export function RotateOnScroll({
  children,
  className = '',
  degrees = 10,
}: RotateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-degrees, degrees]);

  return (
    <motion.div
      ref={ref}
      style={{ rotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function HorizontalScroll({
  children,
  className = '',
  speed = 1,
}: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', `${-50 * speed}%`]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ x }} className="flex whitespace-nowrap">
        {children}
      </motion.div>
    </div>
  );
}

interface StickyScrollProps {
  children: ReactNode;
  className?: string;
  height?: string;
}

export function StickyScroll({
  children,
  className = '',
  height = '200vh',
}: StickyScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={ref} className={className} style={{ height }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{
            scale: useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]),
            opacity: useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
