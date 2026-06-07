import { motion } from 'framer-motion';
import { ArrowUp, Coins, Lock, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, GlowButton, ProgressBar } from '@/components/ui';
import type { GuildBuilding } from '@/data/guild';

interface BuildingCardProps {
  building: GuildBuilding;
  canUpgrade?: boolean;
  treasury?: number;
  onUpgrade?: (buildingId: string) => void;
}

const typeColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  training: {
    border: 'border-red-400/40',
    bg: 'from-red-500/20 to-red-500/5',
    text: 'text-red-300',
    glow: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]',
  },
  intelligence: {
    border: 'border-cyan-400/40',
    bg: 'from-cyan-500/20 to-cyan-500/5',
    text: 'text-cyan-300',
    glow: 'hover:shadow-[0_0_25px_rgba(0,212,255,0.2)]',
  },
  armory: {
    border: 'border-yellow-400/40',
    bg: 'from-yellow-500/20 to-yellow-500/5',
    text: 'text-yellow-300',
    glow: 'hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]',
  },
  lounge: {
    border: 'border-purple-400/40',
    bg: 'from-purple-500/20 to-purple-500/5',
    text: 'text-purple-300',
    glow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
  },
  warehouse: {
    border: 'border-green-400/40',
    bg: 'from-green-500/20 to-green-500/5',
    text: 'text-green-300',
    glow: 'hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]',
  },
};

export function BuildingCard({ building, canUpgrade = false, treasury = 0, onUpgrade }: BuildingCardProps) {
  const colors = typeColors[building.type] ?? typeColors.training;
  const isMaxLevel = building.level >= building.maxLevel;
  const canAfford = treasury >= building.upgradeCost;
  const showUpgrade = canUpgrade && !isMaxLevel && canAfford;

  const nextLevelBonus = () => {
    const match = building.effect.match(/\+(\d+)%/);
    if (!match) return null;
    const currentBonus = parseInt(match[1]);
    return `+${currentBonus + 5}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <TechCard className={cn('h-full overflow-hidden', colors.glow)} borderColor={building.type === 'training' ? 'red' : building.type === 'intelligence' ? 'cyan' : building.type === 'armory' ? 'yellow' : building.type === 'lounge' ? 'purple' : 'green'} glow>
        <div className="relative">
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-40',
              colors.bg,
            )}
          />

          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-3xl border-2 bg-gradient-to-br relative overflow-hidden',
                    colors.border,
                    colors.bg,
                  )}
                >
                  <span className="drop-shadow-lg">{building.icon}</span>
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                    }}
                  />
                </motion.div>
                <div>
                  <h3 className="font-display text-lg font-bold text-scifi-text tracking-tight">
                    {building.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn('text-xs font-semibold font-mono', colors.text)}>
                      Lv.{building.level}
                    </span>
                    <span className="text-[10px] text-scifi-muted">
                      / {building.maxLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-scifi-muted leading-relaxed mb-4">
              {building.description}
            </p>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">
                  等级进度
                </span>
                <span className="text-[10px] font-mono text-scifi-text">
                  {building.level}/{building.maxLevel}
                </span>
              </div>
              <ProgressBar
                value={building.level}
                max={building.maxLevel}
                color={building.type === 'training' ? 'red' : building.type === 'intelligence' ? 'cyan' : building.type === 'armory' ? 'yellow' : building.type === 'lounge' ? 'purple' : 'green'}
                showLabel={false}
                height={6}
              />
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-scifi-muted">当前效果</span>
                </div>
                <span className={cn('text-xs font-semibold', colors.text)}>
                  {building.effect}
                </span>
              </div>

              {!isMaxLevel && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-400/20">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-green-300">升级后</span>
                  </div>
                  <span className="text-xs font-semibold text-green-300">
                    {building.effect.replace(/\+(\d+)%/, nextLevelBonus() ?? '+0%')}
                  </span>
                </div>
              )}
            </div>

            {!isMaxLevel ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-scifi-muted">升级费用</span>
                  </div>
                  <span className={cn(
                    'text-sm font-bold font-mono',
                    canAfford ? 'text-yellow-300' : 'text-red-400',
                  )}>
                    ¥{building.upgradeCost.toLocaleString()}
                  </span>
                </div>

                <GlowButton
                  variant={showUpgrade ? 'success' : 'ghost'}
                  size="md"
                  className="w-full"
                  disabled={!showUpgrade}
                  onClick={() => onUpgrade?.(building.id)}
                >
                  {!canUpgrade ? (
                    <>
                      <Lock className="w-4 h-4" />
                      权限不足
                    </>
                  ) : isMaxLevel ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      已满级
                    </>
                  ) : !canAfford ? (
                    <>
                      <Coins className="w-4 h-4" />
                      金币不足
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      立即升级
                    </>
                  )}
                </GlowButton>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/15 to-orange-500/10 border border-yellow-400/30 text-center">
                <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-yellow-300">已达最高等级</p>
              </div>
            )}
          </div>
        </div>
      </TechCard>
    </motion.div>
  );
}

export default BuildingCard;
