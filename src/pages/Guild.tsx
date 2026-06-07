import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Swords,
  Sparkles,
  Crown,
  Shield,
  Coins,
  Flag,
  Plus,
  Check,
  X,
  Star,
  Zap,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, StatCard, GlowButton, ProgressBar } from '@/components/ui';
import { MemberRow } from '@/components/guild/MemberRow';
import { BuildingCard } from '@/components/guild/BuildingCard';
import { WarCard } from '@/components/guild/WarCard';
import { DistrictWarBattle } from '@/components/guild/DistrictWarBattle';
import { useGuildStore } from '@/store/useGuildStore';
import { districts } from '@/data/city';
import { sampleGuilds } from '@/data/guild';
import type { GuildRank, DistrictWar } from '@/data/guild';

type TabKey = 'members' | 'buildings' | 'wars' | 'bonuses';

const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'members', label: '成员管理', icon: Users },
  { key: 'buildings', label: '建筑升级', icon: Building2 },
  { key: 'wars', label: '街区争夺', icon: Swords },
  { key: 'bonuses', label: '加成总览', icon: Sparkles },
];

interface PendingRequest {
  id: string;
  name: string;
  alias: string;
  level: number;
  power: number;
  avatar: string;
}

const mockRequests: PendingRequest[] = [
  { id: 'req-1', name: '李明', alias: '疾风', level: 7, power: 2800, avatar: '🧑‍🦱' },
  { id: 'req-2', name: '张静', alias: '月影', level: 9, power: 4100, avatar: '👩' },
];

