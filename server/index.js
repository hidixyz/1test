import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';
import checkinsRouter from './routes/checkins.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/tasks', tasksRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/stats', statsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
