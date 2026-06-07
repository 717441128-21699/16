import type { Hero, Enemy, Rarity } from '../types';

const RARITY_MULTIPLIER: Record<Rarity, number> = {
  common: 1,
  rare: 1.5,
  epic: 2,
  legendary: 3,
};

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',
  rare: '#00D4FF',
  epic: '#A855F7',
  legendary: '#FFC93C',
};

export function calculateCombatPower(hero: Hero): number {
  const powersAttack = hero.powers.reduce((sum, p) => sum + p.attack, 0);
  const powersDefense = hero.powers.reduce((sum, p) => sum + p.defense, 0);
  const powersSpeed = hero.powers.reduce((sum, p) => sum + p.speed, 0);

  const suitDefense = hero.suit.defense * RARITY_MULTIPLIER[hero.suit.rarity];
  const weaponDamage = hero.weapon.damage * RARITY_MULTIPLIER[hero.weapon.rarity];
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

export function calculateCooldownEfficiency(hero: Hero): number {
  const baseEfficiency = 1;

  const powerModifier = hero.powers.reduce(
    (product, p) => product * (1 - p.cooldownModifier),
    1
  );

  const suitRarityBonus = (RARITY_MULTIPLIER[hero.suit.rarity] - 1) * 0.05;

  const levelBonus = hero.level * 0.005;

  const efficiency = baseEfficiency * powerModifier * (1 - suitRarityBonus) - levelBonus;

  return Math.max(0.3, Math.min(1, efficiency));
}

export function calculateDamage(attacker: Hero | Enemy, defender: Hero | Enemy): number {
  let baseDamage: number;
  let defense: number;

  if ('weapon' in attacker && 'powers' in attacker) {
    const powersAttack = attacker.powers.reduce((sum, p) => sum + p.attack, 0);
    const weaponDamage = attacker.weapon.damage * RARITY_MULTIPLIER[attacker.weapon.rarity];
    baseDamage = powersAttack * 2 + weaponDamage;
  } else {
    baseDamage = attacker.damage;
  }

  if ('suit' in defender && 'powers' in defender) {
    const powersDefense = defender.powers.reduce((sum, p) => sum + p.defense, 0);
    const suitDefense = defender.suit.defense * RARITY_MULTIPLIER[defender.suit.rarity];
    defense = powersDefense + suitDefense;
  } else {
    defense = 0;
  }

  let isCritical = false;
  let criticalMultiplier = 1;
  if ('weapon' in attacker) {
    const critChance = attacker.weapon.criticalChance;
    if (Math.random() < critChance) {
      isCritical = true;
      criticalMultiplier = 1.5;
    }
  }

  const randomFactor = 0.9 + Math.random() * 0.2;
  const rawDamage = baseDamage * criticalMultiplier * randomFactor;
  const damageReduction = defense / (defense + 100);
  const finalDamage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));

  return finalDamage;
}

export function getRarityColor(rarity: Rarity): string {
  return RARITY_COLORS[rarity];
}
