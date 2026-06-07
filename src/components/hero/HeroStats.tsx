import { motion } from 'framer-motion';
import {
  Heart,
  Zap,
  Shield,
  Trophy,
  Star,
  Clock,
  Flame,
  Snowflake,
  Target,
} from 'lucide-react';
import type { Hero } from '@/data/heroes';
import { superPowers, suits, weapons } from '@/data/heroes';
import { TechCard, ProgressBar, RarityBadge, StatCard } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SkillDisplay {
  id: string;
  name: string;
  icon: typeof Flame;
  cooldown: number;
  currentCooldown: number;
  color: string;
  bgColor: string;
}

interface HeroStatsProps {
  hero: Hero;
  reputation?: number;
  skills?: SkillDisplay[];
}

const defaultSkills: SkillDisplay[] = [
  { id: 'skill-1', name: '烈焰冲击', icon: Flame, cooldown: 8, currentCooldown: 0, color: 'text-orange-400', bgColor: 'from-orange-500/20 to-red-500/10' },
  { id: 'skill-2', name: '冰霜护盾', icon: Snowflake, cooldown: 12, currentCooldown: 3, color: 'text-cyan-400', bgColor: 'from-cyan-500/20 to-blue-500/10' },
  { id: 'skill-3', name: '精准打击', icon: Target, cooldown: 6, currentCooldown: 0, color: 'text-yellow-400', bgColor: 'from-yellow-500/20 to-amber-500/10' },
  { id: 'skill-4', name: '雷霆万钧', icon: Zap, cooldown: 20, currentCooldown: 12, color: 'text-purple-400', bgColor: 'from-purple-500/20 to-pink-500/10' },
];

