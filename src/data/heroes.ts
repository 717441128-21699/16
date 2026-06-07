export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type WeaponType = 'melee' | 'ranged' | 'energy';

export interface SuperPower {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  cooldown: number;
  icon: string;
}

export interface Suit {
  id: string;
  name: string;
  rarity: Rarity;
  defense: number;
  energyBonus: number;
  speedBonus: number;
  specialEffect?: string;
  icon: string;
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: Rarity;
  attack: number;
  attackSpeed: number;
  range: number;
  specialEffect?: string;
  icon: string;
}

export interface Hero {
  id: string;
  name: string;
  alias: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  powers: string[];
  suitId: string;
  weaponId: string;
  avatar: string;
  gold: number;
  reputation: number;
}

export const superPowers: SuperPower[] = [
  {
    id: 'flight',
    name: '飞行',
    description: '自由翱翔于天际，获得高空视野',
    damage: 20,
    energyCost: 15,
    cooldown: 3,
    icon: '✈️',
  },
  {
    id: 'super-strength',
    name: '超级力量',
    description: '拥有超乎常人的力量，可举起重物',
    damage: 50,
    energyCost: 25,
    cooldown: 5,
    icon: '💪',
  },
  {
    id: 'super-speed',
    name: '超级速度',
    description: '移动速度大幅提升，难以被击中',
    damage: 35,
    energyCost: 20,
    cooldown: 4,
    icon: '⚡',
  },
  {
    id: 'telepathy',
    name: '心灵感应',
    description: '读取敌人思想，预测其行动',
    damage: 25,
    energyCost: 30,
    cooldown: 6,
    icon: '🧠',
  },
  {
    id: 'energy-manipulation',
    name: '能量操控',
    description: '操控各种形式的能量进行攻击',
    damage: 60,
    energyCost: 40,
    cooldown: 8,
    icon: '🔮',
  },
  {
    id: 'regeneration',
    name: '再生',
    description: '快速恢复受伤的身体组织',
    damage: 0,
    energyCost: 35,
    cooldown: 10,
    icon: '💚',
  },
  {
    id: 'invisibility',
    name: '隐身',
    description: '使自身隐形，躲避敌人侦查',
    damage: 15,
    energyCost: 20,
    cooldown: 7,
    icon: '👻',
  },
];

export const suits: Suit[] = [
  {
    id: 'basic-suit',
    name: '基础战衣',
    rarity: 'common',
    defense: 10,
    energyBonus: 0,
    speedBonus: 0,
    icon: '👕',
  },
  {
    id: 'reinforced-suit',
    name: '强化战衣',
    rarity: 'common',
    defense: 20,
    energyBonus: 5,
    speedBonus: 0,
    icon: '🦺',
  },
  {
    id: 'speed-suit',
    name: '疾行战衣',
    rarity: 'rare',
    defense: 15,
    energyBonus: 10,
    speedBonus: 20,
    icon: '🥋',
  },
  {
    id: 'arcane-suit',
    name: '奥术战衣',
    rarity: 'rare',
    defense: 25,
    energyBonus: 30,
    speedBonus: 5,
    specialEffect: '能量消耗降低10%',
    icon: '🧙',
  },
  {
    id: 'titan-suit',
    name: '泰坦战衣',
    rarity: 'epic',
    defense: 50,
    energyBonus: 20,
    speedBonus: 10,
    specialEffect: '受到致命伤害时有20%几率免死',
    icon: '🛡️',
  },
  {
    id: 'phantom-suit',
    name: '幻影战衣',
    rarity: 'epic',
    defense: 35,
    energyBonus: 40,
    speedBonus: 30,
    specialEffect: '攻击有15%几率造成双倍伤害',
    icon: '🌑',
  },
  {
    id: 'quantum-suit',
    name: '量子战衣',
    rarity: 'legendary',
    defense: 80,
    energyBonus: 60,
    speedBonus: 40,
    specialEffect: '每秒恢复5点能量',
    icon: '⚛️',
  },
  {
    id: 'celestial-suit',
    name: '天神战衣',
    rarity: 'legendary',
    defense: 100,
    energyBonus: 80,
    speedBonus: 50,
    specialEffect: '全属性+15%',
    icon: '👑',
  },
];

