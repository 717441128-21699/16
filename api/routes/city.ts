import { Router, Request, Response } from 'express';
import {
  getCollection,
  findById,
  insertOne,
  updateOne,
} from '../db.js';

const router = Router();

// 事件类型配置
const EVENT_TEMPLATES = [
  {
    type: 'bank_robbery',
    name: '银行劫案',
    description: '一伙武装歹徒正在抢劫银行',
    icon: '💰',
    baseReward: { exp: 500, gold: 2000, reputation: 50 },
  },
  {
    type: 'alien_invasion',
    name: '外星入侵',
    description: '不明外星生物正在攻击市民',
    icon: '👽',
    baseReward: { exp: 2000, gold: 8000, reputation: 200 },
  },
  {
    type: 'fire',
    name: '火灾',
    description: '大型仓库发生火灾，火势正在蔓延',
    icon: '🔥',
    baseReward: { exp: 800, gold: 3000, reputation: 80 },
  },
  {
    type: 'gang_war',
    name: '帮派火拼',
    description: '两大黑帮展开激烈交火',
    icon: '🔫',
    baseReward: { exp: 1000, gold: 4000, reputation: 100 },
  },
  {
    type: 'hostage',
    name: '人质事件',
    description: '恐怖分子劫持了多名人质',
    icon: '🆘',
    baseReward: { exp: 1500, gold: 6000, reputation: 150 },
  },
];

/**
 * GET /api/districts - 返回三大区域数据，每个区域含 activeEvents
 */
router.get('/districts', async (_req: Request, res: Response) => {
  try {
    const districts = await getCollection('districts');
    const events = await getCollection('events');

    // 将事件关联到区域
    const districtsWithEvents = districts.map((district: any) => ({
      ...district,
      activeEvents: events.filter(
        (e: any) => e.districtId === district.id && e.status === 'active' || e.status === 'in_progress'
      ),
    }));

    res.json(districtsWithEvents);
  } catch (err) {
    res.status(500).json({ error: '获取区域数据失败', message: (err as Error).message });
  }
});

/**
 * PUT /api/districts/:id - 更新区域数据
 */
router.put('/districts/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;

    delete updates.id;
    delete updates.activeEvents;

    const updatedDistrict = await updateOne<any>('districts', id, updates);

    if (!updatedDistrict) {
      res.status(404).json({ error: '区域不存在' });
      return;
    }

    res.json(updatedDistrict);
  } catch (err) {
    res.status(500).json({ error: '更新区域失败', message: (err as Error).message });
  }
});

/**
 * GET /api/events - 返回所有活跃事件
 */
router.get('/events', async (_req: Request, res: Response) => {
  try {
    const events = await getCollection('events');
    const activeEvents = events.filter(
      (e: any) => e.status === 'active' || e.status === 'in_progress'
    );
    res.json(activeEvents);
  } catch (err) {
    res.status(500).json({ error: '获取事件列表失败', message: (err as Error).message });
  }
});

/**
 * POST /api/events/random - 触发随机事件
 */
router.post('/events/random', async (_req: Request, res: Response) => {
  try {
    const districts = await getCollection('districts');
    if (districts.length === 0) {
      res.status(400).json({ error: '没有可用的区域' });
      return;
    }

    // 随机选择区域
    const randomDistrict = districts[Math.floor(Math.random() * districts.length)];

    // 随机选择事件类型
    const randomTemplate = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];

    // 随机严重程度 (1-5
    const severity = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5;

    // 根据严重程度计算奖励倍率
    const rewardMultiplier = 0.5 + severity * 0.3;

    const newEvent = {
      type: randomTemplate.type,
      name: randomTemplate.name,
      description: randomTemplate.description,
      severity,
      districtId: randomDistrict.id,
      reward: {
        exp: Math.floor(randomTemplate.baseReward.exp * rewardMultiplier),
        gold: Math.floor(randomTemplate.baseReward.gold * rewardMultiplier),
        reputation: Math.floor(randomTemplate.baseReward.reputation * rewardMultiplier),
      },
      participants: [],
      status: 'active' as const,
    };

    const createdEvent = await insertOne<any>('events', newEvent);
    res.status(201).json({
      ...createdEvent,
      districtName: randomDistrict.name,
    });
  } catch (err) {
    res.status(500).json({ error: '触发随机事件失败', message: (err as Error).message });
  }
});

/**
 * POST /api/events/:id/join - 英雄参与事件
 * body: { heroId }
 */
router.post('/events/:id/join', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { heroId } = req.body;

    if (!heroId) {
      res.status(400).json({ error: '缺少 heroId' });
      return;
    }

    const event = await findById<any>('events', id);
    if (!event) {
      res.status(404).json({ error: '事件不存在' });
      return;
    }

    const hero = await findById<any>('heroes', heroId);
    if (!hero) {
      res.status(404).json({ error: '英雄不存在' });
      return;
    }

    // 检查英雄是否已参与
    if (event.participants.includes(heroId)) {
      res.status(400).json({ error: '该英雄已参与此事件' });
      return;
    }

    // 添加参与者
    const updatedParticipants = [...event.participants, heroId];
    const updatedEvent = await updateOne<any>('events', id, {
      participants: updatedParticipants });

    // 如果事件状态变为进行中
    if (event.status === 'active') {
      await updateOne<any>('events', id, { status: 'in_progress' });
    }

    // 给英雄奖励（只有第一个参与者获得经验和声望奖励
    if (updatedParticipants.length === 1) {
      // 增加英雄经验和金币
      const expAmount = event.reward?.exp || 100;
      const goldAmount = event.reward?.gold || 500;
      const repAmount = event.reward?.reputation || 10;

      await updateOne<any>('heroes', heroId, {
        exp: hero.exp + expAmount,
        gold: hero.gold + goldAmount,
        reputation: hero.reputation + repAmount,
      });
    }

    res.json({
      ...updatedEvent,
      heroName: hero.name,
      message: `${hero.name} 已成功加入事件`,
    });
  } catch (err) {
    res.status(500).json({ error: '参与事件失败', message: (err as Error).message });
  }
});

/**
 * GET /api/districts/:id/history - 返回区域 7 天历史数据
 */
router.get('/districts/:id/history', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const district = await findById('districts', id);
    if (!district) {
      res.status(404).json({ error: '区域不存在' });
      return;
    }

    const historyData = await getCollection('districtHistory');
    const historyRecord = historyData[0] as any;

    if (historyRecord && historyRecord.data && historyRecord.data[id]) {
      res.json({
        districtId: id,
        history: historyRecord.data[id],
      });
      return;
    }

    // 如果没有历史数据，生成模拟数据
    const today = new Date();
    const mockHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      mockHistory.push({
        date: `${month}-${day}`,
        crimeRate: Math.round(30 + Math.random() * 40),
        satisfaction: Math.round(50 + Math.random() * 40),
      });
    }

    res.json({
      districtId: id,
      history: mockHistory,
    });
  } catch (err) {
    res.status(500).json({ error: '获取历史数据失败', message: (err as Error).message });
  }
});

export default router;
