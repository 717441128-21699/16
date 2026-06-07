import { Router, Request, Response } from 'express';
import {
  getCollection,
  findById,
  insertOne,
  updateOne,
} from '../db.js';

const router = Router();

// GET /api/guilds - 返回所有公会列表
router.get('/', async (_req: Request, res: Response) => {
  try {
    const guilds = await getCollection<any>('guild');
    res.json({ success: true, data: guilds });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取公会列表失败' });
  }
});

// GET /api/guilds/:id - 返回公会详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const guild = await findById<any>('guild', id);

    if (!guild) {
      return res.status(404).json({ success: false, error: '公会不存在' });
    }

    res.json({ success: true, data: guild });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取公会详情失败' });
  }
});

// POST /api/guilds - 创建公会
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, presidentId, presidentName } = req.body;

    if (!name || !presidentId || !presidentName) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const president = await findById<any>('heroes', String(presidentId));
    if (!president) {
      return res.status(404).json({ success: false, error: '会长不存在' });
    }

    const guildBuildings = await getCollection<any>('guildBuildings');

    const guild = {
      name,
      level: 1,
      presidentId,
      vicePresidentIds: [] as string[],
      members: [
        {
          heroId: presidentId,
          heroName: presidentName,
          role: 'president' as const,
          joinDate: Date.now(),
          contribution: 0,
        },
      ],
      buildings: guildBuildings.slice(0, 1).map((b: any) => ({
        id: b.id,
        name: b.name,
        level: 1,
        maxLevel: b.maxLevel || 10,
        effect: b.effect,
        bonus: { stat: 'exp', value: 5 },
        upgradeCost: b.upgradeCost || 50000,
      })),
      controlledDistricts: [] as string[],
      totalPower: president.combatPower || 0,
    };

    const createdGuild = await insertOne<any>('guild', guild);
    res.json({ success: true, data: createdGuild });
  } catch (err) {
    res.status(500).json({ success: false, error: '创建公会失败' });
  }
});

// POST /api/guilds/:id/members/:heroId/promote - 晋升成员
router.post('/:id/members/:heroId/promote', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const heroId = String(req.params.heroId);
    const { role } = req.body;

    if (!role || !['president', 'vice', 'officer', 'member'].includes(role)) {
      return res.status(400).json({ success: false, error: '无效的角色' });
    }

    const guild = await findById<any>('guild', id);
    if (!guild) {
      return res.status(404).json({ success: false, error: '公会不存在' });
    }

    const memberIndex = (guild.members || []).findIndex((m: any) => m.heroId === heroId);
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, error: '成员不存在' });
    }

    const updatedMembers = [...(guild.members || [])];
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      role,
    };

    let vicePresidentIds = guild.vicePresidentIds || [];
    if (role === 'vice') {
      if (!vicePresidentIds.includes(heroId)) {
        vicePresidentIds = [...vicePresidentIds, heroId];
      }
    } else {
      vicePresidentIds = vicePresidentIds.filter((vid: string) => vid !== heroId);
    }

    let presidentId = guild.presidentId;
    if (role === 'president') {
      presidentId = heroId;
      const oldPresidentIndex = updatedMembers.findIndex(
        (m: any) => m.heroId === guild.presidentId && m.heroId !== heroId
      );
      if (oldPresidentIndex !== -1) {
        updatedMembers[oldPresidentIndex] = {
          ...updatedMembers[oldPresidentIndex],
          role: 'vice',
        };
        if (!vicePresidentIds.includes(guild.presidentId)) {
          vicePresidentIds = [...vicePresidentIds, guild.presidentId];
        }
      }
    }

    const updatedGuild = await updateOne<any>('guild', id, {
      members: updatedMembers,
      presidentId,
      vicePresidentIds,
    });

    res.json({ success: true, data: updatedGuild });
  } catch (err) {
    res.status(500).json({ success: false, error: '晋升成员失败' });
  }
});

