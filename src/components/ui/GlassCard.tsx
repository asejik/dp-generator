import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      className={`glass-panel rounded-2xl shadow-xl shadow-gray-200/50 ${className}`}
    >
      {children}
    </motion.div>
  );
};