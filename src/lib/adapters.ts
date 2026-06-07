import type {
  Hero as DataHero,
  SuperPower as DataSuperPower,
  Suit as DataSuit,
  Weapon as DataWeapon,
} from '../data/heroes';

import type {
  District as DataDistrict,
  CityEvent as DataCityEvent,
} from '../data/city';

import type {
  MarketItem as DataMarketItem,
} from '../data/market';

import type {
  Guild as DataGuild,
  DistrictWar as DataDistrictWar,
} from '../data/guild';

interface BackendHero {
  id: string;
  name: string;
  title?: string;
  faction?: string;
  level: number;
  exp: number;
  powers: any[];
  suit: any;
  weapon: any;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  combatPower?: number;
  cooldownEfficiency?: number;
  reputation: number;
  gold: number;
  skills?: any[];
  avatar?: string;
  alias?: string;
  maxExp?: number;
  hp?: number;
  maxHp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  powerIds?: string[];
  suitId?: string;
  weaponId?: string;
}

interface BackendDistrict {
  id: string;
  name: string;
  description: string;
  crimeRate: number;
  citizenSatisfaction?: number;
  satisfaction?: number;
  resourceOutput?: number;
  activity?: number;
  activeEvents?: any[];
  population?: number;
  type?: 'financial' | 'industrial' | 'residential';
  icon?: string;
  controlledBy?: string;
}

interface BackendEvent {
  id: string;
  type?: string;
  name: string;
  description: string;
  severity?: number | string;
  districtId?: string;
  reward?: {
    exp: number;
    gold: number;
    reputation: number;
  };
  participants?: any[];
  status?: string;
  duration?: number;
  icon?: string;
}

interface BackendMarketItem {
  id: string;
  sellerId: string;
  sellerName?: string;
  itemType: string;
  itemName?: string;
  name?: string;
  itemRarity?: string;
  rarity?: string;
  price: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  listedAt?: number;
  status?: string;
  stock?: number;
  icon?: string;
  description?: string;
  buyerId?: string;
  buyerName?: string;
}

interface BackendGuild {
  id: string;
  name: string;
  leaderId?: string;
  leaderName?: string;
  description?: string;
  level?: number;
  members?: any[];
  memberCount?: number;
  maxMembers?: number;
  buildings?: any[];
  treasury?: number;
  reputation?: number;
  controlledDistricts?: string[];
  banner?: string;
  icon?: string;
  createdAt?: number;
}

interface BackendDistrictWar {
  id: string;
  districtId: string;
  attackerGuildId: string;
  defenderGuildId?: string;
  attackerControl?: number;
  defenderControl?: number;
  control?: number;
  status?: 'active' | 'ended';
  startTime?: number;
  endTime?: number;
  winnerId?: string;
  attackerHeroes?: any[];
  defenderHeroes?: any[];
  districtName?: string;
  attackerName?: string;
  defenderName?: string;
}

const AVATARS = ['🦸', '🦹', '👨‍🚀', '👩‍🚀', '🧙', '🦸‍♂️', '🦸‍♀️', '⚡', '🔥', '❄️', '🌊', '🌟'];
const DISTRICT_ICONS: Record<string, string> = {
  'financial': '🏙️',
  'financial-district': '🏙️',
  'industrial': '🏭',
  'industrial-district': '🏭',
  'residential': '🏘️',
  'residential-district': '🏘️',
};
const DISTRICT_TYPES: Record<string, 'financial' | 'industrial' | 'residential'> = {
  'financial-district': 'financial',
  'industrial-district': 'industrial',
  'residential-district': 'residential',
};
const EVENT_ICONS: Record<string, string> = {
  'robbery': '💰',
  'alien-invasion': '👽',
  'fire': '🔥',
  'gang-war': '🔫',
  'hostage': '🆘',
  'disaster': '🌋',
};
const SEVERITY_MAP: Record<number, 'low' | 'medium' | 'high' | 'critical'> = {
  1: 'low', 2: 'low', 3: 'medium', 4: 'high', 5: 'critical',
};
const MARKET_ICONS: Record<string, string> = {
  'suit-blueprint': '📜',
  'weapon-blueprint': '📋',
  'skill-book': '📕',
  'material': '💎',
  'potion': '🧪',
  'suit': '🦺',
  'weapon': '⚔️',
};

