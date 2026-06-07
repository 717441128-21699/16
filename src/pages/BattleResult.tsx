import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Star, Swords, Heart, Users, Zap, Coins, Shield, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, GlowButton, RarityBadge } from '@/components/ui';
import type { Rarity } from '@/data/heroes';
import { useBattleStore } from '@/store/useBattleStore';
import { useCityStore } from '@/store/useCityStore';
import { useHeroStore } from '@/store/useHeroStore';
import type { BattleState as TypesBattleState } from '@/types';

interface BattleStats {
  totalDamage: number;
  totalHeal: number;
  skillUses: number;
  kills: number;
  rescues: number;
}

interface BattleResultState {
  result: 'victory' | 'defeat';
  time: number;
  teamworkScore: number;
  stats: BattleStats;
}

interface Reward {
  exp: number;
  gold: number;
  reputation: number;
  loot?: {
    name: string;
    rarity: Rarity;
    type: string;
  }[];
}

const fakeTeamStats = [
  { name: '曙光', damage: 12500, heal: 0, kills: 8, isPlayer: true },
  { name: '幽影', damage: 8200, heal: 0, kills: 5, isPlayer: false },
  { name: '磐石', damage: 3200, heal: 2100, kills: 2, isPlayer: false },
];

const generateLoot = (result: 'victory' | 'defeat'): Reward['loot'] => {
  const loot: Reward['loot'] = [];
  if (result === 'victory') {
    if (Math.random() > 0.3) {
      loot.push({
        name: '等离子核心',
        rarity: Math.random() > 0.7 ? 'epic' : Math.random() > 0.5 ? 'rare' : 'common',
        type: '材料',
      });
    }
    if (Math.random() > 0.6) {
      loot.push({
        name: '强化战衣碎片',
        rarity: Math.random() > 0.8 ? 'legendary' : 'rare',
        type: '装备',
      });
    }
    if (Math.random() > 0.8) {
      loot.push({
        name: '能量药剂配方',
        rarity: 'epic',
        type: '蓝图',
      });
    }
  }
  return loot;
};

const calculateRating = (stats: BattleStats, teamworkScore: number, result: 'victory' | 'defeat'): 'S' | 'A' | 'B' | 'C' => {
  if (result === 'defeat') return 'C';
  const score = stats.totalDamage / 100 + stats.kills * 20 + stats.totalHeal / 50 + teamworkScore;
  if (score >= 500) return 'S';
  if (score >= 350) return 'A';
  if (score >= 200) return 'B';
  return 'C';
};

const ratingConfig: Record<string, { color: string; glow: string; label: string }> = {
  S: { color: 'text-yellow-400', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)]', label: '完美' },
  A: { color: 'text-purple-400', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]', label: '优秀' },
  B: { color: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.4)]', label: '良好' },
  C: { color: 'text-scifi-muted', glow: '', label: '合格' },
};

