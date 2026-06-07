import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateCombatPower, calculateCooldownEfficiency } from './utils/combat.js';

// 获取当前模块目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 数据文件存储目录
const DATA_DIR = path.join(__dirname, 'data');

// 定义所有集合名称及其对应的文件名
export const COLLECTIONS = {
  heroes: 'heroes.json',
  powers: 'powers.json',
  suits: 'suits.json',
  weapons: 'weapons.json',
  city: 'city.json',
  districts: 'districts.json',
  events: 'events.json',
  districtHistory: 'districtHistory.json',
  market: 'market.json',
  priceHistory: 'priceHistory.json',
  guild: 'guild.json',
  guildBuildings: 'guildBuildings.json',
  wars: 'wars.json',
  rankings: 'rankings.json',
  battles: 'battles.json',
  transactions: 'transactions.json',
} as const;

export type CollectionName = keyof typeof COLLECTIONS;

// 确保数据目录存在
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 获取集合文件的完整路径
function getCollectionPath(collectionName: CollectionName): string {
  const fileName = COLLECTIONS[collectionName];
  return path.join(DATA_DIR, fileName);
}

// 深度克隆数据，避免引用问题
function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * 获取指定集合的所有数据
 * @param collectionName 集合名称
 * @returns 数据数组
 */
