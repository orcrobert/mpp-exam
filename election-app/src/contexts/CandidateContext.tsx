'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Candidate } from '@/types/candidate';
import { apiService } from '@/services/api';
import { websocketService, CandidateGeneratedData } from '@/services/websocket';

interface CandidateContextType {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  // CRUD operations
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCandidate: (id: string, candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  getCandidate: (id: string) => Candidate | undefined;
  refreshCandidates: () => Promise<void>;
  // WebSocket auto-generation
  isGenerating: boolean;
  generatedCount: number;
  websocketConnected: boolean;
  startAutoGeneration: () => void;
  stopAutoGeneration: () => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [websocketConnected, setWebsocketConnected] = useState(false);

  // Load candidates from API
  const refreshCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCandidates = await apiService.getCandidates();
      setCandidates(fetchedCandidates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load candidates';
      setError(errorMessage);
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(async () => {
    try {
      await websocketService.connect();
      setWebsocketConnected(true);

      // Set up event listeners
      websocketService.onCandidateGenerated((data: CandidateGeneratedData) => {
        setCandidates(prev => [...prev, data.candidate]);
        setGeneratedCount(data.generatedCount);
      });

      websocketService.onGenerationStarted((data) => {
        setIsGenerating(true);
        setGeneratedCount(data.generatedCount);
      });

      websocketService.onGenerationStopped((data) => {
        setIsGenerating(false);
      });

      websocketService.onGenerationError((data) => {
        setIsGenerating(false);
        setError(data.message);
      });

      // Get initial generation status
      websocketService.getGenerationStatus();
      websocketService.onGenerationStatusResponse((data) => {
        setIsGenerating(data.isGenerating);
        setGeneratedCount(data.generatedCount);
      });

    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setWebsocketConnected(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    refreshCandidates();
    initializeWebSocket();

    // Cleanup WebSocket on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [refreshCandidates, initializeWebSocket]);

  // CRUD operations
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newCandidate = await apiService.createCandidate(candidateData);
      setCandidates(prev => [...prev, newCandidate]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add candidate';
      setError(errorMessage);
      throw err;
    }
  };

  const updateCandidate = async (id: string, candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const updatedCandidate = await apiService.updateCandidate(id, candidateData);
      setCandidates(prev =>
        prev.map(candidate =>
          candidate.id === id ? updatedCandidate : candidate
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update candidate';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      setError(null);
      await apiService.deleteCandidate(id);
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete candidate';
      setError(errorMessage);
      throw err;
    }
  };

  const getCandidate = (id: string) => {
    return candidates.find(candidate => candidate.id === id);
  };

  // Auto-generation controls
  const startAutoGeneration = () => {
    if (websocketConnected) {
      websocketService.startGeneration();
    } else {
      setError('WebSocket not connected. Cannot start auto-generation.');
    }
  };

  const stopAutoGeneration = () => {
    if (websocketConnected) {
      websocketService.stopGeneration();
    }
  };

  return (
    <CandidateContext.Provider
      value={{
        candidates,
        loading,
        error,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        getCandidate,
        refreshCandidates,
        isGenerating,
        generatedCount,
        websocketConnected,
        startAutoGeneration,
        stopAutoGeneration,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error('useCandidates must be used within a CandidateProvider');
  }
  return context;
} 