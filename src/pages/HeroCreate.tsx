import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Sparkles,
  Shirt,
  Swords,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { PowerSelector } from '@/components/hero/PowerSelector';
import { SuitSelector } from '@/components/hero/SuitSelector';
import { WeaponSelector } from '@/components/hero/WeaponSelector';
import { PowerRadar, type HeroStatsData } from '@/components/hero/PowerRadar';
import { HeroCard } from '@/components/hero/HeroCard';
import { TechCard, GlowButton } from '@/components/ui';
import { useHeroStore } from '@/store/useHeroStore';
import { superPowers, suits, weapons, type Hero } from '@/data/heroes';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout';

type StepId = 'basic' | 'powers' | 'suit' | 'weapon' | 'confirm';

interface Step {
  id: StepId;
  label: string;
  icon: typeof User;
}

const steps: Step[] = [
  { id: 'basic', label: '基础信息', icon: User },
  { id: 'powers', label: '超能力', icon: Sparkles },
  { id: 'suit', label: '战衣', icon: Shirt },
  { id: 'weapon', label: '武器', icon: Swords },
  { id: 'confirm', label: '确认', icon: CheckCircle },
];

const avatars = ['🦸', '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🥷', '👨‍🚀', '👩‍🚀'];

function HeroCreatePage() {
  const navigate = useNavigate();
  const createHero = useHeroStore((s) => s.createHero);
  const [currentStep, setCurrentStep] = useState<StepId>('basic');
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const [heroName, setHeroName] = useState('');
  const [heroAlias, setHeroAlias] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [selectedSuitId, setSelectedSuitId] = useState<string | null>(null);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);

  const computedStats = useMemo<HeroStatsData>(() => {
    let attack = 50;
    let defense = 30;
    let speed = 40;
    let energy = 60;
    let health = 100;
    let cooldownReduction = 0;

    selectedPowers.forEach((id) => {
      const power = superPowers.find((p) => p.id === id);
      if (power) {
        attack += power.damage;
        energy += Math.floor(power.energyCost * 0.5);
        cooldownReduction += Math.floor((10 - power.cooldown) * 2);
      }
    });

    if (selectedSuitId) {
      const suit = suits.find((s) => s.id === selectedSuitId);
      if (suit) {
        defense += suit.defense;
        energy += suit.energyBonus;
        speed += suit.speedBonus;
        health += suit.defense * 2;
      }
    }

    if (selectedWeaponId) {
      const weapon = weapons.find((w) => w.id === selectedWeaponId);
      if (weapon) {
        attack += weapon.attack;
        speed += Math.floor(weapon.attackSpeed * 10);
        cooldownReduction += weapon.range;
      }
    }

    return {
      attack: Math.min(attack, 200),
      defense: Math.min(defense, 200),
      speed: Math.min(speed, 200),
      energy: Math.min(energy, 200),
      health: Math.min(health, 200),
      cooldownReduction: Math.min(cooldownReduction, 100),
    };
  }, [selectedPowers, selectedSuitId, selectedWeaponId]);

  const previewHero: Hero = useMemo(() => {
    return {
      id: 'preview',
      name: heroName || '未命名英雄',
      alias: heroAlias || '待定称号',
      avatar: selectedAvatar,
      level: 1,
      exp: 0,
      maxExp: 1000,
      hp: 500 + computedStats.health * 3,
      maxHp: 500 + computedStats.health * 3,
      energy: 50 + computedStats.energy,
      maxEnergy: 50 + computedStats.energy,
      attack: computedStats.attack,
      defense: computedStats.defense,
      speed: computedStats.speed,
      powers: selectedPowers,
      suitId: selectedSuitId ?? 'basic-suit',
      weaponId: selectedWeaponId ?? 'fists',
    };
  }, [heroName, heroAlias, selectedAvatar, computedStats, selectedPowers, selectedSuitId, selectedWeaponId]);

  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return heroName.trim().length > 0 && heroAlias.trim().length > 0;
      case 'powers':
        return selectedPowers.length > 0;
      case 'suit':
        return selectedSuitId !== null;
      case 'weapon':
        return selectedWeaponId !== null;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx < steps.length - 1 && canProceed()) {
      setCurrentStep(steps[idx + 1].id);
    }
  };

  const goPrev = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].id);
    }
  };

  const handleCreateHero = () => {
    const newHero: Omit<Hero, 'id'> = {
      name: heroName,
      alias: heroAlias,
      avatar: selectedAvatar,
      level: 1,
      exp: 0,
      maxExp: 1000,
      hp: previewHero.maxHp,
      maxHp: previewHero.maxHp,
      energy: previewHero.maxEnergy,
      maxEnergy: previewHero.maxEnergy,
      attack: computedStats.attack,
      defense: computedStats.defense,
      speed: computedStats.speed,
      powers: selectedPowers,
      suitId: selectedSuitId ?? 'basic-suit',
      weaponId: selectedWeaponId ?? 'fists',
    };
    createHero(newHero);
    navigate('/hero-manage');
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <motion.div
            key="basic"
            custom={currentStepIndex}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-scifi-text mb-2">
                创建你的英雄
              </h2>
              <p className="text-scifi-muted">填写基础信息，开启你的超级英雄之路</p>
            </div>

            <div className="space-y-5 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2">
                  选择头像
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((avatar) => (
                    <motion.button
                      key={avatar}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl border transition-all duration-200',
                        selectedAvatar === avatar
                          ? 'bg-cyan-500/20 border-cyan-400/60 shadow-glow-cyan'
                          : 'bg-white/5 border-white/10 hover:border-white/30',
                      )}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2">
                  英雄姓名
                </label>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="输入英雄的真实姓名"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-scifi-text placeholder-scifi-muted focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-scifi-muted uppercase tracking-wider mb-2">
                  英雄称号
                </label>
                <input
                  type="text"
                  value={heroAlias}
                  onChange={(e) => setHeroAlias(e.target.value)}
                  placeholder="例如：曙光、幽影、磐石..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-scifi-text placeholder-scifi-muted focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-200 font-medium"
                />
              </div>
            </div>
          </motion.div>
        );

      case 'powers':
        return (
          <motion.div
            key="powers"
            custom={currentStepIndex}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <PowerSelector
              selectedIds={selectedPowers}
              onChange={setSelectedPowers}
              maxSelect={3}
            />
          </motion.div>
        );

      case 'suit':
        return (
          <motion.div
            key="suit"
            custom={currentStepIndex}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <SuitSelector selectedId={selectedSuitId} onChange={setSelectedSuitId} />
          </motion.div>
        );

      case 'weapon':
        return (
          <motion.div
            key="weapon"
            custom={currentStepIndex}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <WeaponSelector selectedId={selectedWeaponId} onChange={setSelectedWeaponId} />
          </motion.div>
        );

      case 'confirm':
        return (
          <motion.div
            key="confirm"
            custom={currentStepIndex}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-scifi-text mb-2">
                战力分析确认
              </h2>
              <p className="text-scifi-muted">检查你的英雄配置，确认后即可创建</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HeroCard hero={previewHero} showStats />
              <div className="space-y-4">
                <TechCard borderColor="cyan" title="装备摘要">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-scifi-muted">超能力</span>
                      <span className="text-sm font-semibold text-cyan-300">
                        {selectedPowers.length} 个
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-scifi-muted">战衣</span>
                      <span className="text-sm font-semibold text-purple-300">
                        {suits.find((s) => s.id === selectedSuitId)?.name ?? '未选择'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-scifi-muted">武器</span>
                      <span className="text-sm font-semibold text-red-300">
                        {weapons.find((w) => w.id === selectedWeaponId)?.name ?? '未选择'}
                      </span>
                    </div>
                  </div>
                </TechCard>

                <TechCard borderColor="green" title="创建确认">
                  <p className="text-sm text-scifi-muted leading-relaxed mb-4">
                    确认以上信息无误后，点击下方按钮完成英雄创建。创建后你可以在英雄管理页面进行装备调整和属性升级。
                  </p>
                  <GlowButton
                    variant="success"
                    size="lg"
                    className="w-full"
                    onClick={handleCreateHero}
                  >
                    <Zap className="w-4 h-4" />
                    确认创建英雄
                  </GlowButton>
                </TechCard>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl font-bold text-gradient-cyber mb-2"
            >
              英雄创建系统
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-scifi-muted"
            >
              打造属于你的超级英雄
            </motion.p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        whileHover={isCompleted ? { scale: 1.1 } : {}}
                        onClick={() =>
                          isCompleted && setCurrentStep(step.id)
                        }
                        className={cn(
                          'relative w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300',
                          isActive
                            ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400/60 shadow-glow-cyan'
                            : isCompleted
                              ? 'bg-green-500/20 border-green-400/50 cursor-pointer'
                              : 'bg-white/5 border-white/10',
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <StepIcon
                            className={cn(
                              'w-5 h-5',
                              isActive ? 'text-cyan-300' : 'text-scifi-muted',
                            )}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="stepIndicator"
                            className="absolute -inset-1 rounded-xl border-2 border-cyan-400/40"
                            style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
                          />
                        )}
                      </motion.div>
                      <span
                        className={cn(
                          'text-xs font-medium whitespace-nowrap',
                          isActive
                            ? 'text-cyan-300'
                            : isCompleted
                              ? 'text-green-400'
                              : 'text-scifi-muted',
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-3 mb-5">
                        <div className="relative h-0.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            <div>
              <TechCard borderColor="purple" className="min-h-[500px]">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <GlowButton
                    variant="ghost"
                    onClick={goPrev}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一步
                  </GlowButton>

                  {currentStepIndex < steps.length - 1 ? (
                    <GlowButton
                      variant="primary"
                      onClick={goNext}
                      disabled={!canProceed()}
                    >
                      下一步
                      <ChevronRight className="w-4 h-4" />
                    </GlowButton>
                  ) : null}
                </div>
              </TechCard>
            </div>

            <div className="space-y-4">
              <motion.div
                key={`preview-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="sticky top-6"
              >
                <PowerRadar stats={computedStats} title="实时战力分析" size={300} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default HeroCreatePage;
