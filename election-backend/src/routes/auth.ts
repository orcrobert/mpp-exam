import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { comparePassword, generateToken, hashPassword } from '../services/authService';
import { AppError, catchAsync } from '../utils/errors';

const router = Router();

// POST /api/auth/register
router.post('/register', catchAsync(async (req: Request, res: Response) => {
  const { cnp, password } = req.body;

  if (!cnp || !password) {
    throw new AppError('CNP and password are required', 400);
  }

  // Basic CNP validation (must be 13 digits)
  if (!/^\d{13}$/.test(cnp)) {
    throw new AppError('Invalid CNP format. Must be 13 digits.', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { cnp } });
  if (existingUser) {
    throw new AppError('User with this CNP already exists', 409);
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      cnp,
      password: hashedPassword,
    },
  });

  const token = generateToken(user);
  res.status(201).json({ success: true, token, user: { id: user.id, cnp: user.cnp } });
}));

// POST /api/auth/login
router.post('/login', catchAsync(async (req: Request, res: Response) => {
  const { cnp, password } = req.body;

  if (!cnp || !password) {
    throw new AppError('CNP and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { cnp } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user);
  res.status(200).json({ success: true, token, user: { id: user.id, cnp: user.cnp } });
}));

export default router; 