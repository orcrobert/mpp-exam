import { Candidate } from '@/types/candidate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Candidate CRUD operations
  async getCandidates(): Promise<Candidate[]> {
    return this.request<Candidate[]>('/candidates');
  }

  async getCandidate(id: string): Promise<Candidate> {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async createCandidate(candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
    return this.request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
  }

  async updateCandidate(id: string, candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
    return this.request<Candidate>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(candidateData),
    });
  }

  async deleteCandidate(id: string): Promise<void> {
    return this.request<void>(`/candidates/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService(); 