import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Wind, Clock, Check } from 'lucide-react';
import { superPowers as defaultSuperPowers, type SuperPower } from '@/data/heroes';
import { TechCard } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PowerSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelect?: number;
  powers?: SuperPower[];
}

const statIcons = {
  damage: Zap,
  energyCost: Wind,
  cooldown: Clock,
};

export function PowerSelector({ selectedIds, onChange, maxSelect = 3, powers }: PowerSelectorProps) {
  const superPowers = powers ?? defaultSuperPowers;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getStatBonus = (power: SuperPower) => {
    return [
      { key: 'damage', label: '攻击加成', value: power.damage, icon: statIcons.damage, color: 'text-red-400' },
      { key: 'energyCost', label: '能量消耗', value: power.energyCost, icon: statIcons.energyCost, color: 'text-cyan-400' },
      { key: 'cooldown', label: '冷却时间', value: `${power.cooldown}s`, icon: statIcons.cooldown, color: 'text-purple-400' },
    ];
  };

  const togglePower = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((p) => p !== id));
    } else if (selectedIds.length < maxSelect) {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="font-display text-lg font-semibold text-scifi-text">超能力选择</h3>
        </div>
        <span className="text-xs text-scifi-muted font-medium">
          已选择 <span className="text-cyan-400 font-bold">{selectedIds.length}</span> / {maxSelect}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {superPowers.map((power, index) => {
          const isSelected = selectedIds.includes(power.id);
          const isHovered = hoveredId === power.id;
          const isDisabled = !isSelected && selectedIds.length >= maxSelect;
          const StatIcon = Shield;

          return (
            <motion.div
              key={power.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => !isDisabled && togglePower(power.id)}
              onMouseEnter={() => setHoveredId(power.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'relative cursor-pointer transition-all duration-300',
                isDisabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <TechCard
                className={cn(
                  'overflow-hidden h-full',
                  isSelected && 'border-cyan-400/80 shadow-glow-cyan',
                )}
                borderColor={isSelected ? 'cyan' : 'purple'}
                glow={!isDisabled}
              >
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-glow-cyan z-10"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className="flex items-start gap-4">
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'w-14 h-14 rounded-lg flex items-center justify-center text-3xl border flex-shrink-0',
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400/50'
                        : 'bg-white/5 border-white/10',
                    )}
                  >
                    {power.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base font-bold text-scifi-text mb-1">
                      {power.name}
                    </h4>
                    <p className="text-xs text-scifi-muted leading-relaxed line-clamp-2 mb-3">
                      {power.description}
                    </p>

                    <div className="space-y-1.5">
                      {getStatBonus(power).map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div key={stat.key} className="flex items-center gap-2">
                            <Icon className={cn('w-3.5 h-3.5', stat.color)} />
                            <span className="text-xs text-scifi-muted">{stat.label}:</span>
                            <span className={cn('text-xs font-semibold', stat.color)}>
                              {stat.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isHovered && !isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <StatIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-scifi-muted">点击选择此超能力</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TechCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PowerSelector;
