import { Router, Request, Response } from 'express';
import { CandidateModel } from '../models/candidateModel';
import { Candidate } from '../types/candidate';

const router = Router();

// GET /api/candidates - Get all candidates
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await CandidateModel.findAll();
    res.json({
      success: true,
      data: candidates,
      count: candidates.length
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
});

// GET /api/candidates/:id - Get single candidate
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const candidate = await CandidateModel.findById(id);
    
    if (!candidate) {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate'
    });
  }
});

// POST /api/candidates - Create new candidate
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image, party, description } = req.body;
    
    // Basic validation
    if (!name || !party || !description) {
      res.status(400).json({
        success: false,
        message: 'Name, party, and description are required'
      });
      return;
    }
    
    const candidateData = {
      name: name.trim(),
      image: image?.trim() || '',
      party: party.trim(),
      description: description.trim()
    };
    
    const newCandidate = await CandidateModel.create(candidateData);
    
    res.status(201).json({
      success: true,
      data: newCandidate,
      message: 'Candidate created successfully'
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create candidate'
    });
  }
});

// PUT /api/candidates/:id - Update candidate
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, image, party, description } = req.body;
    
    // Basic validation
    if (!name || !party || !description) {
      res.status(400).json({
        success: false,
        message: 'Name, party, and description are required'
      });
      return;
    }
    
    const candidateData = {
      name: name.trim(),
      image: image?.trim() || '',
      party: party.trim(),
      description: description.trim()
    };
    
    const updatedCandidate = await CandidateModel.update(id, candidateData);
    
    if (!updatedCandidate) {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: updatedCandidate,
      message: 'Candidate updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate'
    });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await CandidateModel.delete(id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete candidate'
    });
  }
});

// DELETE /api/candidates - Delete all candidates (for development)
router.delete('/', async (req: Request, res: Response): Promise<void> => {
  try {
    await CandidateModel.deleteAll();
    res.json({
      success: true,
      message: 'All candidates deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting all candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all candidates'
    });
  }
});

export default router; 