import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, StatCard, GlowButton, ProgressBar } from '@/components/ui';
import { MemberRow } from '@/components/guild/MemberRow';
import { BuildingCard } from '@/components/guild/BuildingCard';
import { WarCard } from '@/components/guild/WarCard';
import { DistrictWarBattle } from '@/components/guild/DistrictWarBattle';
import { useGuildStore } from '@/store/useGuildStore';
import { api } from '@/lib/api';
import { districts } from '@/data/city';
import type { Guild as ApiGuild, GuildMember as ApiGuildMember, GuildBuilding as ApiGuildBuilding, DistrictWar as ApiDistrictWar } from '@/types';
import type { Guild as DataGuild, GuildMember as DataGuildMember, GuildBuilding as DataGuildBuilding, GuildRank, DistrictWar as DataDistrictWar } from '@/data/guild';

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

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const mockRequests: PendingRequest[] = [
  { id: 'req-1', name: '李明', alias: '疾风', level: 7, power: 2800, avatar: '🧑‍🦱' },
  { id: 'req-2', name: '张静', alias: '月影', level: 9, power: 4100, avatar: '👩' },
];

const rankMap: Record<string, GuildRank> = {
  president: 'leader',
  vice: 'officer',
  officer: 'officer',
  member: 'member',
  leader: 'leader',
  recruit: 'recruit',
};

const buildingIconMap: Record<string, string> = {
  training: '🏋️',
  intelligence: '📡',
  armory: '⚔️',
  lounge: '🛋️',
  warehouse: '📦',
};

function adaptGuildMember(api: ApiGuildMember): DataGuildMember {
  return {
    id: api.heroId,
    name: api.heroName,
    alias: api.heroName,
    rank: rankMap[api.role] ?? 'member',
    level: 10,
    power: Math.round(api.contribution * 0.5),
    contribution: api.contribution,
    joinedAt: api.joinDate,
    avatar: '🦸',
  };
}

function adaptGuildBuilding(api: ApiGuildBuilding): DataGuildBuilding {
  return {
    id: api.id,
    name: api.name,
    type: 'training',
    level: api.level,
    maxLevel: api.maxLevel,
    description: api.effect,
    effect: api.effect,
    upgradeCost: api.upgradeCost,
    icon: buildingIconMap[api.id] ?? '🏛️',
  };
}

function adaptGuild(api: ApiGuild): DataGuild {
  return {
    id: api.id,
    name: api.name,
    tag: api.name.slice(0, 3).toUpperCase(),
    level: api.level,
    exp: Math.floor(api.totalPower * 0.5),
    maxExp: api.level * 100000,
    description: `${api.name} 公会`,
    members: api.members.map(adaptGuildMember),
    maxMembers: 50,
    buildings: api.buildings.map(adaptGuildBuilding),
    controlledDistricts: api.controlledDistricts,
    treasury: api.totalPower * 10,
    reputation: Math.floor(api.totalPower * 0.1),
    createdAt: Date.now() - 86400000 * 100,
    icon: '🛡️',
  };
}

function adaptDistrictWar(api: ApiDistrictWar): DataDistrictWar {
  return {
    id: api.id,
    districtId: api.districtId,
    districtName: api.districtId,
    attackerGuildId: api.attackerGuildId,
    attackerGuildName: api.attackerGuildId,
    defenderGuildId: api.defenderGuildId,
    defenderGuildName: api.defenderGuildId,
    attackerPower: api.attackerPower,
    defenderPower: api.defenderPower,
    startTime: Date.now(),
    endTime: Date.now() + 3600000 * 3,
    attackerScore: api.attackerControl,
    defenderScore: api.defenderControl,
    status: api.status === 'fighting' ? 'ongoing' : api.status === 'ended' ? 'ended' : 'preparing',
    winner: api.winner,
  };
}

