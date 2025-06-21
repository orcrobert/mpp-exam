import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '../types/candidate';

const DATA_FILE = path.join(__dirname, '../../data/candidates.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize with default data if file doesn't exist
async function initializeData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b332c2f8?w=400&h=400&fit=crop&crop=face',
        party: 'Progressive Alliance',
        description: 'Former city council member with 12 years of experience in local government. Advocate for environmental sustainability, affordable housing, and economic development.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Michael Chen',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        party: 'Unity Party',
        description: 'Small business owner and community organizer. Focuses on infrastructure improvement, education reform, and supporting local businesses.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Elena Rodriguez',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        party: 'Citizens First',
        description: 'Healthcare administrator and former school board president. Champions healthcare access, education funding, and social services.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(initialCandidates, null, 2));
  }
}

// This simulates a database interface - easy to replace later
export class CandidateModel {
  static async initialize() {
    await ensureDataDirectory();
    await initializeData();
  }

  static async findAll(): Promise<Candidate[]> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const candidates = JSON.parse(data);
      return candidates.map((c: any) => ({
        ...c,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date()
      }));
    } catch {
      return [];
    }
  }

  static async findById(id: string): Promise<Candidate | null> {
    const candidates = await this.findAll();
    return candidates.find(c => c.id === id) || null;
  }

  static async create(candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
    const candidates = await this.findAll();
    const newCandidate: Candidate = {
      ...candidateData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    candidates.push(newCandidate);
    await fs.writeFile(DATA_FILE, JSON.stringify(candidates, null, 2));
    return newCandidate;
  }

  static async update(id: string, candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate | null> {
    const candidates = await this.findAll();
    const index = candidates.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const updatedCandidate: Candidate = {
      ...candidates[index],
      ...candidateData,
      updatedAt: new Date()
    };
    
    candidates[index] = updatedCandidate;
    await fs.writeFile(DATA_FILE, JSON.stringify(candidates, null, 2));
    return updatedCandidate;
  }

  static async delete(id: string): Promise<boolean> {
    const candidates = await this.findAll();
    const filteredCandidates = candidates.filter(c => c.id !== id);
    
    if (filteredCandidates.length === candidates.length) return false;
    
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredCandidates, null, 2));
    return true;
  }

  static async deleteAll(): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
} 