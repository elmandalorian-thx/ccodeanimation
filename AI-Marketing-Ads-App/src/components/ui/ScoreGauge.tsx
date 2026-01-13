import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showChange?: { value: number; direction: 'up' | 'down' };
  color?: 'auto' | 'cyan' | 'purple' | 'pink' | 'orange' | 'green';
}

export function ScoreGauge({
  score,
  label,
  size = 'md',
  showChange,
  color = 'auto'
}: ScoreGaugeProps) {
  const getAutoColor = (s: number) => {
    if (s >= 80) return { stroke: '#34d399', text: 'text-green-400' }; // green
    if (s >= 60) return { stroke: '#fbbf24', text: 'text-yellow-400' }; // yellow
    if (s >= 40) return { stroke: '#fb923c', text: 'text-orange-400' }; // orange
    return { stroke: '#f87171', text: 'text-red-400' }; // red
  };

  const colorMap = {
    cyan: { stroke: '#22d3ee', text: 'text-cyan-400' },
    purple: { stroke: '#a855f7', text: 'text-purple-400' },
    pink: { stroke: '#ec4899', text: 'text-pink-400' },
    orange: { stroke: '#fb923c', text: 'text-orange-400' },
    green: { stroke: '#34d399', text: 'text-green-400' },
    auto: getAutoColor(score)
  };

  const { stroke, text } = colorMap[color];

  const sizeMap = {
    sm: { width: 60, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { width: 80, fontSize: 'text-xl', labelSize: 'text-sm' },
    lg: { width: 120, fontSize: 'text-3xl', labelSize: 'text-base' }
  };

  const { width, fontSize, labelSize } = sizeMap[size];
  const strokeWidth = size === 'lg' ? 8 : 6;
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700/50"
          />
          {/* Score arc */}
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${stroke}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-bold ${fontSize} ${text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {score}
          </motion.span>
          {showChange && (
            <span className={`text-xs ${showChange.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {showChange.direction === 'up' ? '\u2191' : '\u2193'} {showChange.value}
            </span>
          )}
        </div>
      </div>
      <span className={`${labelSize} text-muted-foreground mt-2 text-center`}>{label}</span>
    </div>
  );
}
