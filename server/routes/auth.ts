import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'treasure-dev-secret-change-in-prod';

function issueToken(id: number, username: string): string {
  return jwt.sign({ sub: id, username }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', (req: Request, res: Response): void => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    res.status(400).json({ error: '用戶名需為 3-20 個英數字或底線' });
    return;
  }
  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: '密碼至少需要 6 個字元' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: '此用戶名已被使用' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
  const id = Number(result.lastInsertRowid);

  res.status(201).json({ token: issueToken(id, username), user: { id, username } });
});

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: '請填寫用戶名和密碼' });
    return;
  }

  const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password: string }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: '用戶名或密碼錯誤' });
    return;
  }

  res.json({ token: issueToken(user.id, user.username), user: { id: user.id, username: user.username } });
});

export default router;
