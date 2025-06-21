import { Router, Request, Response } from 'express';
import { CandidateModel } from '../models/candidateModel';
import { AppError, catchAsync } from '../utils/errors';

const router = Router();

// GET /api/candidates - Get all candidates
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const candidates = await CandidateModel.findAll();
  res.json({ success: true, data: candidates, count: candidates.length });
}));

// GET /api/candidates/:id - Get a single candidate
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
    const candidate = await CandidateModel.findById(req.params.id);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }
    res.json({ success: true, data: candidate });
}));

// POST /api/candidates - Create a new candidate
router.post('/', catchAsync(async (req: Request, res: Response) => {
  const { name, description, imageUrl } = req.body;
  if (!name || !description || !imageUrl) {
      throw new AppError('Missing required fields: name, description, imageUrl', 400);
  }
  const newCandidate = await CandidateModel.create(req.body);
  res.status(201).json({ success: true, data: newCandidate });
}));

// PUT /api/candidates/:id - Update a candidate
router.put('/:id', catchAsync(async (req: Request, res: Response) => {
    const updatedCandidate = await CandidateModel.update(req.params.id, req.body);
    if (!updatedCandidate) {
      throw new AppError('Candidate not found', 404);
    }
    res.json({ success: true, data: updatedCandidate });
}));

// DELETE /api/candidates/:id - Delete a candidate
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
    const deletedCandidate = await CandidateModel.delete(req.params.id);
    if (!deletedCandidate) {
      throw new AppError('Candidate not found', 404);
    }
    res.status(204).send();
}));

export default router; 