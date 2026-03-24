import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import grnRoutes from './modules/grn/grn.routes';
import auditRoutes from './modules/audit/audit.routes';

const app = express();

// Trust proxy (for rate limiting behind nginx)
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests' },
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request ID
app.use(requestId);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Quantum Invenza API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/audit', auditRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use(errorHandler);

export default app;
