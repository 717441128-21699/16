import express, { Request, Response } from 'express';
import cors from 'cors';
import { initDb, getCollection } from './db.js';

import heroesRouter from './routes/heroes.js';
import cityRouter from './routes/city.js';
import battleRouter from './routes/battle.js';
import marketRouter from './routes/market.js';
import rankingsRouter from './routes/rankings.js';
import guildRouter from './routes/guild.js';
import reportRouter from './routes/report.js';

const app = express();
const PORT = 3001;

// CORS 配置：允许前端开发端口
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 挂载路由（注意顺序：具体路径在前，通配在后）
app.use('/api/heroes', heroesRouter);
app.use('/api/battles', battleRouter);
app.use('/api/market', marketRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/guilds', guildRouter);
app.use('/api/reports', reportRouter);
app.use('/api', cityRouter);

// 独立路由：超能力、战衣、武器列表
app.get('/api/powers', async (_req: Request, res: Response) => {
  try {
    const powers = await getCollection('powers');
    res.json(powers);
  } catch (err) {
    res.status(500).json({ error: '获取超能力列表失败', message: (err as Error).message });
  }
});

app.get('/api/suits', async (_req: Request, res: Response) => {
  try {
    const suits = await getCollection('suits');
    res.json(suits);
  } catch (err) {
    res.status(500).json({ error: '获取战衣列表失败', message: (err as Error).message });
  }
});

app.get('/api/weapons', async (_req: Request, res: Response) => {
  try {
    const weapons = await getCollection('weapons');
    res.json(weapons);
  } catch (err) {
    res.status(500).json({ error: '获取武器列表失败', message: (err as Error).message });
  }
});

// 404 处理
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API 路由不存在' });
});

// 启动服务器
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[Server] 后端服务已启动: http://localhost:${PORT}`);
      console.log(`[Server] 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`[Server] CORS 允许源: http://localhost:5173, 5174, 5175`);
    });
  } catch (err) {
    console.error('[Server] 启动失败:', err);
    process.exit(1);
  }
}

startServer();
