import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RankingChange = 'up' | 'down' | 'same';

interface RankingRowProps {
  rank: number;
  heroId: string;
  heroName: string;
  heroTitle: string;
  avatar: string;
  value: number;
  valueLabel?: string;
  change?: RankingChange;
  changeValue?: number;
  guildTag?: string;
  onClick?: () => void;
  index?: number;
}

const medalStyles: Record<number, { bg: string; border: string; glow: string; text: string; icon: string }> = {
  1: {
    bg: 'from-yellow-500/30 via-amber-500/20 to-transparent',
    border: 'border-yellow-400/60',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.35)]',
    text: 'text-yellow-300',
    icon: '🥇',
  },
  2: {
    bg: 'from-slate-300/30 via-gray-400/20 to-transparent',
    border: 'border-slate-300/60',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
    text: 'text-slate-200',
    icon: '🥈',
  },
  3: {
    bg: 'from-orange-600/30 via-amber-700/20 to-transparent',
    border: 'border-orange-500/60',
    glow: 'shadow-[0_0_20px_rgba(234,88,12,0.3)]',
    text: 'text-orange-300',
    icon: '🥉',
  },
};

export function RankingRow({
  rank,
  heroName,
  heroTitle,
  avatar,
  value,
  valueLabel = '战力',
  change,
  changeValue,
  guildTag,
  onClick,
  index = 0,
}: RankingRowProps) {
  const isTopThree = rank <= 3;
  const medal = medalStyles[rank];

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={onClick ? { backgroundColor: 'rgba(0, 212, 255, 0.03)', scale: 1.005 } : {}}
      onClick={onClick}
      className={cn(
        'border-b border-white/5 transition-all duration-300',
        onClick && 'cursor-pointer',
        isTopThree && medal?.glow,
      )}
    >
      <td className="py-4 px-4">
        <div className="flex items-center justify-center">
          {isTopThree ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 + 0.1, type: 'spring' }}
              className="relative"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-2xl border-2 bg-gradient-to-br',
                  medal?.bg,
                  medal?.border,
                )}
              >
                <span className="drop-shadow-lg">{medal?.icon}</span>
              </div>
              <div
                className={cn(
                  'absolute -inset-1 rounded-lg opacity-50 blur-md -z-10',
                  rank === 1 && 'bg-yellow-400',
                  rank === 2 && 'bg-slate-300',
                  rank === 3 && 'bg-orange-500',
                )}
              />
            </motion.div>
          ) : (
            <span
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center font-display text-lg font-bold bg-white/5 border border-white/10',
                'text-scifi-muted',
              )}
            >
              {rank}
            </span>
          )}
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-lg flex items-center justify-center text-2xl border-2 relative overflow-hidden',
              isTopThree
                ? cn('bg-gradient-to-br', medal?.bg, medal?.border)
                : 'bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border-cyan-400/30',
            )}
          >
            <span className="drop-shadow">{avatar}</span>
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  'font-display text-sm font-semibold truncate',
                  isTopThree ? medal?.text : 'text-scifi-text',
                )}
              >
                {heroName}
              </p>
              {guildTag && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-400/30">
                  [{guildTag}]
                </span>
              )}
            </div>
            <p className="text-xs text-scifi-muted truncate">「{heroTitle}」</p>
          </div>
        </div>
      </td>

      <td className="py-4 px-4 text-right">
        <div className="flex flex-col items-end">
          <span
            className={cn(
              'font-display text-xl font-bold tracking-tight',
              isTopThree ? medal?.text : 'text-gradient-cyber',
            )}
          >
            {value.toLocaleString()}
          </span>
          <span className="text-[10px] text-scifi-muted uppercase tracking-wider">
            {valueLabel}
          </span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center justify-end">
          {change === 'up' ? (
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              {changeValue !== undefined && (
                <span className="text-xs font-semibold font-mono">+{changeValue}</span>
              )}
            </div>
          ) : change === 'down' ? (
            <div className="flex items-center gap-1 text-red-400">
              <TrendingDown className="w-4 h-4" />
              {changeValue !== undefined && (
                <span className="text-xs font-semibold font-mono">-{changeValue}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-scifi-muted">
              <Minus className="w-4 h-4" />
              <span className="text-xs font-mono">持平</span>
            </div>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export default RankingRow;
