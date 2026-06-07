import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuperPower } from '@/data/heroes';

interface SkillBarProps {
  skills: SuperPower[];
  currentEnergy: number;
  onUseSkill?: (skill: SuperPower) => void;
  disabled?: boolean;
}

interface SkillState {
  cooldown: number;
}

export function SkillBar({ skills, currentEnergy, onUseSkill, disabled = false }: SkillBarProps) {
  const [skillStates, setSkillStates] = useState<Record<string, SkillState>>(() =>
    Object.fromEntries(skills.map((s) => [s.id, { cooldown: 0 }])),
  );
  const [castingId, setCastingId] = useState<string | null>(null);

  const handleSkillClick = (skill: SuperPower) => {
    if (disabled) return;
    const state = skillStates[skill.id];
    if (state?.cooldown > 0) return;
    if (currentEnergy < skill.energyCost) return;

    setCastingId(skill.id);
    setSkillStates((prev) => ({
      ...prev,
      [skill.id]: { cooldown: skill.cooldown },
    }));

    setTimeout(() => {
      const interval = setInterval(() => {
        setSkillStates((prev) => {
          const current = prev[skill.id]?.cooldown ?? 0;
          if (current <= 1) {
            clearInterval(interval);
            return { ...prev, [skill.id]: { cooldown: 0 } };
          }
          return { ...prev, [skill.id]: { cooldown: current - 1 } };
        });
      }, 1000);
    }, 0);

    setTimeout(() => setCastingId(null), 400);
    onUseSkill?.(skill);
  };

  return (
    <div className="flex items-end justify-center gap-3 p-4">
      {skills.map((skill, idx) => {
        const state = skillStates[skill.id] ?? { cooldown: 0 };
        const isOnCooldown = state.cooldown > 0;
        const notEnoughEnergy = currentEnergy < skill.energyCost;
        const isDisabled = disabled || isOnCooldown || notEnoughEnergy;
        const isCasting = castingId === skill.id;
        const cooldownPercent = isOnCooldown ? (state.cooldown / skill.cooldown) * 100 : 0;

        return (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="relative"
          >
            <motion.button
              whileHover={!isDisabled ? { y: -4, scale: 1.05 } : undefined}
              whileTap={!isDisabled ? { scale: 0.95 } : undefined}
              onClick={() => handleSkillClick(skill)}
              disabled={isDisabled}
              className={cn(
                'relative w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-200',
                'bg-gradient-to-br from-scifi-panel to-black/40',
                !isDisabled && 'border-cyan-400/50 hover:border-cyan-400 hover:shadow-glow-cyan cursor-pointer',
                isOnCooldown && 'border-gray-500/40 opacity-70',
                notEnoughEnergy && !isOnCooldown && 'border-red-400/40',
                isCasting && 'ring-4 ring-cyan-400/60 scale-110',
              )}
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}
            >
              <AnimatePresence>
                {isCasting && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-xl bg-cyan-400"
                  />
                )}
              </AnimatePresence>

              {isOnCooldown && (
                <motion.div
                  className="absolute inset-0 bg-black/70 origin-bottom"
                  initial={{ height: '100%' }}
                  animate={{ height: `${cooldownPercent}%` }}
                  transition={{ duration: 0.5 }}
                  style={{ bottom: 0, top: 'auto' }}
                />
              )}

              <motion.span
                animate={isCasting ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="text-2xl relative z-10"
              >
                {skill.icon}
              </motion.span>

              <div className="flex items-center gap-0.5 mt-0.5 relative z-10">
                <Zap className={cn(
                  'w-2.5 h-2.5',
                  notEnoughEnergy && !isOnCooldown ? 'text-red-400' : 'text-yellow-400',
                )} />
                <span className={cn(
                  'text-[10px] font-bold font-mono',
                  notEnoughEnergy && !isOnCooldown ? 'text-red-400' : 'text-yellow-400',
                )}>
                  {skill.energyCost}
                </span>
              </div>

              {isOnCooldown && (
                <motion.span
                  key={state.cooldown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-display text-white z-20"
                >
                  {state.cooldown}
                </motion.span>
              )}
            </motion.button>

            <div className="mt-1.5 text-center">
              <p className={cn(
                'text-[10px] font-medium font-display uppercase tracking-wider truncate w-16',
                isDisabled ? 'text-scifi-muted' : 'text-scifi-text',
              )}>
                {skill.name}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default SkillBar;
