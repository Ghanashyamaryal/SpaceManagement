import express, { type Request, type Response, type NextFunction } from 'express';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import branchRoutes from './routes/branches.js';
import workspaceRoutes from './routes/workspaces.js';
import planRoutes from './routes/plans.js';
import bookingRoutes from './routes/bookings.js';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello World');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/bookings', bookingRoutes);

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
