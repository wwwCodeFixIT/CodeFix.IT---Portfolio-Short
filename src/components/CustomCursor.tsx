import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  // Smooth animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    // Very fast interpolation for minimal lag
    const ease = 0.35;
    
    positionRef.current.x += (targetRef.current.x - positionRef.current.x) * ease;
    positionRef.current.y += (targetRef.current.y - positionRef.current.y) * ease;
    
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
    }
    
    if (ringRef.current) {
      // Ring follows with slightly more delay for nice effect
      const ringEase = 0.2;
      const ringX = positionRef.current.x + (targetRef.current.x - positionRef.current.x) * (1 - ringEase);
      const ringY = positionRef.current.y + (targetRef.current.y - positionRef.current.y) * (1 - ringEase);
      ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    }
    
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Check if device supports hover (not mobile)
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const isLargeScreen = window.innerWidth >= 1024;
    
    if (!hasHover || !isLargeScreen) {
      setIsMobile(true);
      return;
    }
    
    setIsMobile(false);

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Track hoverable elements
    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea");
      setIsHovering(!!isHoverable);
    };

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", updateHoverState, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", updateHoverState);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [animate, isVisible]);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <>
      {/* Main Cursor Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ 
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.6 : isHovering ? 1.8 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-3 h-3 -ml-1.5 -mt-1.5 bg-white rounded-full"
          style={{ willChange: 'transform, opacity' }}
        />
      </div>

      {/* Cursor Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ 
          willChange: 'transform',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.6 : isHovering ? 2.2 : 1,
            opacity: isVisible ? (isHovering ? 0.6 : 0.25) : 0,
            borderColor: isHovering ? "#dc2626" : "rgba(255,255,255,0.4)",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-10 h-10 -ml-5 -mt-5 border-2 rounded-full"
          style={{ 
            willChange: 'transform, opacity, border-color',
            borderColor: 'rgba(255,255,255,0.4)'
          }}
        />
      </div>

      {/* Style to hide default cursor */}
      <style>{`
        @media (hover: hover) and (min-width: 1024px) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
