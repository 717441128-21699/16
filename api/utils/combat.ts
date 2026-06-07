// 品质倍率配置
const RARITY_MULTIPLIER: Record<string, number> = {
  common: 1,
  rare: 1.5,
  epic: 2,
  legendary: 3,
};

// 品质颜色配置
const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#00D4FF',
  epic: '#A855F7',
  legendary: '#FFC93C',
};

// 英雄类型定义（后端轻量版）
interface HeroLike {
  powers: { attack: number; defense: number; speed: number; cooldownModifier: number }[];
  suit: { defense: number; rarity: string };
  weapon: { damage: number; rarity: string; attackSpeed: number; criticalChance: number };
  level: number;
  skills: { type: string; damage: number }[];
}

// 敌人类型定义
interface EnemyLike {
  damage: number;
}

/**
 * 计算英雄战斗力
 * @param hero 英雄数据
 * @returns 战斗力数值
 */
export function calculateCombatPower(hero: HeroLike): number {
  const powersAttack = hero.powers.reduce((sum, p) => sum + p.attack, 0);
  const powersDefense = hero.powers.reduce((sum, p) => sum + p.defense, 0);
  const powersSpeed = hero.powers.reduce((sum, p) => sum + p.speed, 0);

  const suitDefense = hero.suit.defense * (RARITY_MULTIPLIER[hero.suit.rarity] || 1);
  const weaponDamage = hero.weapon.damage * (RARITY_MULTIPLIER[hero.weapon.rarity] || 1);
  const weaponAttackSpeed = hero.weapon.attackSpeed;
  const weaponCrit = hero.weapon.criticalChance;

  const basePower =
    powersAttack * 10 +
    powersDefense * 6 +
    powersSpeed * 4 +
    suitDefense * 5 +
    weaponDamage * 8 +
    weaponAttackSpeed * 3 +
    weaponCrit * 50;

  const levelBonus = 1 + (hero.level - 1) * 0.1;

  const skillBonus = hero.skills.reduce((sum, skill) => {
    if (skill.type === 'ultimate') return sum + skill.damage * 0.5;
    if (skill.type === 'active') return sum + skill.damage * 0.3;
    return sum;
  }, 0);

  return Math.floor((basePower + skillBonus) * levelBonus);
}

/**
 * 计算技能冷却效率
 * @param hero 英雄数据
 * @returns 冷却效率（0.3 ~ 1）
 */
export function calculateCooldownEfficiency(hero: HeroLike): number {
  const baseEfficiency = 1;

  const powerModifier = hero.powers.reduce(
    (product, p) => product * (1 - p.cooldownModifier),
    1
  );

  const suitRarityBonus = ((RARITY_MULTIPLIER[hero.suit.rarity] || 1) - 1) * 0.05;

  const levelBonus = hero.level * 0.005;

  const efficiency = baseEfficiency * powerModifier * (1 - suitRarityBonus) - levelBonus;

  return Math.max(0.3, Math.min(1, efficiency));
}

/**
 * 计算攻击伤害
 * @param attacker 攻击者（英雄或敌人）
 * @param defender 防御者（英雄或敌人）
 * @returns 最终伤害值
 */
export function calculateDamage(
  attacker: HeroLike | EnemyLike,
  defender: HeroLike | EnemyLike
): number {
  let baseDamage: number;
  let defense: number;

  // 判断是否为英雄（有 weapon 和 powers 属性）
  const isAttackerHero = 'weapon' in attacker && 'powers' in attacker;
  if (isAttackerHero) {
    const heroAttacker = attacker as HeroLike;
    const powersAttack = heroAttacker.powers.reduce((sum, p) => sum + p.attack, 0);
    const weaponDamage =
      heroAttacker.weapon.damage * (RARITY_MULTIPLIER[heroAttacker.weapon.rarity] || 1);
    baseDamage = powersAttack * 2 + weaponDamage;
  } else {
    baseDamage = (attacker as EnemyLike).damage;
  }

  // 判断防御者是否为英雄
  const isDefenderHero = 'suit' in defender && 'powers' in defender;
  if (isDefenderHero) {
    const heroDefender = defender as HeroLike;
    const powersDefense = heroDefender.powers.reduce((sum, p) => sum + p.defense, 0);
    const suitDefense =
      heroDefender.suit.defense * (RARITY_MULTIPLIER[heroDefender.suit.rarity] || 1);
    defense = powersDefense + suitDefense;
  } else {
    defense = 0;
  }

  // 暴击判定
  let isCritical = false;
  let criticalMultiplier = 1;
  if (isAttackerHero) {
    const critChance = (attacker as HeroLike).weapon.criticalChance;
    if (Math.random() < critChance) {
      isCritical = true;
      criticalMultiplier = 1.5;
    }
  }

  // 计算最终伤害（含随机浮动和伤害减免）
  const randomFactor = 0.9 + Math.random() * 0.2;
  const rawDamage = baseDamage * criticalMultiplier * randomFactor;
  const damageReduction = defense / (defense + 100);
  const finalDamage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));

  return finalDamage;
}

/**
 * 获取品质对应的颜色
 * @param rarity 品质
 * @returns 颜色十六进制字符串
 */
export function getRarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] || '#9CA3AF';
}
