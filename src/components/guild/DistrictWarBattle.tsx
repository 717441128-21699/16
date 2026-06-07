import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Heart, Target, Trophy, Users, Zap, Crown, Skull, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, ProgressBar } from '@/components/ui';
import type { DistrictWar } from '@/data/guild';

interface BattleParticipant {
  id: string;
  name: string;
  avatar: string;
  guild: 'attacker' | 'defender';
  kills: number;
  damage: number;
  contribution: number;
  hp: number;
  maxHp: number;
}

interface DistrictWarBattleProps {
  open: boolean;
  onClose: () => void;
  war: DistrictWar;
}

const mockParticipants: BattleParticipant[] = [
  { id: '1', name: '王磊', avatar: '🧔', guild: 'attacker', kills: 12, damage: 15800, contribution: 3200, hp: 850, maxHp: 1500 },
  { id: '2', name: '马超', avatar: '💂', guild: 'attacker', kills: 9, damage: 12400, contribution: 2800, hp: 620, maxHp: 1200 },
  { id: '3', name: '何刚', avatar: '🧑‍🦲', guild: 'attacker', kills: 7, damage: 9800, contribution: 2100, hp: 400, maxHp: 1000 },
  { id: '4', name: '陈光明', avatar: '🦸', guild: 'defender', kills: 11, damage: 14200, contribution: 3000, hp: 780, maxHp: 1000 },
  { id: '5', name: '林雪', avatar: '🦸‍♀️', guild: 'defender', kills: 8, damage: 11500, contribution: 2500, hp: 540, maxHp: 800 },
  { id: '6', name: '赵勇', avatar: '👨‍🦱', guild: 'defender', kills: 6, damage: 8900, contribution: 1900, hp: 320, maxHp: 900 },
];

