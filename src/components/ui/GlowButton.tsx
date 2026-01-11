import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  // FIX: Explicitly narrow children back to ReactNode to solve the type conflict
  children: React.ReactNode;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children, variant = 'primary', isLoading, icon, className, ...props
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-display font-medium transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group cursor-pointer";

  const variants = {
    primary: "bg-gray-900 text-white shadow-lg hover:shadow-blue-500/25 border border-transparent",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className || ''} disabled:opacity-70 disabled:cursor-not-allowed`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Subtle Shine Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && icon}
        {children}
      </span>
    </motion.button>
  );
};