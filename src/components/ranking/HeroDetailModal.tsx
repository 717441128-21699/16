import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Shield, Zap, Heart, Clock, Target, Award, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechCard, RarityBadge, ProgressBar } from '@/components/ui';
import { PowerRadar, type HeroStatsData } from '@/components/hero/PowerRadar';
import type { Hero } from '@/data/heroes';
import { superPowers, suits, weapons } from '@/data/heroes';

interface BattleRecord {
  id: string;
  date: number;
  type: 'mission' | 'battle' | 'event';
  name: string;
  result: 'victory' | 'defeat';
  score: number;
}

interface HeroDetailModalProps {
  open: boolean;
  onClose: () => void;
  hero: Hero | null;
  battleRecords?: BattleRecord[];
}

const mockRecords: BattleRecord[] = [
  { id: '1', date: Date.now() - 86400000 * 1, type: 'battle', name: '街区争夺战', result: 'victory', score: 1250 },
  { id: '2', date: Date.now() - 86400000 * 2, type: 'mission', name: '银行劫案', result: 'victory', score: 850 },
  { id: '3', date: Date.now() - 86400000 * 3, type: 'event', name: '外星入侵', result: 'victory', score: 2000 },
  { id: '4', date: Date.now() - 86400000 * 5, type: 'mission', name: '人质事件', result: 'victory', score: 1500 },
  { id: '5', date: Date.now() - 86400000 * 7, type: 'battle', name: '帮派火拼', result: 'defeat', score: 420 },
];