export const weapons: Weapon[] = [
  {
    id: 'fists',
    name: '徒手',
    type: 'melee',
    rarity: 'common',
    attack: 5,
    attackSpeed: 2,
    range: 1,
    icon: '✊',
  },
  {
    id: 'baton',
    name: '警棍',
    type: 'melee',
    rarity: 'common',
    attack: 15,
    attackSpeed: 1.5,
    range: 2,
    icon: '🔨',
  },
  {
    id: 'pistol',
    name: '手枪',
    type: 'ranged',
    rarity: 'common',
    attack: 20,
    attackSpeed: 1,
    range: 10,
    icon: '🔫',
  },
  {
    id: 'katana',
    name: '武士刀',
    type: 'melee',
    rarity: 'rare',
    attack: 35,
    attackSpeed: 1.8,
    range: 2,
    specialEffect: '流血伤害',
    icon: '⚔️',
  },
  {
    id: 'sniper-rifle',
    name: '狙击步枪',
    type: 'ranged',
    rarity: 'rare',
    attack: 60,
    attackSpeed: 0.5,
    range: 50,
    specialEffect: '暴击率+20%',
    icon: '🎯',
  },
  {
    id: 'plasma-blade',
    name: '等离子之刃',
    type: 'energy',
    rarity: 'epic',
    attack: 80,
    attackSpeed: 1.2,
    range: 3,
    specialEffect: '无视30%防御',
    icon: '🗡️',
  },
  {
    id: 'arcane-staff',
    name: '奥术法杖',
    type: 'energy',
    rarity: 'epic',
    attack: 70,
    attackSpeed: 1,
    range: 20,
    specialEffect: '范围伤害',
    icon: '🪄',
  },
  {
    id: 'gauntlet-of-power',
    name: '力量手套',
    type: 'energy',
    rarity: 'legendary',
    attack: 150,
    attackSpeed: 0.8,
    range: 5,
    specialEffect: '攻击附带击退效果',
    icon: '🧤',
  },
  {
    id: 'void-bow',
    name: '虚空之弓',
    type: 'ranged',
    rarity: 'legendary',
    attack: 120,
    attackSpeed: 1.5,
    range: 100,
    specialEffect: '箭矢穿透多个目标',
    icon: '🏹',
  },
];

export const sampleHeroes: Hero[] = [
  {
    id: 'hero-1',
    name: '陈光明',
    alias: '曙光',
    level: 15,
    exp: 3500,
    maxExp: 5000,
    hp: 850,
    maxHp: 1000,
    energy: 70,
    maxEnergy: 100,
    attack: 85,
    defense: 60,
    speed: 75,
    powers: ['flight', 'super-strength'],
    suitId: 'titan-suit',
    weaponId: 'plasma-blade',
    avatar: '🦸',
    gold: 128450,
    reputation: 7820,
  },
  {
    id: 'hero-2',
    name: '林雪',
    alias: '幽影',
    level: 12,
    exp: 2200,
    maxExp: 4000,
    hp: 600,
    maxHp: 800,
    energy: 95,
    maxEnergy: 120,
    attack: 95,
    defense: 40,
    speed: 110,
    powers: ['super-speed', 'telepathy', 'invisibility'],
    suitId: 'phantom-suit',
    weaponId: 'katana',
    avatar: '🦸‍♀️',
    gold: 95200,
    reputation: 5430,
  },
  {
    id: 'hero-3',
    name: '王磊',
    alias: '磐石',
    level: 18,
    exp: 6000,
    maxExp: 7000,
    hp: 1500,
    maxHp: 1500,
    energy: 50,
    maxEnergy: 80,
    attack: 70,
    defense: 130,
    speed: 45,
    powers: ['super-strength', 'regeneration'],
    suitId: 'celestial-suit',
    weaponId: 'gauntlet-of-power',
    avatar: '🧔',
    gold: 215800,
    reputation: 12650,
  },
];
