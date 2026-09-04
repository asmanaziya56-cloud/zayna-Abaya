import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startCronJobs } from './services/cron.service.js';
import { setupSocketIO } from './sockets/index.js';
import { logger } from './utils/logger.js';

import { couponService } from './modules/coupons/coupon.service.js';

const server = http.createServer(app);

// Setup Socket.IO with JWT guard
export const io = setupSocketIO(server);

async function startServer() {
  try {
    // 1. Connect database
    await connectDB();

    // 1b. Ensure default coupons (ZAYNA100, ZAYNA10, EIDMUBARAK, WELCOME500)
    await couponService.ensureDefaultCoupons();

    // 2. Start background cron jobs
    startCronJobs();

    // 3. Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`🚀 Zayna Abaya Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`📍 Health endpoint: http://localhost:${env.PORT}/health`);
      logger.info(`📍 API endpoint: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await disconnectDB();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (err: any) {
      logger.error('Error during shutdown:', { error: err.message });
      process.exit(1);
    }
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection detected:', { reason: reason?.message || reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception detected:', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