export function adaptHero(backend: BackendHero | any): DataHero {
  if (!backend) return createEmptyHero();

  const powerIds = backend.powerIds || backend.powers?.map((p: any) => typeof p === 'string' ? p : p.id) || [];
  const suitId = backend.suitId || (typeof backend.suit === 'object' ? backend.suit?.id : backend.suit) || '';
  const weaponId = backend.weaponId || (typeof backend.weapon === 'object' ? backend.weapon?.id : backend.weapon) || '';

  const baseHp = 500 + (backend.level || 1) * 50;
  const baseAttack = 30 + (backend.level || 1) * 5;
  const baseDefense = 20 + (backend.level || 1) * 3;
  const baseSpeed = 10 + (backend.level || 1) * 2;

  return {
    id: backend.id || `hero-${Date.now()}`,
    name: backend.name || '无名英雄',
    alias: backend.alias || backend.title || '英雄',
    level: backend.level || 1,
    exp: backend.exp || 0,
    maxExp: backend.maxExp || ((backend.level || 1) * 1000),
    hp: backend.hp ?? backend.health ?? baseHp,
    maxHp: backend.maxHp ?? backend.maxHealth ?? baseHp,
    energy: backend.energy ?? backend.maxEnergy ?? 100,
    maxEnergy: backend.maxEnergy ?? 100,
    attack: backend.attack || backend.combatPower ? Math.floor((backend.combatPower || 0) / 20) : baseAttack,
    defense: backend.defense || baseDefense,
    speed: backend.speed || baseSpeed,
    powers: powerIds,
    suitId,
    weaponId,
    avatar: backend.avatar || AVATARS[Math.abs(hashCode(backend.id || '')) % AVATARS.length],
    gold: backend.gold ?? 1000,
    reputation: backend.reputation ?? 0,
  };
}

export function adaptHeroes(list: any[]): DataHero[] {
  return Array.isArray(list) ? list.map(adaptHero) : [];
}

export function adaptDistrict(backend: BackendDistrict | any): DataDistrict {
  if (!backend) return createEmptyDistrict();

  const type = backend.type || DISTRICT_TYPES[backend.id] || 'residential';
  const populationBase = type === 'financial' ? 120000 : type === 'industrial' ? 80000 : 250000;

  return {
    id: backend.id || 'district-1',
    name: backend.name || '未知区域',
    type,
    population: backend.population ?? populationBase,
    crimeRate: backend.crimeRate ?? 50,
    satisfaction: backend.satisfaction ?? backend.citizenSatisfaction ?? 70,
    activity: backend.activity ?? backend.resourceOutput ?? 70,
    description: backend.description || '',
    icon: backend.icon || DISTRICT_ICONS[backend.id] || DISTRICT_ICONS[type] || '🏙️',
    controlledBy: backend.controlledBy,
  };
}

export function adaptDistricts(list: any[]): DataDistrict[] {
  return Array.isArray(list) ? list.map(adaptDistrict) : [];
}

export function adaptCityEvent(backend: BackendEvent | any): DataCityEvent {
  if (!backend) return createEmptyEvent();

  const severityNum = typeof backend.severity === 'number' ? backend.severity : 3;

  return {
    id: backend.id || `event-${Date.now()}`,
    name: backend.name || '未知事件',
    type: (backend.type as any) || 'robbery',
    severity: typeof backend.severity === 'string' ? backend.severity : (SEVERITY_MAP[severityNum] || 'medium'),
    description: backend.description || '',
    reward: backend.reward || { exp: 100, gold: 500, reputation: 10 },
    duration: backend.duration || 600,
    icon: backend.icon || EVENT_ICONS[backend.type] || '⚠️',
  };
}

export function adaptCityEvents(list: any[]): DataCityEvent[] {
  return Array.isArray(list) ? list.map(adaptCityEvent) : [];
}

export function adaptMarketItem(backend: BackendMarketItem | any): DataMarketItem {
  if (!backend) return createEmptyMarketItem();

  const price = backend.price || backend.currentPrice || backend.basePrice || 0;

  return {
    id: backend.id || `item-${Date.now()}`,
    name: backend.name || backend.itemName || '未知物品',
    category: (backend.category || backend.itemType || 'rare-material') as any,
    rarity: (backend.rarity || backend.itemRarity || 'common') as any,
    description: backend.description || '',
    basePrice: backend.basePrice || backend.suggestedPriceMin || Math.floor(price * 0.8),
    currentPrice: price,
    stock: backend.stock ?? 1,
    sellerId: backend.sellerId || 'system',
    sellerName: backend.sellerName || '系统商店',
    listedAt: backend.listedAt || Date.now(),
    icon: backend.icon || MARKET_ICONS[backend.itemType || backend.category] || '📦',
  };
}

export function adaptMarketItems(list: any[]): DataMarketItem[] {
  return Array.isArray(list) ? list.map(adaptMarketItem) : [];
}

