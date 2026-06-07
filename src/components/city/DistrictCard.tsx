import { motion } from 'framer-motion';
import { Users, Shield, Factory, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { District } from '@/data/city';

interface DistrictCardProps {
  district: District;
  hasActiveEvent?: boolean;
  onClick?: () => void;
}

const typeIconMap: Record<District['type'], React.ReactNode> = {
  financial: <Shield className="w-5 h-5" />,
  industrial: <Factory className="w-5 h-5" />,
  residential: <Users className="w-5 h-5" />,
};

const typeColorMap: Record<District['type'], { border: string; glow: string; accent: string }> = {
  financial: {
    border: 'border-cyan-400/40',
    glow: 'hover:shadow-glow-cyan',
    accent: 'text-cyan-400',
  },
  industrial: {
    border: 'border-orange-400/40',
    glow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.3),0_0_40px_rgba(251,146,60,0.1)]',
    accent: 'text-orange-400',
  },
  residential: {
    border: 'border-green-400/40',
    glow: 'hover:shadow-glow-green',
    accent: 'text-green-400',
  },
};

function RingProgress({ value, color }: { value: number; color: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const strokeColor =
    value >= 70 ? '#ef4444' : value >= 40 ? '#eab308' : '#22c55e';

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          stroke={color || strokeColor}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 4px ${color || strokeColor})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-lg font-bold text-scifi-text">{value}</span>
      </div>
    </div>
  );
}

export function DistrictCard({ district, hasActiveEvent = false, onClick }: DistrictCardProps) {
  const colors = typeColorMap[district.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'relative glass rounded-lg border backdrop-blur-xl cursor-pointer overflow-hidden transition-all duration-500 p-6',
        colors.border,
        colors.glow,
        hasActiveEvent && 'border-red-500/60',
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
      }}
    >
      {hasActiveEvent && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 border-2 border-red-500/80 rounded-lg pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.1)',
          }}
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            className={cn(
              'w-12 h-12 rounded-lg border flex items-center justify-center bg-gradient-to-br',
              district.type === 'financial' && 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-400/30',
              district.type === 'industrial' && 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-400/30',
              district.type === 'residential' && 'from-green-500/20 to-green-500/5 text-green-400 border-green-400/30',
            )}
          >
            {typeIconMap[district.type]}
          </motion.div>
          <div>
            <h3 className="font-display text-lg font-semibold text-scifi-text tracking-wide">
              {district.name}
            </h3>
            <p className="text-xs text-scifi-muted">{district.population.toLocaleString()} 人口</p>
          </div>
        </div>
        {hasActiveEvent && (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/20 border border-red-500/40"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-red-300">事件中</span>
          </motion.div>
        )}
      </div>

      <p className="text-sm text-scifi-muted mb-5 leading-relaxed line-clamp-2">
        {district.description}
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <RingProgress value={district.crimeRate} color="#ef4444" />
          <span className="mt-2 text-xs text-scifi-muted">犯罪率</span>
        </div>
        <div className="flex flex-col items-center">
          <RingProgress value={district.satisfaction} color="#22c55e" />
          <span className="mt-2 text-xs text-scifi-muted">满意度</span>
        </div>
        <div className="flex flex-col items-center">
          <RingProgress value={district.activity} color="#a855f7" />
          <span className="mt-2 text-xs text-scifi-muted">资源产出</span>
        </div>
      </div>

      {district.controlledBy && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className={cn('text-xs font-medium', colors.accent)}>
            控制公会: {district.controlledBy}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default DistrictCard;