export default function Guild() {
  const [activeTab, setActiveTab] = useState<TabKey>('members');
  const [pendingRequests, setPendingRequests] = useState(mockRequests);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [selectedWar, setSelectedWar] = useState<DataDistrictWar | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableGuilds, setAvailableGuilds] = useState<DataGuild[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [warTickTimer, setWarTickTimer] = useState<NodeJS.Timeout | null>(null);

  const currentGuild = useGuildStore((s) => s.currentGuild);
  const wars = useGuildStore((s) => s.wars);
  const storeLoading = useGuildStore((s) => s.loading);
  const storeError = useGuildStore((s) => s.error);
  const fetchGuilds = useGuildStore((s) => s.fetchGuilds);
  const fetchGuildAsync = useGuildStore((s) => s.fetchGuildAsync);
  const promoteMemberAsync = useGuildStore((s) => s.promoteMemberAsync);
  const upgradeBuildingAsync = useGuildStore((s) => s.upgradeBuildingAsync);
  const declareWarAsync = useGuildStore((s) => s.declareWarAsync);
  const fetchWarsAsync = useGuildStore((s) => s.fetchWarsAsync);
  const setError = useGuildStore((s) => s.setError);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const guilds = await fetchGuilds();
      const adaptedGuilds = guilds.map((g) => adaptGuild(g as unknown as ApiGuild));
      setAvailableGuilds(adaptedGuilds);

      if (guilds.length > 0) {
        await fetchGuildAsync(guilds[0].id);
      }
      await fetchWarsAsync();
    } catch (error) {
      showToast(`加载公会数据失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const displayGuild = currentGuild
    ? ('members' in currentGuild && typeof currentGuild.members[0] === 'object' && 'heroId' in (currentGuild.members[0] || {}))
      ? adaptGuild(currentGuild as unknown as ApiGuild)
      : (currentGuild as DataGuild)
    : null;

  const displayWars = wars.map((w) =>
    'attackerControl' in w ? adaptDistrictWar(w as unknown as ApiDistrictWar) : (w as DataDistrictWar),
  );

  const currentUserRank: GuildRank = 'leader';
  const canManage = currentUserRank === 'leader' || currentUserRank === 'officer';
  const canUpgrade = currentUserRank === 'leader';

  const totalPower = displayGuild
    ? displayGuild.members.reduce((sum, m) => sum + m.power, 0)
    : 0;
  const totalContribution = displayGuild
    ? displayGuild.members.reduce((sum, m) => sum + m.contribution, 0)
    : 0;

  const sortedMembers = displayGuild
    ? [...displayGuild.members].sort((a, b) => {
        const rankOrder = ['leader', 'officer', 'member', 'recruit'];
        const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        if (rankDiff !== 0) return rankDiff;
        return b.power - a.power;
      })
    : [];

  const controlledDistricts = displayGuild
    ? districts.filter((d) => displayGuild.controlledDistricts.includes(d.id))
    : [];

  const availableDistricts = displayGuild
    ? districts.filter((d) => !displayGuild.controlledDistricts.includes(d.id))
    : [];

  const declarableWars = availableDistricts.map((d, idx) => {
    const defendingGuild = availableGuilds.find((g) => g.controlledDistricts.includes(d.id));
    return {
      id: `war-declare-${d.id}`,
      districtId: d.id,
      districtName: d.name,
      attackerGuildId: displayGuild?.id ?? '',
      attackerGuildName: displayGuild?.name ?? '',
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

  const handlePromote = async (memberId: string) => {
    if (!displayGuild) return;
    setActionLoading(true);
    await promoteMemberAsync(displayGuild.id, memberId, 'officer');
    if (storeError) {
      showToast(`晋升失败: ${storeError}`, 'error');
      setError(null);
    } else {
      showToast('成员晋升成功', 'success');
    }
    setActionLoading(false);
  };

  const handleDemote = async (memberId: string) => {
    if (!displayGuild) return;
    setActionLoading(true);
    await promoteMemberAsync(displayGuild.id, memberId, 'member');
    if (storeError) {
      showToast(`降级失败: ${storeError}`, 'error');
      setError(null);
    } else {
      showToast('成员降级成功', 'success');
    }
    setActionLoading(false);
  };

  const handleViewBattle = (warId: string) => {
    const war = displayWars.find((w) => w.id === warId);
    if (war) {
      setSelectedWar(war);
      setBattleModalOpen(true);
      const timer = setInterval(async () => {
        try {
          await api.tickWar(warId);
          await fetchWarsAsync();
        } catch (e) {
          // ignore tick errors
        }
      }, 5000);
      setWarTickTimer(timer);
    }
  };

  const closeBattleModal = () => {
    if (warTickTimer) {
      clearInterval(warTickTimer);
      setWarTickTimer(null);
    }
    setBattleModalOpen(false);
    setSelectedWar(null);
  };

  const handleDeclareWar = async (
    districtId: string,
    districtName: string,
    defenderId: string,
    defenderName: string,
  ) => {
    if (!displayGuild) return;
    setActionLoading(true);
    await declareWarAsync({
      districtId,
      districtName,
      attackerGuildId: displayGuild.id,
      attackerGuildName: displayGuild.name,
      defenderGuildId: defenderId,
      defenderGuildName: defenderName,
    });
    if (storeError) {
      showToast(`宣战失败: ${storeError}`, 'error');
      setError(null);
    } else {
      showToast(`已对 ${defenderName} 宣战，争夺 ${districtName}`, 'success');
      await fetchWarsAsync();
    }
    setActionLoading(false);
  };

  const handleApproveRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast('已通过加入申请', 'success');
  };

  const handleRejectRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast('已拒绝加入申请', 'info');
  };

  const handleBuildingUpgrade = async (buildingId: string) => {
    if (!displayGuild) return;
    setActionLoading(true);
    await upgradeBuildingAsync(displayGuild.id, buildingId);
    if (storeError) {
      showToast(`升级建筑失败: ${storeError}`, 'error');
      setError(null);
    } else {
      showToast('建筑升级成功', 'success');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <TechCard className="max-w-md text-center p-12" borderColor="purple">
          <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
          <h2 className="font-display text-xl font-bold text-scifi-text mb-2">加载公会数据中...</h2>
          <p className="text-sm text-scifi-muted">正在与公会服务器同步数据</p>
        </TechCard>
      </div>
    );
  }

  if (!displayGuild) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <TechCard className="max-w-md text-center p-12" borderColor="purple">
          <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-scifi-text mb-2">尚未加入公会</h2>
          <p className="text-sm text-scifi-muted mb-6">
            创建或加入一个公会，与其他英雄一起守护城市！
          </p>
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
              <span className="drop-shadow-lg">{displayGuild.icon}</span>
            </motion.div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl font-bold text-gradient-cyber tracking-tight">
                  {displayGuild.name}
                </h1>
                <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[11px] font-mono font-semibold border border-purple-400/30">
                  [{displayGuild.tag}]
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-300 font-semibold">
                  公会等级 Lv.{displayGuild.level}
                </span>
                <span className="text-xs text-scifi-muted mx-2">·</span>
                <span className="text-xs text-scifi-muted">{displayGuild.description}</span>
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
                {displayGuild.members.length}/{displayGuild.maxMembers}
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
                {displayGuild.treasury.toLocaleString()}
              </p>
              <p className="text-[10px] text-scifi-muted uppercase tracking-wider">金库</p>
            </div>
          </div>
        </div>

        <div className="relative mt-5">
          <ProgressBar
            value={displayGuild.exp}
            max={displayGuild.maxExp}
            color="cyan-purple"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="在线成员"
          value={Math.floor(displayGuild.members.length * 0.7)}
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
            <TechCard
              title={`加入申请 (${pendingRequests.length})`}
              className="p-5"
              borderColor="purple"
            >
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
                          「{req.alias}」· Lv.{req.level} · 战力{' '}
                          {req.power.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlowButton
                        size="sm"
                        variant="success"
                        onClick={() => handleApproveRequest(req.id)}
                        disabled={actionLoading}
                      >
                        <Check className="w-3.5 h-3.5" />
                        通过
                      </GlowButton>
                      <GlowButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRejectRequest(req.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                        拒绝
                      </GlowButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TechCard>
          )}

          <TechCard
            title={`成员列表 (${sortedMembers.length})`}
            className="p-0 overflow-hidden"
            borderColor="cyan"
          >
            {storeLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-2" />
                <p className="text-sm text-scifi-muted">加载成员列表中...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="py-3.5 px-4 text-left">
                        <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                          成员
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-center w-32">
                        <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                          战力
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-center w-32">
                        <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                          贡献
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-center w-32">
                        <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                          加入时间
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-right w-40">
                        <span className="text-[10px] font-semibold text-scifi-muted uppercase tracking-widest">
                          操作
                        </span>
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
            )}
          </TechCard>
        </div>
      )}

      {activeTab === 'buildings' && (
        <div>
          {storeLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-3" />
              <p className="text-sm text-scifi-text">加载建筑数据中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayGuild.buildings.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  canUpgrade={canUpgrade && !actionLoading}
                  treasury={displayGuild.treasury}
                  onUpgrade={handleBuildingUpgrade}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wars' && (
        <div className="space-y-6">
          {displayWars.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-400" />
                进行中的战斗
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayWars.map((war) => (
                  <WarCard key={war.id} war={war} onViewBattle={handleViewBattle} />
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
                        bonus.color === 'purple' &&
                          'from-purple-500/20 to-purple-500/5 border-purple-400/40 text-purple-400',
                        bonus.color === 'cyan' &&
                          'from-cyan-500/20 to-cyan-500/5 border-cyan-400/40 text-cyan-400',
                        bonus.color === 'yellow' &&
                          'from-yellow-500/20 to-yellow-500/5 border-yellow-400/40 text-yellow-400',
                        bonus.color === 'red' &&
                          'from-red-500/20 to-red-500/5 border-red-400/40 text-red-400',
                        bonus.color === 'green' &&
                          'from-green-500/20 to-green-500/5 border-green-400/40 text-green-400',
                        bonus.color === 'pink' &&
                          'from-pink-500/20 to-pink-500/5 border-pink-400/40 text-pink-400',
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
          onClose={closeBattleModal}
          war={selectedWar}
        />
      )}

      <div className="fixed top-6 right-6 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto relative px-4 py-3 rounded-lg border backdrop-blur-xl max-w-sm',
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-green-400/40 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                  : toast.type === 'error'
                    ? 'bg-gradient-to-r from-red-500/15 to-rose-500/10 border-red-400/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                    : 'bg-scifi-panel/95 border-cyan-400/30',
              )}
            >
              <div className="flex items-start gap-3">
                {toast.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                )}
                {toast.type === 'error' && (
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-xs text-scifi-text leading-relaxed">{toast.message}</p>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-scifi-muted hover:text-scifi-text transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {actionLoading && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-scifi-panel/95 border border-purple-400/30">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-sm text-scifi-text">处理中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
