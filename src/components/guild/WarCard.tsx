import { motion } from 'framer-motion';
import { Swords, Clock, Shield, Flag, Eye, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, GlowButton, ProgressBar } from '@/components/ui';
import type { DistrictWar } from '@/data/guild';

interface WarCardProps {
  war: DistrictWar;
  onViewBattle?: (warId: string) => void;
  onDeclareWar?: () => void;
  isDeclarable?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  preparing: {
    label: '准备中',
    color: 'text-yellow-300',
    bg: 'from-yellow-500/20 to-orange-500/10',
    border: 'border-yellow-400/40',
    icon: Clock,
  },
  ongoing: {
    label: '战斗中',
    color: 'text-red-300',
    bg: 'from-red-500/20 to-pink-500/10',
    border: 'border-red-400/40',
    icon: Swords,
  },
  ended: {
    label: '已结束',
    color: 'text-scifi-muted',
    bg: 'from-white/10 to-white/5',
    border: 'border-white/20',
    icon: Trophy,
  },
};

export function WarCard({ war, onViewBattle, onDeclareWar, isDeclarable = false }: WarCardProps) {
  const status = statusConfig[war.status] ?? statusConfig.preparing;
  const StatusIcon = status.icon;

  const totalScore = war.attackerScore + war.defenderScore;
  const attackerPercent = totalScore > 0 ? (war.attackerScore / totalScore) * 100 : 50;
  const defenderPercent = totalScore > 0 ? (war.defenderScore / totalScore) * 100 : 50;

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const diff = ts - Date.now();
    if (war.status === 'preparing') {
      const mins = Math.ceil(diff / (1000 * 60));
      if (mins < 60) return `${mins}分钟后开始`;
      return `${Math.floor(mins / 60)}小时后开始`;
    }
    if (war.status === 'ongoing') {
      const remaining = war.endTime - Date.now();
      const mins = Math.ceil(remaining / (1000 * 60));
      if (mins < 0) return '即将结束';
      if (mins < 60) return `剩余 ${mins} 分钟`;
      return `剩余 ${Math.floor(mins / 60)} 小时`;
    }
    return date.toLocaleDateString('zh-CN');
  };

  if (isDeclarable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
      >
        <TechCard className="h-full" borderColor="purple" glow>
          <div className="p-5 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-scifi-text">
                  {war.districtName}
                </h3>
                <p className="text-xs text-scifi-muted mt-0.5">
                  当前控制: {war.defenderGuildName}
                </p>
              </div>
              <Flag className="w-8 h-8 text-purple-400" />
            </div>

            <div className="flex-1 space-y-3 mb-5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-scifi-muted">防守方</span>
                </div>
                <span className="text-xs font-semibold text-cyan-300">
                  {war.defenderGuildName}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Swords className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-scifi-muted">防守战力</span>
                </div>
                <span className="text-xs font-semibold font-mono text-red-300">
                  {war.defenderPower.toLocaleString()}
                </span>
              </div>
            </div>

            <GlowButton
              variant="danger"
              size="md"
              className="w-full"
              onClick={onDeclareWar}
            >
              <Swords className="w-4 h-4" />
              发起争夺
            </GlowButton>
          </div>
        </TechCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
    >
      <TechCard className="h-full overflow-hidden" borderColor={war.status === 'ongoing' ? 'red' : war.status === 'preparing' ? 'yellow' : 'cyan'} glow>
        <div className="relative">
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-16 bg-gradient-to-b opacity-40',
              status.bg,
            )}
          />

          <div className="relative p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display text-base font-bold text-scifi-text">
                  {war.districtName}
                </h3>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border',
                  status.bg,
                  status.border,
                  status.color,
                )}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-3 items-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-red-300 truncate mb-1">
                  {war.attackerGuildName}
                </p>
                <p className="text-[10px] text-scifi-muted">进攻方</p>
                <p className="text-sm font-bold font-mono text-red-300 mt-1">
                  {war.attackerScore.toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={war.status === 'ongoing' ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
                  transition={war.status === 'ongoing' ? { duration: 1.5, repeat: Infinity } : {}}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-purple-400/40 flex items-center justify-center"
                >
                  <Swords className="w-6 h-6 text-purple-400" />
                </motion.div>
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold text-cyan-300 truncate mb-1">
                  {war.defenderGuildName}
                </p>
                <p className="text-[10px] text-scifi-muted">防守方</p>
                <p className="text-sm font-bold font-mono text-cyan-300 mt-1">
                  {war.defenderScore.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="relative h-3 rounded-full overflow-hidden bg-white/5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${attackerPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-y-0 left-0"
                  style={{
                    background: 'linear-gradient(90deg, #ef4444, #ec4899)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                  }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${defenderPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="absolute inset-y-0 right-0"
                  style={{
                    background: 'linear-gradient(90deg, #06b6d4, #00d4ff)',
                    boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                  }}
                />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/30" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-red-300 font-mono">
                  {Math.round(attackerPercent)}%
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">
                  {Math.round(defenderPercent)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-scifi-muted mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(war.status === 'ongoing' ? war.endTime : war.startTime)}</span>
              </div>
              {war.winner && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-300 font-semibold">
                    {war.winner === war.attackerGuildId ? war.attackerGuildName : war.defenderGuildName} 获胜
                  </span>
                </div>
              )}
            </div>

            {war.status === 'ongoing' && (
              <GlowButton
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => onViewBattle?.(war.id)}
              >
                <Eye className="w-4 h-4" />
                查看实时战况
              </GlowButton>
            )}
          </div>
        </div>
      </TechCard>
    </motion.div>
  );
}

export default WarCard;
