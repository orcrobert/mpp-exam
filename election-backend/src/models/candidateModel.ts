import { prisma } from '../services/prisma';
import { Candidate } from '@prisma/client';

export const CandidateModel = {
  async findAll(): Promise<Candidate[]> {
    return prisma.candidate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async findById(id: string): Promise<Candidate | null> {
    return prisma.candidate.findUnique({
      where: { id },
    });
  },

  async create(data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'voteCount'>): Promise<Candidate> {
    return prisma.candidate.create({
      data,
    });
  },

  async update(id: string, data: Partial<Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Candidate | null> {
    try {
        return await prisma.candidate.update({
            where: { id },
            data,
          });
    } catch (error) {
        // P2025 is Prisma's error code for "record not found" on update
        // @ts-ignore
        if (error.code === 'P2025') {
            return null;
        }
        throw error;
    }
  },

  async delete(id: string): Promise<Candidate | null> {
    try {
        return await prisma.candidate.delete({
            where: { id },
          });
    } catch (error) {
        // @ts-ignore
        if (error.code === 'P2025') {
            return null;
        }
        throw error;
    }
  },
}; 