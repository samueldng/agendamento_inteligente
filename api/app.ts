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
import categoriesRoutes from './routes/categories';
import webhookRoutes from './routes/webhook';
import hotelRoomsRoutes from './routes/hotelRooms';
import hotelReservationsRoutes from './routes/hotelReservations';
import hotelCheckinsRoutes from './routes/hotelCheckins';
import hotelConsumptionRoutes from './routes/hotelConsumption';
import hotelDashboardRoutes from './routes/hotelDashboard';
import hotelReportsRoutes from './routes/hotelReports';
import hotelNotificationsRoutes from './hotel/notifications';
import { initializeNotificationService } from './services/notificationService';
import notificationService from './services/notificationService';

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
app.use('/api/categories', categoriesRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/hotel-rooms', hotelRoomsRoutes);
app.use('/api/hotel-reservations', hotelReservationsRoutes);
app.use('/api/hotel-checkins', hotelCheckinsRoutes);
app.use('/api/hotel-consumption', hotelConsumptionRoutes);
app.use('/api/hotel-dashboard', hotelDashboardRoutes);
app.use('/api/hotel-reports', hotelReportsRoutes);
app.use('/api/hotel/notifications', hotelNotificationsRoutes);

// Inicializar serviço de notificações
initializeNotificationService();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, parando serviços...');
  notificationService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, parando serviços...');
  notificationService.stop();
  process.exit(0);
});

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