import { Server as SocketIOServer } from 'socket.io';
import { CandidateModel } from '../models/candidateModel';
import { generateRandomCandidate } from '../utils/candidateGenerator';

export class AutoGenerationService {
  private io: SocketIOServer;
  private generationIntervals: Map<string, NodeJS.Timeout> = new Map();
  private generationCounts: Map<string, number> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle start generation request
      socket.on('start-generation', async () => {
        try {
          await this.startGeneration(socket.id);
          socket.emit('generation-started', { 
            message: 'Auto-generation started',
            generatedCount: this.generationCounts.get(socket.id) || 0
          });
          
          // Broadcast to all clients that generation started
          this.io.emit('generation-status', {
            isGenerating: true,
            clientId: socket.id
          });
        } catch (error) {
          console.error('Error starting generation:', error);
          socket.emit('generation-error', { message: 'Failed to start generation' });
        }
      });

      // Handle stop generation request
      socket.on('stop-generation', () => {
        this.stopGeneration(socket.id);
        socket.emit('generation-stopped', { 
          message: 'Auto-generation stopped',
          totalGenerated: this.generationCounts.get(socket.id) || 0
        });
        
        // Broadcast to all clients that generation stopped
        this.io.emit('generation-status', {
          isGenerating: false,
          clientId: socket.id
        });
      });

      // Handle get generation status
      socket.on('get-generation-status', () => {
        const isGenerating = this.generationIntervals.has(socket.id);
        const generatedCount = this.generationCounts.get(socket.id) || 0;
        
        socket.emit('generation-status-response', {
          isGenerating,
          generatedCount
        });
      });

      // Handle client disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.stopGeneration(socket.id);
        this.generationCounts.delete(socket.id);
      });
    });
  }

  private async startGeneration(clientId: string) {
    // Stop existing generation for this client if any
    this.stopGeneration(clientId);
    
    // Initialize generation count
    this.generationCounts.set(clientId, 0);
    
    // Start generation interval (every 5 seconds)
    const interval = setInterval(async () => {
      try {
        const candidateData = generateRandomCandidate();
        const newCandidate = await CandidateModel.create(candidateData);
        
        // Increment count
        const currentCount = this.generationCounts.get(clientId) || 0;
        this.generationCounts.set(clientId, currentCount + 1);
        
        // Emit to all clients that a new candidate was generated
        this.io.emit('candidate-generated', {
          candidate: newCandidate,
          generatedCount: currentCount + 1,
          clientId
        });
        
        console.log(`Generated candidate: ${newCandidate.name} for client ${clientId}`);
      } catch (error) {
        console.error('Error generating candidate:', error);
        
        // Stop generation on error and notify client
        this.stopGeneration(clientId);
        this.io.to(clientId).emit('generation-error', {
          message: 'Auto-generation stopped due to error'
        });
      }
    }, 5000); // 5 seconds
    
    this.generationIntervals.set(clientId, interval);
  }

  private stopGeneration(clientId: string) {
    const interval = this.generationIntervals.get(clientId);
    if (interval) {
      clearInterval(interval);
      this.generationIntervals.delete(clientId);
      console.log(`Stopped generation for client ${clientId}`);
    }
  }

  // Method to stop all generations (useful for cleanup)
  public stopAllGenerations() {
    this.generationIntervals.forEach((interval, clientId) => {
      clearInterval(interval);
      console.log(`Stopped generation for client ${clientId}`);
    });
    this.generationIntervals.clear();
    this.generationCounts.clear();
  }

  // Get active generation stats
  public getGenerationStats() {
    return {
      activeGenerations: this.generationIntervals.size,
      totalGenerated: Array.from(this.generationCounts.values()).reduce((sum, count) => sum + count, 0)
    };
  }
} 