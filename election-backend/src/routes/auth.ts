import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { comparePassword, generateToken, hashPassword } from '../services/authService';
import { catchAsync } from '../utils/errors';

const router = Router();

// POST /api/auth/register
router.post('/register', catchAsync(async (req: Request, res: Response) => {
  const { cnp, password } = req.body;

  if (!cnp || !password) {
    return res.status(400).json({ success: false, message: 'CNP and password are required' });
  }

  // Basic CNP validation (must be 13 digits)
  if (!/^\d{13}$/.test(cnp)) {
    return res.status(400).json({ success: false, message: 'Invalid CNP format. Must be 13 digits.' });
  }

  const existingUser = await prisma.user.findUnique({ where: { cnp } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User with this CNP already exists' });
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
    return res.status(400).json({ success: false, message: 'CNP and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { cnp } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.status(200).json({ success: true, token, user: { id: user.id, cnp: user.cnp } });
}));

export default router; 