export type GuildRank = 'leader' | 'officer' | 'member' | 'recruit';

export interface GuildMember {
  id: string;
  name: string;
  alias: string;
  rank: GuildRank;
  level: number;
  power: number;
  contribution: number;
  joinedAt: number;
  avatar: string;
}

export interface GuildBuilding {
  id: string;
  name: string;
  type: 'training' | 'intelligence' | 'armory' | 'lounge' | 'warehouse';
  level: number;
  maxLevel: number;
  description: string;
  effect: string;
  upgradeCost: number;
  icon: string;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  level: number;
  exp: number;
  maxExp: number;
  description: string;
  members: GuildMember[];
  maxMembers: number;
  buildings: GuildBuilding[];
  controlledDistricts: string[];
  treasury: number;
  reputation: number;
  createdAt: number;
  icon: string;
}

export interface DistrictWar {
  id: string;
  districtId: string;
  districtName: string;
  attackerGuildId: string;
  attackerGuildName: string;
  defenderGuildId: string;
  defenderGuildName: string;
  attackerPower: number;
  defenderPower: number;
  startTime: number;
  endTime: number;
  attackerScore: number;
  defenderScore: number;
  status: 'preparing' | 'ongoing' | 'ended';
  winner?: string;
}

export const guildBuildings: GuildBuilding[] = [
  {
    id: 'training-room',
    name: '训练室',
    type: 'training',
    level: 3,
    maxLevel: 10,
    description: '供公会成员进行战斗训练的场所',
    effect: '成员获得经验值+15%',
    upgradeCost: 50000,
    icon: '🏋️',
  },
  {
    id: 'intelligence-center',
    name: '情报中心',
    type: 'intelligence',
    level: 2,
    maxLevel: 10,
    description: '收集和分析城市各处的情报',
    effect: '随机事件奖励+10%',
    upgradeCost: 80000,
    icon: '📡',
  },
  {
    id: 'armory',
    name: '武器库',
    type: 'armory',
    level: 4,
    maxLevel: 10,
    description: '存放和维护公会武器装备的地方',
    effect: '装备耐久度消耗-20%',
    upgradeCost: 120000,
    icon: '⚔️',
  },
];

export const sampleGuilds: Guild[] = [
  {
    id: 'guild-justice',
    name: '正义联盟',
    tag: 'JLA',
    level: 8,
    exp: 65000,
    maxExp: 100000,
    description: '守护城市和平的老牌英雄公会，以正义和秩序为信条',
    members: [
      {
        id: 'hero-1',
        name: '陈光明',
        alias: '曙光',
        rank: 'leader',
        level: 15,
        power: 8500,
        contribution: 128500,
        joinedAt: Date.now() - 86400000 * 180,
        avatar: '🦸',
      },
      {
        id: 'hero-4',
        name: '赵勇',
        alias: '铁拳',
        rank: 'officer',
        level: 14,
        power: 7800,
        contribution: 89200,
        joinedAt: Date.now() - 86400000 * 150,
        avatar: '👨‍🦱',
      },
      {
        id: 'hero-5',
        name: '孙丽',
        alias: '星尘',
        rank: 'member',
        level: 11,
        power: 5200,
        contribution: 35600,
        joinedAt: Date.now() - 86400000 * 60,
        avatar: '👩‍🦰',
      },
      {
        id: 'hero-6',
        name: '周杰',
        alias: '闪电',
        rank: 'recruit',
        level: 8,
        power: 3200,
        contribution: 4200,
        joinedAt: Date.now() - 86400000 * 7,
        avatar: '🧑',
      },
    ],
    maxMembers: 50,
    buildings: guildBuildings,
    controlledDistricts: ['financial-district'],
    treasury: 580000,
    reputation: 12500,
    createdAt: Date.now() - 86400000 * 365,
    icon: '🛡️',
  },
  {
    id: 'guild-phantom',
    name: '暗夜兄弟会',
    tag: 'PHM',
    level: 6,
    exp: 32000,
    maxExp: 80000,
    description: '活跃于城市暗处的神秘公会，擅长情报和潜入作战',
    members: [
      {
        id: 'hero-2',
        name: '林雪',
        alias: '幽影',
        rank: 'leader',
        level: 12,
        power: 7200,
        contribution: 95800,
        joinedAt: Date.now() - 86400000 * 120,
        avatar: '🦸‍♀️',
      },
      {
        id: 'hero-7',
        name: '吴风',
        alias: '夜行',
        rank: 'officer',
        level: 10,
        power: 4800,
        contribution: 52300,
        joinedAt: Date.now() - 86400000 * 90,
        avatar: '🥷',
      },
      {
        id: 'hero-8',
        name: '郑雪',
        alias: '银狐',
        rank: 'member',
        level: 9,
        power: 4100,
        contribution: 21500,
        joinedAt: Date.now() - 86400000 * 45,
        avatar: '👩',
      },
    ],
    maxMembers: 30,
    buildings: [
      { ...guildBuildings[0], level: 2 },
      { ...guildBuildings[1], level: 5 },
      { ...guildBuildings[2], level: 2 },
    ],
    controlledDistricts: [],
    treasury: 210000,
    reputation: 7800,
    createdAt: Date.now() - 86400000 * 200,
    icon: '🌙',
  },
  {
    id: 'guild-titan',
    name: '泰坦要塞',
    tag: 'TTN',
    level: 10,
    exp: 95000,
    maxExp: 120000,
    description: '以绝对力量著称的公会，成员皆为战斗精英',
    members: [
      {
        id: 'hero-3',
        name: '王磊',
        alias: '磐石',
        rank: 'leader',
        level: 18,
        power: 12000,
        contribution: 186200,
        joinedAt: Date.now() - 86400000 * 300,
        avatar: '🧔',
      },
      {
        id: 'hero-9',
        name: '马超',
        alias: '战狂',
        rank: 'officer',
        level: 16,
        power: 9500,
        contribution: 112500,
        joinedAt: Date.now() - 86400000 * 250,
        avatar: '💂',
      },
      {
        id: 'hero-10',
        name: '何刚',
        alias: '巨像',
        rank: 'member',
        level: 13,
        power: 6800,
        contribution: 68900,
        joinedAt: Date.now() - 86400000 * 100,
        avatar: '🧑‍🦲',
      },
    ],
    maxMembers: 40,
    buildings: [
      { ...guildBuildings[0], level: 6 },
      { ...guildBuildings[1], level: 3 },
      { ...guildBuildings[2], level: 7 },
    ],
    controlledDistricts: ['industrial-district'],
    treasury: 890000,
    reputation: 15200,
    createdAt: Date.now() - 86400000 * 400,
    icon: '🏰',
  },
];

export const sampleWar: DistrictWar = {
  id: 'war-001',
  districtId: 'residential-district',
  districtName: '住宅区',
  attackerGuildId: 'guild-titan',
  attackerGuildName: '泰坦要塞',
  defenderGuildId: 'guild-justice',
  defenderGuildName: '正义联盟',
  attackerPower: 45800,
  defenderPower: 38500,
  startTime: Date.now() - 3600000,
  endTime: Date.now() + 3600000 * 2,
  attackerScore: 1250,
  defenderScore: 1080,
  status: 'ongoing',
};
