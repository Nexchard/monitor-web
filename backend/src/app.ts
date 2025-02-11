import express from 'express';
import cors from 'cors';
import cloudRoutes from './routes/cloud.routes';
import { setupSyncTasks } from './tasks/sync.task';

const app = express();
const port = Number(process.env.PORT) || 3000;  // 转换为数字
const host = process.env.HOST || '0.0.0.0';

// CORS配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGINS?.split(',') 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// API路由
app.use('/api', cloudRoutes);

// 添加健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动同步任务
setupSyncTasks();

// 添加错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 添加404处理
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
}); 