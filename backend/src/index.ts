import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { openapiSpec } from './openapi.js';
import authRoutes from './routes/auth/index.js';
import userRoutes from './routes/users/index.js';
import branchRoutes from './routes/branches/index.js';
import workspaceRoutes from './routes/workspaces/index.js';
import planRoutes from './routes/plans/index.js';
import bookingRoutes from './routes/bookings/index.js';
import eventRoutes from './routes/events/index.js';
import publicRoutes from './routes/public/index.js';
import dashboardRoutes from './routes/dashboard/index.js';
import uploadRoutes from './routes/upload/index.js';
import canteenRoutes from './routes/canteen/index.js';

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.send('Hello World');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get('/openapi.json', (_req, res) => {
  res.json(openapiSpec);
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec as unknown as object, {
    customSiteTitle: 'CoWork API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/canteen', canteenRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start(): Promise<void> {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
