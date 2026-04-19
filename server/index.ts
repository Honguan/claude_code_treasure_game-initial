import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import scoresRoutes from './routes/scores';

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', scoresRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
