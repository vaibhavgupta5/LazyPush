import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import mongoose from 'mongoose';
import { MONGODB_URI, PORT } from './config';
import authRoutes from './routes/auth';
import scheduleRoutes from './routes/schedule';
import { info, error } from './logger';
import { startWorker } from './worker';

const app = new Hono();

// Health check route
app.get('/', (c) => c.json({ status: 'ok', message: 'LazyPush server is running' }));

app.route('/auth', authRoutes);
app.route('/schedule', scheduleRoutes);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    info('Connected to MongoDB');
    serve({ fetch: app.fetch, port: PORT });
    info(`Server listening on port ${PORT}`);
    // start worker (same process)
    startWorker().catch(e => error('worker failed to start', e));
  } catch (e) {
    error('startup error', e);
    process.exit(1);
  }
}

start();
