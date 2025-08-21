/**
 * This is a API server
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import professionalsRoutes from './routes/professionals';
import servicesRoutes from './routes/services';
import clientsRoutes from './routes/clients';
import appointmentsRoutes from './routes/appointments';
import webhookRoutes from './routes/webhook';
import { notificationService } from './services/notifications';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/webhook', webhookRoutes);

// Inicializar serviço de notificações
notificationService.start();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;