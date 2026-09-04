import cron from 'node-cron';
import { logger } from '../utils/logger.js';

export function startCronJobs(): void {
  // Run every hour: cleanup jobs
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running scheduled hourly background maintenance');
      // Dynamic imports or model calls to prevent circular dependency
      const { User } = await import('../modules/users/user.model.js');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Clean expired password reset tokens
      await User.updateMany(
        { passwordResetExpires: { $lt: new Date() } },
        { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } }
      );

      // Delete unverified accounts older than 24h
      const deleteResult = await User.deleteMany({
        isEmailVerified: false,
        createdAt: { $lt: twentyFourHoursAgo }
      });

      if (deleteResult.deletedCount > 0) {
        logger.info(`Pruned ${deleteResult.deletedCount} unverified stale accounts`);
      }
    } catch (error: any) {
      logger.error('Error during scheduled maintenance cron', { error: error.message });
    }
  });

  logger.info('Background cron jobs initialized');
}
