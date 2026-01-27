import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  strength?: number;
  radius?: number;
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  strength = 0.3,
  radius = 200,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-20, 20], [5, -5]);
  const rotateY = useTransform(springX, [-20, 20], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < radius) {
      const power = 1 - distance / radius;
      x.set(distanceX * strength * power);
      y.set(distanceY * strength * power);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ perspective: 500 }}
    >
      <Component
        href={href}
        onClick={onClick}
        style={{
          x: springX,
          y: springY,
          rotateX,
          rotateY,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        {children}
      </Component>
    </div>
  );
}
