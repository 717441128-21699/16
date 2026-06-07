import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Users, Heart, Zap, Trophy, Swords, Shield, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, GlowButton, ProgressBar } from '@/components/ui';
import { SkillBar } from '@/components/battle/SkillBar';
import { BattleLog, type BattleLogEntry } from '@/components/battle/BattleLog';
import { EnemyCard, type EnemyData } from '@/components/battle/EnemyCard';
import { TeamPanel } from '@/components/battle/TeamPanel';
import { useHeroStore } from '@/store/useHeroStore';
import { useBattleStore } from '@/store/useBattleStore';
import { useCityStore } from '@/store/useCityStore';
import { superPowers, sampleHeroes, type SuperPower } from '@/data/heroes';
import type { BattleState as TypesBattleState } from '../types';

type EnemyType = EnemyData['type'];

const enemyTemplates: Omit<EnemyData, 'id'>[] = [
  { name: '机械兵', type: 'robot', hp: 200, maxHp: 200, damage: 25, icon: '🤖' },
  { name: '外星战士', type: 'alien', hp: 180, maxHp: 180, damage: 30, icon: '👽' },
  { name: '变异体', type: 'mutant', hp: 300, maxHp: 300, damage: 35, icon: '🧟' },
  { name: '幽灵', type: 'ghost', hp: 150, maxHp: 150, damage: 40, icon: '👻' },
  { name: '恶魔', type: 'demon', hp: 400, maxHp: 400, damage: 45, icon: '👹' },
];

function generateEnemies(count: number): EnemyData[] {
  return Array.from({ length: count }).map((_, i) => {
    const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
    const variance = 0.8 + Math.random() * 0.4;
    return {
      ...template,
      id: `enemy-${Date.now()}-${i}`,
      hp: Math.round(template.hp * variance),
      maxHp: Math.round(template.maxHp * variance),
      damage: Math.round(template.damage * variance),
    };
  });
}

