import React from 'react';

interface Props {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const CompatibilityBar: React.FC<Props> = ({
  percentage,
  label,
  size = 'md',
  showPercentage = true
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  // Determine gradient color based on percentage
  const getGradient = () => {
    if (clamped >= 88) return 'from-emerald-400 via-teal-400 to-cyan-400';
    if (clamped >= 75) return 'from-purple-500 via-pink-500 to-rose-400';
    return 'from-amber-400 to-orange-500';
  };

  const getHeight = () => {
    if (size === 'sm') return 'h-1.5';
    if (size === 'lg') return 'h-3';
    return 'h-2';
  };

  return (
    <div className="w-full space-y-1">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-600 dark:text-slate-300">{label}</span>}
          {showPercentage && (
            <span className="text-purple-600 dark:text-purple-300 font-bold font-mono">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden ${getHeight()}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
