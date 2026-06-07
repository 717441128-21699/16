import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, Target, Zap, Shield, Gauge, Flame, Sparkles } from 'lucide-react';
import { weapons as defaultWeapons, type Weapon, type WeaponType, type Rarity } from '@/data/heroes';
import { TechCard, RarityBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface WeaponSelectorProps {
  selectedId: string | null;
  onChange: (id: string) => void;
  weapons?: Weapon[];
}

const typeConfig: Record<WeaponType, { label: string; icon: typeof Swords; color: string }> = {
  melee: { label: '近战', icon: Swords, color: 'text-red-400' },
  ranged: { label: '远程', icon: Target, color: 'text-blue-400' },
  energy: { label: '能量', icon: Zap, color: 'text-purple-400' },
};

const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

const rarityLabelMap: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const borderColorMap: Record<Rarity, 'cyan' | 'purple' | 'pink' | 'yellow'> = {
  common: 'cyan',
  rare: 'purple',
  epic: 'pink',
  legendary: 'yellow',
};

const getCriticalChance = (weapon: Weapon): number => {
  const baseByType: Record<WeaponType, number> = {
    melee: 10,
    ranged: 15,
    energy: 8,
  };
  const rarityMultiplier: Record<Rarity, number> = {
    common: 1,
    rare: 1.5,
    epic: 2,
    legendary: 3,
  };
  return Math.round(baseByType[weapon.type] * rarityMultiplier[weapon.rarity]);
};

export function WeaponSelector({ selectedId, onChange, weapons }: WeaponSelectorProps) {
  const [typeFilter, setTypeFilter] = useState<WeaponType | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');
  const weaponList = weapons ?? defaultWeapons;

  const filteredWeapons = useMemo(() => {
    return weaponList.filter((w) => {
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (rarityFilter !== 'all' && w.rarity !== rarityFilter) return false;
      return true;
    });
  }, [typeFilter, rarityFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400" />
          <h3 className="font-display text-lg font-semibold text-scifi-text">武器选择</h3>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-scifi-muted font-medium">类型:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                  typeFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-white/5 text-scifi-muted border border-white/10 hover:bg-white/10',
                )}
              >
                全部
              </button>
              {(Object.keys(typeConfig) as WeaponType[]).map((type) => {
                const TypeIcon = typeConfig[type].icon;
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all duration-200',
                      typeFilter === type
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'bg-white/5 text-scifi-muted border border-white/10 hover:bg-white/10',
                    )}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {typeConfig[type].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-scifi-muted font-medium">品质:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRarityFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                  rarityFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-white/5 text-scifi-muted border border-white/10 hover:bg-white/10',
                )}
              >
                全部
              </button>
              {rarityOrder.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setRarityFilter(rarity)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                    rarityFilter === rarity
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-white/5 text-scifi-muted border border-white/10 hover:bg-white/10',
                  )}
                >
                  {rarityLabelMap[rarity]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredWeapons.map((weapon, index) => {
          const isSelected = selectedId === weapon.id;
          const TypeIcon = typeConfig[weapon.type].icon;
          const critChance = getCriticalChance(weapon);

          return (
            <motion.div
              key={weapon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => onChange(weapon.id)}
              className="relative cursor-pointer"
            >
              <TechCard
                borderColor={borderColorMap[weapon.rarity]}
                className={cn(
                  'overflow-hidden h-full transition-all duration-300',
                  isSelected && 'border-cyan-400/80 shadow-glow-cyan',
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <motion.div
                    animate={isSelected ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.6 }}
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center text-2xl border flex-shrink-0',
                      isSelected
                        ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30 border-red-400/50'
                        : 'bg-white/5 border-white/10',
                    )}
                  >
                    {weapon.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-display text-sm font-bold text-scifi-text truncate">
                        {weapon.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={cn('flex items-center gap-1 text-xs', typeConfig[weapon.type].color)}>
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeConfig[weapon.type].label}</span>
                      </div>
                      <RarityBadge rarity={weapon.rarity}>
                        {rarityLabelMap[weapon.rarity]}
                      </RarityBadge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-scifi-muted">伤害</span>
                    </div>
                    <span className="text-sm font-bold text-red-400">{weapon.attack}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-scifi-muted">攻速</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">{weapon.attackSpeed}/s</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs text-scifi-muted">暴击率</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">{critChance}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-scifi-muted">射程</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">{weapon.range}m</span>
                  </div>
                </div>

                {weapon.specialEffect && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-yellow-300/90 leading-relaxed">
                        {weapon.specialEffect}
                      </span>
                    </div>
                  </div>
                )}

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-cyan"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </TechCard>
            </motion.div>
          );
        })}
      </div>

      {filteredWeapons.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-scifi-muted"
        >
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>没有符合筛选条件的武器</p>
        </motion.div>
      )}
    </div>
  );
}

export default WeaponSelector;
