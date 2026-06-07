import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Sparkles,
  Shirt,
  Swords,
  Star,
  TrendingUp,
  Zap,
  Flame,
  Snowflake,
  Target,
  Clock,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { HeroStats } from '@/components/hero/HeroStats';
import { HeroCard } from '@/components/hero/HeroCard';
import { PowerRadar, type HeroStatsData } from '@/components/hero/PowerRadar';
import { SuitSelector } from '@/components/hero/SuitSelector';
import { WeaponSelector } from '@/components/hero/WeaponSelector';
import { TechCard, GlowButton, StatCard, ProgressBar, RarityBadge } from '@/components/ui';
import { useHeroStore } from '@/store/useHeroStore';
import { suits, weapons } from '@/data/heroes';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout';

type TabId = 'overview' | 'suit' | 'weapon' | 'skills';

interface SkillInfo {
  id: string;
  name: string;
  description: string;
  icon: typeof Flame;
  cooldown: number;
  currentCooldown: number;
  efficiency: number;
  color: string;
  bgColor: string;
}

const defaultSkills: SkillInfo[] = [
  {
    id: 'skill-1',
    name: '烈焰冲击',
    description: '释放强大的火焰能量，对范围内敌人造成伤害',
    icon: Flame,
    cooldown: 8,
    currentCooldown: 0,
    efficiency: 85,
    color: 'text-orange-400',
    bgColor: 'from-orange-500/20 to-red-500/10',
  },
  {
    id: 'skill-2',
    name: '冰霜护盾',
    description: '召唤冰霜护盾，在一段时间内减少受到的伤害',
    icon: Snowflake,
    cooldown: 12,
    currentCooldown: 3,
    efficiency: 72,
    color: 'text-cyan-400',
    bgColor: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    id: 'skill-3',
    name: '精准打击',
    description: '锁定目标进行精准攻击，必定造成暴击',
    icon: Target,
    cooldown: 6,
    currentCooldown: 0,
    efficiency: 91,
    color: 'text-yellow-400',
    bgColor: 'from-yellow-500/20 to-amber-500/10',
  },
  {
    id: 'skill-4',
    name: '雷霆万钧',
    description: '召唤雷霆之力，对单体目标造成巨额伤害',
    icon: Zap,
    cooldown: 20,
    currentCooldown: 12,
    efficiency: 68,
    color: 'text-purple-400',
    bgColor: 'from-purple-500/20 to-pink-500/10',
  },
];

