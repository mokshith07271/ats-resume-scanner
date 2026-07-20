import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import routes from './routes';
import { errorHandler } from './middleware';
import { logger } from './config';


import path from 'path';
import fs from 'fs';

const app: Application = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Security middleware - allow iframe embedding for resume PDF preview
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Static uploads directory with inline PDF headers
const path = require('path');
const uploadsPaths = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../../../uploads'),
  path.join(__dirname, '../../../../uploads'),
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), '../uploads'),
];

const serveUploads = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Disposition', 'inline');
  next();
};

uploadsPaths.forEach(uPath => {
  app.use('/uploads', serveUploads, express.static(uPath));
  app.use('/api/uploads', serveUploads, express.static(uPath));
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Root API Welcome Endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'ATS Resume Scanner API',
    status: 'online',
    healthCheck: '/api/health',
    documentation: 'Access application frontend at http://localhost:3000',
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'ATS Resume Scanner API',
    version: '1.0.0',
    status: 'online',
  });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
