import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Shield, Zap, Wind, Sparkles } from 'lucide-react';
import { suits as defaultSuits, type Suit, type Rarity } from '@/data/heroes';
import { TechCard, RarityBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SuitSelectorProps {
  selectedId: string | null;
  onChange: (id: string) => void;
  suits?: Suit[];
}

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

export function SuitSelector({ selectedId, onChange, suits }: SuitSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Rarity | 'all'>('all');
  const suitList = suits ?? defaultSuits;

  const groupedSuits = useMemo(() => {
    const filtered = activeFilter === 'all' ? suitList : suitList.filter((s) => s.rarity === activeFilter);
    return rarityOrder
      .map((rarity) => ({
        rarity,
        items: filtered.filter((s) => s.rarity === rarity),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeFilter]);

  const getStats = (suit: Suit) => {
    return [
      { label: '防御', value: suit.defense, icon: Shield, color: 'text-blue-400' },
      { label: '能量加成', value: `+${suit.energyBonus}`, icon: Zap, color: 'text-cyan-400' },
      { label: '速度加成', value: `+${suit.speedBonus}`, icon: Wind, color: 'text-green-400' },
    ];
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-purple-400" />
          <h3 className="font-display text-lg font-semibold text-scifi-text">战衣选择</h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300',
              activeFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'bg-white/5 text-scifi-muted border border-white/10 hover:bg-white/10',
            )}
          >
            全部
          </button>
          {rarityOrder.map((rarity) => (
            <button
              key={rarity}
              onClick={() => setActiveFilter(rarity)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300',
                activeFilter === rarity
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-white/5 text-scifi-muted border border-white/10 hover:bg-white/10',
              )}
            >
              {rarityLabelMap[rarity]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {groupedSuits.map((group) => (
          <div key={group.rarity} className="space-y-3">
            <div className="flex items-center gap-2">
              <RarityBadge rarity={group.rarity}>
                <span className="uppercase tracking-wider">{rarityLabelMap[group.rarity]}</span>
              </RarityBadge>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.items.map((suit, index) => {
                const isSelected = selectedId === suit.id;
                const isHovered = hoveredId === suit.id;

                return (
                  <motion.div
                    key={suit.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    onClick={() => onChange(suit.id)}
                    onMouseEnter={() => setHoveredId(suit.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative cursor-pointer"
                  >
                    <TechCard
                      borderColor={borderColorMap[suit.rarity]}
                      className={cn(
                        'overflow-hidden h-full transition-all duration-300',
                        isSelected && 'border-cyan-400/80 shadow-glow-cyan scale-[1.02]',
                      )}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
                          transition={{ duration: 0.6 }}
                          className={cn(
                            'w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-3 border',
                            isSelected
                              ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400/50'
                              : 'bg-white/5 border-white/10',
                          )}
                        >
                          {suit.icon}
                        </motion.div>

                        <h4 className="font-display text-sm font-bold text-scifi-text mb-1">
                          {suit.name}
                        </h4>

                        <div className="mb-3">
                          <RarityBadge rarity={suit.rarity}>
                            {rarityLabelMap[suit.rarity]}
                          </RarityBadge>
                        </div>

                        <AnimatePresence>
                          {(isHovered || isSelected) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full overflow-hidden"
                            >
                              <div className="w-full pt-3 border-t border-white/5 space-y-2">
                                {getStats(suit).map((stat) => {
                                  const Icon = stat.icon;
                                  return (
                                    <div
                                      key={stat.label}
                                      className="flex items-center justify-between w-full"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <Icon className={cn('w-3.5 h-3.5', stat.color)} />
                                        <span className="text-[11px] text-scifi-muted">
                                          {stat.label}
                                        </span>
                                      </div>
                                      <span className={cn('text-xs font-semibold', stat.color)}>
                                        {stat.value}
                                      </span>
                                    </div>
                                  );
                                })}

                                {suit.specialEffect && (
                                  <div className="mt-2 pt-2 border-t border-white/5">
                                    <div className="flex items-start gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                      <span className="text-[11px] text-yellow-300/90 leading-relaxed">
                                        {suit.specialEffect}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

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
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuitSelector;