export function HeroStats({ hero, reputation = 1250, skills = defaultSkills }: HeroStatsProps) {
  const heroPowers = superPowers.filter((p) => hero.powers.includes(p.id));
  const heroSuit = suits.find((s) => s.id === hero.suitId);
  const heroWeapon = weapons.find((w) => w.id === hero.weaponId);

  const combatPower =
    hero.attack * 3 +
    hero.defense * 2.5 +
    hero.speed * 2 +
    hero.maxHp * 0.1 +
    hero.maxEnergy * 0.5 +
    hero.level * 50;

  return (
    <div className="space-y-4">
      <TechCard borderColor="cyan" glow>
        <div className="flex items-center gap-4 mb-5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 flex items-center justify-center text-4xl shadow-glow-cyan"
          >
            {hero.avatar}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-scifi-bg flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{hero.level}</span>
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-xl font-bold text-scifi-text truncate">
                {hero.name}
              </h3>
              {heroSuit && (
                <RarityBadge rarity={heroSuit.rarity}>
                  {heroSuit.rarity === 'legendary' ? '传说' : heroSuit.rarity === 'epic' ? '史诗' : heroSuit.rarity === 'rare' ? '稀有' : '普通'}
                </RarityBadge>
              )}
            </div>
            <p className="text-sm text-scifi-muted mb-2">「{hero.alias}」</p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">{Math.round(combatPower).toLocaleString()}</span>
                <span className="text-scifi-muted">战力</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300 font-semibold">{reputation.toLocaleString()}</span>
                <span className="text-scifi-muted">声望</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-scifi-muted">生命值</span>
              </div>
              <span className="text-xs font-bold text-red-300">
                {hero.hp.toLocaleString()} / {hero.maxHp.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={hero.hp} max={hero.maxHp} color="red" showLabel={false} height={10} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-scifi-muted">能量</span>
              </div>
              <span className="text-xs font-bold text-cyan-300">
                {hero.energy.toLocaleString()} / {hero.maxEnergy.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={hero.energy} max={hero.maxEnergy} color="cyan" showLabel={false} height={10} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-scifi-muted">经验值</span>
              </div>
              <span className="text-xs font-bold text-purple-300">
                {hero.exp.toLocaleString()} / {hero.maxExp.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={hero.exp} max={hero.maxExp} color="purple" showLabel={false} height={8} />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Shield className="w-5 h-5" />}
          label="防御"
          value={hero.defense}
          color="cyan"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="攻击"
          value={hero.attack}
          color="red"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="速度"
          value={hero.speed}
          color="yellow"
        />
      </div>

      <TechCard borderColor="purple" title="技能冷却">
        <div className="grid grid-cols-2 gap-3">
          {skills.map((skill) => {
            const Icon = skill.icon;
            const isOnCooldown = skill.currentCooldown > 0;
            const cooldownPercent = isOnCooldown ? (skill.currentCooldown / skill.cooldown) * 100 : 0;

            return (
              <motion.div
                key={skill.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'relative overflow-hidden rounded-lg border p-3 transition-all duration-300',
                  isOnCooldown
                    ? 'bg-white/5 border-white/10'
                    : cn('bg-gradient-to-br border-white/20 shadow-glow-cyan', skill.bgColor),
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn('relative w-10 h-10 rounded-lg flex items-center justify-center border',
                    isOnCooldown
                      ? 'bg-white/5 border-white/10'
                      : cn('bg-white/10 border-white/20', skill.bgColor),
                  )}>
                    <Icon className={cn('w-5 h-5', isOnCooldown ? 'text-scifi-muted' : skill.color)} />
                    {isOnCooldown && (
                      <div
                        className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center"
                        style={{
                          background: `conic-gradient(rgba(0,0,0,0.7) ${cooldownPercent}%, transparent ${cooldownPercent}%)`,
                        }}
                      >
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-semibold truncate',
                      isOnCooldown ? 'text-scifi-muted' : 'text-scifi-text',
                    )}>
                      {skill.name}
                    </p>
                    <p className="text-[11px] text-scifi-muted">
                      {isOnCooldown ? (
                        <span className="text-yellow-400">冷却中: {skill.currentCooldown}s</span>
                      ) : (
                        <span className="text-green-400">就绪</span>
                      )}
                      <span className="ml-1">/ {skill.cooldown}s</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </TechCard>

      {(heroPowers.length > 0 || heroSuit || heroWeapon) && (
        <TechCard borderColor="green" title="当前装备">
          <div className="space-y-3">
            {heroPowers.length > 0 && (
              <div>
                <p className="text-xs text-scifi-muted mb-2 uppercase tracking-wider">超能力</p>
                <div className="flex flex-wrap gap-2">
                  {heroPowers.map((power) => (
                    <motion.div
                      key={power.id}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-400/30"
                    >
                      <span className="text-lg">{power.icon}</span>
                      <span className="text-xs font-medium text-cyan-300">{power.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {heroSuit && (
              <div className="flex items-center justify-between py-2 border-y border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{heroSuit.icon}</span>
                  <div>
                    <p className="text-xs text-scifi-muted">战衣</p>
                    <p className="text-sm font-medium text-scifi-text">{heroSuit.name}</p>
                  </div>
                </div>
                <RarityBadge rarity={heroSuit.rarity}>
                  {heroSuit.rarity === 'legendary' ? '传说' : heroSuit.rarity === 'epic' ? '史诗' : heroSuit.rarity === 'rare' ? '稀有' : '普通'}
                </RarityBadge>
              </div>
            )}

            {heroWeapon && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{heroWeapon.icon}</span>
                  <div>
                    <p className="text-xs text-scifi-muted">武器</p>
                    <p className="text-sm font-medium text-scifi-text">{heroWeapon.name}</p>
                  </div>
                </div>
                <RarityBadge rarity={heroWeapon.rarity}>
                  {heroWeapon.rarity === 'legendary' ? '传说' : heroWeapon.rarity === 'epic' ? '史诗' : heroWeapon.rarity === 'rare' ? '稀有' : '普通'}
                </RarityBadge>
              </div>
            )}
          </div>
        </TechCard>
      )}
    </div>
  );
}

export default HeroStats;
