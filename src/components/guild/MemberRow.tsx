import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Clock, Coins, Star, Crown, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowButton } from '@/components/ui';
import type { GuildMember, GuildRank } from '@/data/guild';

interface MemberRowProps {
  member: GuildMember;
  currentUserRank?: GuildRank;
  onPromote?: (memberId: string) => void;
  onDemote?: (memberId: string) => void;
  index?: number;
}

const rankConfig: Record<GuildRank, { label: string; icon: typeof Star; color: string; bg: string; border: string }> = {
  leader: {
    label: '会长',
    icon: Crown,
    color: 'text-yellow-300',
    bg: 'from-yellow-500/20 to-orange-500/10',
    border: 'border-yellow-400/40',
  },
  officer: {
    label: '副会长',
    icon: Shield,
    color: 'text-purple-300',
    bg: 'from-purple-500/20 to-purple-500/10',
    border: 'border-purple-400/40',
  },
  member: {
    label: '成员',
    icon: Users,
    color: 'text-cyan-300',
    bg: 'from-cyan-500/20 to-cyan-500/10',
    border: 'border-cyan-400/40',
  },
  recruit: {
    label: '新人',
    icon: Star,
    color: 'text-scifi-muted',
    bg: 'from-white/10 to-white/5',
    border: 'border-white/20',
  },
};

const rankOrder: GuildRank[] = ['recruit', 'member', 'officer', 'leader'];

export function MemberRow({ member, currentUserRank, onPromote, onDemote, index = 0 }: MemberRowProps) {
  const config = rankConfig[member.rank];
  const RankIcon = config.icon;
  const currentRankIdx = rankOrder.indexOf(member.rank);
  const userRankIdx = currentUserRank ? rankOrder.indexOf(currentUserRank) : -1;

  const canPromote = currentUserRank === 'leader' && member.rank !== 'officer' && member.rank !== 'leader';
  const canDemote = currentUserRank === 'leader' && member.rank !== 'recruit' && member.rank !== 'leader';

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    if (days < 1) return '今天';
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ backgroundColor: 'rgba(0, 212, 255, 0.03)' }}
      className="border-b border-white/5 transition-colors"
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-lg flex items-center justify-center text-2xl border-2 bg-gradient-to-br relative overflow-hidden',
              config.bg,
              config.border,
            )}
          >
            <span className="drop-shadow">{member.avatar}</span>
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display text-sm font-semibold text-scifi-text truncate">
                {member.name}
              </p>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border',
                  config.bg,
                  config.border,
                  config.color,
                )}
              >
                <RankIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <p className="text-xs text-scifi-muted">「{member.alias}」· Lv.{member.level}</p>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span className="font-display text-lg font-bold text-gradient-cyber">
              {member.power.toLocaleString()}
            </span>
            <span className="text-[10px] text-scifi-muted uppercase tracking-wider">战力</span>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center justify-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-300 font-mono">
            {member.contribution.toLocaleString()}
          </span>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-scifi-muted" />
          <span className="text-xs text-scifi-muted">{formatDate(member.joinedAt)}</span>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center justify-end gap-2">
          {canPromote && (
            <GlowButton
              size="sm"
              variant="success"
              onClick={() => onPromote?.(member.id)}
              className="!py-1 !px-2.5"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              晋升
            </GlowButton>
          )}
          {canDemote && (
            <GlowButton
              size="sm"
              variant="danger"
              onClick={() => onDemote?.(member.id)}
              className="!py-1 !px-2.5"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              降职
            </GlowButton>
          )}
          {!canPromote && !canDemote && (
            <span className="text-[11px] text-scifi-muted">—</span>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export default MemberRow;
