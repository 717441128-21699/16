import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Users, Heart, Zap, Trophy, Swords, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, GlowButton, ProgressBar } from '@/components/ui';
import { SkillBar } from '@/components/battle/SkillBar';
import { BattleLog, type BattleLogEntry } from '@/components/battle/BattleLog';
import { EnemyCard, type EnemyData } from '@/components/battle/EnemyCard';
import { TeamPanel } from '@/components/battle/TeamPanel';
import { useHeroStore } from '@/store/useHeroStore';
import { superPowers, sampleHeroes, type SuperPower } from '@/data/heroes';

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
  const { currentHero, recoverEnergy, takeDamage } = useHeroStore();

  const [battleTime, setBattleTime] = useState(0);
  const [teamworkScore, setTeamworkScore] = useState(75);
  const [enemies, setEnemies] = useState<EnemyData[]>(() => generateEnemies(3));
  const [targetedEnemy, setTargetedEnemy] = useState<string | null>(null);
  const [heroHp, setHeroHp] = useState(currentHero?.hp ?? 1000);
  const [heroEnergy, setHeroEnergy] = useState(currentHero?.energy ?? 100);
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
    addLog('info', `战斗开始！检测到 ${enemies.length} 个敌人`);
    addLog('info', `${currentHero?.alias ?? '英雄'} 进入战场`);
  }, []);

  useEffect(() => {
    if (isBattleOver) return;

    const timer = setInterval(() => {
      setBattleTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isBattleOver]);

  useEffect(() => {
    if (isBattleOver) return;

    const battleInterval = setInterval(() => {
      setEnemies((prevEnemies) => {
        const aliveEnemies = prevEnemies.filter((e) => e.hp > 0);
        if (aliveEnemies.length === 0) return prevEnemies;

        setStats((prev) => {
          const autoDamage = 15 + Math.floor(Math.random() * 20);
          const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

          setEnemies((enemies) =>
            enemies.map((e) => {
              if (e.id === target.id) {
                const newHp = Math.max(0, e.hp - autoDamage);
                if (newHp === 0 && e.hp > 0) {
                  addLog('kill', `${currentHero?.alias ?? '英雄'} 击败了 ${e.name}！`);
                  setStats((s) => ({ ...s, kills: s.kills + 1, totalDamage: s.totalDamage + autoDamage }));
                } else {
                  addLog('damage', `${currentHero?.alias ?? '英雄'} 攻击 ${e.name}`, autoDamage);
                  setStats((s) => ({ ...s, totalDamage: s.totalDamage + autoDamage }));
                  setDamageEffectId(e.id);
                  setTimeout(() => setDamageEffectId(null), 400);
                }
                return { ...e, hp: newHp };
              }
              return e;
            }),
          );
          return prev;
        });

        const attackingEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        if (attackingEnemy) {
          const enemyDamage = attackingEnemy.damage + Math.floor(Math.random() * 10);
          setHeroHp((hp) => {
            const newHp = Math.max(0, hp - enemyDamage);
            addLog('damage', `${attackingEnemy.name} 攻击 ${currentHero?.alias ?? '英雄'}`, enemyDamage);
            takeDamage(currentHero?.id ?? '', enemyDamage);
            return newHp;
          });
        }

        setHeroEnergy((e) => {
          const newEnergy = Math.min(currentHero?.maxEnergy ?? 100, e + 3);
          recoverEnergy(currentHero?.id ?? '', 3);
          return newEnergy;
        });

        setTeamworkScore((s) => Math.min(100, s + Math.floor(Math.random() * 3) - 1));

        return prevEnemies;
      });
    }, 2000);

    return () => clearInterval(battleInterval);
  }, [isBattleOver, currentHero, addLog, takeDamage, recoverEnergy]);

  useEffect(() => {
    const aliveEnemies = enemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0 && enemies.length > 0 && !isBattleOver) {
      setIsBattleOver(true);
      setBattleResult('victory');
      addLog('info', '🎉 所有敌人已被击败！');
    }
    if (heroHp <= 0 && !isBattleOver) {
      setIsBattleOver(true);
      setBattleResult('defeat');
      addLog('info', '💀 英雄倒下了...');
    }
  }, [enemies, heroHp, isBattleOver, addLog]);

  const handleUseSkill = useCallback((skill: SuperPower) => {
    if (isBattleOver) return;
    if (heroEnergy < skill.energyCost) {
      addLog('info', '能量不足！');
      return;
    }

    const aliveEnemies = enemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0) return;

    const targetId = targetedEnemy ?? aliveEnemies[0].id;
    setHeroEnergy((e) => e - skill.energyCost);

    if (skill.damage > 0) {
      setEnemies((prev) =>
        prev.map((enemy) => {
          if (enemy.id !== targetId) return enemy;
          const damage = skill.damage + Math.floor(Math.random() * 20);
          const newHp = Math.max(0, enemy.hp - damage);
          if (newHp === 0 && enemy.hp > 0) {
            addLog('kill', `技能【${skill.name}】击败了 ${enemy.name}！`);
            setStats((s) => ({ ...s, kills: s.kills + 1, totalDamage: s.totalDamage + damage }));
          } else {
            addLog('skill', `${currentHero?.alias ?? '英雄'} 使用【${skill.name}】攻击 ${enemy.name}`, damage);
            setStats((s) => ({ ...s, totalDamage: s.totalDamage + damage, skillUses: s.skillUses + 1 }));
          }
          setDamageEffectId(enemy.id);
          setTimeout(() => setDamageEffectId(null), 400);
          return { ...enemy, hp: newHp };
        }),
      );
    } else {
      const healAmount = 50 + Math.floor(Math.random() * 30);
      setHeroHp((hp) => Math.min(currentHero?.maxHp ?? 1000, hp + healAmount));
      addLog('heal', `技能【${skill.name}】恢复了生命`, healAmount);
      setStats((s) => ({ ...s, totalHeal: s.totalHeal + healAmount, skillUses: s.skillUses + 1 }));
    }
  }, [isBattleOver, heroEnergy, enemies, targetedEnemy, currentHero, addLog]);

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
                  {currentHero?.avatar ?? '🦸'}
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-scifi-panel border border-white/20 text-[10px] font-bold font-mono text-cyan-400">
                    Lv.{currentHero?.level ?? 1}
                  </div>
                </motion.div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-semibold text-scifi-text">
                      {currentHero?.alias ?? '英雄'}
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
                      <ProgressBar value={heroHp} max={currentHero?.maxHp ?? 1000} color="red" height={6} />
                    </div>
                    <span className="text-xs font-mono text-scifi-muted w-24 text-right">
                      {heroHp} / {currentHero?.maxHp ?? 1000}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <ProgressBar value={heroEnergy} max={currentHero?.maxEnergy ?? 100} color="yellow" height={6} />
                    </div>
                    <span className="text-xs font-mono text-scifi-muted w-24 text-right">
                      {heroEnergy} / {currentHero?.maxEnergy ?? 100}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <SkillBar
                  skills={heroSkills}
                  currentEnergy={heroEnergy}
                  onUseSkill={handleUseSkill}
                  disabled={isBattleOver}
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