export default function Battle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentHero, heroList } = useHeroStore();
  const {
    serverBattleState,
    startBattleAsync,
    useSkillAsync,
    tickBattleAsync,
    loading: battleLoading,
  } = useBattleStore();
  const { activeEvents } = useCityStore();

  const hero = currentHero ?? heroList[0];

  const [battleTime, setBattleTime] = useState(0);
  const [teamworkScore, setTeamworkScore] = useState(75);
  const [enemies, setEnemies] = useState<EnemyData[]>(() => generateEnemies(3));
  const [targetedEnemy, setTargetedEnemy] = useState<string | null>(null);
  const [heroHp, setHeroHp] = useState(hero?.hp ?? 1000);
  const [heroEnergy, setHeroEnergy] = useState(hero?.energy ?? 100);
  const [logs, setLogs] = useState<BattleLogEntry[]>([]);
  const [damageEffectId, setDamageEffectId] = useState<string | null>(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [stats, setStats] = useState({
    totalDamage: 0,
    totalHeal: 0,
    skillUses: 0,
    kills: 0,
    rescues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [usingSkill, setUsingSkill] = useState(false);

  const logIdRef = useRef(0);

  const addLog = useCallback((type: BattleLogEntry['type'], message: string, value?: number) => {
    const entry: BattleLogEntry = {
      id: `log-${++logIdRef.current}`,
      timestamp: Date.now(),
      type,
      message,
      value,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  useEffect(() => {
    const initBattle = async () => {
      if (!hero) {
        navigate('/hero-create');
        return;
      }

      try {
        const eventId = activeEvents[0]?.id ?? 'default-event';
        await startBattleAsync(hero.id, eventId);
        const state = useBattleStore.getState().serverBattleState as TypesBattleState;
        if (state) {
          setBattleId(state.id);
          if (state.enemies && state.enemies.length > 0) {
            const mappedEnemies: EnemyData[] = state.enemies.map((e, idx) => ({
              id: e.id,
              name: e.name,
              hp: e.health,
              maxHp: e.maxHealth,
              damage: e.damage,
              type: (enemyTemplates[idx % enemyTemplates.length]?.type) ?? 'robot',
              icon: enemyTemplates[idx % enemyTemplates.length]?.icon,
            }));
            setEnemies(mappedEnemies);
          }
          if (state.logs) {
            const mappedLogs: BattleLogEntry[] = state.logs.map((log, idx) => ({
              id: `log-server-${idx}`,
              timestamp: log.timestamp,
              type: log.type as BattleLogEntry['type'],
              message: log.message,
              value: log.value,
            }));
            setLogs(mappedLogs);
          }
        }
        addLog('info', `战斗开始！检测到 ${enemies.length} 个敌人`);
        addLog('info', `${hero.alias ?? '英雄'} 进入战场`);
      } catch (error) {
        console.error('初始化战斗失败:', error);
        addLog('info', '战斗已开始');
      } finally {
        setLoading(false);
      }
    };

    initBattle();
  }, [hero, navigate, startBattleAsync, activeEvents, addLog, enemies.length]);

  useEffect(() => {
    if (isBattleOver || loading) return;

    const timer = setInterval(() => {
      setBattleTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isBattleOver, loading]);

  useEffect(() => {
    if (isBattleOver || loading || !battleId) return;

    const battleInterval = setInterval(async () => {
      try {
        await tickBattleAsync(battleId);
        const state = useBattleStore.getState().serverBattleState as TypesBattleState;
        
        if (state && state.enemies) {
          setEnemies((prev) =>
            prev.map((e) => {
              const serverEnemy = state.enemies.find((se) => se.id === e.id);
              if (serverEnemy) {
                const newHp = Math.max(0, serverEnemy.health);
                if (newHp < e.hp) {
                  setDamageEffectId(e.id);
                  setTimeout(() => setDamageEffectId(null), 400);
                }
                if (newHp === 0 && e.hp > 0) {
                  addLog('kill', `${hero?.alias ?? '英雄'} 击败了 ${e.name}！`);
                  setStats((s) => ({ ...s, kills: s.kills + 1 }));
                }
                return { ...e, hp: newHp };
              }
              return e;
            }),
          );
        }

        if (state && state.logs && state.logs.length > 0) {
          const latestLogs = state.logs.slice(-3);
          latestLogs.forEach((log, idx) => {
            const logEntry: BattleLogEntry = {
              id: `log-tick-${Date.now()}-${idx}`,
              timestamp: log.timestamp,
              type: log.type as BattleLogEntry['type'],
              message: log.message,
              value: log.value,
            };
            setLogs((prev) => {
              if (prev.some((l) => l.message === log.message && l.timestamp === log.timestamp)) {
                return prev;
              }
              return [...prev, logEntry];
            });
          });
        }
      } catch (error) {
        console.error('战斗tick失败:', error);
      }

      setHeroEnergy((e) => Math.min(hero?.maxEnergy ?? 100, e + 3));
      setTeamworkScore((s) => Math.min(100, s + Math.floor(Math.random() * 3) - 1));
    }, 2000);

    return () => clearInterval(battleInterval);
  }, [isBattleOver, loading, battleId, tickBattleAsync, hero, addLog]);

  useEffect(() => {
    const aliveEnemies = enemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0 && enemies.length > 0 && !isBattleOver && !loading) {
      setIsBattleOver(true);
      setBattleResult('victory');
      addLog('info', '🎉 所有敌人已被击败！');
    }
    if (heroHp <= 0 && !isBattleOver && !loading) {
      setIsBattleOver(true);
      setBattleResult('defeat');
      addLog('info', '💀 英雄倒下了...');
    }
  }, [enemies, heroHp, isBattleOver, loading, addLog]);

  const handleUseSkill = useCallback(async (skill: SuperPower) => {
    if (isBattleOver || usingSkill) return;
    if (heroEnergy < skill.energyCost) {
      addLog('info', '能量不足！');
      return;
    }
    if (!battleId) return;

    const aliveEnemies = enemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0) return;

    const targetId = targetedEnemy ?? aliveEnemies[0].id;
    setUsingSkill(true);
    setHeroEnergy((e) => e - skill.energyCost);

    try {
      await useSkillAsync(battleId, skill.id, targetId);
      addLog('skill', `${hero?.alias ?? '英雄'} 使用【${skill.name}】`);
      setStats((s) => ({ ...s, skillUses: s.skillUses + 1 }));
    } catch (error) {
      console.error('使用技能失败:', error);
    } finally {
      setUsingSkill(false);
    }
  }, [isBattleOver, usingSkill, heroEnergy, battleId, enemies, targetedEnemy, hero, useSkillAsync, addLog]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const aliveEnemies = enemies.filter((e) => e.hp > 0);
  const deadEnemies = enemies.filter((e) => e.hp <= 0);
  const heroSkills = superPowers.slice(0, 5);
  const teammates = sampleHeroes.slice(1).map((h) => ({ ...h, isOnline: true, contribution: Math.floor(Math.random() * 100) }));

  const handleFinishBattle = () => {
    navigate('/battle-result', {
      state: {
        result: battleResult,
        time: battleTime,
        teamworkScore,
        stats,
      },
    });
  };

  if (loading || battleLoading) {
    return (
      <div className="min-h-screen p-4 grid-bg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-scifi-muted">初始化战斗中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 grid-bg">
      <div className="max-w-7xl mx-auto space-y-4">
        <TechCard borderColor="cyan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="font-display text-sm font-semibold text-scifi-text uppercase tracking-wider">
                  银行劫案 - 精英难度
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-scifi-muted" />
                <span className="font-mono text-lg text-scifi-text">{formatTime(battleTime)}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-scifi-muted">存活敌人</span>
                <span className="font-mono text-lg font-bold text-red-400">{aliveEnemies.length}</span>
                <span className="text-scifi-muted">/</span>
                <span className="font-mono text-sm text-scifi-muted">{enemies.length}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-scifi-muted">团队配合</span>
                <span className="font-mono text-lg font-bold text-yellow-400">{teamworkScore}</span>
              </div>
            </div>
          </div>
        </TechCard>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5 space-y-4">
            <TechCard title="敌方目标" borderColor="red">
              <div className="space-y-3">
                {aliveEnemies.map((enemy) => (
                  <EnemyCard
                    key={enemy.id}
                    enemy={enemy}
                    isTargeted={targetedEnemy === enemy.id}
                    onClick={() => setTargetedEnemy(enemy.id)}
                    showDamageEffect={damageEffectId === enemy.id}
                  />
                ))}
                {deadEnemies.map((enemy) => (
                  <EnemyCard key={enemy.id} enemy={enemy} />
                ))}
              </div>
            </TechCard>

            <TeamPanel teammates={teammates} teamworkScore={teamworkScore} className="h-auto" />
          </div>

          <div className="col-span-7 flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              <BattleLog logs={logs} className="h-[400px]" />
            </div>

            <TechCard borderColor="cyan">
              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-20 h-20 rounded-xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/10 flex items-center justify-center text-4xl"
                  style={{
                    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                  }}
                >
                  {hero?.avatar ?? '🦸'}
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-scifi-panel border border-white/20 text-[10px] font-bold font-mono text-cyan-400">
                    Lv.{hero?.level ?? 1}
                  </div>
                </motion.div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-semibold text-scifi-text">
                      {hero?.alias ?? '英雄'}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Swords className="w-4 h-4 text-red-400" />
                        <span className="font-mono text-red-400">{stats.totalDamage}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="font-mono text-green-400">{stats.totalHeal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <ProgressBar value={heroHp} max={hero?.maxHp ?? 1000} color="red" height={6} />
                    </div>
                    <span className="text-xs font-mono text-scifi-muted w-24 text-right">
                      {heroHp} / {hero?.maxHp ?? 1000}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <ProgressBar value={heroEnergy} max={hero?.maxEnergy ?? 100} color="yellow" height={6} />
                    </div>
                    <span className="text-xs font-mono text-scifi-muted w-24 text-right">
                      {heroEnergy} / {hero?.maxEnergy ?? 100}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <SkillBar
                  skills={heroSkills}
                  currentEnergy={heroEnergy}
                  onUseSkill={handleUseSkill}
                  disabled={isBattleOver || usingSkill}
                />
              </div>
            </TechCard>
          </div>
        </div>

        <AnimatePresence>
          {isBattleOver && battleResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative"
              >
                <TechCard
                  borderColor={battleResult === 'victory' ? 'green' : 'red'}
                  className="text-center min-w-[400px]"
                >
                  <motion.div
                    animate={battleResult === 'victory' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mb-4"
                  >
                    <div className="text-6xl mb-2">
                      {battleResult === 'victory' ? '🏆' : '💀'}
                    </div>
                    <h2 className={cn(
                      'font-display text-3xl font-bold uppercase tracking-wider',
                      battleResult === 'victory' ? 'text-green-400 glow-text-green' : 'text-red-400 glow-text-red',
                    )}>
                      {battleResult === 'victory' ? '战斗胜利！' : '战斗失败'}
                    </h2>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-scifi-muted mb-1">战斗时长</p>
                      <p className="font-mono text-xl text-scifi-text">{formatTime(battleTime)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-scifi-muted mb-1">团队评分</p>
                      <p className="font-mono text-xl text-yellow-400">{teamworkScore}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-scifi-muted mb-1">总伤害</p>
                      <p className="font-mono text-xl text-red-400">{stats.totalDamage}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-scifi-muted mb-1">击杀数</p>
                      <p className="font-mono text-xl text-purple-400">{stats.kills}</p>
                    </div>
                  </div>

                  <GlowButton
                    variant={battleResult === 'victory' ? 'success' : 'primary'}
                    size="lg"
                    className="w-full"
                    onClick={handleFinishBattle}
                  >
                    <Trophy className="w-5 h-5" />
                    查看战斗结算
                  </GlowButton>
                </TechCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