// POST /api/guilds/:id/buildings/:buildingId/upgrade - 升级建筑
router.post('/:id/buildings/:buildingId/upgrade', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const buildingId = String(req.params.buildingId);

    const guild = await findById<any>('guild', id);
    if (!guild) {
      return res.status(404).json({ success: false, error: '公会不存在' });
    }

    const buildingIndex = (guild.buildings || []).findIndex((b: any) => b.id === buildingId);
    if (buildingIndex === -1) {
      return res.status(404).json({ success: false, error: '建筑不存在' });
    }

    const building = guild.buildings[buildingIndex];
    if (building.level >= (building.maxLevel || 10)) {
      return res.status(400).json({ success: false, error: '建筑已达最高等级' });
    }

    const president = await findById<any>('heroes', String(guild.presidentId));
    if (!president) {
      return res.status(404).json({ success: false, error: '会长不存在' });
    }

    const upgradeCost = building.upgradeCost || 50000;
    if (president.gold < upgradeCost) {
      return res.status(400).json({ success: false, error: '金币不足' });
    }

    await updateOne<any>('heroes', String(guild.presidentId), { gold: president.gold - upgradeCost });

    const newBuildings = [...(guild.buildings || [])];
    newBuildings[buildingIndex] = {
      ...building,
      level: building.level + 1,
      bonus: {
        ...building.bonus,
        value: (building.bonus?.value || 0) + 5,
      },
      upgradeCost: Math.floor(upgradeCost * 1.5),
    };

    const updatedGuild = await updateOne<any>('guild', id, { buildings: newBuildings });
    res.json({ success: true, data: updatedGuild });
  } catch (err) {
    res.status(500).json({ success: false, error: '升级建筑失败' });
  }
});

// GET /api/guilds/buildings/list - 公会建筑配置
router.get('/buildings/list', async (_req: Request, res: Response) => {
  try {
    const buildings = await getCollection<any>('guildBuildings');
    res.json({ success: true, data: buildings });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取建筑配置失败' });
  }
});

// ===== 街区争夺战 =====

// GET /api/wars/list - 街区争夺战列表
router.get('/wars/list', async (_req: Request, res: Response) => {
  try {
    const wars = await getCollection<any>('wars');
    res.json({ success: true, data: wars });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取争夺战列表失败' });
  }
});

// POST /api/wars - 宣战
router.post('/wars', async (req: Request, res: Response) => {
  try {
    const { attackerGuildId, defenderGuildId, districtId } = req.body;

    if (!attackerGuildId || !defenderGuildId || !districtId) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const attackerGuild = await findById<any>('guild', String(attackerGuildId));
    if (!attackerGuild) {
      return res.status(404).json({ success: false, error: '进攻方公会不存在' });
    }

    const defenderGuild = await findById<any>('guild', String(defenderGuildId));
    if (!defenderGuild) {
      return res.status(404).json({ success: false, error: '防守方公会不存在' });
    }

    const war = {
      districtId,
      attackerGuildId,
      defenderGuildId,
      attackerPower: attackerGuild.totalPower || 0,
      defenderPower: defenderGuild.totalPower || 0,
      attackerControl: 0,
      defenderControl: 100,
      participants: [] as any[],
      status: 'preparing' as const,
    };

    const createdWar = await insertOne<any>('wars', war);
    res.json({ success: true, data: createdWar });
  } catch (err) {
    res.status(500).json({ success: false, error: '宣战失败' });
  }
});

// GET /api/wars/:id - 争夺战详情
router.get('/wars/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const war = await findById<any>('wars', id);

    if (!war) {
      return res.status(404).json({ success: false, error: '争夺战不存在' });
    }

    res.json({ success: true, data: war });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取争夺战详情失败' });
  }
});