export function HeroDetailModal({ open, onClose, hero }: HeroDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!hero) return null;

  const heroPowers = hero.powers
    .map((p) => superPowers.find((sp) => sp.id === p))
    .filter(Boolean);
  const heroSuit = suits.find((s) => s.id === hero.suitId);
  const heroWeapon = weapons.find((w) => w.id === hero.weaponId);
  const rarity = heroSuit?.rarity ?? 'common';

  const stats: HeroStatsData = {
    attack: hero.attack,
    defense: hero.defense,
    speed: hero.speed,
    energy: hero.maxEnergy,
    health: Math.round(hero.maxHp * 0.15),
    cooldownReduction: 25 + Math.round(hero.level * 1.5),
  };

  const hpPercent = (hero.hp / hero.maxHp) * 100;
  const energyPercent = (hero.energy / hero.maxEnergy) * 100;
  const expPercent = (hero.exp / hero.maxExp) * 100;

  const totalVictories = mockRecords.filter((r) => r.result === 'victory').length;
  const winRate = Math.round((totalVictories / mockRecords.length) * 100);

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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            <TechCard className="overflow-hidden" borderColor={rarity === 'legendary' ? 'yellow' : rarity === 'epic' ? 'pink' : rarity === 'rare' ? 'purple' : 'cyan'} glow>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-scifi-muted hover:text-scifi-text hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative">
                <div
                  className={cn(
                    'absolute inset-x-0 top-0 h-40 bg-gradient-to-b opacity-40',
                    rarity === 'legendary'
                      ? 'from-yellow-500/40 via-orange-500/20 to-transparent'
                      : rarity === 'epic'
                        ? 'from-pink-500/40 via-purple-500/20 to-transparent'
                        : rarity === 'rare'
                          ? 'from-purple-500/40 via-blue-500/20 to-transparent'
                          : 'from-cyan-500/40 via-blue-500/20 to-transparent',
                  )}
                />

                <div className="relative p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-5">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.03, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={cn(
                              'w-28 h-28 rounded-2xl flex items-center justify-center text-6xl border-3 relative overflow-hidden',
                              rarity === 'legendary'
                                ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400/60 shadow-[0_0_40px_rgba(234,179,8,0.35)]'
                                : rarity === 'epic'
                                  ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-pink-400/50'
                                  : rarity === 'rare'
                                    ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-purple-400/50'
                                    : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/40',
                            )}
                          >
                            <span className="drop-shadow-2xl">{hero.avatar}</span>
                            <div
                              className="absolute inset-0 opacity-40"
                              style={{
                                background:
                                  'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%',
                              }}
                            />
                          </motion.div>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-3 border-scifi-bg flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white font-display">{hero.level}</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h2 className="font-display text-2xl font-bold text-scifi-text tracking-tight">
                                {hero.name}
                              </h2>
                              <p className="text-base text-scifi-muted">「{hero.alias}」</p>
                            </div>
                            <RarityBadge rarity={rarity}>
                              {rarity === 'legendary' ? '传说' : rarity === 'epic' ? '史诗' : rarity === 'rare' ? '稀有' : '普通'}
                            </RarityBadge>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              <Trophy className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs text-scifi-muted">战力</span>
                              <span className="text-sm font-bold font-display text-yellow-300">
                                {Math.round(
                                  hero.attack * 3 +
                                    hero.defense * 2.5 +
                                    hero.speed * 2 +
                                    hero.maxHp * 0.1 +
                                    hero.maxEnergy * 0.5 +
                                    hero.level * 50,
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              <Award className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-scifi-muted">胜率</span>
                              <span className="text-sm font-bold font-display text-green-300">{winRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">生命值</span>
                          <span className="text-[10px] font-bold text-red-300">{hero.hp}/{hero.maxHp}</span>
                        </div>
                        <ProgressBar value={hero.hp} max={hero.maxHp} color="red" showLabel={false} height={6} />
                      </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">能量</span>
                            <span className="text-[10px] font-bold text-cyan-300">{hero.energy}/{hero.maxEnergy}</span>
                          </div>
                          <ProgressBar value={hero.energy} max={hero.energy} color="cyan" showLabel={false} height={6} />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-scifi-muted font-medium uppercase tracking-wider">经验</span>
                            <span className="text-[10px] font-bold text-purple-300">{Math.round(expPercent)}%</span>
                          </div>
                          <ProgressBar value={hero.exp} max={hero.maxExp} color="purple" showLabel={false} height={6} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                          <Swords className="w-5 h-5 text-red-400 mx-auto mb-1" />
                          <p className="text-[10px] text-scifi-muted">攻击</p>
                          <p className="text-lg font-bold font-display text-red-300">{hero.attack}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                          <Shield className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                          <p className="text-[10px] text-scifi-muted">防御</p>
                          <p className="text-lg font-bold font-display text-cyan-300">{hero.defense}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                          <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
                          <p className="text-[10px] text-scifi-muted">速度</p>
                          <p className="text-lg font-bold font-display text-green-300">{hero.speed}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                          <p className="text-[10px] text-scifi-muted">能量上限</p>
                          <p className="text-lg font-bold font-display text-purple-300">{hero.maxEnergy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-[380px]">
                      <PowerRadar stats={stats} size={300} />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <TechCard title="超能力" borderColor="purple" className="p-5">
                      <div className="space-y-3">
                        {heroPowers.map((power) => power && (
                          <motion.div
                            key={power.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/30 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center text-2xl border border-purple-400/30">
                              <span>{power.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-display text-sm font-semibold text-scifi-text">
                                  {power.name}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px]">
                                  <span className="text-red-300">伤害 {power.damage}</span>
                                  <span className="text-cyan-300">CD {power.cooldown}s</span>
                                </div>
                              </div>
                              <p className="text-xs text-scifi-muted mt-0.5">
                                {power.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TechCard>

                    <div className="space-y-4">
                      <TechCard title="战衣配置" borderColor="cyan" className="p-5">
                        {heroSuit && (
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 flex items-center justify-center text-3xl border border-cyan-400/30">
                              <span>{heroSuit.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-display text-sm font-semibold text-scifi-text">
                                  {heroSuit.name}
                                </h4>
                                <RarityBadge rarity={heroSuit.rarity}>
                                  {heroSuit.rarity === 'legendary' ? '传说' : heroSuit.rarity === 'epic' ? '史诗' : heroSuit.rarity === 'rare' ? '稀有' : '普通'}
                                </RarityBadge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className="text-cyan-300">防御 +{heroSuit.defense}</span>
                                <span className="text-purple-300">能量 +{heroSuit.energyBonus}</span>
                                <span className="text-green-300">速度 +{heroSuit.speedBonus}</span>
                              </div>
                              {heroSuit.specialEffect && (
                                <p className="text-[11px] text-yellow-300 mt-1">
                                  ✨ {heroSuit.specialEffect}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </TechCard>

                      <TechCard title="武器装备" borderColor="pink" className="p-5">
                        {heroWeapon && (
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-500/10 flex items-center justify-center text-3xl border border-pink-400/30">
                              <span>{heroWeapon.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-display text-sm font-semibold text-scifi-text">
                                  {heroWeapon.name}
                                </h4>
                                <RarityBadge rarity={heroWeapon.rarity}>
                                  {heroWeapon.rarity === 'legendary' ? '传说' : heroWeapon.rarity === 'epic' ? '史诗' : heroWeapon.rarity === 'rare' ? '稀有' : '普通'}
                                </RarityBadge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className="text-red-300">攻击 +{heroWeapon.attack}</span>
                                <span className="text-green-300">攻速 {heroWeapon.attackSpeed}</span>
                                <span className="text-cyan-300">射程 {heroWeapon.range}</span>
                              </div>
                              {heroWeapon.specialEffect && (
                                <p className="text-[11px] text-yellow-300 mt-1">
                                  ✨ {heroWeapon.specialEffect}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </TechCard>
                    </div>
                  </div>

                  <TechCard title="战绩历史" className="mt-6 p-5" borderColor="green">
                    <div className="space-y-2">
                      {mockRecords.map((record, idx) => (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                                record.result === 'victory'
                                  ? 'bg-green-500/15 border border-green-400/30'
                                  : 'bg-red-500/15 border border-red-400/30',
                              )}
                            >
                              {record.type === 'battle' && <Swords className="w-5 h-5" />}
                              {record.type === 'mission' && <Target className="w-5 h-5" />}
                              {record.type === 'event' && <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-scifi-text">{record.name}</p>
                              <p className="text-[11px] text-scifi-muted">
                                {new Date(record.date).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded',
                                record.result === 'victory'
                                  ? 'text-green-400 bg-green-500/10'
                                  : 'text-red-400 bg-red-500/10',
                              )}
                            >
                              {record.result === 'victory' ? '胜利' : '失败'}
                            </span>
                            <span className="text-sm font-bold font-display text-yellow-300">
                              +{record.score}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TechCard>
                </div>
              </div>
            </TechCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HeroDetailModal;
