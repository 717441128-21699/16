import { Router, Request, Response } from 'express';
import {
  getCollection,
  findById,
  insertOne,
  updateOne,
} from '../db.js';
import { calculateCombatPower, calculateCooldownEfficiency } from '../utils/combat.js';

const router = Router();

// 计算升级所需经验
function getExpForLevel(level: number): number {
  return level * 1000;
}

// 计算英雄最大生命值
function getMaxHealth(level: number): number {
  return 500 + level * 100;
}

// 计算英雄最大能量
function getMaxEnergy(level: number): number {
  return 80 + level * 5;
}

/**
 * GET /api/heroes - 返回所有英雄列表
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const heroes = await getCollection('heroes');
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: '获取英雄列表失败', message: (err as Error).message });
  }
});

/**
 * GET /api/heroes/:id - 返回单个英雄详情（含完整关联数据）
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const hero = await findById('heroes', id);

    if (!hero) {
      res.status(404).json({ error: '英雄不存在' });
      return;
    }

    res.json(hero);
  } catch (err) {
    res.status(500).json({ error: '获取英雄详情失败', message: (err as Error).message });
  }
});

/**
 * POST /api/heroes - 创建新英雄
 * body: { name, title, faction, powerIds[], suitId, weaponId }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, title, faction, powerIds, suitId, weaponId } = req.body;

    if (!name || !title || !faction || !powerIds || !suitId || !weaponId) {
      res.status(400).json({ error: '缺少必填字段：name, title, faction, powerIds, suitId, weaponId' });
      return;
    }

    // 获取关联数据
    const allPowers = await getCollection('powers');
    const allSuits = await getCollection('suits');
    const allWeapons = await getCollection('weapons');

    const heroPowers = allPowers.filter((p: any) => powerIds.includes(p.id));
    const heroSuit = allSuits.find((s: any) => s.id === suitId);
    const heroWeapon = allWeapons.find((w: any) => w.id === weaponId);

    if (heroPowers.length === 0) {
      res.status(400).json({ error: '未找到有效的超能力' });
      return;
    }
    if (!heroSuit) {
      res.status(400).json({ error: '未找到指定的战衣' });
      return;
    }
    if (!heroWeapon) {
      res.status(400).json({ error: '未找到指定的武器' });
      return;
    }

    // 标准化超能力数据
    const normalizedPowers = heroPowers.map((p: any) => ({
      id: p.id,
      name: p.name,
      icon: p.icon || '⚡',
      description: p.description,
      attack: p.attack || p.damage || 10,
      defense: p.defense || 5,
      speed: p.speed || 5,
      cooldownModifier: p.cooldown ? 1 / (p.cooldown + 1) : 0.1,
    }));

    // 标准化战衣数据
    const normalizedSuit = {
      id: heroSuit.id,
      name: heroSuit.name,
      rarity: heroSuit.rarity,
      defense: heroSuit.defense,
      energyBonus: heroSuit.energyBonus || 0,
      healthBonus: heroSuit.speedBonus || 0,
      color: heroSuit.rarity === 'legendary' ? '#FFC93C' :
             heroSuit.rarity === 'epic' ? '#A855F7' :
             heroSuit.rarity === 'rare' ? '#00D4FF' : '#9CA3AF',
    };

    // 标准化武器数据
    const normalizedWeapon = {
      id: heroWeapon.id,
      name: heroWeapon.name,
      type: heroWeapon.type,
      rarity: heroWeapon.rarity,
      damage: (heroWeapon as any).attack || (heroWeapon as any).damage || 10,
      attackSpeed: heroWeapon.attackSpeed,
      criticalChance: 0.1,
    };

    const level = 1;
    const maxHealth = getMaxHealth(level);
    const maxEnergy = getMaxEnergy(level);

    // 创建初始英雄
    const newHero: any = {
      name,
      title,
      faction,
      level,
      exp: 0,
      powers: normalizedPowers,
      suit: normalizedSuit,
      weapon: normalizedWeapon,
      health: maxHealth,
      maxHealth,
      energy: maxEnergy,
      maxEnergy,
      combatPower: 0,
      cooldownEfficiency: 1,
      reputation: 0,
      gold: 1000,
      skills: [],
    };

    // 计算战斗力和冷却效率
    newHero.combatPower = calculateCombatPower(newHero);
    newHero.cooldownEfficiency = calculateCooldownEfficiency(newHero);

    const createdHero = await insertOne('heroes', newHero);
    res.status(201).json(createdHero);
  } catch (err) {
    res.status(500).json({ error: '创建英雄失败', message: (err as Error).message });
  }
});

/**
 * PUT /api/heroes/:id - 更新英雄信息
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    // 不允许直接修改 id
    delete updates.id;

    const updatedHero = await updateOne<any>('heroes', id, updates);

    if (!updatedHero) {
      res.status(404).json({ error: '英雄不存在' });
      return;
    }

    // 如果更新了影响战斗力的属性，重新计算
    if (updates.powers || updates.suit || updates.weapon || updates.level || updates.skills) {
      updatedHero.combatPower = calculateCombatPower(updatedHero);
      updatedHero.cooldownEfficiency = calculateCooldownEfficiency(updatedHero);
      await updateOne<any>('heroes', id, {
        combatPower: updatedHero.combatPower,
        cooldownEfficiency: updatedHero.cooldownEfficiency,
      });
    }

    res.json(updatedHero);
  } catch (err) {
    res.status(500).json({ error: '更新英雄失败', message: (err as Error).message });
  }
});

/**
 * POST /api/heroes/:id/exp - 添加经验值（含自动升级）
 * body: { amount }
 */
