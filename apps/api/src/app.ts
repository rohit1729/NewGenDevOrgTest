import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import helmet from 'helmet';
import logger from 'http-err-notification';
import morgan from 'morgan';
import path from 'path';
import { collectionListCache, marketStatsCache, nftListCache } from './middleware/cache';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFound } from './middleware/error';
import { apiRateLimit } from './middleware/rateLimit';
import { requestIdMiddleware } from './middleware/requestId';
import routes from './routes';

export function createApp(): Application {
  const app = express();
  
  app.use(requestIdMiddleware);
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(apiRateLimit);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('dev'));
  app.use(compression());
  app.use(cookieParser());
  app.use(corsMiddleware);

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  app.get('/health', (_req, res) => res.json({ 
    success: true, 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  }));

  app.use('/market/stats', marketStatsCache);
  app.use('/nfts', nftListCache);
  app.use('/collections', collectionListCache);

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);
  logger();
  
  return app;
}