function HeroManagePage() {
  const navigate = useNavigate();
  const { heroList, currentHero, updateHero, addExp } = useHeroStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [showWeaponSelector, setShowWeaponSelector] = useState(false);

  const hero = currentHero ?? heroList[0];

  const computedStats = useMemo<HeroStatsData>(() => {
    if (!hero) {
      return { attack: 0, defense: 0, speed: 0, energy: 0, health: 0, cooldownReduction: 0 };
    }
    const cooldownReduction = Math.round(
      defaultSkills.reduce((sum, s) => sum + s.efficiency, 0) / defaultSkills.length,
    );
    return {
      attack: Math.min(hero.attack, 200),
      defense: Math.min(hero.defense, 200),
      speed: Math.min(hero.speed, 200),
      energy: Math.min(hero.maxEnergy, 200),
      health: Math.min(Math.round(hero.maxHp / 10), 200),
      cooldownReduction: Math.min(cooldownReduction, 100),
    };
  }, [hero]);

  if (!hero) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-8">
          <TechCard borderColor="cyan" className="text-center max-w-md w-full">
            <Users className="w-16 h-16 mx-auto mb-4 text-scifi-muted opacity-50" />
            <h2 className="font-display text-xl font-bold text-scifi-text mb-2">
              暂无英雄
            </h2>
            <p className="text-scifi-muted mb-6">
              你还没有创建任何英雄，点击下方按钮创建你的第一个超级英雄
            </p>
            <GlowButton variant="primary" size="lg" onClick={() => navigate('/hero-create')}>
              <Plus className="w-4 h-4" />
              创建英雄
            </GlowButton>
          </TechCard>
        </div>
      </AppLayout>
    );
  }

  const tabs: Array<{ id: TabId; label: string; icon: typeof Users }> = [
    { id: 'overview', label: '总览', icon: Users },
    { id: 'suit', label: '战衣', icon: Shirt },
    { id: 'weapon', label: '武器', icon: Swords },
    { id: 'skills', label: '技能', icon: Sparkles },
  ];

  const handleSuitChange = (suitId: string) => {
    updateHero(hero.id, { suitId });
    setShowSuitSelector(false);
  };

  const handleWeaponChange = (weaponId: string) => {
    updateHero(hero.id, { weaponId });
    setShowWeaponSelector(false);
  };

  const handleAddExp = () => {
    addExp(hero.id, 500);
  };

  const expPercent = (hero.exp / hero.maxExp) * 100;
  const levelProgress = Math.round(expPercent);

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl font-bold text-gradient-cyber mb-2"
              >
                英雄管理中心
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-scifi-muted"
              >
                管理你的超级英雄，升级属性和装备
              </motion.p>
            </div>
            <div className="flex items-center gap-2">
              <GlowButton variant="ghost" onClick={handleAddExp}>
                <TrendingUp className="w-4 h-4" />
                模拟获得经验
              </GlowButton>
              <GlowButton variant="primary" onClick={() => navigate('/hero-create')}>
                <Plus className="w-4 h-4" />
                创建新英雄
              </GlowButton>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="等级"
              value={`Lv.${hero.level}`}
              change={levelProgress}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="经验进度"
              value={`${levelProgress}%`}
              color="cyan"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="英雄总数"
              value={heroList.length}
              color="green"
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="声望值"
              value="1,250"
              change={5.2}
              color="yellow"
            />
          </div>

          <div className="flex items-center gap-1 mb-6 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-glow-cyan'
                      : 'text-scifi-muted hover:text-scifi-text hover:bg-white/5',
                  )}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6"
            >
              <HeroStats hero={hero} />
              <div className="space-y-6">
                <PowerRadar stats={computedStats} title="战力雷达图" size={380} />

                <TechCard borderColor="purple" title="等级进度">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-scifi-text">
                          当前等级: Lv.{hero.level}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-300">
                        下一等级: Lv.{hero.level + 1}
                      </span>
                    </div>
                    <ProgressBar
                      value={hero.exp}
                      max={hero.maxExp}
                      color="purple"
                      label="经验值"
                      height={12}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-[11px] text-scifi-muted mb-1">生命成长</p>
                      <p className="text-sm font-bold text-red-300">+100</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-[11px] text-scifi-muted mb-1">能量成长</p>
                      <p className="text-sm font-bold text-cyan-300">+10</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-[11px] text-scifi-muted mb-1">全属性</p>
                      <p className="text-sm font-bold text-yellow-300">+23</p>
                    </div>
                  </div>
                </TechCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'suit' && (
            <motion.div
              key="suit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {showSuitSelector ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-scifi-text">选择新战衣</h3>
                    <GlowButton variant="ghost" onClick={() => setShowSuitSelector(false)}>
                      取消
                    </GlowButton>
                  </div>
                  <SuitSelector selectedId={hero.suitId} onChange={handleSuitChange} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HeroCard hero={hero} />
                  <TechCard borderColor="purple" title="当前战衣">
                    {(() => {
                      const currentSuit = suits.find((s) => s.id === hero.suitId);
                      if (!currentSuit) return null;
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/40 flex items-center justify-center text-5xl shadow-glow-purple"
                            >
                              {currentSuit.icon}
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-display text-xl font-bold text-scifi-text mb-1">
                                {currentSuit.name}
                              </h4>
                              <RarityBadge rarity={currentSuit.rarity}>
                                {currentSuit.rarity === 'legendary' ? '传说' : currentSuit.rarity === 'epic' ? '史诗' : currentSuit.rarity === 'rare' ? '稀有' : '普通'}
                              </RarityBadge>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/5">
                            <div className="text-center">
                              <p className="text-[11px] text-scifi-muted mb-1">防御</p>
                              <p className="text-lg font-bold text-blue-300">{currentSuit.defense}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[11px] text-scifi-muted mb-1">能量加成</p>
                              <p className="text-lg font-bold text-cyan-300">+{currentSuit.energyBonus}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[11px] text-scifi-muted mb-1">速度加成</p>
                              <p className="text-lg font-bold text-green-300">+{currentSuit.speedBonus}</p>
                            </div>
                          </div>

                          {currentSuit.specialEffect && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                              <p className="text-xs text-yellow-300">
                                <span className="font-semibold">特殊效果: </span>
                                {currentSuit.specialEffect}
                              </p>
                            </div>
                          )}

                          <GlowButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={() => setShowSuitSelector(true)}
                          >
                            <RefreshCw className="w-4 h-4" />
                            更换战衣
                          </GlowButton>
                        </div>
                      );
                    })()}
                  </TechCard>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'weapon' && (
            <motion.div
              key="weapon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {showWeaponSelector ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-scifi-text">选择新武器</h3>
                    <GlowButton variant="ghost" onClick={() => setShowWeaponSelector(false)}>
                      取消
                    </GlowButton>
                  </div>
                  <WeaponSelector selectedId={hero.weaponId} onChange={handleWeaponChange} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HeroCard hero={hero} />
                  <TechCard borderColor="red" title="当前武器">
                    {(() => {
                      const currentWeapon = weapons.find((w) => w.id === hero.weaponId);
                      if (!currentWeapon) return null;
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-400/40 flex items-center justify-center text-5xl shadow-glow-red"
                            >
                              {currentWeapon.icon}
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-display text-xl font-bold text-scifi-text mb-1">
                                {currentWeapon.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <RarityBadge rarity={currentWeapon.rarity}>
                                  {currentWeapon.rarity === 'legendary' ? '传说' : currentWeapon.rarity === 'epic' ? '史诗' : currentWeapon.rarity === 'rare' ? '稀有' : '普通'}
                                </RarityBadge>
                                <span className="text-xs text-scifi-muted uppercase tracking-wider">
                                  {currentWeapon.type === 'melee' ? '近战' : currentWeapon.type === 'ranged' ? '远程' : '能量'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 py-4 border-y border-white/5">
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-[10px] text-scifi-muted mb-1">伤害</p>
                              <p className="text-base font-bold text-red-300">{currentWeapon.attack}</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-[10px] text-scifi-muted mb-1">攻速</p>
                              <p className="text-base font-bold text-green-300">{currentWeapon.attackSpeed}/s</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-[10px] text-scifi-muted mb-1">射程</p>
                              <p className="text-base font-bold text-blue-300">{currentWeapon.range}m</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-white/5">
                              <p className="text-[10px] text-scifi-muted mb-1">DPS</p>
                              <p className="text-base font-bold text-yellow-300">
                                {Math.round(currentWeapon.attack * currentWeapon.attackSpeed)}
                              </p>
                            </div>
                          </div>

                          {currentWeapon.specialEffect && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                              <p className="text-xs text-yellow-300">
                                <span className="font-semibold">特殊效果: </span>
                                {currentWeapon.specialEffect}
                              </p>
                            </div>
                          )}

                          <GlowButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={() => setShowWeaponSelector(true)}
                          >
                            <RefreshCw className="w-4 h-4" />
                            更换武器
                          </GlowButton>
                        </div>
                      );
                    })()}
                  </TechCard>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <TechCard borderColor="cyan" title="技能冷却效率">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {defaultSkills.map((skill) => {
                    const SkillIcon = skill.icon;
                    const isOnCooldown = skill.currentCooldown > 0;
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          'relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
                          'bg-gradient-to-br border-white/10',
                          skill.bgColor,
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div
                              className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center border-2',
                                isOnCooldown
                                  ? 'bg-white/5 border-white/10'
                                  : 'bg-white/10 border-white/20',
                              )}
                            >
                              <SkillIcon className={cn('w-7 h-7', isOnCooldown ? 'text-scifi-muted' : skill.color)} />
                            </div>
                            {isOnCooldown && (
                              <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="text-center">
                                  <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-0.5" />
                                  <span className="text-xs font-bold text-yellow-300">
                                    {skill.currentCooldown}s
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className={cn(
                                'font-display text-base font-bold truncate',
                                isOnCooldown ? 'text-scifi-muted' : 'text-scifi-text',
                              )}>
                                {skill.name}
                              </h4>
                              <span className={cn(
                                'text-xs font-bold px-2 py-0.5 rounded-md',
                                isOnCooldown
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                                  : 'bg-green-500/20 text-green-300 border border-green-400/30',
                              )}>
                                {isOnCooldown ? '冷却中' : '就绪'}
                              </span>
                            </div>
                            <p className="text-xs text-scifi-muted mb-3 leading-relaxed">
                              {skill.description}
                            </p>

                            <div className="space-y-2">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-scifi-muted uppercase tracking-wider">冷却效率</span>
                                  <span className={cn(
                                    'text-xs font-bold',
                                    skill.efficiency >= 80 ? 'text-green-400' : skill.efficiency >= 60 ? 'text-yellow-400' : 'text-red-400',
                                  )}>
                                    {skill.efficiency}%
                                  </span>
                                </div>
                                <ProgressBar
                                  value={skill.efficiency}
                                  max={100}
                                  color={skill.efficiency >= 80 ? 'green' : skill.efficiency >= 60 ? 'yellow' : 'red'}
                                  showLabel={false}
                                  height={6}
                                />
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-scifi-muted">
                                  冷却时间: <span className="text-scifi-text font-semibold">{skill.cooldown}s</span>
                                </span>
                                <span className="text-scifi-muted">
                                  实际冷却: <span className="text-cyan-300 font-semibold">
                                    {Math.ceil(skill.cooldown * (1 - skill.efficiency / 200))}s
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TechCard>

              <TechCard borderColor="purple" title="冷却效率分析">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-scifi-text mb-1">平均效率</p>
                    <p className="text-2xl font-display font-bold text-gradient-cyber">
                      {Math.round(defaultSkills.reduce((sum, s) => sum + s.efficiency, 0) / defaultSkills.length)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-scifi-text mb-1">就绪技能</p>
                    <p className="text-2xl font-display font-bold text-purple-300">
                      {defaultSkills.filter((s) => s.currentCooldown === 0).length} / {defaultSkills.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-scifi-text mb-1">最高效率</p>
                    <p className="text-2xl font-display font-bold text-yellow-300">
                      {Math.max(...defaultSkills.map((s) => s.efficiency))}%
                    </p>
                  </div>
                </div>
              </TechCard>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default HeroManagePage;
