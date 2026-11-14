import './config/env.js';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import followUpRoutes from './routes/followUpRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/follow-ups', followUpRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