router.post('/:id/exp', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: '经验值必须是正数' });
      return;
    }

    const hero = await findById<any>('heroes', id);
    if (!hero) {
      res.status(404).json({ error: '英雄不存在' });
      return;
    }

    let newExp = hero.exp + amount;
    let newLevel = hero.level;
    let leveledUp = false;

    // 自动升级逻辑
    while (newExp >= getExpForLevel(newLevel)) {
      newExp -= getExpForLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    const updates: any = {
      exp: newExp,
      level: newLevel,
    };

    // 如果升级了，更新最大生命和能量，恢复满值
    if (leveledUp) {
      updates.maxHealth = getMaxHealth(newLevel);
      updates.maxEnergy = getMaxEnergy(newLevel);
      updates.health = updates.maxHealth;
      updates.energy = updates.maxEnergy;
    }

    const updatedHero = await updateOne<any>('heroes', id, updates);

    if (updatedHero) {
      updatedHero.combatPower = calculateCombatPower(updatedHero);
      updatedHero.cooldownEfficiency = calculateCooldownEfficiency(updatedHero);
      await updateOne<any>('heroes', id, {
        combatPower: updatedHero.combatPower,
        cooldownEfficiency: updatedHero.cooldownEfficiency,
      });
    }

    res.json({
      ...updatedHero,
      leveledUp,
      expGained: amount,
    });
  } catch (err) {
    res.status(500).json({ error: '添加经验失败', message: (err as Error).message });
  }
});

/**
 * POST /api/heroes/:id/damage - 扣除生命值
 * body: { damage }
 */
router.post('/:id/damage', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { damage } = req.body;

    if (typeof damage !== 'number' || damage < 0) {
      res.status(400).json({ error: '伤害值必须是非负数' });
      return;
    }

    const hero = await findById<any>('heroes', id);
    if (!hero) {
      res.status(404).json({ error: '英雄不存在' });
      return;
    }

    const newHealth = Math.max(0, hero.health - damage);
    const updatedHero = await updateOne<any>('heroes', id, { health: newHealth });

    res.json({
      ...updatedHero,
      damageTaken: damage,
      isDead: newHealth <= 0,
    });
  } catch (err) {
    res.status(500).json({ error: '扣血失败', message: (err as Error).message });
  }
});

/**
 * POST /api/heroes/:id/energy - 恢复能量
 * body: { amount }
 */
router.post('/:id/energy', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      res.status(400).json({ error: '恢复量必须是非负数' });
      return;
    }

    const hero = await findById<any>('heroes', id);
    if (!hero) {
      res.status(404).json({ error: '英雄不存在' });
      return;
    }

    const newEnergy = Math.min(hero.maxEnergy, hero.energy + amount);
    const updatedHero = await updateOne<any>('heroes', id, { energy: newEnergy });

    res.json({
      ...updatedHero,
      energyRestored: newEnergy - hero.energy,
    });
  } catch (err) {
    res.status(500).json({ error: '恢复能量失败', message: (err as Error).message });
  }
});

export default router;