export function adaptGuild(backend: BackendGuild | any): DataGuild {
  if (!backend) return createEmptyGuild();

  const level = backend.level || 1;

  const members: any[] = Array.isArray(backend.members)
    ? backend.members.map((m: any, idx: number) => ({
        id: m.heroId || m.id || `member-${idx}`,
        name: m.heroName || m.name || '无名英雄',
        alias: m.alias || m.title || m.heroName || '英雄',
        rank: adaptRank(m.role || m.rank),
        level: m.level || 10,
        power: m.power || m.combatPower || Math.floor(2000 + Math.random() * 8000),
        contribution: m.contribution || 0,
        joinedAt: m.joinDate || m.joinedAt || Date.now(),
        avatar: m.avatar || AVATARS[idx % AVATARS.length],
      }))
    : [];

  return {
    id: backend.id || `guild-${Date.now()}`,
    name: backend.name || '无名公会',
    tag: backend.tag || backend.name?.slice(0, 3).toUpperCase() || 'NON',
    level,
    exp: backend.exp ?? 0,
    maxExp: backend.maxExp ?? level * 10000,
    description: backend.description || '',
    members,
    maxMembers: backend.maxMembers || 50,
    buildings: backend.buildings || [],
    controlledDistricts: backend.controlledDistricts || [],
    treasury: Number(backend.treasury) || 0,
    reputation: backend.reputation ?? 0,
    createdAt: backend.createdAt || Date.now(),
    icon: backend.icon || backend.banner || '🏰',
  };
}

export function adaptGuilds(list: any[]): DataGuild[] {
  return Array.isArray(list) ? list.map(adaptGuild) : [];
}

export function adaptDistrictWar(backend: BackendDistrictWar | any): DataDistrictWar {
  if (!backend) return createEmptyWar();

  const attackerPower = backend.attackerPower ?? Math.floor((backend.attackerControl ?? 50) * 100);
  const defenderPower = backend.defenderPower ?? Math.floor((backend.defenderControl ?? 50) * 100);
  const status = backend.status === 'active' ? 'ongoing' : (backend.status || 'preparing');

  return {
    id: backend.id || `war-${Date.now()}`,
    districtId: backend.districtId || '',
    districtName: backend.districtName || '未知区域',
    attackerGuildId: backend.attackerGuildId || '',
    attackerGuildName: backend.attackerGuildName || backend.attackerName || '攻击方',
    defenderGuildId: backend.defenderGuildId || '',
    defenderGuildName: backend.defenderGuildName || backend.defenderName || '防守方',
    attackerPower,
    defenderPower,
    startTime: backend.startTime || Date.now(),
    endTime: backend.endTime || (backend.startTime || Date.now()) + 3600000,
    attackerScore: backend.attackerScore ?? backend.attackerControl ?? 50,
    defenderScore: backend.defenderScore ?? backend.defenderControl ?? 50,
    status: status as any,
    winner: backend.winnerId || backend.winner,
  };
}

export function adaptDistrictWars(list: any[]): DataDistrictWar[] {
  return Array.isArray(list) ? list.map(adaptDistrictWar) : [];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function adaptRank(role: string | undefined): 'leader' | 'officer' | 'member' | 'recruit' {
  switch (role) {
    case 'president':
    case 'leader':
      return 'leader';
    case 'vice':
    case 'vice_president':
    case 'officer':
    case 'elder':
      return 'officer';
    case 'member':
      return 'member';
    case 'recruit':
    case 'new':
    case 'applicant':
      return 'recruit';
    default:
      return 'member';
  }
}

function createEmptyHero(): DataHero {
  return {
    id: '',
    name: '',
    alias: '',
    level: 1,
    exp: 0,
    maxExp: 1000,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    attack: 10,
    defense: 5,
    speed: 5,
    powers: [],
    suitId: '',
    weaponId: '',
    avatar: '🦸',
    gold: 0,
    reputation: 0,
  };
}

function createEmptyDistrict(): DataDistrict {
  return {
    id: '',
    name: '',
    type: 'residential',
    population: 0,
    crimeRate: 0,
    satisfaction: 0,
    activity: 0,
    description: '',
    icon: '🏙️',
  };
}

function createEmptyEvent(): DataCityEvent {
  return {
    id: '',
    name: '',
    type: 'robbery',
    severity: 'medium',
    description: '',
    reward: { exp: 0, gold: 0, reputation: 0 },
    duration: 0,
    icon: '⚠️',
  };
}

function createEmptyMarketItem(): DataMarketItem {
  return {
    id: '',
    name: '',
    category: 'rare-material',
    rarity: 'common',
    description: '',
    basePrice: 0,
    currentPrice: 0,
    stock: 1,
    icon: '📦',
  };
}

function createEmptyGuild(): DataGuild {
  return {
    id: '',
    name: '',
    tag: '',
    level: 1,
    exp: 0,
    maxExp: 10000,
    description: '',
    members: [],
    maxMembers: 50,
    buildings: [],
    controlledDistricts: [],
    treasury: 0,
    reputation: 0,
    createdAt: Date.now(),
    icon: '🏰',
  };
}

function createEmptyWar(): DataDistrictWar {
  return {
    id: '',
    districtId: '',
    districtName: '',
    attackerGuildId: '',
    attackerGuildName: '',
    defenderGuildId: '',
    defenderGuildName: '',
    attackerPower: 0,
    defenderPower: 0,
    startTime: Date.now(),
    endTime: Date.now(),
    attackerScore: 0,
    defenderScore: 0,
    status: 'preparing',
  };
}
