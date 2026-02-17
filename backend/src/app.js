import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import authorityRoutes from './routes/authorityRoutes.js';
import watchmanRoutes from './routes/watchmanRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/watchman', watchmanRoutes);
app.use(errorHandler);

export default app;
