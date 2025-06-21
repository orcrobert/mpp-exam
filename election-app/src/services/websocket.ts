import { io, Socket } from 'socket.io-client';
import { Candidate } from '@/types/candidate';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'https://mpp-exam-y31v.onrender.com';

export interface GenerationStatusData {
  isGenerating: boolean;
  clientId?: string;
}

export interface CandidateGeneratedData {
  candidate: Candidate;
  generatedCount: number;
  clientId: string;
}

export interface GenerationStatusResponse {
  isGenerating: boolean;
  generatedCount: number;
}

export interface GenerationStartedData {
  message: string;
  generatedCount: number;
}

export interface GenerationStoppedData {
  message: string;
  totalGenerated: number;
}

export interface GenerationErrorData {
  message: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io(WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from WebSocket server:', reason);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          return;
        }
        this.handleReconnect();
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000); // Max 10 seconds
      });
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Generation control methods
  startGeneration() {
    if (this.socket?.connected) {
      this.socket.emit('start-generation');
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  stopGeneration() {
    if (this.socket?.connected) {
      this.socket.emit('stop-generation');
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  getGenerationStatus() {
    if (this.socket?.connected) {
      this.socket.emit('get-generation-status');
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  // Event listeners
  onCandidateGenerated(callback: (data: CandidateGeneratedData) => void) {
    this.socket?.on('candidate-generated', callback);
  }

  onGenerationStatus(callback: (data: GenerationStatusData) => void) {
    this.socket?.on('generation-status', callback);
  }

  onGenerationStatusResponse(callback: (data: GenerationStatusResponse) => void) {
    this.socket?.on('generation-status-response', callback);
  }

  onGenerationStarted(callback: (data: GenerationStartedData) => void) {
    this.socket?.on('generation-started', callback);
  }

  onGenerationStopped(callback: (data: GenerationStoppedData) => void) {
    this.socket?.on('generation-stopped', callback);
  }

  onGenerationError(callback: (data: GenerationErrorData) => void) {
    this.socket?.on('generation-error', callback);
  }

  // Remove event listeners
  offCandidateGenerated(callback?: (data: CandidateGeneratedData) => void) {
    this.socket?.off('candidate-generated', callback);
  }

  offGenerationStatus(callback?: (data: GenerationStatusData) => void) {
    this.socket?.off('generation-status', callback);
  }

  offGenerationStatusResponse(callback?: (data: GenerationStatusResponse) => void) {
    this.socket?.off('generation-status-response', callback);
  }

  offGenerationStarted(callback?: (data: GenerationStartedData) => void) {
    this.socket?.off('generation-started', callback);
  }

  offGenerationStopped(callback?: (data: GenerationStoppedData) => void) {
    this.socket?.off('generation-stopped', callback);
  }

  offGenerationError(callback?: (data: GenerationErrorData) => void) {
    this.socket?.off('generation-error', callback);
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const websocketService = new WebSocketService();