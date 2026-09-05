import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

import { env } from './config/env.js';
import { mongoSanitizeMiddleware } from './middleware/mongoSanitize.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { categoryRoutes } from './modules/categories/category.routes.js';
import { collectionRoutes } from './modules/collections/collection.routes.js';
import { productRoutes } from './modules/products/product.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';
import { cartRoutes } from './modules/cart/cart.routes.js';
import { wishlistRoutes } from './modules/wishlist/wishlist.routes.js';
import { couponRoutes } from './modules/coupons/coupon.routes.js';
import { orderRoutes } from './modules/orders/order.routes.js';
import { paymentRoutes } from './modules/payments/payment.routes.js';
import { reviewRoutes } from './modules/reviews/review.routes.js';
import { contentRoutes } from './modules/content/content.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';

const app = express();

// 1. Initialize Sentry (if DSN provided)
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    beforeSend(event) {
      // Scrub sensitive headers & tokens before sending to Sentry
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    }
  });
}

// 2. Security HTTP headers (allowing cross-origin resource policy for uploaded media)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }) as any
);

// 3. Dynamic CORS configuration for all frontend and deployment origins
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-session-id', 'X-Session-Id']
  })
);

// 4. Body parsing with rawBody retention for webhook verification (50mb for image/video uploads)
app.use(
  express.json({
    limit: '50mb',
    verify: (req: Request, _res: Response, buf: Buffer) => {
      (req as any).rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploaded product pictures and hero videos with cross-origin headers
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(uploadsDir)
);

// 5. Cookie parsing for HttpOnly refresh tokens
app.use(cookieParser());

// 6. NoSQL injection sanitizer (Express 5 safe)
app.use(mongoSanitizeMiddleware());

// 7. Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 8. Health & readiness probes (mounted before heavy rate limiters so monitoring is not throttled)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/ready', (_req: Request, res: Response) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    res.status(200).json({ status: 'ready', database: 'connected' });
  } else {
    res.status(503).json({ status: 'not_ready', database: 'disconnected' });
  }
});

// 9. Global rate limiting for general API calls
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.'
    }
  }
});
app.use('/api', apiLimiter);

// 10. Mount API v1 router
const apiV1 = express.Router();
apiV1.use('/auth', authRoutes);
apiV1.use('/users', userRoutes);
apiV1.use('/categories', categoryRoutes);
apiV1.use('/collections', collectionRoutes);
apiV1.use('/products', productRoutes);
apiV1.use('/inventory', inventoryRoutes);
apiV1.use('/cart', cartRoutes);
apiV1.use('/wishlist', wishlistRoutes);
apiV1.use('/coupons', couponRoutes);
apiV1.use('/orders', orderRoutes);
apiV1.use('/payments', paymentRoutes);
apiV1.use('/reviews', reviewRoutes);
apiV1.use('/content', contentRoutes);
apiV1.use('/settings', settingsRoutes);
apiV1.use('/audit', auditRoutes);

// Direct Multiple Pictures & Videos Upload endpoint
apiV1.post('/upload', (req: Request, res: Response) => {
  try {
    const images = req.body.images || req.body.files;
    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ success: false, error: { message: 'No media files provided' } });
      return;
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
    const baseUrl = `${protocol}://${host}`;

    const savedUrls: string[] = [];
    for (const dataUrl of images) {
      if (typeof dataUrl !== 'string') continue;
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        savedUrls.push(dataUrl);
        continue;
      }
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mime = matches[1]?.toLowerCase() || '';
        const rawBase64 = matches[2];
        if (!rawBase64) continue;

        let ext = 'jpg';
        if (mime.includes('mp4')) ext = 'mp4';
        else if (mime.includes('webm')) ext = 'webm';
        else if (mime.includes('quicktime') || mime.includes('mov')) ext = 'mov';
        else if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('gif')) ext = 'gif';

        try {
          const buffer = Buffer.from(rawBase64, 'base64');
          const filename = `zayna-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
          const filepath = path.join(uploadsDir, filename);
          fs.writeFileSync(filepath, buffer);
          savedUrls.push(`${baseUrl}/uploads/${filename}`);
        } catch {
          // If filesystem write fails on serverless container, return dataUrl directly
          savedUrls.push(dataUrl);
        }
      } else {
        savedUrls.push(dataUrl);
      }
    }

    res.json({ success: true, data: { urls: savedUrls } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message || 'Upload processing failed' } });
  }
});

app.use('/api/v1', apiV1);

// 11. 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// 12. Central error handler (always last)
app.use(errorHandler);

export default app;
