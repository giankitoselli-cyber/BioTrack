import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">
          Progresso Giornaliero
        </h3>
        <span className="text-lg font-bold text-purple-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        />
      </div>
    </div>
  );
};
