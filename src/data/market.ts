import type { Rarity } from './heroes';

export type ItemCategory = 'suit-blueprint' | 'skill-book' | 'rare-material' | 'weapon-part' | 'consumable';

export interface MarketItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  description: string;
  basePrice: number;
  currentPrice: number;
  stock: number;
  sellerId?: string;
  sellerName?: string;
  listedAt?: number;
  icon: string;
}

export interface PriceRecord {
  date: string;
  price: number;
}

export interface ItemPriceHistory {
  itemId: string;
  history: PriceRecord[];
}

export const marketItems: MarketItem[] = [
  {
    id: 'bp-titan-suit',
    name: '泰坦战衣蓝图',
    category: 'suit-blueprint',
    rarity: 'epic',
    description: '可用于制作史诗品质泰坦战衣的设计图纸',
    basePrice: 15000,
    currentPrice: 16500,
    stock: 3,
    icon: '📜',
  },
  {
    id: 'bp-quantum-suit',
    name: '量子战衣蓝图',
    category: 'suit-blueprint',
    rarity: 'legendary',
    description: '传说中的量子战衣设计图，极其稀有',
    basePrice: 80000,
    currentPrice: 95000,
    stock: 1,
    icon: '📋',
  },
  {
    id: 'sb-flight-mastery',
    name: '飞行精通·技能书',
    category: 'skill-book',
    rarity: 'rare',
    description: '学习后可大幅提升飞行能力的效率',
    basePrice: 5000,
    currentPrice: 5500,
    stock: 8,
    icon: '📕',
  },
  {
    id: 'sb-energy-control',
    name: '能量操控·高级教程',
    category: 'skill-book',
    rarity: 'epic',
    description: '提升能量操控技能等级+2',
    basePrice: 12000,
    currentPrice: 13200,
    stock: 5,
    icon: '📗',
  },
  {
    id: 'sb-ultimate-regen',
    name: '究极再生·秘传',
    category: 'skill-book',
    rarity: 'legendary',
    description: '学习再生技能的终极形态',
    basePrice: 50000,
    currentPrice: 58000,
    stock: 2,
    icon: '📘',
  },
  {
    id: 'mt-adamantine',
    name: '精金矿石',
    category: 'rare-material',
    rarity: 'rare',
    description: '用于锻造高级装备的稀有金属',
    basePrice: 2000,
    currentPrice: 2200,
    stock: 25,
    icon: '💎',
  },
  {
    id: 'mt-vibranium',
    name: '振金碎片',
    category: 'rare-material',
    rarity: 'epic',
    description: '来自外星的神秘金属，具备超强韧性',
    basePrice: 8000,
    currentPrice: 9000,
    stock: 10,
    icon: '🔷',
  },
  {
    id: 'mt-cosmic-crystal',
    name: '宇宙水晶',
    category: 'rare-material',
    rarity: 'legendary',
    description: '蕴含宇宙能量的神秘水晶',
    basePrice: 30000,
    currentPrice: 35000,
    stock: 4,
    icon: '💠',
  },
  {
    id: 'wp-plasma-core',
    name: '等离子核心',
    category: 'weapon-part',
    rarity: 'epic',
    description: '能量武器的核心组件',
    basePrice: 10000,
    currentPrice: 11000,
    stock: 6,
    icon: '⚡',
  },
  {
    id: 'cs-health-potion',
    name: '高级治疗药水',
    category: 'consumable',
    rarity: 'common',
    description: '使用后立即恢复500点生命值',
    basePrice: 500,
    currentPrice: 550,
    stock: 50,
    icon: '🧪',
  },
  {
    id: 'cs-energy-drink',
    name: '能量浓缩液',
    category: 'consumable',
    rarity: 'rare',
    description: '使用后立即恢复80点能量',
    basePrice: 800,
    currentPrice: 880,
    stock: 30,
    icon: '🥤',
  },
  {
    id: 'cs-exp-boost',
    name: '经验增幅卷轴',
    category: 'consumable',
    rarity: 'epic',
    description: '1小时内获得的经验值翻倍',
    basePrice: 3000,
    currentPrice: 3300,
    stock: 15,
    icon: '📜',
  },
];

export const priceHistory: ItemPriceHistory[] = [
  {
    itemId: 'bp-titan-suit',
    history: [
      { date: '06-01', price: 14500 },
      { date: '06-02', price: 14800 },
      { date: '06-03', price: 15200 },
      { date: '06-04', price: 15000 },
      { date: '06-05', price: 15800 },
      { date: '06-06', price: 16200 },
      { date: '06-07', price: 16500 },
    ],
  },
  {
    itemId: 'mt-adamantine',
    history: [
      { date: '06-01', price: 1900 },
      { date: '06-02', price: 1950 },
      { date: '06-03', price: 2100 },
      { date: '06-04', price: 2050 },
      { date: '06-05', price: 2000 },
      { date: '06-06', price: 2150 },
      { date: '06-07', price: 2200 },
    ],
  },
  {
    itemId: 'sb-flight-mastery',
    history: [
      { date: '06-01', price: 4800 },
      { date: '06-02', price: 4900 },
      { date: '06-03', price: 5100 },
      { date: '06-04', price: 5000 },
      { date: '06-05', price: 5200 },
      { date: '06-06', price: 5400 },
      { date: '06-07', price: 5500 },
    ],
  },
  {
    itemId: 'mt-vibranium',
    history: [
      { date: '06-01', price: 7500 },
      { date: '06-02', price: 7800 },
      { date: '06-03', price: 8200 },
      { date: '06-04', price: 8000 },
      { date: '06-05', price: 8500 },
      { date: '06-06', price: 8800 },
      { date: '06-07', price: 9000 },
    ],
  },
  {
    itemId: 'cs-health-potion',
    history: [
      { date: '06-01', price: 480 },
      { date: '06-02', price: 490 },
      { date: '06-03', price: 510 },
      { date: '06-04', price: 500 },
      { date: '06-05', price: 520 },
      { date: '06-06', price: 540 },
      { date: '06-07', price: 550 },
    ],
  },
];
