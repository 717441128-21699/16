import { motion } from 'framer-motion';
import { Skull, Bot, Bug, Ghost, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui';

export interface EnemyData {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  type: 'robot' | 'alien' | 'mutant' | 'ghost' | 'demon';
  icon?: string;
}

interface EnemyCardProps {
  enemy: EnemyData;
  isTargeted?: boolean;
  onClick?: () => void;
  showDamageEffect?: boolean;
}

const typeConfig: Record<EnemyData['type'], { icon: React.ReactNode; color: string; border: string; glow: string }> = {
  robot: {
    icon: <Bot className="w-5 h-5" />,
    color: 'text-cyan-400',
    border: 'border-cyan-400/40',
    glow: 'hover:shadow-glow-cyan',
  },
  alien: {
    icon: <Bug className="w-5 h-5" />,
    color: 'text-green-400',
    border: 'border-green-400/40',
    glow: 'hover:shadow-glow-green',
  },
  mutant: {
    icon: <Skull className="w-5 h-5" />,
    color: 'text-purple-400',
    border: 'border-purple-400/40',
    glow: 'hover:shadow-glow-purple',
  },
  ghost: {
    icon: <Ghost className="w-5 h-5" />,
    color: 'text-blue-400',
    border: 'border-blue-400/40',
    glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3),0_0_40px_rgba(59,130,246,0.1)]',
  },
  demon: {
    icon: <Flame className="w-5 h-5" />,
    color: 'text-red-400',
    border: 'border-red-400/40',
    glow: 'hover:shadow-glow-red',
  },
};

export function EnemyCard({ enemy, isTargeted = false, onClick, showDamageEffect = false }: EnemyCardProps) {
  const config = typeConfig[enemy.type];
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const hpColor = hpPercent > 60 ? 'green' : hpPercent > 30 ? 'yellow' : 'red';
  const isDead = enemy.hp <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isDead ? 0.3 : 1,
        scale: isDead ? 0.95 : 1,
        filter: isDead ? 'grayscale(100%)' : 'none',
      }}
      whileHover={!isDead ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.25 }}
      onClick={!isDead ? onClick : undefined}
      className={cn(
        'relative glass rounded-lg border backdrop-blur-xl overflow-hidden transition-all duration-300 p-4',
        config.border,
        !isDead && config.glow,
        !isDead && onClick && 'cursor-pointer',
        isTargeted && !isDead && 'ring-2 ring-yellow-400/70 shadow-glow-yellow',
        isDead && 'opacity-50 pointer-events-none',
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}
    >
      {showDamageEffect && (
        <motion.div
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-red-500/50 pointer-events-none rounded-lg"
        />
      )}

      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={!isDead ? { rotate: [0, 3, -3, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className={cn(
            'w-11 h-11 rounded-lg border flex items-center justify-center bg-gradient-to-br',
            enemy.type === 'robot' && 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-400/30',
            enemy.type === 'alien' && 'from-green-500/20 to-green-500/5 text-green-400 border-green-400/30',
            enemy.type === 'mutant' && 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-400/30',
            enemy.type === 'ghost' && 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-400/30',
            enemy.type === 'demon' && 'from-red-500/20 to-red-500/5 text-red-400 border-red-400/30',
          )}
        >
          {enemy.icon ? <span className="text-xl">{enemy.icon}</span> : config.icon}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              'font-display font-semibold text-scifi-text tracking-wide truncate',
              isDead && 'line-through',
            )}>
              {enemy.name}
            </h4>
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border',
              enemy.type === 'robot' && 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400',
              enemy.type === 'alien' && 'bg-green-500/10 border-green-400/30 text-green-400',
              enemy.type === 'mutant' && 'bg-purple-500/10 border-purple-400/30 text-purple-400',
              enemy.type === 'ghost' && 'bg-blue-500/10 border-blue-400/30 text-blue-400',
              enemy.type === 'demon' && 'bg-red-500/10 border-red-400/30 text-red-400',
            )}>
              {enemy.type}
            </span>
          </div>
          <p className="text-xs text-scifi-muted mt-0.5">
            攻击力: <span className="text-red-400 font-mono font-semibold">{enemy.damage}</span>
          </p>
        </div>

        {isDead && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-2xl"
          >
            💀
          </motion.div>
        )}
      </div>

      <ProgressBar
        value={enemy.hp}
        max={enemy.maxHp}
        color={hpColor}
        height={6}
        showLabel={true}
      />
    </motion.div>
  );
}

export default EnemyCard;