export default function Guild() {
  const [activeTab, setActiveTab] = useState<TabKey>('members');
  const [pendingRequests, setPendingRequests] = useState(mockRequests);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [selectedWar, setSelectedWar] = useState<DistrictWar | null>(null);

  const currentGuild = useGuildStore((s) => s.currentGuild);
  const wars = useGuildStore((s) => s.wars);
  const upgradeBuilding = useGuildStore((s) => s.upgradeBuilding);
  const promoteMember = useGuildStore((s) => s.promoteMember);
  const declareWar = useGuildStore((s) => s.declareWar);

  if (!currentGuild) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <TechCard className="max-w-md text-center p-12" borderColor="purple">
          <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-scifi-text mb-2">尚未加入公会</h2>
          <p className="text-sm text-scifi-muted mb-6">创建或加入一个公会，与其他英雄一起守护城市！</p>
          <div className="flex gap-3 justify-center">
            <GlowButton variant="primary">
              <Plus className="w-4 h-4" />
              创建公会
            </GlowButton>
            <GlowButton variant="ghost">
              <Users className="w-4 h-4" />
              搜索公会
            </GlowButton>
          </div>
        </TechCard>
      </div>
    );
  }

  const currentUserRank: GuildRank = 'leader';
  const canManage = currentUserRank === 'leader' || currentUserRank === 'officer';
  const canUpgrade = currentUserRank === 'leader';

  const totalPower = currentGuild.members.reduce((sum, m) => sum + m.power, 0);
  const totalContribution = currentGuild.members.reduce((sum, m) => sum + m.contribution, 0);

  const sortedMembers = [...currentGuild.members].sort((a, b) => {
    const rankOrder = ['leader', 'officer', 'member', 'recruit'];
    const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    if (rankDiff !== 0) return rankDiff;
    return b.power - a.power;
  });

  const controlledDistricts = districts.filter((d) =>
    currentGuild.controlledDistricts.includes(d.id),
  );

  const availableDistricts = districts.filter(
    (d) => !currentGuild.controlledDistricts.includes(d.id),
  );

  const declarableWars = availableDistricts.map((d, idx) => {
    const defendingGuild = sampleGuilds.find((g) => g.controlledDistricts.includes(d.id));
    return {
      id: `war-declare-${d.id}`,
      districtId: d.id,
      districtName: d.name,
      attackerGuildId: currentGuild.id,
      attackerGuildName: currentGuild.name,
      attackerPower: totalPower,
      attackerScore: 0,
      defenderGuildId: defendingGuild?.id ?? 'npc',
      defenderGuildName: defendingGuild?.name ?? '无主之地',
      defenderPower: defendingGuild
        ? defendingGuild.members.reduce((s, m) => s + m.power, 0)
        : Math.floor(totalPower * 0.6),
      defenderScore: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      status: 'preparing' as const,
    };
  });

  const bonuses = [
    { name: '经验加成', value: '+15%', icon: Star, color: 'purple', source: '训练室 Lv.3' },
    { name: '事件奖励', value: '+10%', icon: Zap, color: 'cyan', source: '情报中心 Lv.2' },
    { name: '装备耐久', value: '-20%', icon: Shield, color: 'yellow', source: '武器库 Lv.4' },
    { name: '战力加成', value: '+5%', icon: Swords, color: 'red', source: '公会等级 Lv.8' },
    { name: '生命上限', value: '+10%', icon: Heart, color: 'green', source: '控制区域加成' },
    { name: '能量恢复', value: '+8%', icon: Sparkles, color: 'pink', source: '全体加成' },
  ];

  const handlePromote = (memberId: string) => {
    promoteMember(memberId, 'officer');
  };

  const handleDemote = (memberId: string) => {
    promoteMember(memberId, 'member');
  };

  const handleViewBattle = (warId: string) => {
    const war = wars.find((w) => w.id === warId);
    if (war) {
      setSelectedWar(war);
      setBattleModalOpen(true);
    }
  };

  const handleDeclareWar = (districtId: string, districtName: string, defenderId: string, defenderName: string) => {
    declareWar(districtId, districtName, defenderId, defenderName);
  };

  const handleApproveRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleRejectRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/15 via-scifi-panel to-cyan-500/10 p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(168,85,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border-2 border-purple-400/50 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <span className="drop-shadow-lg">{currentGuild.icon}</span>
            </motion.div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl font-bold text-gradient-cyber tracking-tight">
                  {currentGuild.name}
                </h1>
                <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[11px] font-mono font-semibold border border-purple-400/30">
                  [{currentGuild.tag}]
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-300 font-semibold">公会等级 Lv.{currentGuild.level}</span>
                <span className="text-xs text-scifi-muted mx-2">·</span>
                <span className="text-xs text-scifi-muted">{currentGuild.description}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {controlledDistricts.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold border border-cyan-400/30"
                  >
                    <Flag className="w-3 h-3" />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-cyan-300">
                {currentGuild.members.length}/{currentGuild.maxMembers}
              </p>
              <p className="text-[10px] text-scifi-muted uppercase tracking-wider">成员</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <Swords className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-red-300">
                {totalPower.toLocaleString()}
              </p>
              <p className="text-[10px] text-scifi-muted uppercase tracking-wider">总战力</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-yellow-300">
                {currentGuild.treasury.toLocaleString()}
              </p>
              <p className="text-[10px] text-scifi-muted uppercase tracking-wider">金库</p>
            </div>
          </div>
        </div>

        <div className="relative mt-5">
          <ProgressBar value={currentGuild.exp} max={currentGuild.maxExp} color="cyan-purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="在线成员"
          value={Math.floor(currentGuild.members.length * 0.7)}
          change={2}
          color="cyan"
        />
        <StatCard
          icon={<Coins className="w-5 h-5" />}
          label="本周贡献"
          value={totalContribution.toLocaleString()}
          change={15}
          color="yellow"
        />
        <StatCard
          icon={<Flag className="w-5 h-5" />}
          label="控制区域"
          value={controlledDistricts.length}
          change={0}
          color="purple"
        />
      </div>

      <TechCard className="p-4" glow={false} borderColor="purple">
        <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all duration-300',
                  activeTab === tab.key
                    ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'text-scifi-muted hover:text-scifi-text hover:bg-white/5',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </TechCard>

      {activeTab === 'members' && (
        <div className="space-y-6">
          {pendingRequests.length > 0 && canManage && (
            <TechCard title={`加入申请 (${pendingRequests.length})`} className="p-5" borderColor="purple">
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/10 flex items-center justify-center text-xl border border-purple-400/30">
                        <span>{req.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-scifi-text">{req.name}</p>
                        <p className="text-xs text-scifi-muted">
                          「{req.alias}」· Lv.{req.level} · 战力 {req.power.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlowButton size="sm" variant="success" onClick={() => handleApproveRequest(req.id)}>
                        <Check className="w-3.5 h-3.5" />
                        通过
                      </GlowButton>
                      <GlowButton size="sm" variant="ghost" onClick={() => handleRejectRequest(req.id)}>
                        <X className="w-3.5 h-3.5" />
                        拒绝
                      </GlowButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TechCard>
          )}

          <TechCard title={`成员列表 (${sortedMembers.length})`} className="p-0 overflow-hidden" borderColor="cyan">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-3.5 px-4 text-left">
                      <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">成员</span>
                    </th>
                    <th className="py-3.5 px-4 text-center w-32">
                      <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">战力</span>
                    </th>
                    <th className="py-3.5 px-4 text-center w-32">
                      <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">贡献</span>
                    </th>
                    <th className="py-3.5 px-4 text-center w-32">
                      <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">加入时间</span>
                    </th>
                    <th className="py-3.5 px-4 text-right w-40">
                      <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, idx) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      currentUserRank={currentUserRank}
                      onPromote={handlePromote}
                      onDemote={handleDemote}
                      index={idx}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'buildings' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentGuild.buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                canUpgrade={canUpgrade}
                treasury={currentGuild.treasury}
                onUpgrade={upgradeBuilding}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wars' && (
        <div className="space-y-6">
          {wars.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-400" />
                进行中的战斗
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wars.map((war) => (
                  <WarCard
                    key={war.id}
                    war={war}
                    onViewBattle={handleViewBattle}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-purple-400" />
              可争夺街区
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {declarableWars.map((war) => (
                <WarCard
                  key={war.id}
                  war={war}
                  isDeclarable
                  onDeclareWar={() =>
                    handleDeclareWar(
                      war.districtId,
                      war.districtName,
                      war.defenderGuildId,
                      war.defenderGuildName,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bonuses' && (
        <TechCard title="公会加成总览" className="p-5" borderColor="yellow">
          <p className="text-xs text-scifi-muted mb-5">
            以下加成适用于所有公会成员，升级建筑和占领更多区域可解锁更多加成
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonuses.map((bonus, idx) => {
              const Icon = bonus.icon;
              return (
                <motion.div
                  key={bonus.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                      bonus.color === 'purple' && 'bg-purple-500/5',
                      bonus.color === 'cyan' && 'bg-cyan-500/5',
                      bonus.color === 'yellow' && 'bg-yellow-500/5',
                      bonus.color === 'red' && 'bg-red-500/5',
                      bonus.color === 'green' && 'bg-green-500/5',
                      bonus.color === 'pink' && 'bg-pink-500/5',
                    )}
                  />
                  <div className="relative flex items-start gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center border-2 bg-gradient-to-br flex-shrink-0',
                        bonus.color === 'purple' && 'from-purple-500/20 to-purple-500/5 border-purple-400/40 text-purple-400',
                        bonus.color === 'cyan' && 'from-cyan-500/20 to-cyan-500/5 border-cyan-400/40 text-cyan-400',
                        bonus.color === 'yellow' && 'from-yellow-500/20 to-yellow-500/5 border-yellow-400/40 text-yellow-400',
                        bonus.color === 'red' && 'from-red-500/20 to-red-500/5 border-red-400/40 text-red-400',
                        bonus.color === 'green' && 'from-green-500/20 to-green-500/5 border-green-400/40 text-green-400',
                        bonus.color === 'pink' && 'from-pink-500/20 to-pink-500/5 border-pink-400/40 text-pink-400',
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-display text-sm font-semibold text-scifi-text">
                          {bonus.name}
                        </h4>
                        <span
                          className={cn(
                            'text-sm font-bold font-display',
                            bonus.color === 'purple' && 'text-purple-300',
                            bonus.color === 'cyan' && 'text-cyan-300',
                            bonus.color === 'yellow' && 'text-yellow-300',
                            bonus.color === 'red' && 'text-red-300',
                            bonus.color === 'green' && 'text-green-300',
                            bonus.color === 'pink' && 'text-pink-300',
                          )}
                        >
                          {bonus.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-scifi-muted">来源: {bonus.source}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TechCard>
      )}

      {selectedWar && (
        <DistrictWarBattle
          open={battleModalOpen}
          onClose={() => {
            setBattleModalOpen(false);
            setSelectedWar(null);
          }}
          war={selectedWar}
        />
      )}
    </div>
  );
}
