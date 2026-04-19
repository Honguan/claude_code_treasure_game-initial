import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/scores', authenticate, (req: Request, res: Response): void => {
  const { score, won } = req.body ?? {};
  const userId = req.user!.sub;

  if (typeof score !== 'number' || typeof won !== 'boolean') {
    res.status(400).json({ error: 'Invalid score payload' });
    return;
  }

  const result = db
    .prepare('INSERT INTO scores (user_id, score, won) VALUES (?, ?, ?)')
    .run(userId, score, won ? 1 : 0);

  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

router.get('/leaderboard', (_req: Request, res: Response): void => {
  const rows = db
    .prepare(
      `SELECT u.username, MAX(s.score) AS best_score, COUNT(s.id) AS games_played
       FROM scores s
       JOIN users u ON u.id = s.user_id
       GROUP BY s.user_id
       ORDER BY best_score DESC
       LIMIT 20`
    )
    .all() as { username: string; best_score: number; games_played: number }[];

  const ranked = rows.map((row, i) => ({ rank: i + 1, ...row }));
  res.json(ranked);
});

export default router;
