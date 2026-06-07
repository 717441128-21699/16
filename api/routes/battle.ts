import { Router, Request, Response } from 'express';
import {
  getCollection,
  findById,
  insertOne,
  updateOne,
} from '../db.js';
import { calculateDamage } from '../utils/combat.js';
import type { BattleState, BattleLog, Enemy } from '../../src/types/index.js';

const router = Router();

// 生成敌人
function generateEnemies(severity: number): Enemy[] {
  const count = 3 + Math.floor(Math.random() * 3);
  const enemies: Enemy[] = [];
  const enemyNames = ['强盗', '匪徒', '外星人', '暴徒', '怪物', '机器人'];
  const enemyTypes = ['thug', 'alien', 'monster', 'robot'];

  for (let i = 0; i < count; i++) {
    const baseHealth = 80 + severity * 40;
    const baseDamage = 10 + severity * 8;
    enemies.push({
      id: `enemy-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: enemyNames[Math.floor(Math.random() * enemyNames.length)] + (i + 1),
      health: baseHealth + Math.floor(Math.random() * 30),
      maxHealth: baseHealth + Math.floor(Math.random() * 30),
      damage: baseDamage + Math.floor(Math.random() * 10),
      type: enemyTypes[Math.floor(Math.random() * enemyTypes.length)],
    });
  }
  return enemies;
}

// 添加战斗日志
function addLog(logs: BattleLog[], type: BattleLog['type'], message: string, value?: number): BattleLog[] {
  return [...logs, { timestamp: Date.now(), type, message, value }];
}

// POST /api/battles/start - 创建新战斗
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { heroId, eventId, teammateIds = [] } = req.body;

    if (!heroId) {
      return res.status(400).json({ success: false, error: '缺少英雄ID' });
    }

    const hero = await findById<any>('heroes', String(heroId));
    if (!hero) {
      return res.status(404).json({ success: false, error: '英雄不存在' });
    }

    let severity = 2;
    if (eventId) {
      const event = await findById<any>('events', String(eventId));
      if (event) severity = event.severity;
    }

    const teammates: any[] = [];
    for (const tid of teammateIds) {
      const t = await findById<any>('heroes', String(tid));
      if (t) teammates.push(t);
    }

    const enemies = generateEnemies(severity);

    const battle: BattleState = {
      id: '',
      heroId: String(heroId),
      teammates,
      enemies,
      logs: addLog([], 'info', `战斗开始！遭遇 ${enemies.length} 个敌人`),
      teamworkScore: 0,
      startTime: Date.now(),
      status: 'fighting',
    };

    const createdBattle = await insertOne<any>('battles', battle);
    res.json({ success: true, data: createdBattle });
  } catch (err) {
    res.status(500).json({ success: false, error: '创建战斗失败' });
  }
});

// GET /api/battles/:id - 获取战斗状态
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const battle = await findById<any>('battles', id);

    if (!battle) {
      return res.status(404).json({ success: false, error: '战斗不存在' });
    }

    res.json({ success: true, data: battle });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取战斗状态失败' });
  }
});

// POST /api/battles/:id/skill - 使用技能
router.post('/:id/skill', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { skillId, targetId } = req.body;

    const battle = await findById<any>('battles', id);
    if (!battle) {
      return res.status(404).json({ success: false, error: '战斗不存在' });
    }
    if (battle.status !== 'fighting') {
      return res.status(400).json({ success: false, error: '战斗已结束' });
    }

    const hero = await findById<any>('heroes', String(battle.heroId));
    if (!hero) {
      return res.status(404).json({ success: false, error: '英雄不存在' });
    }

    const skill = (hero.skills || []).find((s: any) => s.id === skillId);
    if (!skill) {
      return res.status(404).json({ success: false, error: '技能不存在' });
    }
    if (skill.currentCooldown > 0) {
      return res.status(400).json({ success: false, error: '技能冷却中' });
    }
    if (hero.energy < skill.energyCost) {
      return res.status(400).json({ success: false, error: '能量不足' });
    }

    let target = battle.enemies.find((e: Enemy) => e.id === targetId);
    if (!target && battle.enemies.length > 0) target = battle.enemies[0];
    if (!target) {
      return res.status(400).json({ success: false, error: '没有可用的目标' });
    }

    let logs = battle.logs;
    const isCritical = Math.random() < 0.15;
    const damage = Math.floor(skill.damage * (isCritical ? 2 : 1) * (0.9 + Math.random() * 0.2));

    const updatedEnemies = battle.enemies.map((e: Enemy) =>
      e.id === target.id ? { ...e, health: Math.max(0, e.health - damage) } : e
    );

    logs = addLog(
      logs,
      'skill',
      `${hero.name} 使用 ${skill.name} 对 ${target.name} 造成 ${damage} 点伤害${isCritical ? '（暴击！）' : ''}`,
      damage
    );

    const deadEnemy = updatedEnemies.find((e: Enemy) => e.id === target.id && e.health <= 0);
    if (deadEnemy) logs = addLog(logs, 'kill', `${target.name} 被击败！`);

    const aliveEnemies = updatedEnemies.filter((e: Enemy) => e.health > 0);

    const updatedSkills = (hero.skills || []).map((s: any) =>
      s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s
    );

    let newStatus: BattleState['status'] = battle.status;
    const newEnergy = Math.max(0, hero.energy - skill.energyCost);
    let newHealth = hero.health;

    if (aliveEnemies.length === 0) {
      newStatus = 'victory';
      logs = addLog(logs, 'info', '所有敌人已被击败！战斗胜利！');
    } else {
      let totalDamage = 0;
      for (const enemy of aliveEnemies) {
        const enemyDamage = calculateDamage(enemy, hero);
        totalDamage += enemyDamage;
        logs = addLog(logs, 'damage', `${enemy.name} 对 ${hero.name} 造成 ${enemyDamage} 点伤害`, enemyDamage);
      }
      newHealth = Math.max(0, hero.health - totalDamage);
      if (newHealth <= 0) {
        newStatus = 'defeat';
        logs = addLog(logs, 'info', '英雄被击败！战斗失败...');
      }
    }

    await updateOne<any>('heroes', String(battle.heroId), {
      health: newHealth,
      energy: newEnergy,
      skills: updatedSkills,
    });

    const updatedBattle = await updateOne<any>('battles', id, {
      enemies: aliveEnemies,
      logs,
      status: newStatus,
    });

    res.json({ success: true, data: updatedBattle });
  } catch (err) {
    res.status(500).json({ success: false, error: '使用技能失败' });
  }
});

// POST /api/battles/:id/attack - 普通攻击
router.post('/:id/attack', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { targetId } = req.body;

    const battle = await findById<any>('battles', id);
    if (!battle) {
      return res.status(404).json({ success: false, error: '战斗不存在' });
    }
    if (battle.status !== 'fighting') {
      return res.status(400).json({ success: false, error: '战斗已结束' });
    }

    const hero = await findById<any>('heroes', String(battle.heroId));
    if (!hero) {
      return res.status(404).json({ success: false, error: '英雄不存在' });
    }

    let target = battle.enemies.find((e: Enemy) => e.id === targetId);
    if (!target && battle.enemies.length > 0) target = battle.enemies[0];
    if (!target) {
      return res.status(400).json({ success: false, error: '没有可用的目标' });
    }

    let logs = battle.logs;
    const baseDamage = hero.weapon.damage + (hero.skills?.[0]?.damage || 30);
    const isCritical = Math.random() < (hero.weapon.criticalChance || 0.1);
    const damage = Math.floor(baseDamage * (isCritical ? 2 : 1) * (0.9 + Math.random() * 0.2));

    const updatedEnemies = battle.enemies.map((e: Enemy) =>
      e.id === target.id ? { ...e, health: Math.max(0, e.health - damage) } : e
    );

    logs = addLog(
      logs,
      'damage',
      `${hero.name} 对 ${target.name} 发动普通攻击，造成 ${damage} 点伤害${isCritical ? '（暴击！）' : ''}`,
      damage
    );

    const deadEnemy = updatedEnemies.find((e: Enemy) => e.id === target.id && e.health <= 0);
    if (deadEnemy) logs = addLog(logs, 'kill', `${target.name} 被击败！`);

    const aliveEnemies = updatedEnemies.filter((e: Enemy) => e.health > 0);

    let newStatus: BattleState['status'] = battle.status;
    let newHealth = hero.health;

    if (aliveEnemies.length === 0) {
      newStatus = 'victory';
      logs = addLog(logs, 'info', '所有敌人已被击败！战斗胜利！');
    } else {
      let totalDamage = 0;
      for (const enemy of aliveEnemies) {
        const enemyDamage = calculateDamage(enemy, hero);
        totalDamage += enemyDamage;
        logs = addLog(logs, 'damage', `${enemy.name} 对 ${hero.name} 造成 ${enemyDamage} 点伤害`, enemyDamage);
      }
      newHealth = Math.max(0, hero.health - totalDamage);
      if (newHealth <= 0) {
        newStatus = 'defeat';
        logs = addLog(logs, 'info', '英雄被击败！战斗失败...');
      }
    }

    await updateOne<any>('heroes', String(battle.heroId), { health: newHealth });

    const updatedBattle = await updateOne<any>('battles', id, {
      enemies: aliveEnemies,
      logs,
      status: newStatus,
    });

    res.json({ success: true, data: updatedBattle });
  } catch (err) {
    res.status(500).json({ success: false, error: '普通攻击失败' });
  }
});

// POST /api/battles/:id/tick - 推进一个游戏回合
router.post('/:id/tick', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const battle = await findById<any>('battles', id);
    if (!battle) {
      return res.status(404).json({ success: false, error: '战斗不存在' });
    }
    if (battle.status !== 'fighting') {
      return res.status(400).json({ success: false, error: '战斗已结束' });
    }

    const hero = await findById<any>('heroes', String(battle.heroId));
    if (!hero) {
      return res.status(404).json({ success: false, error: '英雄不存在' });
    }

    let logs = battle.logs;
    const updatedSkills = (hero.skills || []).map((s: any) => ({
      ...s,
      currentCooldown: Math.max(0, s.currentCooldown - 1),
    }));

    const newEnergy = Math.min(hero.maxEnergy, hero.energy + 5);
    let totalDamage = 0;

    for (const enemy of battle.enemies) {
      if (enemy.health > 0) {
        const enemyDamage = calculateDamage(enemy, hero);
        totalDamage += enemyDamage;
        logs = addLog(logs, 'damage', `${enemy.name} 对 ${hero.name} 造成 ${enemyDamage} 点伤害`, enemyDamage);
      }
    }

    const newHealth = Math.max(0, hero.health - totalDamage);
    let newStatus: BattleState['status'] = battle.status;

    if (newHealth <= 0) {
      newStatus = 'defeat';
      logs = addLog(logs, 'info', '英雄被击败！战斗失败...');
    } else {
      logs = addLog(logs, 'info', `回合推进：能量恢复至 ${newEnergy}，技能冷却已刷新`);
    }

    await updateOne<any>('heroes', String(battle.heroId), {
      health: newHealth,
      energy: newEnergy,
      skills: updatedSkills,
    });

    const updatedBattle = await updateOne<any>('battles', id, { logs, status: newStatus });

    res.json({ success: true, data: updatedBattle });
  } catch (err) {
    res.status(500).json({ success: false, error: '推进回合失败' });
  }
});

// POST /api/battles/:id/end - 结算战斗
router.post('/:id/end', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { result } = req.body;

    const battle = await findById<any>('battles', id);
    if (!battle) {
      return res.status(404).json({ success: false, error: '战斗不存在' });
    }

    const hero = await findById<any>('heroes', String(battle.heroId));
    if (!hero) {
      return res.status(404).json({ success: false, error: '英雄不存在' });
    }

    let logs = battle.logs;
    const rewards = { exp: 0, gold: 0, reputation: 0, drops: [] as string[] };

    if (result === 'victory') {
      const contributionFactor = 1 + (battle.teammates?.length || 0) * 0.2;
      rewards.exp = Math.floor(300 * contributionFactor);
      rewards.gold = Math.floor(1500 * contributionFactor);
      rewards.reputation = Math.floor(30 * contributionFactor);

      if (Math.random() < 0.2) {
        const dropItems = ['强化战衣碎片', '能量核心', '稀有金属', '技能书残页'];
        const drop = dropItems[Math.floor(Math.random() * dropItems.length)];
        rewards.drops.push(drop);
        logs = addLog(logs, 'info', `获得战利品：${drop}`);
      }

      let newExp = hero.exp + rewards.exp;
      let newLevel = hero.level;
      let expNeeded = hero.level * 1000;

      while (newExp >= expNeeded) {
        newExp -= expNeeded;
        newLevel++;
        expNeeded = newLevel * 1000;
      }

      await updateOne<any>('heroes', String(battle.heroId), {
        exp: newExp,
        gold: hero.gold + rewards.gold,
        reputation: hero.reputation + rewards.reputation,
        level: newLevel,
        maxHealth: hero.maxHealth + (newLevel - hero.level) * 50,
        maxEnergy: hero.maxEnergy + (newLevel - hero.level) * 5,
      });

      logs = addLog(logs, 'info', `战斗胜利！获得 ${rewards.exp} 经验，${rewards.gold} 金币，${rewards.reputation} 声望`);
      if (newLevel > hero.level) logs = addLog(logs, 'info', `恭喜升级！当前等级：${newLevel}`);
    } else {
      logs = addLog(logs, 'info', '战斗失败，未获得奖励');
    }

    const updatedBattle = await updateOne<any>('battles', id, {
      status: result === 'victory' ? 'victory' : 'defeat',
      logs,
    });

    res.json({ success: true, data: { battle: updatedBattle, rewards } });
  } catch (err) {
    res.status(500).json({ success: false, error: '结算战斗失败' });
  }
});

export default router;
