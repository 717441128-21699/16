import { Router, Request, Response } from 'express';
import {
  getCollection,
  findById,
} from '../db.js';

const router = Router();

// GET /api/rankings/power - 战力榜前50
router.get('/power', async (_req: Request, res: Response) => {
  try {
    const heroes = await getCollection<any>('heroes');
    const rankings = heroes
      .sort((a, b) => b.combatPower - a.combatPower)
      .slice(0, 50)
      .map((hero, index) => ({
        rank: index + 1,
        heroId: hero.id,
        heroName: hero.name,
        heroTitle: hero.title,
        value: hero.combatPower,
        change: (['up', 'down', 'same'] as const)[Math.floor(Math.random() * 3)],
      }));

    res.json({ success: true, data: rankings });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取战力榜失败' });
  }
});

// GET /api/rankings/mission - 任务完成率榜
router.get('/mission', async (_req: Request, res: Response) => {
  try {
    const heroes = await getCollection<any>('heroes');
    const rankings = heroes
      .map((hero) => ({
        hero,
        missionsCompleted: Math.floor(Math.random() * 200) + 50,
        missionsTotal: Math.floor(Math.random() * 30) + 200,
      }))
      .sort((a, b) => b.missionsCompleted / b.missionsTotal - a.missionsCompleted / a.missionsTotal)
      .slice(0, 50)
      .map((item, index) => ({
        rank: index + 1,
        heroId: item.hero.id,
        heroName: item.hero.name,
        heroTitle: item.hero.title,
        value: Number(((item.missionsCompleted / item.missionsTotal) * 100).toFixed(1)),
        missionsCompleted: item.missionsCompleted,
        missionsTotal: item.missionsTotal,
        change: (['up', 'down', 'same'] as const)[Math.floor(Math.random() * 3)],
      }));

    res.json({ success: true, data: rankings });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取任务完成率榜失败' });
  }
});

// GET /api/rankings/contribution - 城市贡献度榜
router.get('/contribution', async (_req: Request, res: Response) => {
  try {
    const heroes = await getCollection<any>('heroes');
    const rankings = heroes
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 50)
      .map((hero, index) => ({
        rank: index + 1,
        heroId: hero.id,
        heroName: hero.name,
        heroTitle: hero.title,
        value: hero.reputation,
        change: (['up', 'down', 'same'] as const)[Math.floor(Math.random() * 3)],
      }));

    res.json({ success: true, data: rankings });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取城市贡献度榜失败' });
  }
});

// GET /api/heroes/:id/detail - 返回英雄详细配置
router.get('/heroes/:id/detail', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const hero = await findById<any>('heroes', id);

    if (!hero) {
      return res.status(404).json({ success: false, error: '英雄不存在' });
    }

    const guilds = await getCollection<any>('guild');
    const guild = guilds.find((g: any) =>
      (g.members || []).some((m: any) => m.heroId === id)
    );

    const detail = {
      hero,
      guildName: guild?.name,
      guildTag: guild?.name ? guild.name.substring(0, 3).toUpperCase() : undefined,
      missionsCompleted: Math.floor(Math.random() * 200) + 50,
      battlesWon: Math.floor(Math.random() * 150) + 30,
      achievements: [
        { id: 'ach-1', name: '初出茅庐', unlocked: true },
        { id: 'ach-2', name: '英勇无畏', unlocked: hero.level >= 10 },
        { id: 'ach-3', name: '传奇英雄', unlocked: hero.level >= 15 },
        { id: 'ach-4', name: '正义使者', unlocked: hero.reputation >= 5000 },
      ],
    };

    res.json({ success: true, data: detail });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取英雄详情失败' });
  }
});

export default router;
