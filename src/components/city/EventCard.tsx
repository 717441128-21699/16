import { motion } from 'framer-motion';
import { Star, Trophy, Coins, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowButton } from '@/components/ui';
import type { CityEvent } from '@/data/city';

interface EventCardProps {
  event: CityEvent;
  onAccept?: () => void;
  compact?: boolean;
}

const severityConfig: Record<CityEvent['severity'], { stars: number; color: string; label: string }> = {
  low: { stars: 1, color: 'text-green-400', label: '低' },
  medium: { stars: 2, color: 'text-yellow-400', label: '中' },
  high: { stars: 4, color: 'text-orange-400', label: '高' },
  critical: { stars: 5, color: 'text-red-400', label: '危急' },
};

const typeBorderMap: Record<CityEvent['type'], string> = {
  robbery: 'border-yellow-400/40 hover:shadow-glow-yellow',
  'alien-invasion': 'border-purple-400/40 hover:shadow-glow-purple',
  fire: 'border-red-400/40 hover:shadow-glow-red',
  'gang-war': 'border-orange-400/40 hover:shadow-[0_0_20px_rgba(251,146,60,0.3),0_0_40px_rgba(251,146,60,0.1)]',
  hostage: 'border-pink-400/40 hover:shadow-glow-pink',
  disaster: 'border-cyan-400/40 hover:shadow-glow-cyan',
};

export function EventCard({ event, onAccept, compact = false }: EventCardProps) {
  const severity = severityConfig[event.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, x: 4 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'relative glass rounded-lg border backdrop-blur-xl overflow-hidden transition-all duration-300',
        typeBorderMap[event.type],
        compact ? 'p-4' : 'p-5',
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      }}
    >
      <div className={cn('flex gap-4', compact && 'gap-3')}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className={cn(
            'flex-shrink-0 rounded-lg border flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5',
            compact ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl',
          )}
        >
          {event.icon}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className={cn(
                'font-display font-semibold text-scifi-text tracking-wide',
                compact ? 'text-sm' : 'text-base',
              )}>
                {event.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3 h-3',
                        i < severity.stars ? severity.color : 'text-white/10',
                      )}
                      fill={i < severity.stars ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className={cn('text-xs font-medium', severity.color)}>
                  {severity.label}
                </span>
              </div>
            </div>
          </div>

          {!compact && (
            <p className="text-sm text-scifi-muted mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className={cn(
            'flex flex-wrap items-center gap-x-4 gap-y-1',
            compact ? 'text-xs' : 'text-sm',
          )}>
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-3.5 h-3.5" />
              <span>+{event.reward.exp} EXP</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>+{event.reward.gold}</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400">
              <Shield className="w-3.5 h-3.5" />
              <span>+{event.reward.reputation} 声望</span>
            </div>
          </div>

          {onAccept && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-scifi-muted">
                <Trophy className="w-3.5 h-3.5" />
                <span>预计 {Math.floor(event.duration / 60)} 分钟</span>
              </div>
              <GlowButton size="sm" variant="primary" onClick={onAccept}>
                接取任务
              </GlowButton>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default EventCard;