export async function getCollection<T = any>(collectionName: CollectionName): Promise<T[]> {
  await ensureDataDir();
  const filePath = getCollectionPath(collectionName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return deepClone(Array.isArray(data) ? data : []);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * 保存数据到指定集合
 * @param collectionName 集合名称
 * @param data 要保存的数据数组
 */
export async function saveCollection<T = any>(
  collectionName: CollectionName,
  data: T[]
): Promise<void> {
  await ensureDataDir();
  const filePath = getCollectionPath(collectionName);
  const jsonData = JSON.stringify(deepClone(data), null, 2);
  await fs.writeFile(filePath, jsonData, 'utf-8');
}

/**
 * 根据 ID 查找单个条目
 * @param collectionName 集合名称
 * @param id 条目的 ID
 * @returns 找到的条目或 null
 */
export async function findById<T = any>(
  collectionName: CollectionName,
  id: string
): Promise<T | null> {
  const collection = await getCollection<T>(collectionName);
  const item = collection.find((item: any) => item.id === id);
  return item ? deepClone(item) : null;
}

/**
 * 向集合中插入一个新条目
 * @param collectionName 集合名称
 * @param item 要插入的条目（如果没有 id 会自动生成）
 * @returns 插入后的条目（含 id）
 */
export async function insertOne<T extends { id?: string } = any>(
  collectionName: CollectionName,
  item: T
): Promise<T> {
  const collection = await getCollection<T>(collectionName);
  const newItem = deepClone(item) as T & { id: string };

  if (!newItem.id) {
    newItem.id = `${collectionName}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  collection.push(newItem);
  await saveCollection(collectionName, collection);
  return deepClone(newItem);
}

/**
 * 更新集合中指定 ID 的条目
 * @param collectionName 集合名称
 * @param id 条目的 ID
 * @param updates 要更新的字段
 * @returns 更新后的条目或 null（如果未找到）
 */
export async function updateOne<T extends { id: string } = any>(
  collectionName: CollectionName,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const collection = await getCollection<T>(collectionName);
  const index = collection.findIndex((item: any) => item.id === id);

  if (index === -1) {
    return null;
  }

  collection[index] = { ...deepClone(collection[index]), ...deepClone(updates), id };
  await saveCollection(collectionName, collection);
  return deepClone(collection[index]);
}

/**
 * 删除集合中指定 ID 的条目
 * @param collectionName 集合名称
 * @param id 条目的 ID
 * @returns 是否成功删除
 */
export async function deleteOne(
  collectionName: CollectionName,
  id: string
): Promise<boolean> {
  const collection = await getCollection(collectionName);
  const index = collection.findIndex((item: any) => item.id === id);

  if (index === -1) {
    return false;
  }

  collection.splice(index, 1);
  await saveCollection(collectionName, collection);
  return true;
}

// ============ 初始化数据库 ============

/**
 * 从前端数据文件初始化数据库
 * 仅在首次启动（JSON 文件不存在）时执行
 */
export async function initDb(): Promise<void> {
  await ensureDataDir();

  // 检查是否已初始化
  const heroesPath = getCollectionPath('heroes');
  try {
    await fs.access(heroesPath);
    console.log('[DB] 数据库已存在，跳过初始化');
    return;
  } catch {
    console.log('[DB] 首次启动，正在初始化数据库...');
  }

  // 导入前端数据
  const heroesModule = await import('../src/data/heroes.js');
  const cityModule = await import('../src/data/city.js');
  const marketModule = await import('../src/data/market.js');
  const guildModule = await import('../src/data/guild.js');
  const rankingsModule = await import('../src/data/rankings.js');

  // 初始化英雄相关数据
  const superPowers = heroesModule.superPowers || [];
  const suits = heroesModule.suits || [];
  const weapons = heroesModule.weapons || [];

  // 将 sampleHeroes 转换为完整格式（包含关联数据）
  const sampleHeroes = heroesModule.sampleHeroes || [];
  const fullHeroes = sampleHeroes.map((h: any) => {
    const heroPowers = (h.powers || []).map((pid: string) =>
      superPowers.find((p: any) => p.id === pid)
    ).filter(Boolean);
    const heroSuit = suits.find((s: any) => s.id === h.suitId) || suits[0];
    const heroWeapon = weapons.find((w: any) => w.id === h.weaponId) || weapons[0];

    // 标准化属性名
    return {
      id: h.id,
      name: h.name,
      title: h.alias || h.title || '',
      faction: 'justice' as const,
      level: h.level || 1,
      exp: h.exp || 0,
      powers: heroPowers.map((p: any) => ({
        id: p.id,
        name: p.name,
        icon: p.icon || '⚡',
        description: p.description,
        attack: p.attack || p.damage || 10,
        defense: p.defense || 5,
        speed: p.speed || 5,
        cooldownModifier: p.cooldown ? 1 / (p.cooldown + 1) : 0.1,
      })),
      suit: {
        id: heroSuit.id,
        name: heroSuit.name,
        rarity: heroSuit.rarity,
        defense: heroSuit.defense,
        energyBonus: heroSuit.energyBonus || 0,
        healthBonus: heroSuit.speedBonus || 0,
        color: heroSuit.rarity === 'legendary' ? '#FFC93C' :
               heroSuit.rarity === 'epic' ? '#A855F7' :
               heroSuit.rarity === 'rare' ? '#00D4FF' : '#9CA3AF',
      },
      weapon: {
        id: heroWeapon.id,
        name: heroWeapon.name,
        type: heroWeapon.type,
        rarity: heroWeapon.rarity,
        damage: (heroWeapon as any).attack || (heroWeapon as any).damage || 10,
        attackSpeed: heroWeapon.attackSpeed,
        criticalChance: 0.1,
      },
      health: h.hp || 1000,
      maxHealth: h.maxHp || 1000,
      energy: h.energy || 100,
      maxEnergy: h.maxEnergy || 100,
      combatPower: 0,
      cooldownEfficiency: 1,
      reputation: 0,
      gold: 1000,
      skills: [],
    };
  });

  // 计算每个英雄的战斗力和冷却效率
  fullHeroes.forEach((hero: any) => {
    hero.combatPower = calculateCombatPower(hero);
    hero.cooldownEfficiency = calculateCooldownEfficiency(hero);
  });

  // 初始化城市数据
  const districts = (cityModule.districts || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    crimeRate: d.crimeRate,
    citizenSatisfaction: d.satisfaction,
    resourceOutput: d.activity || 50,
    activeEvents: [],
    controllingGuild: d.controlledBy,
  }));

  const events = (cityModule.cityEvents || []).map((e: any, idx: number) => {
    const districtIds = districts.map((d: any) => d.id);
    return {
      id: e.id || `event-${Date.now()}-${idx}`,
      type: e.type,
      name: e.name,
      description: e.description,
      severity: e.severity === 'critical' ? 5 :
                e.severity === 'high' ? 4 :
                e.severity === 'medium' ? 3 : 1,
      districtId: districtIds[idx % districtIds.length],
      reward: e.reward || { exp: 100, gold: 500, reputation: 10 },
      participants: [],
      status: 'active' as const,
    };
  });

  // 将事件分配到区域
  districts.forEach((d: any) => {
    d.activeEvents = events.filter((e: any) => e.districtId === d.id);
  });

  // 生成区域历史数据
  const districtHistory: Record<string, any[]> = {};
  const historicalStats = cityModule.historicalStats || [];
  districts.forEach((d: any) => {
    districtHistory[d.id] = historicalStats.map((stat: any, idx: number) => ({
      date: stat.date || `06-0${idx + 1}`,
      crimeRate: stat.crimeRate || d.crimeRate + (Math.random() - 0.5) * 10,
      satisfaction: stat.satisfaction || d.citizenSatisfaction + (Math.random() - 0.5) * 10,
    }));
  });

  // 初始化市场数据
  const marketItems = (marketModule.marketItems || []).map((item: any) => ({
    id: item.id,
    sellerId: item.sellerId || 'system',
    sellerName: item.sellerName || '系统商店',
    itemType: item.category,
    itemName: item.name,
    itemRarity: item.rarity,
    price: item.currentPrice,
    suggestedPriceMin: Math.floor(item.basePrice * 0.9),
    suggestedPriceMax: Math.floor(item.basePrice * 1.2),
    listedAt: Date.now(),
    status: 'listed' as const,
    stock: item.stock || 1,
    icon: item.icon,
    description: item.description,
  }));

  const priceHistory = marketModule.priceHistory || [];

  // 初始化公会数据
  const guildBuildings = guildModule.guildBuildings || [];
  const guilds = (guildModule.sampleGuilds || []).map((g: any) => ({
    id: g.id,
    name: g.name,
    level: g.level,
    presidentId: g.members?.find((m: any) => m.rank === 'leader')?.id || '',
    vicePresidentIds: g.members?.filter((m: any) => m.rank === 'officer').map((m: any) => m.id) || [],
    members: (g.members || []).map((m: any) => ({
      heroId: m.id,
      heroName: m.name,
      role: m.rank === 'leader' ? 'president' :
            m.rank === 'officer' ? 'vice' :
            m.rank === 'member' ? 'member' : 'member',
      joinDate: m.joinedAt || Date.now(),
      contribution: m.contribution || 0,
    })),
    buildings: g.buildings || guildBuildings,
    controlledDistricts: g.controlledDistricts || [],
    totalPower: (g.members || []).reduce((sum: number, m: any) => sum + (m.power || 0), 0),
  }));

  const wars = guildModule.sampleWar ? [guildModule.sampleWar] : [];

  // 初始化排行榜数据
  const rankings = {
    power: rankingsModule.powerRankings || [],
    task: rankingsModule.taskRankings || [],
    contribution: rankingsModule.contributionRankings || [],
  };

  // 保存所有数据到 JSON 文件
  await saveCollection('powers', superPowers);
  await saveCollection('suits', suits);
  await saveCollection('weapons', weapons);
  await saveCollection('heroes', fullHeroes);
  await saveCollection('districts', districts);
  await saveCollection('events', events);
  await saveCollection('districtHistory', [{ id: 'history', data: districtHistory }]);
  await saveCollection('market', marketItems);
  await saveCollection('priceHistory', priceHistory);
  await saveCollection('guildBuildings', guildBuildings);
  await saveCollection('guild', guilds);
  await saveCollection('wars', wars);
  await saveCollection('rankings', [rankings]);
  await saveCollection('battles', []);
  await saveCollection('transactions', []);

  console.log('[DB] 数据库初始化完成');
}
