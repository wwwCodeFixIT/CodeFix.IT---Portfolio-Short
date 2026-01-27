import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled = false
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25 hover:shadow-red-600/40",
    secondary: "bg-white text-black hover:bg-gray-100",
    outline: "bg-transparent border-2 border-white/20 text-white hover:border-red-600 hover:text-red-500"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {children}
    </motion.button>
  );
}
