import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'treasure-dev-secret-change-in-prod';

export interface AuthPayload {
  sub: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}
