import { Router, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { AppError, catchAsync } from '../utils/errors';
import { Prisma } from '@prisma/client';

const router = Router();

// POST /api/votes
router.post('/', authMiddleware, catchAsync<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { candidateId } = req.body;
  const userId = req.user?.id;

  if (!candidateId) {
    throw new AppError('Candidate ID is required', 400);
  }

  if (!userId) {
    throw new AppError('Authentication error', 401);
  }

  const vote = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existingVote = await tx.vote.findUnique({
      where: { userId },
    });

    if (existingVote) {
      throw new AppError('User has already voted', 409);
    }

    const candidate = await tx.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
        throw new AppError('Candidate not found', 404);
    }

    const newVote = await tx.vote.create({
      data: {
        userId,
        candidateId,
      },
    });

    await tx.candidate.update({
      where: { id: candidateId },
      data: { voteCount: { increment: 1 } },
    });

    return newVote;
  });

  void res.status(201).json({ success: true, data: vote });
}));

export default router;