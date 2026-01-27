import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
  once?: boolean;
  type?: 'words' | 'chars' | 'lines';
  staggerDelay?: number;
}

export function AnimatedText({
  children,
  className = '',
  delay = 0,
  once = true,
  type = 'words',
  staggerDelay = 0.05,
}: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const renderAnimatedContent = () => {
    if (type === 'chars') {
      return children.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ));
    }

    if (type === 'lines') {
      return children.split('\n').map((line, i) => (
        <motion.div key={i} variants={itemVariants} className="block">
          {line}
        </motion.div>
      ));
    }

    // words
    return children.split(' ').map((word, i) => (
      <motion.span
        key={i}
        variants={itemVariants}
        className="inline-block mr-[0.25em]"
      >
        {word}
      </motion.span>
    ));
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
      style={{ perspective: 1000 }}
    >
      {renderAnimatedContent()}
    </motion.div>
  );
}

interface TypewriterTextProps {
  children: string;
  className?: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
}

export function TypewriterText({
  children,
  className = '',
  delay = 0,
  speed = 50,
  cursor = true,
}: TypewriterTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={className}>
      {isInView && (
        <>
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{
              duration: children.length * (speed / 1000),
              delay,
              ease: 'linear',
            }}
            className="inline-block overflow-hidden whitespace-nowrap"
          >
            {children}
          </motion.span>
          {cursor && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-0.5 h-[1em] bg-red-500 ml-1 align-middle"
            />
          )}
        </>
      )}
    </div>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className = '',
  from = 'from-red-500',
  via = 'via-red-400',
  to = 'to-orange-500',
  animate = false,
}: GradientTextProps) {
  return (
    <span
      className={`
        bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent
        ${animate ? 'animate-gradient bg-[length:200%_auto]' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={className}>
      {isInView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {prefix}
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            onAnimationStart={() => {
              if (!ref.current) return;
              
              const startTime = Date.now();
              const startValue = 0;
              
              const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000 - delay;
                if (elapsed < 0) {
                  requestAnimationFrame(animate);
                  return;
                }
                
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Math.floor(startValue + (end - startValue) * eased);
                
                if (ref.current) {
                  const textNode = ref.current.querySelector('[data-count]');
                  if (textNode) {
                    textNode.textContent = value.toString();
                  }
                }
                
                if (progress < 1) {
                  requestAnimationFrame(animate);
                }
              };
              
              requestAnimationFrame(animate);
            }}
          >
            <span data-count>0</span>
          </motion.span>
          {suffix}
        </motion.span>
      )}
    </span>
  );
}

interface SplitTextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function SplitTextReveal({
  children,
  className = '',
  delay = 0,
}: SplitTextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
