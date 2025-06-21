import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { CandidateModel } from './models/candidateModel';
import { AutoGenerationService } from './services/autoGenerationService';
import candidatesRouter from './routes/candidates';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8000;

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/candidates', candidatesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Election API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Election API',
    version: '1.0.0',
    endpoints: {
      candidates: '/api/candidates',
      health: '/api/health'
    },
    websocket: {
      events: [
        'start-generation',
        'stop-generation', 
        'get-generation-status',
        'candidate-generated',
        'generation-status'
      ]
    }
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Initialize services
async function startServer() {
  try {
    // Initialize database/file system
    await CandidateModel.initialize();
    console.log('✅ Data storage initialized');

    // Initialize auto-generation service
    const autoGenService = new AutoGenerationService(io);
    console.log('✅ Auto-generation service initialized');

    // Graceful shutdown handling
    const gracefulShutdown = () => {
      console.log('\n🔄 Shutting down gracefully...');
      autoGenService.stopAllGenerations();
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    // Start server
    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Election API server running on port ${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket server ready for connections`);
      console.log(`🌐 Accepting connections from: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