export function DistrictWarBattle({ open, onClose, war }: DistrictWarBattleProps) {
  const [attackerHp, setAttackerHp] = useState(68);
  const [defenderHp, setDefenderHp] = useState(75);
  const [attackerControl, setAttackerControl] = useState(war.attackerScore);
  const [defenderControl, setDefenderControl] = useState(war.defenderScore);
  const [showVictory, setShowVictory] = useState(false);
  const [winner, setWinner] = useState<'attacker' | 'defender' | null>(null);
  const [participants, setParticipants] = useState(mockParticipants);

  useEffect(() => {
    if (!open || winner) return;

    const interval = setInterval(() => {
      setAttackerControl((prev) => {
        const newVal = prev + Math.floor(Math.random() * 50 - 15);
        return Math.max(0, newVal);
      });
      setDefenderControl((prev) => {
        const newVal = prev + Math.floor(Math.random() * 50 - 15);
        return Math.max(0, newVal);
      });
      setAttackerHp((prev) => {
        const newVal = prev + (Math.random() - 0.55) * 2;
        return Math.max(0, Math.min(100, newVal));
      });
      setDefenderHp((prev) => {
        const newVal = prev + (Math.random() - 0.45) * 2;
        return Math.max(0, Math.min(100, newVal));
      });

      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          kills: p.kills + (Math.random() > 0.85 ? 1 : 0),
          damage: p.damage + Math.floor(Math.random() * 200),
          contribution: p.contribution + Math.floor(Math.random() * 50),
          hp: Math.max(0, Math.min(p.maxHp, p.hp + Math.floor((Math.random() - 0.5) * 50))),
        })),
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [open, winner]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const totalControl = attackerControl + defenderControl;
  const attackerControlPercent = totalControl > 0 ? (attackerControl / totalControl) * 100 : 50;
  const defenderControlPercent = totalControl > 0 ? (defenderControl / totalControl) * 100 : 50;

  const sortedAttackerParticipants = [...participants]
    .filter((p) => p.guild === 'attacker')
    .sort((a, b) => b.contribution - a.contribution);

  const sortedDefenderParticipants = [...participants]
    .filter((p) => p.guild === 'defender')
    .sort((a, b) => b.contribution - a.contribution);

  const triggerVictory = (side: 'attacker' | 'defender') => {
    setWinner(side);
    setShowVictory(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-7xl max-h-[92vh] overflow-y-auto"
          >
            <TechCard className="overflow-hidden" borderColor="red" glow>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center text-scifi-muted hover:text-scifi-text hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative">
                <div
                  className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-500/20 via-purple-500/10 to-cyan-500/10 opacity-60 pointer-events-none"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                <div className="relative p-6">
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-red-500/20 via-purple-500/20 to-cyan-500/20 border border-purple-400/40 mb-3"
                    >
                      <Swords className="w-5 h-5 text-purple-400" />
                      <span className="font-display text-lg font-bold text-gradient-cyber tracking-wider">
                        街区争夺战 · {war.districtName}
                      </span>
                      <Swords className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <p className="text-sm text-scifi-muted">实时战况监控中...</p>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-red-400" />
                          <h3 className="font-display text-xl font-bold text-red-300">
                            {war.attackerGuildName}
                          </h3>
                        </div>
                        <span className="text-xs text-scifi-muted">进攻方</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[10px] text-scifi-muted uppercase tracking-wider">公会血量</span>
                          </div>
                          <span className="text-[10px] font-mono text-red-300 font-bold">{Math.round(attackerHp)}%</span>
                        </div>
                        <div className="relative h-4 rounded-full overflow-hidden bg-white/5 border border-red-400/30">
                          <motion.div
                            animate={{ width: `${attackerHp}%` }}
                            className="absolute inset-y-0 left-0"
                            style={{
                              background: 'linear-gradient(90deg, #ef4444, #ec4899)',
                              boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="relative"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/30 via-purple-500/30 to-cyan-500/30 border-3 border-purple-400/50 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                        <Swords className="w-10 h-10 text-purple-400" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-cyan-500 blur-xl opacity-40 -z-10 animate-pulse-glow" />
                    </motion.div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-scifi-muted">防守方</span>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl font-bold text-cyan-300">
                            {war.defenderGuildName}
                          </h3>
                          <Shield className="w-5 h-5 text-cyan-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono text-cyan-300 font-bold">{Math.round(defenderHp)}%</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-scifi-muted uppercase tracking-wider">公会血量</span>
                            <Heart className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                        </div>
                        <div className="relative h-4 rounded-full overflow-hidden bg-white/5 border border-cyan-400/30">
                          <motion.div
                            animate={{ width: `${defenderHp}%` }}
                            className="absolute inset-y-0 right-0"
                            style={{
                              background: 'linear-gradient(270deg, #06b6d4, #00d4ff)',
                              boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-scifi-text uppercase tracking-wider">控制度争夺</span>
                    </div>
                    <div className="relative h-6 rounded-full overflow-hidden bg-white/5 border border-white/20">
                      <motion.div
                        animate={{ width: `${attackerControlPercent}%` }}
                        className="absolute inset-y-0 left-0"
                        style={{
                          background: 'linear-gradient(90deg, #ef4444, #f97316)',
                          boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
                        }}
                      />
                      <motion.div
                        animate={{ width: `${defenderControlPercent}%` }}
                        className="absolute inset-y-0 right-0"
                        style={{
                          background: 'linear-gradient(270deg, #06b6d4, #22d3ee)',
                          boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)',
                        }}
                      />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-white/50" />
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-red-300">
                          {attackerControl.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-red-400">
                          ({Math.round(attackerControlPercent)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400">
                          ({Math.round(defenderControlPercent)}%)
                        </span>
                        <span className="text-sm font-bold font-mono text-cyan-300">
                          {defenderControl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TechCard title="进攻方战力排行" className="p-5" borderColor="red">
                      <div className="space-y-2">
                        {sortedAttackerParticipants.map((p, idx) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/5 hover:border-red-400/20 transition-colors"
                          >
                            <div className="relative">
                              <div
                                className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center text-xl border',
                                  idx === 0
                                    ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border-yellow-400/50'
                                    : 'bg-gradient-to-br from-red-500/20 to-red-500/10 border-red-400/30',
                                )}
                              >
                                <span>{p.avatar}</span>
                              </div>
                              {idx < 3 && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                  {idx + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-scifi-text truncate">
                                  {p.name}
                                </span>
                                <span className="text-xs font-mono text-yellow-300">
                                  +{p.contribution}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-scifi-muted">
                                <div className="flex items-center gap-1">
                                  <Skull className="w-3 h-3 text-red-400" />
                                  <span>击杀 {p.kills}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-orange-400" />
                                  <span>伤害 {p.damage.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  animate={{ width: `${(p.hp / p.maxHp) * 100}%` }}
                                  className="h-full bg-gradient-to-r from-red-500 to-red-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TechCard>

                    <TechCard title="防守方战力排行" className="p-5" borderColor="cyan">
                      <div className="space-y-2">
                        {sortedDefenderParticipants.map((p, idx) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/5 hover:border-cyan-400/20 transition-colors"
                          >
                            <div className="relative">
                              <div
                                className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center text-xl border',
                                  idx === 0
                                    ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border-yellow-400/50'
                                    : 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border-cyan-400/30',
                                )}
                              >
                                <span>{p.avatar}</span>
                              </div>
                              {idx < 3 && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                  {idx + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-scifi-text truncate">
                                  {p.name}
                                </span>
                                <span className="text-xs font-mono text-yellow-300">
                                  +{p.contribution}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-scifi-muted">
                                <div className="flex items-center gap-1">
                                  <Skull className="w-3 h-3 text-red-400" />
                                  <span>击杀 {p.kills}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-orange-400" />
                                  <span>伤害 {p.damage.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  animate={{ width: `${(p.hp / p.maxHp) * 100}%` }}
                                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TechCard>
                  </div>

                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={() => triggerVictory('attacker')}
                      className="px-4 py-2 rounded-lg text-xs bg-red-500/10 border border-red-400/30 text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                      模拟进攻方胜利
                    </button>
                    <button
                      onClick={() => triggerVictory('defender')}
                      className="px-4 py-2 rounded-lg text-xs bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                    >
                      模拟防守方胜利
                    </button>
                  </div>
                </div>
              </div>
            </TechCard>

            <AnimatePresence>
              {showVictory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="relative"
                  >
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 1,
                          scale: 1,
                        }}
                        animate={{
                          x: Math.cos((i / 20) * Math.PI * 2) * 200,
                          y: Math.sin((i / 20) * Math.PI * 2) * 200,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                        className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                        style={{
                          background: i % 2 === 0 ? '#fbbf24' : '#a855f7',
                          boxShadow: `0 0 10px ${i % 2 === 0 ? '#fbbf24' : '#a855f7'}`,
                        }}
                      />
                    ))}

                    <div
                      className={cn(
                        'relative px-16 py-10 rounded-2xl border-4 text-center',
                        winner === 'attacker'
                          ? 'bg-gradient-to-br from-red-500/30 via-purple-500/20 to-transparent border-red-400/60'
                          : 'bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-transparent border-cyan-400/60',
                      )}
                      style={{
                        boxShadow: winner === 'attacker'
                          ? '0 0 80px rgba(239, 68, 68, 0.5)'
                          : '0 0 80px rgba(0, 212, 255, 0.5)',
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="mb-4"
                      >
                        <Trophy
                          className={cn(
                            'w-20 h-20 mx-auto',
                            winner === 'attacker' ? 'text-yellow-400' : 'text-cyan-300',
                          )}
                          style={{
                            filter: winner === 'attacker'
                              ? 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))'
                              : 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.8))',
                          }}
                        />
                      </motion.div>
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                          'font-display text-4xl font-bold tracking-wider mb-2',
                          winner === 'attacker' ? 'text-yellow-300' : 'text-cyan-300',
                        )}
                      >
                        胜利!
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-scifi-text mb-2"
                      >
                        {winner === 'attacker' ? war.attackerGuildName : war.defenderGuildName}
                      </motion.p>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-scifi-muted"
                      >
                        成功占领 {war.districtName}
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DistrictWarBattle;
