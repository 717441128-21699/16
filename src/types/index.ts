export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type WeaponType = 'melee' | 'ranged' | 'energy';
export type Faction = 'justice' | 'neutral' | 'chaos';
export type SkillType = 'active' | 'ultimate' | 'passive';
export type DistrictId = 'finance' | 'industry' | 'residential';
export type EventType = 'bank_robbery' | 'alien_invasion' | 'fire' | 'gang_war' | 'hostage';
export type EventStatus = 'active' | 'in_progress' | 'completed';
export type BattleStatus = 'fighting' | 'victory' | 'defeat';
export type BattleLogType = 'damage' | 'heal' | 'skill' | 'kill' | 'info';
export type MarketItemType = 'blueprint' | 'skill_book' | 'material';
export type MarketItemStatus = 'listed' | 'sold' | 'expired';
export type RankingChange = 'up' | 'down' | 'same';
export type GuildRole = 'president' | 'vice' | 'officer' | 'member';
export type WarStatus = 'preparing' | 'fighting' | 'ended';

export interface SuperPower {
  id: string;
  name: string;
  icon: string;
  description: string;
  attack: number;
  defense: number;
  speed: number;
  cooldownModifier: number;
}

export interface Suit {
  id: string;
  name: string;
  rarity: Rarity;
  defense: number;
  energyBonus: number;
  healthBonus: number;
  color: string;
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: Rarity;
  damage: number;
  attackSpeed: number;
  criticalChance: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  cooldown: number;
  currentCooldown: number;
  type: SkillType;
}

export interface Hero {
  id: string;
  name: string;
  title: string;
  faction: Faction;
  level: number;
  exp: number;
  powers: SuperPower[];
  suit: Suit;
  weapon: Weapon;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  combatPower: number;
  cooldownEfficiency: number;
  reputation: number;
  gold: number;
  skills: Skill[];
}

export interface CityDistrict {
  id: DistrictId;
  name: string;
  description: string;
  crimeRate: number;
  citizenSatisfaction: number;
  resourceOutput: number;
  activeEvents: CityEvent[];
  controllingGuild?: string;
}

export interface CityEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  districtId: string;
  reward: { exp: number; gold: number; reputation: number };
  participants: string[];
  status: EventStatus;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  type: string;
}

export interface BattleLog {
  timestamp: number;
  type: BattleLogType;
  message: string;
  value?: number;
}

export interface BattleState {
  id: string;
  heroId: string;
  teammates: Hero[];
  enemies: Enemy[];
  logs: BattleLog[];
  teamworkScore: number;
  startTime: number;
  status: BattleStatus;
}

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  itemType: MarketItemType;
  itemName: string;
  itemRarity: string;
  price: number;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  listedAt: number;
  status: MarketItemStatus;
}

export interface PriceHistory {
  itemType: string;
  averagePrice: number;
  priceHistory: { date: string; price: number }[];
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  districtStats: {
    districtId: string;
    crimeRateData: number[];
    satisfactionData: number[];
  }[];
  heroActivity: { date: string; activeHeroes: number }[];
  totalEvents: number;
  totalMissions: number;
  totalResources: number;
}

export interface RankingEntry {
  rank: number;
  heroId: string;
  heroName: string;
  heroTitle: string;
  value: number;
  change: RankingChange;
}

export interface GuildMember {
  heroId: string;
  heroName: string;
  role: GuildRole;
  joinDate: number;
  contribution: number;
}

export interface GuildBuilding {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  effect: string;
  bonus: { stat: string; value: number };
  upgradeCost: number;
}

export interface Guild {
  id: string;
  name: string;
  level: number;
  presidentId: string;
  vicePresidentIds: string[];
  members: GuildMember[];
  buildings: GuildBuilding[];
  controlledDistricts: string[];
  totalPower: number;
}

export interface WarParticipant {
  heroId: string;
  heroName: string;
  guildId: string;
  kills: number;
  damage: number;
  contribution: number;
}

export interface DistrictWar {
  id: string;
  districtId: string;
  attackerGuildId: string;
  defenderGuildId: string;
  attackerPower: number;
  defenderPower: number;
  attackerControl: number;
  defenderControl: number;
  participants: WarParticipant[];
  status: WarStatus;
  winner?: string;
}
