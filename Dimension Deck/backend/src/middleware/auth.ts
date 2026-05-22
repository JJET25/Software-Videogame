import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  playerId: number;
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    (req as any).player = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
