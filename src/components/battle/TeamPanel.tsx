import { motion } from 'framer-motion';
import { Heart, Zap, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui';
import type { Hero } from '@/data/heroes';

interface Teammate extends Hero {
  isOnline?: boolean;
  contribution?: number;
}

interface TeamPanelProps {
  teammates: Teammate[];
  teamworkScore: number;
  className?: string;
}

export function TeamPanel({ teammates, teamworkScore, className }: TeamPanelProps) {
  return (
    <div className={cn('glass rounded-lg border border-scifi-border overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="font-display text-xs font-semibold uppercase tracking-wider text-scifi-text">
            队友状态
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-mono text-yellow-400 font-bold">
            配合评分: {teamworkScore}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {teammates.map((mate, idx) => {
          const hpPercent = (mate.hp / mate.maxHp) * 100;
          const energyPercent = (mate.energy / mate.maxEnergy) * 100;
          const hpColor = hpPercent > 60 ? 'green' : hpPercent > 30 ? 'yellow' : 'red';
          const isDown = mate.hp <= 0;

          return (
            <motion.div
              key={mate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-md border transition-all',
                'bg-white/[0.02] border-white/5',
                isDown && 'opacity-50 bg-red-500/5 border-red-500/20',
              )}
            >
              {mate.isOnline !== false && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}

              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={cn(
                  'relative w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl flex-shrink-0',
                  isDown
                    ? 'bg-red-500/10 border-red-500/40 grayscale'
                    : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/10 border-cyan-400/40',
                )}
              >
                {mate.avatar}
                {isDown && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg">💀</span>
                  </div>
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-display text-sm font-semibold',
                      isDown ? 'text-red-400 line-through' : 'text-scifi-text',
                    )}>
                      {mate.alias}
                    </span>
                    <span className="text-[10px] font-mono text-scifi-muted">
                      Lv.{mate.level}
                    </span>
                  </div>
                  {mate.contribution !== undefined && (
                    <span className="text-[10px] font-mono text-purple-400">
                      +{mate.contribution} 贡献
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <ProgressBar
                        value={mate.hp}
                        max={mate.maxHp}
                        color={hpColor}
                        height={4}
                        showLabel={false}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-scifi-muted w-16 text-right">
                      {mate.hp}/{mate.maxHp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <ProgressBar
                        value={mate.energy}
                        max={mate.maxEnergy}
                        color="yellow"
                        height={4}
                        showLabel={false}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-scifi-muted w-16 text-right">
                      {mate.energy}/{mate.maxEnergy}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 mt-2">
                  <div className="flex -space-x-1">
                    {mate.powers.slice(0, 3).map((p, i) => (
                      <div
                        key={`${mate.id}-${p}-${i}`}
                        className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px]"
                      >
                        ⚡
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {teammates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-scifi-muted">
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">暂无队友</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamPanel;
