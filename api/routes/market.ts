import { Router, Request, Response } from 'express';
import {
  getCollection,
  findById,
  insertOne,
  updateOne,
  deleteOne,
} from '../db.js';

const router = Router();

// GET /api/market/items - 返回所有 listed 状态商品
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const allItems = await getCollection<any>('market');
    const listedItems = allItems.filter((item) => item.status === 'listed');
    res.json({ success: true, data: listedItems });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取商品列表失败' });
  }
});

// GET /api/market/items/my/:itemType - 按类型筛选我的上架商品
router.get('/items/my/:itemType', async (req: Request, res: Response) => {
  try {
    const { itemType } = req.params;
    const { heroId } = req.query;

    if (!heroId) {
      return res.status(400).json({ success: false, error: '缺少英雄ID' });
    }

    const allItems = await getCollection<any>('market');
    const myItems = allItems.filter(
      (item) => item.sellerId === heroId && item.itemType === itemType
    );

    res.json({ success: true, data: myItems });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取我的商品失败' });
  }
});

// POST /api/market/items - 上架商品
router.post('/items', async (req: Request, res: Response) => {
  try {
    const { sellerId, sellerName, itemType, itemName, itemRarity, price } = req.body;

    if (!sellerId || !sellerName || !itemType || !itemName || !itemRarity || !price) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const priceHistoryList = await getCollection<any>('priceHistory');
    const typeHistory = priceHistoryList.find((p: any) => {
      const category = p.itemId?.includes('bp') ? 'suit-blueprint' :
                        p.itemId?.includes('sb') ? 'skill-book' : 'rare-material';
      return category === itemType || p.itemId === itemType;
    });

    const history = typeHistory?.history || [];
    const average = history.length > 0
      ? Math.floor(history.reduce((sum: number, h: any) => sum + h.price, 0) / history.length)
      : 0;

    const suggestedPriceMin = average > 0 ? Math.floor(average * 0.85) : Math.floor(price * 0.8);
    const suggestedPriceMax = average > 0 ? Math.floor(average * 1.2) : Math.floor(price * 1.2);

    const item = {
      sellerId,
      sellerName,
      itemType,
      itemName,
      itemRarity,
      price,
      suggestedPriceMin,
      suggestedPriceMax,
      listedAt: Date.now(),
      status: 'listed' as const,
    };

    const createdItem = await insertOne<any>('market', item);
    res.json({ success: true, data: createdItem });
  } catch (err) {
    res.status(500).json({ success: false, error: '上架商品失败' });
  }
});

// POST /api/market/items/:id/buy - 购买商品
router.post('/items/:id/buy', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { buyerId } = req.body;

    if (!buyerId) {
      return res.status(400).json({ success: false, error: '缺少买家ID' });
    }

    const item = await findById<any>('market', id);
    if (!item) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    if (item.status !== 'listed') {
      return res.status(400).json({ success: false, error: '商品已售出或已下架' });
    }

    const buyer = await findById<any>('heroes', String(buyerId));
    if (!buyer) {
      return res.status(404).json({ success: false, error: '买家不存在' });
    }
    if (buyer.gold < item.price) {
      return res.status(400).json({ success: false, error: '金币不足' });
    }

    await updateOne<any>('heroes', String(buyerId), { gold: buyer.gold - item.price });

    const seller = await findById<any>('heroes', String(item.sellerId));
    if (seller) {
      const fee = Math.floor(item.price * 0.1);
      await updateOne<any>('heroes', String(item.sellerId), { gold: seller.gold + (item.price - fee) });
    }

    const updatedItem = await updateOne<any>('market', id, { status: 'sold' });

    const transaction = {
      itemId: id,
      itemName: item.itemName,
      price: item.price,
      buyerId,
      buyerName: buyer.name,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      timestamp: Date.now(),
    };
    await insertOne<any>('transactions', transaction);

    const announcement = {
      id: `ann-${Date.now()}`,
      message: `${buyer.name} 成功购买了 ${item.itemName}`,
      timestamp: Date.now(),
      heroName: buyer.name,
      itemName: item.itemName,
      price: item.price,
    };

    res.json({ success: true, data: { item: updatedItem, announcement } });
  } catch (err) {
    res.status(500).json({ success: false, error: '购买商品失败' });
  }
});

// DELETE /api/market/items/:id - 取消上架
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const item = await findById<any>('market', id);

    if (!item) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }

    const deleted = await deleteOne('market', id);
    if (!deleted) {
      return res.status(500).json({ success: false, error: '下架失败' });
    }

    res.json({ success: true, data: { message: '商品已下架' } });
  } catch (err) {
    res.status(500).json({ success: false, error: '下架商品失败' });
  }
});

// GET /api/market/orders/:heroId - 我的订单
router.get('/orders/:heroId', async (req: Request, res: Response) => {
  try {
    const heroId = String(req.params.heroId);
    const allTransactions = await getCollection<any>('transactions');
    const myOrders = allTransactions.filter(
      (t) => t.buyerId === heroId || t.sellerId === heroId
    );
    res.json({ success: true, data: myOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取订单失败' });
  }
});

// GET /api/market/price-history/:itemType - 近7天价格历史
router.get('/price-history/:itemType', async (req: Request, res: Response) => {
  try {
    const { itemType } = req.params;
    const priceHistoryList = await getCollection<any>('priceHistory');

    const typeHistory = priceHistoryList.find((p: any) => {
      const category = p.itemId?.includes('bp') ? 'suit-blueprint' :
                        p.itemId?.includes('sb') ? 'skill-book' : 'rare-material';
      return category === itemType || p.itemId === itemType;
    });

    const history = typeHistory?.history || [];
    const average = history.length > 0
      ? Math.floor(history.reduce((sum: number, h: any) => sum + h.price, 0) / history.length)
      : 0;

    res.json({ success: true, data: { average, history } });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取价格历史失败' });
  }
});

// GET /api/market/announcements - 最新成交公告
router.get('/announcements', async (_req: Request, res: Response) => {
  try {
    const allTransactions = await getCollection<any>('transactions');
    const announcements = allTransactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)
      .map((t) => ({
        id: t.id,
        message: `${t.buyerName} 成功购买了 ${t.itemName}`,
        timestamp: t.timestamp,
        heroName: t.buyerName,
        itemName: t.itemName,
        price: t.price,
      }));

    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取成交公告失败' });
  }
});

export default router;
