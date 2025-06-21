import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { prisma } from '../services/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    cnp: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as { userId: string; cnp: string; iat: number; exp: number } | null;

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }

    req.user = { id: user.id, cnp: user.cnp };
    next();
  } catch (error) {
    next(error);
  }
}; 