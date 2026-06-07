import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import type { Hero } from '@/data/heroes';
import { suits } from '@/data/heroes';
import { TechCard, RarityBadge, ProgressBar } from '@/components/ui';
import { cn } from '@/lib/utils';

interface HeroCardProps {
  hero: Hero;
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
  className?: string;
}

export function HeroCard({ hero, onClick, selected = false, showStats = true, className }: HeroCardProps) {
  const heroSuit = suits.find((s) => s.id === hero.suitId);
  const rarity = heroSuit?.rarity ?? 'common';

  const combatPower =
    hero.attack * 3 +
    hero.defense * 2.5 +
    hero.speed * 2 +
    hero.maxHp * 0.1 +
    hero.maxEnergy * 0.5 +
    hero.level * 50;

  const hpPercent = (hero.hp / hero.maxHp) * 100;
  const energyPercent = (hero.energy / hero.maxEnergy) * 100;
  const expPercent = (hero.exp / hero.maxExp) * 100;

  return (
    <motion.div
      whileHover={onClick ? { y: -4, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer', className)}
    >
      <TechCard
        className={cn(
          'overflow-hidden transition-all duration-300',
          selected && 'border-cyan-400/80 shadow-glow-cyan',
        )}
        borderColor={selected ? 'cyan' : rarity === 'legendary' ? 'yellow' : rarity === 'epic' ? 'pink' : rarity === 'rare' ? 'purple' : 'cyan'}
        glow
      >
        <div className="relative">
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-30',
              rarity === 'legendary'
                ? 'from-yellow-500/40 via-orange-500/20 to-transparent'
                : rarity === 'epic'
                  ? 'from-pink-500/40 via-purple-500/20 to-transparent'
                  : rarity === 'rare'
                    ? 'from-purple-500/40 via-blue-500/20 to-transparent'
                    : 'from-cyan-500/40 via-blue-500/20 to-transparent',
            )}
          />

          <div className="relative pt-5 px-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <motion.div
                  animate={selected ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    'w-20 h-20 rounded-xl flex items-center justify-center text-5xl border-2 relative overflow-hidden',
                    selected
                      ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400/60 shadow-glow-cyan'
                      : rarity === 'legendary'
                        ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                        : rarity === 'epic'
                          ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-pink-400/50'
                          : rarity === 'rare'
                            ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-purple-400/50'
                            : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/30',
                  )}
                >
                  <span className="drop-shadow-lg">{hero.avatar}</span>
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                    }}
                  />
                </motion.div>

                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-2 border-scifi-bg flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white font-display">{hero.level}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-scifi-text truncate">
                      {hero.name}
                    </h3>
                    <p className="text-sm text-scifi-muted">「{hero.alias}」</p>
                  </div>
                  <RarityBadge rarity={rarity}>
                    {rarity === 'legendary' ? '传说' : rarity === 'epic' ? '史诗' : rarity === 'rare' ? '稀有' : '普通'}
                  </RarityBadge>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300 font-display">
                      {Math.round(combatPower).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-scifi-muted text-cyan-300">
                      {hero.powers.length} 能力
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showStats && (
          <div className="px-5 pb-5 pt-2 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">HP</span>
                  <span className="text-[10px] font-bold text-red-300">
                    {hero.hp}/{hero.maxHp}
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hpPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                      boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">能量</span>
                  <span className="text-[10px] font-bold text-cyan-300">
                    {hero.energy}/{hero.maxEnergy}
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${energyPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #00d4ff, #06b6d4)',
                      boxShadow: '0 0 6px rgba(0, 212, 255, 0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">经验</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-300">
                    {Math.round(expPercent)}%
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${expPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                      boxShadow: '0 0 6px rgba(168, 85, 247, 0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] text-scifi-muted mb-0.5">攻击</p>
                <p className="text-sm font-bold text-red-300 font-display">{hero.attack}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-scifi-muted mb-0.5">防御</p>
                <p className="text-sm font-bold text-cyan-300 font-display">{hero.defense}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-scifi-muted mb-0.5">速度</p>
                <p className="text-sm font-bold text-green-300 font-display">{hero.speed}</p>
              </div>
            </div>
          </div>
        )}

        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-cyan"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </TechCard>
    </motion.div>
  );
}

export default HeroCard;