export default function BattleResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as BattleResultState | undefined;

  const { serverBattleState, result: battleStoreResult, loading: battleLoading } = useBattleStore();
  const { activeEvents } = useCityStore();
  const { currentHero, heroList } = useHeroStore();

  const hero = currentHero ?? heroList[0];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const state = useMemo<BattleResultState>(() => {
    if (locationState) return locationState;

    const serverState = serverBattleState as TypesBattleState;
    if (serverState) {
      let result: 'victory' | 'defeat';
      if (battleStoreResult === 'victory' || battleStoreResult === 'defeat') {
        result = battleStoreResult;
      } else if (serverState.status === 'victory') {
        result = 'victory';
      } else if (serverState.status === 'defeat') {
        result = 'defeat';
      } else {
        result = 'victory';
      }

      let totalDamage = 0;
      let totalHeal = 0;
      let skillUses = 0;
      let kills = 0;
      let rescues = 0;

      if (serverState.logs) {
        serverState.logs.forEach((log) => {
          if (log.type === 'damage' && log.value) {
            totalDamage += log.value;
          } else if (log.type === 'heal' && log.value) {
            totalHeal += log.value;
          } else if (log.type === 'skill') {
            skillUses += 1;
          } else if (log.type === 'kill') {
            kills += 1;
          }
        });
      }

      const time = serverState.startTime
        ? Math.floor((Date.now() - serverState.startTime) / 1000)
        : 180;

      return {
        result,
        time: time || 180,
        teamworkScore: serverState.teamworkScore ?? 82,
        stats: {
          totalDamage: totalDamage || 15680,
          totalHeal,
          skillUses,
          kills,
          rescues,
        },
      };
    }

    return {
      result: 'victory' as const,
      time: 180,
      teamworkScore: 82,
      stats: {
        totalDamage: 15680,
        totalHeal: 0,
        skillUses: 12,
        kills: 8,
        rescues: 1,
      },
    };
  }, [locationState, serverBattleState, battleStoreResult]);

  const rewards = useMemo<Reward>(() => {
    const event = activeEvents[0];
    if (event?.reward) {
      const multiplier = state.result === 'victory' ? 1 : 0.3;
      return {
        exp: Math.round(event.reward.exp * multiplier),
        gold: Math.round(event.reward.gold * multiplier),
        reputation: Math.round(event.reward.reputation * multiplier),
        loot: generateLoot(state.result),
      };
    }

    const multiplier = state.result === 'victory' ? 1 : 0.3;
    const baseExp = 500 + state.stats.totalDamage / 10 + state.stats.kills * 50;
    const baseGold = 2000 + state.stats.totalDamage / 20 + state.stats.kills * 100;
    const baseRep = 50 + state.stats.kills * 10;

    return {
      exp: Math.round(baseExp * multiplier),
      gold: Math.round(baseGold * multiplier),
      reputation: Math.round(baseRep * multiplier),
      loot: generateLoot(state.result),
    };
  }, [state, activeEvents]);

  const rating = calculateRating(state.stats, state.teamworkScore, state.result);
  const ratingStyle = ratingConfig[rating];

  const totalTeamDamage = fakeTeamStats.reduce((sum, s) => sum + s.damage, 0);
  const nonPlayerDamage = fakeTeamStats
    .filter(s => !s.isPlayer)
    .reduce((sum, s) => sum + s.damage, 0);
  const playerDamagePercent = Math.round(
    (state.stats.totalDamage / (state.stats.totalDamage + nonPlayerDamage)) * 100
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  if (loading || battleLoading) {
    return (
      <div className="min-h-screen p-6 grid-bg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-scifi-muted">加载战斗结果...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 grid-bg flex items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={state.result === 'victory' ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block text-7xl mb-4"
          >
            {state.result === 'victory' ? '🏆' : '💀'}
          </motion.div>
          <h1 className={cn(
            'font-display text-4xl font-bold uppercase tracking-widest mb-2',
            state.result === 'victory' ? 'text-green-400 glow-text-green' : 'text-red-400 glow-text-red',
          )}>
            {state.result === 'victory' ? '战斗胜利！' : '战斗失败'}
          </h1>
          <p className="text-scifi-muted">
            {state.result === 'victory' ? '任务完成，城市安全了！' : '下次再接再厉！'}
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5 space-y-4">
            <TechCard title="战斗评级" borderColor="yellow">
              <div className="flex flex-col items-center py-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  className={cn(
                    'w-32 h-32 rounded-2xl border-4 flex items-center justify-center bg-gradient-to-br from-black/60 to-scifi-panel mb-4',
                    ratingStyle.color,
                    ratingStyle.glow,
                    rating === 'S' && 'animate-pulse-glow',
                  )}
                >
                  <span className="font-display text-7xl font-black">{rating}</span>
                </motion.div>
                <p className={cn('font-display text-lg font-semibold uppercase tracking-widest', ratingStyle.color)}>
                  {ratingStyle.label}
                </p>
                <p className="text-sm text-scifi-muted mt-1">
                  团队配合评分: {state.teamworkScore}
                </p>
              </div>
            </TechCard>

            <TechCard title="个人贡献统计" borderColor="cyan">
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-scifi-text">伤害占比</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-red-400">{playerDamagePercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${playerDamagePercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)' }}
                    />
                  </div>
                  <p className="text-xs text-scifi-muted mt-1">
                    总伤害: {state.stats.totalDamage.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-scifi-muted">治疗量</span>
                    </div>
                    <p className="font-mono text-xl font-bold text-green-400">
                      {state.stats.totalHeal.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-scifi-muted">救援次数</span>
                    </div>
                    <p className="font-mono text-xl font-bold text-purple-400">
                      {state.stats.rescues}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-scifi-muted">技能释放</span>
                    </div>
                    <p className="font-mono text-xl font-bold text-yellow-400">
                      {state.stats.skillUses}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span className="text-xs text-scifi-muted">击杀数</span>
                    </div>
                    <p className="font-mono text-xl font-bold text-pink-400">
                      {state.stats.kills}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-scifi-muted mb-2">团队伤害统计</p>
                  <div className="space-y-2">
                    {[...fakeTeamStats.filter(s => !s.isPlayer), { name: `${hero?.alias ?? '曙光'} (你)`, damage: state.stats.totalDamage, heal: state.stats.totalHeal, kills: state.stats.kills, isPlayer: true }]
                      .sort((a, b) => b.damage - a.damage)
                      .map((member, idx) => {
                        const percent = Math.round((member.damage / totalTeamDamage) * 100);
                        return (
                          <div key={member.name} className="flex items-center gap-2">
                            <span className={cn(
                              'w-5 h-5 rounded flex items-center justify-center text-xs font-bold',
                              idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                              'bg-orange-600/20 text-orange-400',
                            )}>
                              {idx + 1}
                            </span>
                            <span className={cn(
                              'text-sm w-20 truncate',
                              member.isPlayer ? 'text-cyan-400 font-semibold' : 'text-scifi-text',
                            )}>
                              {member.name}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, delay: 0.6 + idx * 0.1 }}
                                className={cn(
                                  'h-full rounded-full',
                                  member.isPlayer
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                                    : 'bg-gradient-to-r from-white/30 to-white/20',
                                )}
                              />
                            </div>
                            <span className="text-xs font-mono text-scifi-muted w-12 text-right">
                              {percent}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </TechCard>
          </div>

          <div className="col-span-7 space-y-4">
            <TechCard title="奖励展示" borderColor="purple">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-xs text-scifi-muted mb-1">经验值</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                    className="font-mono text-2xl font-bold text-yellow-400"
                  >
                    +{rewards.exp.toLocaleString()}
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-xs text-scifi-muted mb-1">金币</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.7 }}
                    className="font-mono text-2xl font-bold text-amber-400"
                  >
                    +{rewards.gold.toLocaleString()}
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-xs text-scifi-muted mb-1">声望</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.8 }}
                    className="font-mono text-2xl font-bold text-purple-400"
                  >
                    +{rewards.reputation}
                  </motion.p>
                </motion.div>
              </div>

              {rewards.loot && rewards.loot.length > 0 ? (
                <div>
                  <p className="text-sm text-scifi-muted mb-3">装备掉落</p>
                  <div className="grid grid-cols-3 gap-3">
                    {rewards.loot.map((item, idx) => (
                      <motion.div
                        key={`${item.name}-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', delay: 0.9 + idx * 0.15 }}
                        className="relative p-4 rounded-xl border bg-white/[0.02] backdrop-blur-sm text-center"
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: idx * 0.5 }}
                          className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border flex items-center justify-center text-3xl"
                        >
                          {item.type === '装备' ? '🛡️' : item.type === '材料' ? '⚙️' : '📜'}
                        </motion.div>
                        <RarityBadge rarity={item.rarity}>{item.rarity}</RarityBadge>
                        <p className="text-sm font-medium text-scifi-text mt-2 truncate">{item.name}</p>
                        <p className="text-xs text-scifi-muted">{item.type}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                  <p className="text-scifi-muted text-sm">本次战斗未获得装备掉落</p>
                </div>
              )}
            </TechCard>

            <TechCard title="战斗摘要" borderColor="green">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3">
                  <p className="text-xs text-scifi-muted mb-1">战斗时长</p>
                  <p className="font-mono text-lg font-bold text-scifi-text">{formatTime(state.time)}</p>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-scifi-muted mb-1">团队评分</p>
                  <p className="font-mono text-lg font-bold text-yellow-400">{state.teamworkScore}</p>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-scifi-muted mb-1">评级</p>
                  <p className={cn('font-display text-xl font-black', ratingStyle.color)}>{rating}</p>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-scifi-muted mb-1">结果</p>
                  <p className={cn(
                    'font-display text-lg font-bold uppercase',
                    state.result === 'victory' ? 'text-green-400' : 'text-red-400',
                  )}>
                    {state.result === 'victory' ? '胜利' : '失败'}
                  </p>
                </div>
              </div>
            </TechCard>

            <div className="flex gap-4">
              <GlowButton
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
                返回上一页
              </GlowButton>
              <GlowButton
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => navigate('/city')}
              >
                <Trophy className="w-5 h-5" />
                返回城市
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
