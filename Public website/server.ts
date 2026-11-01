import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { serviceRequestsService } from './apps/api/src/modules/service-requests/service-requests.service.ts';
import { casesService } from './apps/api/src/modules/cases/cases.service.ts';
import { filesService } from './apps/api/src/modules/files/files.service.ts';
import { checkRateLimit } from './apps/api/src/common/guards/rate-limit.guard.ts';
import { sanitizeError } from './apps/api/src/common/filters/http-exception.filter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing with safe size limits (10MB for JSON / binary uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Idempotency key extraction helper
app.use('/api/', (req: Request, _res: Response, next: NextFunction) => {
  const headerKey = req.headers['idempotency-key'];
  if (headerKey && typeof headerKey === 'string' && req.body && typeof req.body === 'object') {
    if (!req.body.idempotencyKey) {
      req.body.idempotencyKey = headerKey.trim();
    }
  }
  next();
});

// Rate limit middleware: 60 requests per minute per IP for public endpoints
app.use('/api/', (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ipKey = Array.isArray(clientIp) ? clientIp[0] : String(clientIp);

  if (!checkRateLimit(ipKey, 60, 60000)) {
    return res.status(429).json({
      statusCode: 429,
      message: 'Too many requests. Please pause before querying dispatch again.',
    });
  }
  next();
});

// --- API Endpoints ---

// 1. Service Requests Creation
app.post('/api/v1/service-requests', async (req: Request, res: Response) => {
  try {
    const result = await serviceRequestsService.create(req.body);
    return res.status(201).json(result);
  } catch (err) {
    const { statusCode, message, errors } = sanitizeError(err);
    return res.status(statusCode).json({ message, errors });
  }
});

// 2. Track Service Request (2FA Protected)
app.post('/api/v1/service-requests/track', async (req: Request, res: Response) => {
  try {
    const result = await serviceRequestsService.track(req.body);
    return res.status(200).json(result);
  } catch (err) {
    const { statusCode, message, errors } = sanitizeError(err);
    return res.status(statusCode).json({ message, errors });
  }
});

// 3. Service Request Workflow State Transition
app.post('/api/v1/service-requests/:ref/transition', async (req: Request, res: Response) => {
  try {
    const { ref } = req.params;
    const { targetStatus, actor, reason, publicNotes, nextStep } = req.body;

    if (!targetStatus) {
      return res.status(400).json({ message: 'Target status is required.' });
    }

    const updated = await serviceRequestsService.transitionStatus(ref, targetStatus, {
      actor: actor || 'operations_officer',
      reason: reason || 'Supervisory status update',
      publicNotes,
      nextStep,
    });

    return res.status(200).json({
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      updatedAt: updated.updatedAt,
      latestPublicUpdate: updated.publicNotes,
      nextAction: updated.nextStep,
    });
  } catch (err) {
    const { statusCode, message, errors } = sanitizeError(err);
    return res.status(statusCode).json({ message, errors });
  }
});

// 4. Feedback / Complaints
app.post('/api/v1/cases', async (req: Request, res: Response) => {
  try {
    const result = await casesService.createCase(req.body);
    return res.status(201).json(result);
  } catch (err) {
    const { statusCode, message, errors } = sanitizeError(err);
    return res.status(statusCode).json({ message, errors });
  }
});

// 5. Track Feedback / Complaint Case
app.post('/api/v1/cases/track', async (req: Request, res: Response) => {
  try {
    const result = await casesService.trackCase(req.body);
    return res.status(200).json(result);
  } catch (err) {
    const { statusCode, message, errors } = sanitizeError(err);
    return res.status(statusCode).json({ message, errors });
  }
});

// 6. Contact Inquiries
app.post('/api/v1/contact', async (req: Request, res: Response) => {
  try {
    const result = await casesService.handleContactMessage(req.body);
    return res.status(200).json(result);
  } catch (err) {
    const { statusCode, message, errors } = sanitizeError(err);
    return res.status(statusCode).json({ message, errors });
  }
});

// 7. Secure File Upload Route (Base64 payload or raw buffer with magic signature check)
app.post('/api/v1/files/upload', async (req: Request, res: Response) => {
  try {
    const { fileName, mimeType, contentBase64 } = req.body;
    if (!fileName || !mimeType || !contentBase64) {
      return res.status(400).json({
        message: 'File upload requires fileName, mimeType, and contentBase64 string.',
      });
    }

    const buffer = Buffer.from(contentBase64, 'base64');
    const stored = await filesService.processUpload(fileName, mimeType, buffer);
    return res.status(201).json(stored);
  } catch (err) {
    const { statusCode, message } = sanitizeError(err);
    return res.status(statusCode).json({ message });
  }
});

// 8. Authorized File Download Route (Guarded by short-lived tracking token)
app.get('/api/v1/files/:fileId', (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const trackingToken = (req.query.token as string) || (req.headers['x-tracking-token'] as string);

    const file = filesService.getFile(fileId, trackingToken);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    return res.send(file.buffer);
  } catch (err) {
    const { statusCode, message } = sanitizeError(err);
    return res.status(statusCode === 500 ? 403 : statusCode).json({ message });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'Covenant Shield Security Services Dispatch API',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
  });
});

// --- Front-end Integration ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Dev mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Covenant Shield Dispatch Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