// POST /api/wars/:id/tick - 实时攻防 tick
router.post('/wars/:id/tick', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const war = await findById<any>('wars', id);

    if (!war) {
      return res.status(404).json({ success: false, error: '争夺战不存在' });
    }
    if (war.status === 'ended') {
      return res.status(400).json({ success: false, error: '争夺战已结束' });
    }

    const totalPower = (war.attackerPower || 0) + (war.defenderPower || 0);
    const attackerRatio = totalPower > 0 ? war.attackerPower / totalPower : 0.5;
    const defenderRatio = totalPower > 0 ? war.defenderPower / totalPower : 0.5;

    const controlChange = Math.floor(Math.random() * 10) + 5;

    let newAttackerControl = war.attackerControl || 0;
    let newDefenderControl = war.defenderControl || 0;

    if (attackerRatio > defenderRatio) {
      const change = Math.floor(controlChange * attackerRatio);
      newAttackerControl = Math.min(100, newAttackerControl + change);
      newDefenderControl = Math.max(0, newDefenderControl - change);
    } else {
      const change = Math.floor(controlChange * defenderRatio);
      newDefenderControl = Math.min(100, newDefenderControl + change);
      newAttackerControl = Math.max(0, newAttackerControl - change);
    }

    let newStatus = war.status;
    let winner: string | undefined;

    if (newAttackerControl >= 100) {
      newStatus = 'ended';
      winner = war.attackerGuildId;
    } else if (newDefenderControl >= 100) {
      newStatus = 'ended';
      winner = war.defenderGuildId;
    } else if (war.status === 'preparing') {
      newStatus = 'fighting';
    }

    const updatedWar = await updateOne<any>('wars', id, {
      attackerControl: newAttackerControl,
      defenderControl: newDefenderControl,
      status: newStatus,
      winner,
    });

    if (newStatus === 'ended' && winner) {
      const winnerGuild = await findById<any>('guild', String(winner));
      const loserId = winner === war.attackerGuildId ? war.defenderGuildId : war.attackerGuildId;
      const loserGuild = await findById<any>('guild', String(loserId));

      if (winnerGuild && !(winnerGuild.controlledDistricts || []).includes(war.districtId)) {
        await updateOne<any>('guild', String(winner), {
          controlledDistricts: [...(winnerGuild.controlledDistricts || []), war.districtId],
        });
      }

      if (loserGuild) {
        await updateOne<any>('guild', String(loserId), {
          controlledDistricts: (loserGuild.controlledDistricts || []).filter(
            (d: string) => d !== war.districtId
          ),
        });
      }
    }

    res.json({ success: true, data: updatedWar });
  } catch (err) {
    res.status(500).json({ success: false, error: '推进战斗失败' });
  }
});

// POST /api/wars/:id/end - 结束战斗
router.post('/wars/:id/end', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const war = await findById<any>('wars', id);

    if (!war) {
      return res.status(404).json({ success: false, error: '争夺战不存在' });
    }
    if (war.status === 'ended') {
      return res.status(400).json({ success: false, error: '争夺战已结束' });
    }

    let winner: string;
    if ((war.attackerControl || 0) > (war.defenderControl || 0)) {
      winner = war.attackerGuildId;
    } else {
      winner = war.defenderGuildId;
    }

    const updatedWar = await updateOne<any>('wars', id, {
      status: 'ended',
      winner,
    });

    const winnerGuild = await findById<any>('guild', String(winner));
    const loserId = winner === war.attackerGuildId ? war.defenderGuildId : war.attackerGuildId;
    const loserGuild = await findById<any>('guild', String(loserId));

    if (winnerGuild && !(winnerGuild.controlledDistricts || []).includes(war.districtId)) {
      await updateOne<any>('guild', String(winner), {
        controlledDistricts: [...(winnerGuild.controlledDistricts || []), war.districtId],
      });
    }

    if (loserGuild) {
      await updateOne<any>('guild', String(loserId), {
        controlledDistricts: (loserGuild.controlledDistricts || []).filter(
          (d: string) => d !== war.districtId
        ),
      });
    }

    res.json({ success: true, data: updatedWar });
  } catch (err) {
    res.status(500).json({ success: false, error: '结束战斗失败' });
  }
});

export default router;
