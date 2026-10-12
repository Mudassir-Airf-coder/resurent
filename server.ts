import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './src/server/routes/api.js';
import { socketService } from './src/server/services/socketService.js';
import { errorHandler } from './src/server/middleware/errorHandler.js';
import { rateLimiter } from './src/server/middleware/rateLimiter.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrapServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize Socket.io real-time engine
  socketService.init(httpServer);

  // Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for preview iframe and 3D webgl assets
      crossOriginEmbedderPolicy: false
    })
  );

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate Limiter
  app.use('/api', rateLimiter);

  // Mount API Endpoints
  app.use('/api', apiRouter);

  // Frontend Integration: Vite middleware in dev, static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA BITES] Server and WebSocket KDS running on http://0.0.0.0:${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Fatal failure launching Aura Bites server:', err);
  process.exit(1);
});
